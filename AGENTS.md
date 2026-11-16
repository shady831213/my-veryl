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
