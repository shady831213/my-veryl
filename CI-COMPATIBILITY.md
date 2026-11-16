# Rust 1.100 CI compatibility

This follow-up repairs the red checks on
[PR3710](https://github.com/veryl-lang/veryl/pull/3710), not the downstream compiler
recipes. The original dependency-identity change is `a9f7a444`; its implementation
and regression assertions remain unchanged. Follow-up commits are `1cfc336d`,
`534f1ce7` and `c5f8f2ce`, kept separate for review.

## Failure and cause

The original CI head had18 successful checks,3 failures and1 skipped task:

- Clippy stopped in existing parser code on Rust1.100's `needless_bool` lint.
  The same failure reproduced locally with Rust1.100. Once it was fixed, the
  complete check exposed six more existing diagnostics: the migrator's copy of
  that predicate and five indexed loops in analyzer, simulator and synthesizer.
  These source files were not changed by the original identity PR.
- Both Windows targets failed to launch rustc through sccache0.19.0, reporting
  error206 before running the tests. Cargo1.100's
  [new build-directory layout](https://blog.rust-lang.org/2026/11/12/Rust-1.100.0/)
  expands the dependency argument lists. Sccache expands Cargo's response file
  but then attempts to launch the expanded list. The matching upstream fix,
  [mozilla/sccache#3026](https://github.com/mozilla/sccache/pull/3026), merged on
  November14, is91 commits after v0.19.0 and is not in that release.

The earlier local Rust1.97 Clippy PASS was genuine but did not qualify the newer
CI compiler. The initial CI failures were not failures of the override assertions.
They still count as failed checks, not a successful regression run.

## Repair boundaries

The two Boolean guards now use `is_none()`. The five loops retain ascending
iteration, selected ranges, copied values and effects using standard iterators.
The dirty-map regression compares relative output indices with an independent
per-bit oracle across empty, full and sparse words, partial words, word boundaries,
out-of-range starts and clipped lengths. No lint allow, test deletion or new ignore
was added. The analyzer's17 pre-existing ignored tests are unchanged.

Windows uses Cargo/rustc directly, allowing Cargo's response-file fallback.
Both Windows targets, wasm target installation, `--locked`, test selection and
optimization settings are unchanged. Rust-cache still restores compiled
dependencies, using a distinct direct-rustc key. Non-Windows sccache remains
enabled. This is a scoped workaround for a known cache-tool defect, not a test
workaround. Restore Windows sccache only after selecting a release containing
the upstream fix and qualifying both Windows matrix entries.

No consumer pin, ordered patch bytes, installer recipe, user default toolchain,
hardware source or EDA input changed. Rust1.100 was installed as a separately named
toolchain for verification; the existing mirror lacked it, so that installation
used the official distribution server without changing global configuration.

## Local evidence

| Gate | Result |
| --- | --- |
| Rust1.100 parser Clippy before repair | Exact `needless_bool` failure reproduced |
| Rust1.100 workspace/all-target Clippy after all repairs | PASS with `-D warnings`; Cargo-level unused-dependency warnings remain visible |
| Rust1.100 rustfmt | PASS |
| actionlint1.7.12, workflow checks without optional shellcheck | PASS; downloaded binary/archive hashes checked |
| Rust1.97 parser | 30 PASS |
| Rust1.97 analyzer | 1470 PASS,17 existing ignored |
| Rust1.97 metadata / migrator | 80 /1 PASS |
| Rust1.97 simulator / synthesizer | 1425 /9 PASS |
| Rust1.97 dependency-override CLI integration | 1 PASS |
| my-veryl installer | 6 PASS |
| Candidate source hashes | PASS after execution |

These are native Linux results, not proof of Windows or WASM runtime execution.
Raw receipts remain in `.run/followup-20261116-ci`, including the red checks and
the original CI logs; they are not design inputs or published snapshots.

## Upstream execution

Final candidate head is `c5f8f2cea1bf0b2a31101d8c5841395445b0d82f`.
New [Regression43821964304](https://github.com/veryl-lang/veryl/actions/runs/43821964304)
and [CodSpeed43821964346](https://github.com/veryl-lang/veryl/actions/runs/43821964346)
are running; final conclusions remain pending. The investigation and local results
were posted in the [PR comment](https://github.com/veryl-lang/veryl/pull/3710#issuecomment-6909922347).

Intermediate head534f1ce7 fixed the first two blockers but still exposed later
Clippy diagnostics. Its runs43820137746 and43820137735 are superseded, not PASS.
Cancellation requests were denied with HTTP403 because the fork author lacks
the required upstream repository permission; those runs were not cancelled by
this work. Use the final head's checks for qualification.
