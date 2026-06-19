package github

import (
	"context"
	"math/rand"
	"time"
)

// Clock abstracts the few time-dependent operations the transport relies on so
// that backoff, Retry-After parsing, and jitter are deterministic under test.
// The real implementation defers to the standard library; tests substitute a
// fake that records requested sleep durations and returns immediately.
type Clock interface {
	// Now returns the current time (used when parsing HTTP-date Retry-After
	// headers into a duration).
	Now() time.Time
	// Int63n returns a pseudo-random value in [0, n) for full-jitter backoff.
	Int63n(n int64) int64
	// Sleep blocks for d or until ctx is cancelled, whichever comes first. It
	// returns ctx.Err() if the context is cancelled, otherwise nil.
	Sleep(ctx context.Context, d time.Duration) error
}

// realClock is the production Clock backed by the standard library.
type realClock struct{}

func (realClock) Now() time.Time { return time.Now() }

func (realClock) Int63n(n int64) int64 {
	if n <= 0 {
		return 0
	}
	return rand.Int63n(n)
}

func (realClock) Sleep(ctx context.Context, d time.Duration) error {
	if d <= 0 {
		return ctx.Err()
	}
	timer := time.NewTimer(d)
	defer timer.Stop()
	select {
	case <-timer.C:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}
