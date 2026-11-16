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
| [3709](https://github.com/veryl-lang/veryl/issues/3709) / [3710](https://github.com/veryl-lang/veryl/pull/3710) | Root override identity; explicit development recipe only. Original head18 success/3 fail/1 skipped. CI compatibility fixes pushed at c5f8f2ce; new CI pending. See [repair evidence](CI-COMPATIBILITY.md). No human review yet |

PRs 3703-3706 have unchanged heads, no human reviews, and each has 21 successful
checks plus one skipped Dependabot task. Those are existing CI results, not new
runs. Do not equate mergeability, upstream CI or an issue being closed with a
qualified downstream compiler upgrade. The struct-member-width fix remains a
documented downstream patch; no separate upstream acceptance is claimed here.

## PR3710 CI follow-up, 2026-11-16

Checked the actual job logs for head `a9f7a4441865fff7cd72c7d6ce9f5fd335172700`,
base `56c9c11789c85b4fb633c456f7889197ee9b325f`,
[run43804692007](https://github.com/veryl-lang/veryl/actions/runs/43804692007),
attempt1. All checks have completed; the three failures are:

- [Clippy](https://github.com/veryl-lang/veryl/actions/runs/43804692007/job/133092641449):
  Rust1.100.0 reports `clippy::needless_bool` at
  `crates/parser/src/veryl_grammar_trait.rs:503`. The file's Git blob is identical
  in PR head and base (`987dd205456aeab82cd45f4931e015af992bfe4c`); this PR changes
  metadata identity and tests, not parser code. Local qualification used Rust1.97,
  so its Clippy PASS does not establish compatibility with the CI toolchain.
- [Windows x64](https://github.com/veryl-lang/veryl/actions/runs/43804692007/job/133092641580)
  and [Windows ARM64](https://github.com/veryl-lang/veryl/actions/runs/43804692007/job/133092641566):
  `sccache` fails to spawn `rustc` for `veryl-analyzer` with Windows error206,
  "The filename or extension is too long." The logs include very long compiler
  argument lists. These jobs failed during compilation; they are not evidence
  that the new dependency-override test failed, nor that Windows tests passed.

The logs identify CI/toolchain compatibility blockers, not a demonstrated
override-semantic regression. No clean-base Windows CI reproduction or local
Rust1.100 full-workspace reproduction has been performed in this follow-up;
do not overstate the remaining causal evidence or turn the red checks into PASS.
At the initial investigation checkpoint no PR edits or CI reruns had been made.
The subsequent user-authorized [repair](CI-COMPATIBILITY.md) adds separate CI
compatibility commits without lint suppression, recipe changes or consumer pin
updates. Local receipts are under `.run/followup-20261116-ci` with
SHA256SUMS; the older CLI returned an empty combined failed log, so the evidence
uses the individual GitHub job-log API responses instead.
