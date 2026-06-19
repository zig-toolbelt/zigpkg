// Package httpx provides a generic, dependency-free retrying HTTP transport.
// It owns every HTTP-level retry concern — network errors, 5xx responses, and
// rate-limit responses — so a client built on it never has to see a retry. It
// is auth-agnostic: callers set their own Authorization header on the request
// (the transport replays the request unchanged across attempts), which lets it
// serve backends with different auth schemes.
package httpx

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const (
	// defaultMaxAttempts bounds how many times a single request is sent before
	// giving up (the initial try plus retries).
	defaultMaxAttempts = 5

	baseBackoff = 500 * time.Millisecond
	maxBackoff  = 60 * time.Second
)

// RateLimitError reports that the server rejected a request because a rate
// limit was hit and the transport exhausted its retries. Callers detect it with
// errors.As and translate it into their own typed error. RetryAfter is the
// server's hint; Resource names the limit that tripped when reported.
type RateLimitError struct {
	RetryAfter time.Duration
	Resource   string
}

func (e *RateLimitError) Error() string {
	if e.Resource != "" {
		return "httpx: rate limited on " + e.Resource + " (retry after " + e.RetryAfter.String() + ")"
	}
	return "httpx: rate limited (retry after " + e.RetryAfter.String() + ")"
}

// RetryTransport is an http.RoundTripper that transparently retries transient
// failures. Waits are ctx-aware and driven by Retry-After when the server
// provides it, falling back to exponential backoff with full jitter. It does
// not inject authentication; set it on the request before calling.
type RetryTransport struct {
	base  http.RoundTripper
	clock Clock
	max   int
}

// NewRetryTransport wraps base with retry behaviour. A nil base defaults to
// http.DefaultTransport and a nil clock to RealClock.
func NewRetryTransport(base http.RoundTripper, clock Clock) *RetryTransport {
	if base == nil {
		base = http.DefaultTransport
	}
	if clock == nil {
		clock = RealClock{}
	}
	return &RetryTransport{base: base, clock: clock, max: defaultMaxAttempts}
}

func (t *RetryTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	// Clone so we never mutate the caller's request (RoundTripper contract).
	r := req.Clone(req.Context())

	// Buffer the body once so it can be replayed on every attempt.
	var body []byte
	if r.Body != nil {
		b, err := io.ReadAll(r.Body)
		_ = r.Body.Close()
		if err != nil {
			return nil, err
		}
		body = b
	}

	ctx := r.Context()
	var (
		resp *http.Response
		err  error
	)

	for attempt := 0; attempt < t.max; attempt++ {
		if body != nil {
			r.Body = io.NopCloser(bytes.NewReader(body))
			r.ContentLength = int64(len(body))
		}

		resp, err = t.base.RoundTrip(r)

		switch {
		case err != nil:
			if !retryable(err) {
				return nil, err
			}
		case resp.StatusCode >= 500:
			// Transient server error — retry.
		case isRateLimited(resp):
			// Rate limited — retry after the server-directed wait.
		default:
			// Success or a non-retryable status (2xx, 4xx other than rate
			// limits). Hand the response back; the caller classifies it.
			return resp, nil
		}

		// On the final attempt, stop without sleeping and resolve the outcome
		// below with the response/error still intact.
		if attempt == t.max-1 {
			break
		}

		var wait time.Duration
		if err == nil {
			wait = retryAfter(resp, t.clock, attempt)
			drain(resp)
		} else {
			wait = backoff(attempt, t.clock)
		}

		if werr := t.clock.Sleep(ctx, wait); werr != nil {
			return nil, werr
		}
	}

	// Attempts exhausted.
	if err != nil {
		return nil, err
	}
	if isRateLimited(resp) {
		rle := &RateLimitError{
			RetryAfter: retryAfter(resp, t.clock, t.max-1),
			Resource:   resp.Header.Get("X-RateLimit-Resource"),
		}
		drain(resp)
		return nil, rle
	}
	// A 5xx that never recovered — surface the last response unchanged.
	return resp, nil
}

// isRateLimited reports whether resp is a rate-limit response. A 429 always
// counts; a 403 counts only when it carries a Retry-After header or
// x-ratelimit-remaining: 0 (a bare 403 is a genuine authorization failure).
func isRateLimited(resp *http.Response) bool {
	if resp == nil {
		return false
	}
	switch resp.StatusCode {
	case http.StatusTooManyRequests:
		return true
	case http.StatusForbidden:
		if resp.Header.Get("Retry-After") != "" {
			return true
		}
		return resp.Header.Get("X-RateLimit-Remaining") == "0"
	default:
		return false
	}
}

// retryable reports whether a transport-level error is worth retrying. Context
// cancellation and deadline errors are terminal and never retried.
func retryable(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return false
	}
	return true
}

// retryAfter resolves how long to wait before the next attempt. It prefers the
// Retry-After header (delta-seconds or HTTP-date), then the x-ratelimit-reset
// time when the quota is exhausted, and finally exponential backoff with full
// jitter.
func retryAfter(resp *http.Response, clock Clock, attempt int) time.Duration {
	if resp != nil {
		if v := resp.Header.Get("Retry-After"); v != "" {
			if secs, err := strconv.Atoi(strings.TrimSpace(v)); err == nil {
				if secs < 0 {
					secs = 0
				}
				return time.Duration(secs) * time.Second
			}
			if when, err := http.ParseTime(v); err == nil {
				if d := when.Sub(clock.Now()); d > 0 {
					return d
				}
				return 0
			}
		}
		if resp.Header.Get("X-RateLimit-Remaining") == "0" {
			if v := resp.Header.Get("X-RateLimit-Reset"); v != "" {
				if unix, err := strconv.ParseInt(v, 10, 64); err == nil {
					if d := time.Unix(unix, 0).Sub(clock.Now()); d > 0 {
						return d
					}
					return 0
				}
			}
		}
	}
	return backoff(attempt, clock)
}

// backoff returns 500ms * 2^attempt capped at 60s, with full jitter applied (a
// uniformly random duration in [0, window)).
func backoff(attempt int, clock Clock) time.Duration {
	window := baseBackoff << attempt
	if window <= 0 || window > maxBackoff {
		window = maxBackoff
	}
	return time.Duration(clock.Int63n(int64(window)))
}

// drain reads and closes a response body so the underlying connection can be
// reused on the next attempt.
func drain(resp *http.Response) {
	if resp == nil || resp.Body == nil {
		return
	}
	_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 4096))
	_ = resp.Body.Close()
}
