package github

import (
	"context"
	"time"

	"golang.org/x/time/rate"
)

const (
	// defaultRate is a generous cold-start baseline: GitHub grants authenticated
	// GraphQL clients 5000 points/hour ≈ 1.39 points/second. The real allowance
	// is learned from the server's rateLimit block on the first response.
	defaultRate = rate.Limit(5000.0 / 3600.0)

	// defaultBurst lets a fresh client (and the test suite) make a small handful
	// of immediate requests before pacing kicks in.
	defaultBurst = 10

	// crawlRate is the near-idle pace used once the remaining budget is spent or
	// its reset time has already passed: roughly one request per second.
	crawlRate = rate.Limit(1)

	// safetyMargin keeps ~10% of the remaining budget unspent as headroom
	// against GitHub's secondary (points-per-minute) limits.
	safetyMargin = 0.9

	// defaultRateLimitWait is the fallback retry hint used when the server has
	// not yet told us when the budget resets.
	defaultRateLimitWait = time.Minute
)

// budget adaptively paces outbound requests using the server-reported GraphQL
// rate limit as the source of truth. It wraps a token-bucket limiter whose rate
// is recomputed after every successful response.
type budget struct {
	limiter *rate.Limiter
	resetAt time.Time
}

func newBudget() *budget {
	return &budget{limiter: rate.NewLimiter(defaultRate, defaultBurst)}
}

// Wait blocks until the limiter allows another request or ctx is cancelled.
func (b *budget) Wait(ctx context.Context) error {
	return b.limiter.Wait(ctx)
}

// update recomputes the allowed request rate from a server-reported rateLimit
// block. It is a no-op when ResetAt is zero — header-less responses (such as the
// test mocks) must not slow the limiter down. When the budget is spent or its
// reset has passed it drops to a crawl until the window resets; otherwise it
// spreads the remaining budget (minus a safety margin) across the time left.
func (b *budget) update(rl RateLimit) {
	if rl.ResetAt.IsZero() {
		return
	}
	b.resetAt = rl.ResetAt

	timeToReset := time.Until(rl.ResetAt)
	if rl.Remaining <= 0 || timeToReset <= 0 {
		b.limiter.SetLimit(crawlRate)
		return
	}
	b.limiter.SetLimit(rate.Limit(float64(rl.Remaining) * safetyMargin / timeToReset.Seconds()))
}

// untilReset reports how long to wait for the current rate-limit window to
// reset. It is used as the RetryAfter hint when GitHub returns RATE_LIMITED
// inside an otherwise-200 GraphQL body (which carries no Retry-After header).
func (b *budget) untilReset() time.Duration {
	if b.resetAt.IsZero() {
		return defaultRateLimitWait
	}
	if d := time.Until(b.resetAt); d > 0 {
		return d
	}
	return defaultRateLimitWait
}
