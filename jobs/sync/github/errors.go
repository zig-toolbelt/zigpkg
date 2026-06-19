package github

import (
	"context"
	"errors"
	"net/http"
	"time"
)

// RateLimitError reports that the GitHub API rejected (or would reject) a
// request because a rate limit was hit. Callers detect it with errors.As and
// use RetryAfter to decide how long to back off before resuming. Resource names
// the limit that tripped (e.g. "graphql") when the server reports it.
type RateLimitError struct {
	RetryAfter time.Duration
	Resource   string
}

func (e *RateLimitError) Error() string {
	if e.Resource != "" {
		return "github: rate limited on " + e.Resource + " (retry after " + e.RetryAfter.String() + ")"
	}
	return "github: rate limited (retry after " + e.RetryAfter.String() + ")"
}

// isRateLimited reports whether resp is a GitHub rate-limit response. GitHub
// signals the primary limit with 429 and secondary limits with either 429 or a
// 403 carrying a Retry-After header or x-ratelimit-remaining: 0. A bare 403
// (genuine authorization failure) is not treated as rate limiting.
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

// retryable reports whether a transport-level error (typically a network
// failure) is worth retrying. Context cancellation and deadline errors are
// terminal and never retried.
func retryable(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return false
	}
	return true
}
