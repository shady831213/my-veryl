# Upstream tracking

Checked 2026-11-16. Official release remains v0.22.1; master is
`56c9c11789c85b4fb633c456f7889197ee9b325f`. Status is not a fresh compiler test.

| Issue / PR | State and action |
| --- | --- |
| [3530](https://github.com/veryl-lang/veryl/pull/3530), [3531](https://github.com/veryl-lang/veryl/pull/3531), [3585](https://github.com/veryl-lang/veryl/pull/3585) | Merged; former fixes are upstream in the selected release |
| [3671](https://github.com/veryl-lang/veryl/issues/3671) / [3672](https://github.com/veryl-lang/veryl/pull/3672) | Merged after the release; wide-array backport retained |
| [3576](https://github.com/veryl-lang/veryl/issues/3576) | Open; last reply is our Nov5 retest. Keep the consumer's explicit no-reuse qualification policy |
| [3697](https://github.com/veryl-lang/veryl/issues/3697) / [3703](https://github.com/veryl-lang/veryl/pull/3703) | Four-state equality; open, not added to recipes |
| [3689](https://github.com/veryl-lang/veryl/issues/3689) / [3704](https://github.com/veryl-lang/veryl/pull/3704) | Conditional constant arrays; open, not added to recipes |
| [3694](https://github.com/veryl-lang/veryl/issues/3694) / [3705](https://github.com/veryl-lang/veryl/pull/3705) | Timed-helper settling; open, not added to recipes |
| [3696](https://github.com/veryl-lang/veryl/issues/3696) / [3706](https://github.com/veryl-lang/veryl/pull/3706) | Nested generic scope; open, not added to recipes |

PRs 3703-3706 have unchanged heads, no human reviews, and each has 21 successful
checks plus one skipped Dependabot task. Those are existing CI results, not new
runs. Do not equate mergeability, upstream CI or an issue being closed with a
qualified downstream compiler upgrade. The struct-member-width fix remains a
documented downstream patch; no separate upstream acceptance is claimed here.
