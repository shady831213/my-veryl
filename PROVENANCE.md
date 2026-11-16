# Provenance

Extracted without compiler implementation changes on 2026-11-16 from:

- [pcie_modeling 1bfc188](https://github.com/shady831213/pcie_modeling/tree/1bfc188):
  installer, two-patch recipe and installer tests under `tools/rtl-flow`.
- [pdma 34aaccff](https://github.com/shady831213/pdma/tree/34aaccff):
  third patch, recipe and compiler smoke projects under `tools/rtl-flow`.

The two shared patches have identical bytes in both projects. Their ordered
manifest is `481f5b9ad45f88c9f0a867cf75ced2b470400e9cc0397b598b56a2fc13fa201b`;
the three-patch manifest is
`083c78440af0bd7085059e25000f1ab2b8a00bb6ed3954d94f9b3a92df5e7396`.
The recipes preserve those identities. Installer changes only select an explicit
recipe and a caller-owned cache; project-root assumptions are removed.

Patch order:

1. `veryl-generic-parameters.patch`: generic module forwarding and known literal
   interface widths; preserve genuine range and cycle diagnostics.
2. `veryl-wide-array-guard.patch`: select safe wide storage before a slice;
   [#3671](https://github.com/veryl-lang/veryl/issues/3671),
   [#3672](https://github.com/veryl-lang/veryl/pull/3672). Merged upstream after
   0.22.1, retained as a backport for these frozen recipes.
3. `veryl-struct-member-width.patch`: truncate nonliteral member expressions
   before concatenating a struct in native simulation. Does not change emitted
   SystemVerilog. The independent multi-field reproducer is preserved.

Inherited evidence does not prove a new extraction or consumer migration passed.
Record new runs separately, including discovered counts and compiler identities.
The upstream compiler is MIT OR Apache-2.0; its source is downloaded from its
official archive, not vendored in this repository.
