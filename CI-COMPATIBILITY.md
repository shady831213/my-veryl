# Rust 1.100 CI compatibility

This follow-up repairs the red checks on
[PR3710](https://github.com/veryl-lang/veryl/pull/3710), not the downstream compiler
recipes. The original dependency-identity change is `a9f7a444`; its implementation
and regression assertions remain unchanged. The compatibility follow-ups below
are historical: upstream subsequently merged its own repair in
[PR3708](https://github.com/veryl-lang/veryl/pull/3708), and the maintainer requested
a rebase. The rebased PR contains only the original identity fix and its tests.

## Current head

`44fa020c7ef4bd9442d0e25d9683d6ba1884b6c9` applies the original fix to upstream
`e86d2851b456c2b31d27f67a752511f5783ed6dc`. Its stable patch ID is identical to
`a9f7a444`. The diff against this new base touches only the metadata identity,
metadata regressions and dependency-override CLI regression. It does not retain
our independent Clippy, workflow or unrelated dirty-map test changes.

Upstream now pins Windows sccache to v0.16.0; the PR inherits that policy rather
than keeping a second workaround. The former `0801ab27` head completed with
21 successful checks, one skipped Dependabot task and zero failures, including
both Windows platforms and CodSpeed's eight untouched benchmarks. That is
evidence for the former head, not a substitute for testing the rebased head.
Rebased Rust 1.100 strict workspace/all-target Clippy and fmt pass, as do all
80 metadata tests and the CLI integration regression on Rust 1.97. Source hashes
were checked after execution. Fresh upstream qualification also passed:
[Regression43834332525](https://github.com/veryl-lang/veryl/actions/runs/43834332525),
[CodSpeed43834332560](https://github.com/veryl-lang/veryl/actions/runs/43834332560).
The exact head has 21 successful checks, zero failures and one skipped Dependabot
task. Both Windows logs explicitly execute the override CLI test and all three
metadata regressions. CodSpeed reports eight untouched benchmarks against the
new base. The PR is open and conflict-free; these results do not claim approval
or a downstream compiler upgrade.
The [reply to the maintainer](https://github.com/veryl-lang/veryl/pull/3710#issuecomment-6911812248)
records the rebase and removal of duplicate changes. Consumer recipes and pins
remain unchanged.

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

## Historical repair boundaries

Before rebase, the two Boolean guards were changed to `is_none()`. The five loops
retained ascending iteration, selected ranges, copied values and effects using
standard iterators.
The dirty-map regression compares relative output indices with an independent
per-bit oracle across empty, full and sparse words, partial words, word boundaries,
out-of-range starts and clipped lengths. No lint allow, test deletion or new ignore
was added. The analyzer's17 pre-existing ignored tests are unchanged.

Our temporary workflow used Cargo/rustc directly on Windows, allowing Cargo's
response-file fallback.
Both Windows targets, wasm target installation, `--locked`, test selection and
optimization settings are unchanged. Rust-cache still restores compiled
dependencies, using a distinct direct-rustc key. Non-Windows sccache remains
enabled. This is a scoped workaround for a known cache-tool defect, not a test
workaround. It did not qualify resuming sccache0.19.0. Upstream subsequently
selected v0.16.0, predating the regression; the rebased PR uses that upstream
policy and removes our temporary workflow changes entirely.

No consumer pin, ordered patch bytes, installer recipe, user default toolchain,
hardware source or EDA input changed. Rust1.100 was installed as a separately named
toolchain for verification; the existing mirror lacked it, so that installation
used the official distribution server without changing global configuration.

## Historical local evidence

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

The first fully functional candidate is `c5f8f2cea1bf0b2a31101d8c5841395445b0d82f`.
[Regression43821964304](https://github.com/veryl-lang/veryl/actions/runs/43821964304)
completed successfully, including all five platform builds and Clippy. Both
Windows logs show the override CLI regression and all three metadata regressions
executed and passed; their full workspace test jobs are not zero-discovery passes.
[CodSpeed43821964346](https://github.com/veryl-lang/veryl/actions/runs/43821964346)
also completed its execution jobs, but its separate performance-analysis check
failed. That head had20 successful checks,1 failure and1 skipped task, not
an all-green result. The investigation and local results were posted in the
[PR comment](https://github.com/veryl-lang/veryl/pull/3710#issuecomment-6909922347).

Intermediate head534f1ce7 fixed the first two blockers but still exposed later
Clippy diagnostics. Its runs43820137746 and43820137735 are superseded, not PASS.
Cancellation requests were denied with HTTP403 because the fork author lacks
the required upstream repository permission; those runs were not cancelled by
this work. Use the final head's checks for qualification.

## Performance investigation

The c5f8f2ce performance report flagged `analyze`: base244.8ms versus head249.9ms,
-2.03% efficiency,7 other benchmarks untouched. It explicitly warns that hardware
and software environments differ. The original identity-only head a9f7a444 had
8 untouched benchmarks. These observations do not establish a code regression,
but they also do not permit ignoring or acknowledging the red check as harmless.

A native paired benchmark ran on the same machine with Rust1.100,
the same bench profile, CPU affinity, input ordering and runtime metadata. Its
walltime results are diagnostic, not equivalent to CodSpeed's CPU simulation.
No benchmark thresholds, fixtures or functional assertions have been weakened.

An attempted shared Cargo target reused the base checkout's artifact for head;
the generated fixture list still pointed at base. That attempt is rejected and
not a head measurement. Head is rebuilt in its own target directory, and the
capture helper rejects fixture paths outside the claimed source checkout.
The unmodified base's non-CI benchmark preflight also reports analyzer errors;
the paired performance run must explicitly retain the existing CI benchmark
profile rather than treating that preflight as passed. Full functional tests are
qualified independently above.

### Matched native diagnostics

Base and head were built in separate target directories and captured as separate
hashed binaries. Cargo JSON artifacts and generated fixture paths identify their
actual source checkout. All104 ordered fixture files, benchmark source, Cargo.lock
and runtime metadata match. Runs use one working directory, fixed CPU affinity,
fat LTO,100 samples,3s warmup and a requested10s measurement window. Criterion may
extend that window to collect100 samples. Each round alternates A/B/B/A.

| Paired round | A executions (ms) | B executions (ms) | Mean time change B/A |
| --- | --- | --- | --- |
| master56c9c117 / c5f8f2ce | 100.637,103.276 | 103.466,102.565 | +1.04% |
| c5f8f2ce / minimal alias append cleanup | 112.640,113.568 | 112.446,113.851 | +0.04% |

The shared host is not exclusive. The first round's base drift exceeds its mean
difference, and absolute times differ across rounds; do not pool those absolute
values or treat walltime as an instruction-simulation result. These diagnostics
neither conclusively attribute the alert to code nor prove the cleanup fixes it.

Review found that Vec::extend unnecessarily replaced the original empty-suffix
guard and per-item push. Commit0801ab27 retains that structure, using iteration
only to replace indexing. It minimizes the lint cleanup independently of noisy
performance measurements. Rust1.100 strict workspace Clippy and fmt,
Rust1.97 analyzer1470 with17 existing ignored, and the override CLI test pass again.
The measured source patch matches this commit. Identity logic and consumer
recipes are unchanged.

The last pre-rebase head was `0801ab2717439b6d7ca0a4b78c7d911b3dd9b6e8`.
[Regression43830105589](https://github.com/veryl-lang/veryl/actions/runs/43830105589)
and [CodSpeed43830105672](https://github.com/veryl-lang/veryl/actions/runs/43830105672)
passed, including the separate performance gate: eight benchmarks untouched.
Both Windows logs execute the override CLI test and all three metadata regression
tests successfully. The passing rerun does not establish the unique cause of the
earlier alert; the native diagnostics remain inconclusive. Matched results
were posted in the [PR comment](https://github.com/veryl-lang/veryl/pull/3710#issuecomment-6911183569)
with a request for a fresh upstream base measurement. No performance acknowledgment,
threshold change or baseline rewrite was made.
