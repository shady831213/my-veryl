# Upstream tracking

Checked 2026-11-19. Official release remains v0.22.1; master is
`e36f236d366bf63e2301e69a4f39ed8cc565b925`. Status alone is not compiler
qualification; dated repair tests are recorded below.

| Issue / PR | State and action |
| --- | --- |
| [3530](https://github.com/veryl-lang/veryl/pull/3530), [3531](https://github.com/veryl-lang/veryl/pull/3531), [3585](https://github.com/veryl-lang/veryl/pull/3585) | Merged; former fixes are upstream in the selected release |
| [3671](https://github.com/veryl-lang/veryl/issues/3671) / [3672](https://github.com/veryl-lang/veryl/pull/3672) | Merged after the release; wide-array backport retained |
| [3576](https://github.com/veryl-lang/veryl/issues/3576) | Open; last reply is our Nov5 retest. Keep the consumer's explicit no-reuse qualification policy |
| [3697](https://github.com/veryl-lang/veryl/issues/3697) / [3703](https://github.com/veryl-lang/veryl/pull/3703) | Four-state equality; merged Nov17 as `b8b90bc9`, issue closed. Not in v0.22.1 or the selected downstream recipes; no consumer upgrade performed |
| [3689](https://github.com/veryl-lang/veryl/issues/3689) / [3704](https://github.com/veryl-lang/veryl/pull/3704) | Conditional constant arrays; maintainer regression repaired on `22aaaa9a`. Remote tests passed, but Windows ARM64 post-job cleanup failed. Maintainer rerun requested. Not added to recipes |
| [3694](https://github.com/veryl-lang/veryl/issues/3694) / [3705](https://github.com/veryl-lang/veryl/pull/3705) | Timed-helper settling; merged Nov19 as `b4df4d88`, issue closed. Post-release; not added to recipes |
| [3696](https://github.com/veryl-lang/veryl/issues/3696) / [3706](https://github.com/veryl-lang/veryl/pull/3706) | Nested generic scope; merged Nov19 as `e36f236d`, issue closed. Post-release; not added to recipes |
| [3709](https://github.com/veryl-lang/veryl/issues/3709) / [3710](https://github.com/veryl-lang/veryl/pull/3710) | Root override identity; explicit development recipe only. After the requested rebase, `44fa020c` passed 21 checks with one Dependabot skip; eight CodSpeed benchmarks untouched. On Nov19 master was merged into the PR: head `09b2e998`, same three changed files. Fresh CI: 21 successful, one Dependabot skip, no failures. Open and mergeable, not merged. See [repair evidence](CI-COMPATIBILITY.md) |
| [3714](https://github.com/veryl-lang/veryl/issues/3714) / [3715](https://github.com/veryl-lang/veryl/pull/3715) | Merged Nov18 as `7f226bcf`; issue closed. Fix preserves short-circuit behavior and adds three feature-subset CI checks. Post-release only; not added to consumer recipes |

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
have been sent. In [Regression attempt 1, Windows ARM64](https://github.com/veryl-lang/veryl/actions/runs/44252629176/job/134626715163),
`Run tests` succeeded. The only failure was the setup-dev-drive post-job cleanup:
Get-VHD was unavailable during removal, after the tests and sccache stats.
The workflow is red, but it does not report a compiler regression.
A [failed-job rerun was requested](https://github.com/veryl-lang/veryl/pull/3704#issuecomment-6971532058).
Reproducer patches,
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
PASS on Rust1.97. A backlink was posted on the issue. Remote CI on this head
finished with 21 successes and one skip.

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
