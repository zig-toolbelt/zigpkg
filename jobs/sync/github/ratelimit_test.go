package github

import (
	"math"
	"testing"
	"time"
)

func TestBudgetUpdate_ComputesRate(t *testing.T) {
	t.Parallel()
	b := newBudget()
	b.update(RateLimit{Limit: 5000, Cost: 1, Remaining: 5000, ResetAt: time.Now().Add(time.Hour)})

	got := float64(b.limiter.Limit())
	want := 5000.0 * safetyMargin / 3600.0 // 1.25 rps
	if math.Abs(got-want) > 0.05 {
		t.Errorf("rate: got %v, want ~%v", got, want)
	}
}

func TestBudgetUpdate_ZeroResetIsNoOp(t *testing.T) {
	t.Parallel()
	b := newBudget()
	before := b.limiter.Limit()

	b.update(RateLimit{Limit: 5000, Remaining: 1, ResetAt: time.Time{}})

	if b.limiter.Limit() != before {
		t.Errorf("limit changed on zero ResetAt: got %v, want %v", b.limiter.Limit(), before)
	}
	if !b.resetAt.IsZero() {
		t.Errorf("resetAt should stay zero, got %v", b.resetAt)
	}
}

func TestBudgetUpdate_ExhaustedCrawls(t *testing.T) {
	t.Parallel()
	b := newBudget()
	b.update(RateLimit{Limit: 5000, Remaining: 0, ResetAt: time.Now().Add(time.Hour)})

	if got := b.limiter.Limit(); got != crawlRate {
		t.Errorf("rate: got %v, want crawl %v", got, crawlRate)
	}
}

func TestBudgetUpdate_ResetPassedCrawls(t *testing.T) {
	t.Parallel()
	b := newBudget()
	b.update(RateLimit{Limit: 5000, Remaining: 500, ResetAt: time.Now().Add(-time.Minute)})

	if got := b.limiter.Limit(); got != crawlRate {
		t.Errorf("rate: got %v, want crawl %v", got, crawlRate)
	}
}

func TestBudgetUntilReset(t *testing.T) {
	t.Parallel()
	b := newBudget()
	b.update(RateLimit{Remaining: 100, ResetAt: time.Now().Add(30 * time.Second)})

	if d := b.untilReset(); d < 28*time.Second || d > 30*time.Second {
		t.Errorf("untilReset: got %v, want ~30s", d)
	}
}

func TestBudgetUntilReset_Unknown(t *testing.T) {
	t.Parallel()
	b := newBudget()
	if d := b.untilReset(); d != defaultRateLimitWait {
		t.Errorf("untilReset: got %v, want %v", d, defaultRateLimitWait)
	}
}
