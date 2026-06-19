package github

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// fakeClock is a deterministic Clock for transport tests: it records every
// requested sleep duration, returns immediately, and yields fixed jitter so
// exact wait durations can be asserted without real time passing.
type fakeClock struct {
	now     time.Time
	slept   []time.Duration
	int63n  func(int64) int64
	onSleep func()
}

func newFakeClock() *fakeClock {
	return &fakeClock{now: time.Unix(1_700_000_000, 0).UTC()}
}

func (c *fakeClock) Now() time.Time { return c.now }

func (c *fakeClock) Int63n(n int64) int64 {
	if c.int63n != nil {
		return c.int63n(n)
	}
	if n <= 0 {
		return 0
	}
	return n / 2 // deterministic mid-window jitter
}

func (c *fakeClock) Sleep(ctx context.Context, d time.Duration) error {
	c.slept = append(c.slept, d)
	if c.onSleep != nil {
		c.onSleep()
	}
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
		return nil
	}
}

// flakyTransport fails its first n RoundTrips with a network error, then
// delegates to base — used to exercise retry-on-network-error.
type flakyTransport struct {
	failures int32
	calls    int32
	base     http.RoundTripper
}

func (f *flakyTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	if atomic.AddInt32(&f.calls, 1) <= f.failures {
		return nil, errors.New("dial tcp 203.0.113.1:443: connect: connection refused")
	}
	return f.base.RoundTrip(req)
}

func roundtrip(t *testing.T, ctx context.Context, rt *retryTransport, url string) (*http.Response, error) {
	t.Helper()
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, strings.NewReader("payload"))
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	return rt.RoundTrip(req)
}

func TestRetryTransport_RetryAfter429(t *testing.T) {
	t.Parallel()
	clock := newFakeClock()
	var calls int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if atomic.AddInt32(&calls, 1) == 1 {
			w.Header().Set("Retry-After", "2")
			w.WriteHeader(http.StatusTooManyRequests)
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = io.WriteString(w, "ok")
	}))
	defer srv.Close()

	rt := newRetryTransport("tok", http.DefaultTransport, clock)
	resp, err := roundtrip(t, context.Background(), rt, srv.URL)
	if err != nil {
		t.Fatalf("RoundTrip: %v", err)
	}
	drain(resp)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("status: got %d, want 200", resp.StatusCode)
	}
	if n := atomic.LoadInt32(&calls); n != 2 {
		t.Errorf("server calls: got %d, want 2", n)
	}
	if len(clock.slept) != 1 || clock.slept[0] != 2*time.Second {
		t.Errorf("waits: got %v, want [2s]", clock.slept)
	}
}

func TestRetryTransport_SecondaryRateLimit403(t *testing.T) {
	t.Parallel()
	clock := newFakeClock()
	var calls int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if atomic.AddInt32(&calls, 1) == 1 {
			// Secondary rate limit: 403 carrying a Retry-After header.
			w.Header().Set("Retry-After", "1")
			w.WriteHeader(http.StatusForbidden)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	rt := newRetryTransport("tok", http.DefaultTransport, clock)
	resp, err := roundtrip(t, context.Background(), rt, srv.URL)
	if err != nil {
		t.Fatalf("RoundTrip: %v", err)
	}
	drain(resp)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("status: got %d, want 200", resp.StatusCode)
	}
	if n := atomic.LoadInt32(&calls); n != 2 {
		t.Errorf("server calls: got %d, want 2", n)
	}
	if len(clock.slept) != 1 || clock.slept[0] != time.Second {
		t.Errorf("waits: got %v, want [1s]", clock.slept)
	}
}

func TestRetryTransport_ServerError5xx(t *testing.T) {
	t.Parallel()
	clock := newFakeClock()
	var calls int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if atomic.AddInt32(&calls, 1) == 1 {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	rt := newRetryTransport("tok", http.DefaultTransport, clock)
	resp, err := roundtrip(t, context.Background(), rt, srv.URL)
	if err != nil {
		t.Fatalf("RoundTrip: %v", err)
	}
	drain(resp)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("status: got %d, want 200", resp.StatusCode)
	}
	if n := atomic.LoadInt32(&calls); n != 2 {
		t.Errorf("server calls: got %d, want 2", n)
	}
	// No Retry-After: full-jitter backoff of baseBackoff (500ms), halved by the
	// fake clock's deterministic jitter.
	if len(clock.slept) != 1 || clock.slept[0] != baseBackoff/2 {
		t.Errorf("waits: got %v, want [%v]", clock.slept, baseBackoff/2)
	}
}

func TestRetryTransport_NetworkErrorThenSuccess(t *testing.T) {
	t.Parallel()
	clock := newFakeClock()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	flaky := &flakyTransport{failures: 1, base: http.DefaultTransport}
	rt := newRetryTransport("tok", flaky, clock)
	resp, err := roundtrip(t, context.Background(), rt, srv.URL)
	if err != nil {
		t.Fatalf("RoundTrip: %v", err)
	}
	drain(resp)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("status: got %d, want 200", resp.StatusCode)
	}
	if n := atomic.LoadInt32(&flaky.calls); n != 2 {
		t.Errorf("transport calls: got %d, want 2", n)
	}
	if len(clock.slept) != 1 || clock.slept[0] != baseBackoff/2 {
		t.Errorf("waits: got %v, want [%v]", clock.slept, baseBackoff/2)
	}
}

func TestRetryTransport_NonRetryableStatus(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name   string
		status int
		header map[string]string
	}{
		{"unauthorized", http.StatusUnauthorized, nil},
		{"plain forbidden", http.StatusForbidden, nil}, // 403 without rate-limit headers
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			clock := newFakeClock()
			var calls int32
			srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				atomic.AddInt32(&calls, 1)
				for k, v := range tc.header {
					w.Header().Set(k, v)
				}
				w.WriteHeader(tc.status)
			}))
			defer srv.Close()

			rt := newRetryTransport("tok", http.DefaultTransport, clock)
			resp, err := roundtrip(t, context.Background(), rt, srv.URL)
			if err != nil {
				t.Fatalf("RoundTrip: %v", err)
			}
			drain(resp)

			if resp.StatusCode != tc.status {
				t.Errorf("status: got %d, want %d", resp.StatusCode, tc.status)
			}
			if n := atomic.LoadInt32(&calls); n != 1 {
				t.Errorf("server calls: got %d, want 1 (no retry)", n)
			}
			if len(clock.slept) != 0 {
				t.Errorf("waits: got %v, want none", clock.slept)
			}
		})
	}
}

func TestRetryTransport_ContextCancelDuringWait(t *testing.T) {
	t.Parallel()
	clock := newFakeClock()
	ctx, cancel := context.WithCancel(context.Background())
	clock.onSleep = cancel // cancel the moment the retry wait begins

	var calls int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(&calls, 1)
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv.Close()

	rt := newRetryTransport("tok", http.DefaultTransport, clock)
	resp, err := roundtrip(t, ctx, rt, srv.URL)
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("err: got %v, want context.Canceled", err)
	}
	if resp != nil {
		t.Errorf("resp: got %v, want nil", resp)
	}
	if n := atomic.LoadInt32(&calls); n != 1 {
		t.Errorf("server calls: got %d, want 1 (cancelled during first wait)", n)
	}
}

func TestRetryTransport_BodyReplayedAcrossAttempts(t *testing.T) {
	t.Parallel()
	clock := newFakeClock()

	var mu sync.Mutex
	var bodies, auths []string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		b, _ := io.ReadAll(r.Body)
		mu.Lock()
		bodies = append(bodies, string(b))
		auths = append(auths, r.Header.Get("Authorization"))
		n := len(bodies)
		mu.Unlock()

		if n == 1 {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	rt := newRetryTransport("tok", http.DefaultTransport, clock)
	resp, err := roundtrip(t, context.Background(), rt, srv.URL)
	if err != nil {
		t.Fatalf("RoundTrip: %v", err)
	}
	drain(resp)

	mu.Lock()
	defer mu.Unlock()
	if len(bodies) != 2 {
		t.Fatalf("server calls: got %d bodies, want 2", len(bodies))
	}
	for i, b := range bodies {
		if b != "payload" {
			t.Errorf("body[%d]: got %q, want %q", i, b, "payload")
		}
	}
	for i, a := range auths {
		if a != "Bearer tok" {
			t.Errorf("auth[%d]: got %q, want %q", i, a, "Bearer tok")
		}
	}
}

func TestRetryTransport_AttemptsExhausted(t *testing.T) {
	t.Parallel()
	clock := newFakeClock()
	var calls int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(&calls, 1)
		w.Header().Set("Retry-After", "2")
		w.Header().Set("X-RateLimit-Resource", "graphql")
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	rt := newRetryTransport("tok", http.DefaultTransport, clock)
	rt.max = 3
	resp, err := roundtrip(t, context.Background(), rt, srv.URL)

	var rle *RateLimitError
	if !errors.As(err, &rle) {
		t.Fatalf("err: got %T %v, want *RateLimitError", err, err)
	}
	if resp != nil {
		t.Errorf("resp: got %v, want nil", resp)
	}
	if rle.RetryAfter != 2*time.Second {
		t.Errorf("RetryAfter: got %v, want 2s", rle.RetryAfter)
	}
	if rle.Resource != "graphql" {
		t.Errorf("Resource: got %q, want graphql", rle.Resource)
	}
	if n := atomic.LoadInt32(&calls); n != 3 {
		t.Errorf("server calls: got %d, want 3", n)
	}
	if len(clock.slept) != 2 {
		t.Errorf("waits: got %v, want 2 sleeps between 3 attempts", clock.slept)
	}
}
