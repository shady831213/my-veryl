# Compiler maintenance boundary

- Maintain temporary upstream fixes, reproducible recipes and compiler regressions.
- No cells, design snapshots, IP packaging, EDA flows or project-specific policy.
- Keep recipes explicit and consumers independently pinned. Never silently add a
  patch, switch a consumer's compiler, disable assertions or alter test discovery.
- Preserve source/archive/ordered patch hashes and verified installation locking.
- Use native Veryl projects for reproducers; tests stay with their owning surface.
- Check upstream with a minimal reproducer before claiming a defect is fixed.
- Qualify the actual CI compiler version as well as the consumer's pinned compiler;
  a local pinned-tool PASS does not cover moving stable CI. Inspect all failures
  before changing cache policy or adding suppressions. Preserve test coverage and
  separate cache/compiler compatibility fixes from the original semantic fix.
- Retire patches after upstream and downstream qualification, not merely merging.
- Upstream PR branches remain in the Veryl fork, not duplicate source trees here.
- Public repository: no machine paths, proprietary sources, keys or EDA settings.
- Use per-checkout Cargo target directories for qualification. A cache hit is not
  proof that a different checkout was rebuilt; validate source provenance and
  generated fixture paths before accepting comparison binaries.

## Current repair

PR3710 head `44fa020c` on upstream `e86d2851` replays only the original identity
fix after the maintainer's rebase request. Duplicate CI/lint changes are dropped.
Fresh Regression43834332525 and CodSpeed43834332560 passed: 21 successful checks,
one Dependabot skip, zero failures; eight benchmarks untouched. Both Windows
logs execute the new metadata and CLI regressions. Local strict Rust1.100 Clippy,
fmt, Rust1.97 metadata80 and CLI integration also pass. PR remains open, not merged.
The earlier c5f8f2ce performance alert and inconclusive native diagnostics remain
recorded; subsequent green checks do not prove the alert's unique cause.
Read CI-COMPATIBILITY.md and local receipts in .run/followup-20261116-ci before
continuing. Preserve consumer pins and the identity backport; do not acknowledge
or suppress the performance gate without matched evidence and appropriate review.
