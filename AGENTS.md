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
- Check relevant feature subsets as well as the combined workspace graph.
  Dev-dependency feature unification can hide defects in an isolated library's
  default backend; record the actual feature graph instead of treating one
  successful Clippy invocation as covering all supported configurations.

## Current Follow-up

Nov19: PR3704 and PR3710 merged after green final-head CI and both issues
closed. The latest release is still v0.22.1; #3576 remains open. No recipe,
consumer pin or installed compiler changes. See UPSTREAM.md for merge IDs;
the earlier investigation notes below describe the state at the time.

Nov18 repair: PR3704 rebased onto b8b90bc9 and pushed as 22aaaa9a. Maintainer's
example is RED on original efb1990b, GREEN on unmodified master and repaired head.
The missing !overridden guard re-evaluated caller VarIds against the child table.
New tests preserve unknown external selectors, genuine select errors and known/
X/Z values through instances. Analyzer 1473 pass / 17 existing ignored, simulator
1429, emitter 94, metadata 77, fmt and combined strict Clippy pass on Rust1.100;
focused analyzer 2 / simulator 3 also pass on Rust1.97. PR/issue replies sent.
Windows ARM64 tests passed but post-job Dev Drive cleanup failed; rerun requested. See
UPSTREAM.md and local .run/followup-20261118 receipts; repair checkout is
.run/conditional-review.

Separate upstream-baseline command-only metadata Clippy failure is issue3714 /
PR3715 d62661c0, checkout .run/git-exists-review. Three backend-subset strict checks,
metadata 77 and fmt pass; Rust1.97 command-only check also passes. CI checks added
without lint suppression; remote CI green (21 successes, one skip). Not folded into 3704 or recipes.
PR3703 merged / issue3697 closed; 3705/3706/3710 unchanged and mergeable;
3576 has no new reply.
No compiler recipe, dependency pin, installed compiler or consumer change.

## Previous Repair

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
