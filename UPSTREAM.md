# Upstream tracking

Checked 2026-11-18. Official release remains v0.22.1; master is
`b8b90bc966967a140404e72cf3ade77d80442853`. Status alone is not compiler
qualification; today's isolated repair tests are recorded below.

| Issue / PR | State and action |
| --- | --- |
| [3530](https://github.com/veryl-lang/veryl/pull/3530), [3531](https://github.com/veryl-lang/veryl/pull/3531), [3585](https://github.com/veryl-lang/veryl/pull/3585) | Merged; former fixes are upstream in the selected release |
| [3671](https://github.com/veryl-lang/veryl/issues/3671) / [3672](https://github.com/veryl-lang/veryl/pull/3672) | Merged after the release; wide-array backport retained |
| [3576](https://github.com/veryl-lang/veryl/issues/3576) | Open; last reply is our Nov5 retest. Keep the consumer's explicit no-reuse qualification policy |
| [3697](https://github.com/veryl-lang/veryl/issues/3697) / [3703](https://github.com/veryl-lang/veryl/pull/3703) | Four-state equality; merged Nov17 as `b8b90bc9`, issue closed. Not in v0.22.1 or the selected downstream recipes; no consumer upgrade performed |
| [3689](https://github.com/veryl-lang/veryl/issues/3689) / [3704](https://github.com/veryl-lang/veryl/pull/3704) | Conditional constant arrays; maintainer regression reproduced and fixed, rebased onto `b8b90bc9`, pushed as `22aaaa9a`. Conflict resolved, new local gates pass, fresh upstream CI pending. PR and issue replies sent. Not added to recipes |
| [3694](https://github.com/veryl-lang/veryl/issues/3694) / [3705](https://github.com/veryl-lang/veryl/pull/3705) | Timed-helper settling; open, not added to recipes |
| [3696](https://github.com/veryl-lang/veryl/issues/3696) / [3706](https://github.com/veryl-lang/veryl/pull/3706) | Nested generic scope; open, not added to recipes |
| [3709](https://github.com/veryl-lang/veryl/issues/3709) / [3710](https://github.com/veryl-lang/veryl/pull/3710) | Root override identity; explicit development recipe only. Rebased at maintainer request after PR3708 merged. Head `44fa020c` contains only the identity fix and its regressions: 21 checks successful, 1 Dependabot skip, 0 failures; CodSpeed eight benchmarks untouched. Open and conflict-free, not approved or merged. See [repair evidence](CI-COMPATIBILITY.md) |
| [3714](https://github.com/veryl-lang/veryl/issues/3714) / [3715](https://github.com/veryl-lang/veryl/pull/3715) | New, independent command-only Git backend Clippy failure reproduced on unmodified master. Fix `d62661c0` preserves short-circuit behavior and adds three feature-subset CI checks; local checks and metadata77 pass. Fresh upstream CI pending; not added to recipes |

PRs 3705, 3706 and 3710 have unchanged heads, and each has 21 successful
checks plus one skipped Dependabot task. Those are existing CI results, not new
runs. PRs 3705, 3706 and 3710 remain mergeable, without a new review or maintainer
reply since the previous check.
Do not equate mergeability, upstream CI or an issue being closed with a qualified
downstream compiler upgrade. The struct-member-width fix remains a documented
downstream patch; no separate upstream acceptance is claimed here.

## PR3704 repair, 2026-11-18

The [Nov17 maintainer comment](https://github.com/veryl-lang/veryl/pull/3704#issuecomment-6936030640)
reports an unexpected error introduced by the conditional-array change. The
example passes an array chosen using a `$define`-dependent parameter into a
child module, where an array element determines a part-select bound. It fails
with `InvalidSelect::WrongOrder` on original head `efb1990b`, and passes with
unchanged production sources from master `b8b90bc9` plus the same regression.

The conditional-array path added in `eval_const_assign` missed the scalar path's
`!overridden` guard. The unresolved override contains **caller-local VarIds**.
Re-evaluating it in the child reads `PORT=0` under the ID belonging to `Top.SEL`,
selects `{9,9}`, and falsely diagnoses the `8 - 9` slice bound. The repair leaves
unresolved overrides unresolved in the child; arrays already resolved in the
caller still propagate through `NumericArray`. This is distinct from a real
four-state X/Z condition, which retains the original per-element merge behavior.

Head `22aaaa9ad5c3421bc5d7fabbafa3becfee4d70ef` is rebased onto `b8b90bc9`.
The conflict was only adjacent simulator test-module declarations; both modules
are retained. Added regression coverage includes `$define` and `$sv` selectors,
both child-ID collision values, known legal/illegal slice bounds, and conditional
arrays passed through Top -> Mid -> Leaf with known and X/Z values.

Local Rust1.100 qualification: analyzer 1473 PASS with 17 existing ignored;
simulator 1429, emitter 94 and metadata 77 PASS. Cargo integration/doc gates for
the latter three packages returned 0; no full-workspace PASS is claimed. The
focused analyzer 2 / simulator 3 tests also PASS on Rust1.97. Formatting, source hashes,
and strict all-target Clippy for analyzer/simulator/emitter/metadata together PASS.
Command-only metadata Clippy instead exposed the independent issue3714 below;
the original failure is retained, not treated as a passing check.

[Maintainer reply](https://github.com/veryl-lang/veryl/pull/3704#issuecomment-6971150525)
and [issue update](https://github.com/veryl-lang/veryl/issues/3689#issuecomment-6971156420)
have been sent. GitHub now reports MERGEABLE. Fresh
[Regression44252629176](https://github.com/veryl-lang/veryl/actions/runs/44252629176)
and [CodSpeed44252629048](https://github.com/veryl-lang/veryl/actions/runs/44252629048)
are pending; old-head CI is not qualification of this repair. Reproducer patches,
RED/GREEN logs, commands, versions and source hashes are retained locally under
`.run/followup-20261118`.

## Git backend feature-subset lint, 2026-11-18

[Issue3714](https://github.com/veryl-lang/veryl/issues/3714) reproduces on unchanged
master `b8b90bc9` with Rust1.100:

```sh
cargo clippy --locked -p veryl-metadata --lib --no-default-features --features git-command -- -D warnings
```

The command-only `Git::exists` reduces to `if { return true; } false`, causing
`clippy::needless_bool`. Metadata's dev dependency enables gitoxide in combined
test graphs; that successful graph does not cover the isolated command-only
configuration. This is not a conditional-array regression.

[PR3715](https://github.com/veryl-lang/veryl/pull/3715), head `d62661c0`, uses
cfg-selected boolean bindings while preserving backend priority and short-circuit
behavior. It adds command-only, gitoxide-only and combined strict Clippy checks
to the existing CI lint job, without suppression or dependency changes. All three
checks, metadata 77 and formatting PASS locally; command-only strict Clippy also
PASS on Rust1.97. A backlink was posted on the issue. Fresh remote CI is pending.

Issue3576 remains open with the Nov5 retest as the last reply. Keep explicit
no-reuse qualification unchanged. The newly merged four-state fix likewise
does not authorize a toolchain switch or patch retirement without isolated
consumer qualification. Neither repair changes selected recipes, installed
compilers or consumer pins.

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
override-semantic regression. At the initial investigation checkpoint, no
clean-base Windows CI reproduction, local Rust1.100 full-workspace reproduction,
PR edits or CI reruns had been performed. Later reproduction and repairs are
recorded separately; do not reinterpret the original failed run as PASS.
The subsequent user-authorized [repair](CI-COMPATIBILITY.md) adds separate CI
compatibility commits without lint suppression, recipe changes or consumer pin
updates. Local receipts are under `.run/followup-20261116-ci` with
SHA256SUMS; the older CLI returned an empty combined failed log, so the evidence
uses the individual GitHub job-log API responses instead.

During the follow-up, upstream merged PR3708 with equivalent lint fixes and a
Windows sccache v0.16.0 pin. Our fully green0801ab27 then conflicted with master.
The maintainer's rebase request is handled by replaying only the original identity
commit onto e86d2851. The old compatibility history and run evidence remain
available; they are no longer changes proposed by PR3710.
