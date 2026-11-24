# Post-release compiler candidate: 75c47070

Use `upstream-75c47070-generic-struct` to evaluate the newer compiler. Use
`upstream-75c47070` as the **unpatched control**, not as a replacement for a
working installation. Both use the same [upstream archive](https://github.com/veryl-lang/veryl/tree/75c47070ca1f89428390229c3502df409e139645),
Rust 1.97.0, locked Cargo dependencies and the optimized `release-verylup`
profile. Each was built from scratch in a separate Cargo target. No published
release recipe was modified or consumer selected automatically.

| What the native reproducer checks | No patches | Two patches |
|---|---|---|
| Basic clocked increment and struct layout (2 tests) | Pass | Pass |
| Constant and expression overrides through a generic module, at two widths | Runtime assertion `FORWARD_128` | Pass |
| Nested interface width follows its caller | Analyzer `invalid_select` on legal bit 4; test did not execute | Pass |
| Wide array storage before slicing | Pass | Pass |
| Nonliteral packed-struct member preserves its neighbors | Runtime assertion `NEIGHBORS_INTACT` | Pass |

Results were the same for both requested native backends (CC and Cranelift),
with reuse off and backend validation every step. The first two generic cases
exercise separate parts of one patch. Do not infer their status from a related
upstream fix for nested generic *type* arguments. The rebased generic patch
retains the original production edits and regressions; only test-module
registration context and hunk offsets changed. The original struct-member
patch applies without modification. Neither backports the wide-array fix
[#3672](https://github.com/veryl-lang/veryl/pull/3672) or the override fix
[#3710](https://github.com/veryl-lang/veryl/pull/3710).

**Dependency override is a separate check.** On the untouched upstream source,
the integration test below passed: a root override and a transitive dependency
select the same release; the analyzer reads the *local* leaf with a deliberately
different width. This is stronger than checking the metadata JSON alone.
On the [cells development graph](https://github.com/shady831213/my-veryl-cells/tree/d519330d921bf4145f146b85e52aa9fca1793ee3)
unpatched metadata v2 resolved both expected local paths and the transitive
edge. Standalone `veryl check` on its test project returned nonzero with
nine unused-variable diagnostics on both the pinned release control and
the unpatched candidate. It is **not** counted as a clean lint pass.
With the repaired binary, the native cell and provider tests passed 12/12 and
3/3 respectively on each requested backend.

**Additional qualification.** Three focused analyzer unit tests passed on the
patched source, including rejection of a real out-of-range select; the
simulator's generic forwarding unit test also passed. Two external native
suites (52 and 32 tests) matched their respective pinned compilers on CC by
test name, status and reported output. All 17 assertion-negative controls in
the first consumer reached their expected diagnostics on the candidate.

That consumer's production SV filelist grew from 81 files to 82. Of the
original 81, 80 were byte-identical and all retained their relative order.
Only the standard library RAM changed, and the standard library utility
package was added. No project-authored SV changed. This is a reason to
qualify the new filelist and RAM in the consumer's EDA flow before changing
its pin, not a reason to repeat synthesis on this compiler-maintenance branch.

## Reproduce

From this repository on Linux x86-64, use a fresh output directory for each
matrix. The unpatched matrix is expected to exit 1; inspect the per-case logs
and JSON. The repaired matrix must exit 0 with all six named tests passing
per backend. An analyzer error is never counted as a passing runtime test.

```sh
recipe=upstream-75c47070-generic-struct  # Repeat with upstream-75c47070 for the control.
bin=$(bash veryl.sh --toolchain "$recipe" --print-bin-dir) &&
    node tests/compiler-regressions.mjs "$bin/veryl" ".run/matrix-$recipe"
```

From the exact unpatched upstream checkout, with an isolated Cargo target:

```sh
cargo +1.97.0 test --locked --profile release-verylup -p veryl \
  --test dependency_override -- --exact local_override_resolves_transitive_namespace
```

This removes two backports **from the candidate only**. Consumer negative
tests, generated SV, and downstream verification/implementation flows have
their own qualification gates. These runs do not establish correctness with
DUT reuse enabled or physical equivalence of an emitted design.
