package semver

import "testing"

func TestIsValid(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name string
		want bool
	}{
		{"v1.2.3", true},
		{"1.2.3", true},
		{"v0.0.1", true},
		{"v1.2.3-rc.1", true},
		{"v1.2.3+build.5", true},
		{"v1.2.3-rc.1+build.5", true},
		{"bindings-cleanup", false},
		{"latest", false},
		// golang.org/x/mod/semver treats a missing minor/patch as implicit
		// ".0" (same leniency the Go toolchain applies to module versions),
		// so partial-but-numeric tags are accepted rather than rejected.
		{"v1.2", true},
		{"v1", true},
		{"vv1.2.3", false},
		{"", false},
	}

	for _, c := range cases {
		if got := IsValid(c.name); got != c.want {
			t.Errorf("IsValid(%q) = %v, want %v", c.name, got, c.want)
		}
	}
}

func TestHighest(t *testing.T) {
	t.Parallel()

	cases := []struct {
		desc  string
		names []string
		want  string
	}{
		{
			desc:  "picks the greatest semver regardless of order",
			names: []string{"v1.2.2", "v1.2.3", "v1.0.0"},
			want:  "v1.2.3",
		},
		{
			// The sokol-zig report: the only tag is a manual, non-version
			// marker created long ago. It must never be reported as a version.
			desc:  "non-semver-only tag set yields no version",
			names: []string{"bindings-cleanup"},
			want:  "",
		},
		{
			desc:  "ignores non-semver tags mixed with real versions",
			names: []string{"bindings-cleanup", "v0.5.0", "wip"},
			want:  "v0.5.0",
		},
		{
			desc:  "empty input yields no version",
			names: []string{},
			want:  "",
		},
		{
			desc:  "release outranks prerelease at the same major.minor.patch",
			names: []string{"v1.0.0-rc.1", "v1.0.0"},
			want:  "v1.0.0",
		},
		{
			desc:  "preserves the tag's original casing/prefix",
			names: []string{"1.0.0", "v0.9.0"},
			want:  "1.0.0",
		},
		{
			// A plain string comparison would rank "rc.9" above "rc.10" (the
			// character '9' sorts after '1'). Per semver.org, dot-separated
			// numeric identifiers compare numerically instead — x/mod/semver
			// gets this right where the old hand-rolled comparator did not.
			desc:  "compares prerelease identifiers numerically, not lexically",
			names: []string{"v1.0.0-rc.9", "v1.0.0-rc.10"},
			want:  "v1.0.0-rc.10",
		},
	}

	for _, c := range cases {
		t.Run(c.desc, func(t *testing.T) {
			t.Parallel()
			if got := Highest(c.names); got != c.want {
				t.Errorf("Highest(%v) = %q, want %q", c.names, got, c.want)
			}
		})
	}
}
