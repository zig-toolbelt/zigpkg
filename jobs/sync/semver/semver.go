// Package semver filters and ranks git tag names shaped like a semantic
// version. Sources report the most recently created tag on a repo, but many
// Zig repos also carry non-version tags (one-off markers, milestones) that
// happen to be newer than any real release — this package makes sure only
// tags that actually look like a version are ever treated as one.
//
// It wraps golang.org/x/mod/semver (the same semver implementation the Go
// toolchain uses for module versions) instead of hand-rolling parsing and
// comparison — spec-correct precedence (including prerelease ordering) comes
// for free. The one gap x/mod/semver doesn't cover is tags without a leading
// "v" (common in Zig repos, e.g. "1.2.3"), so this package normalizes that
// before delegating.
package semver

import (
	"strings"

	xsemver "golang.org/x/mod/semver"
)

// normalize adds the "v" prefix golang.org/x/mod/semver requires.
func normalize(s string) string {
	if strings.HasPrefix(s, "v") {
		return s
	}
	return "v" + s
}

// IsValid reports whether s is shaped like a semantic version, with or
// without a leading "v" (e.g. "v1.2.3", "1.2.3-rc.1").
func IsValid(s string) bool {
	return xsemver.IsValid(normalize(s))
}

// Highest returns the tag name (as-authored, e.g. "v1.2.3") with the greatest
// semver value among names, or "" if none of them are semver-shaped.
//
// names is expected to be a bounded window (the most recent N tags by commit
// date, not the repo's full tag history) — see the callers in the github and
// codeberg packages for why. If the repo's true highest version falls outside
// that window, it will be missed; this is an accepted cost/exhaustiveness
// trade-off, not a bug in this function.
func Highest(names []string) string {
	var best string
	for _, name := range names {
		if !IsValid(name) {
			continue
		}
		if best == "" || xsemver.Compare(normalize(name), normalize(best)) > 0 {
			best = name
		}
	}
	return best
}
