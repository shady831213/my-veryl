# my-veryl

Temporary, reproducible fixes for the upstream Veryl compiler. This repository
owns compiler recipes, patches, minimal regressions and upstream issue tracking.
It does not own hardware libraries, project flows, IP-resource packaging,
technology configuration or generated design snapshots.

## Use

```sh
bash veryl.sh --toolchain 0.22.1-generic-wide --version
bash veryl.sh --toolchain 0.22.1-generic-wide-struct --print-bin-dir
node --test tests/installer.test.mjs
```

Select a recipe explicitly. Both use upstream 0.22.1 at
`8521c8c21e495916ca33648ddab746320953e11d`, Rust 1.97.0, locked Cargo dependencies
and `release-verylup`. `generic-wide` preserves the PCIe project's existing two
patches. `generic-wide-struct` additionally preserves PDMA's member-width fix.
Extraction does not qualify either project's switch to the other recipe.

Library development with a root Git dependency override and a transitive
reference needs the additional `0.22.1-generic-wide-struct-override` recipe:

```sh
export PATH="$(bash veryl.sh --toolchain 0.22.1-generic-wide-struct-override --print-bin-dir):$PATH"
```

It fixes repository identity for that native dependency graph. The original two
recipes remain unchanged for independently pinned consumers. No project is
automatically upgraded. See [the fix and qualification](DEPENDENCY-OVERRIDE.md).

For testing the post-release upstream commit, select `upstream-75c47070`
(unpatched diagnostic baseline, **known failing**) or
`upstream-75c47070-generic-struct` (opt-in repaired candidate).
[Candidate comparison and reproduction](CANDIDATE-75c47070.md) explains why
two patches are still needed. These are not new names for the release recipes.

The launcher verifies source and ordered patch hashes, builds with zero patch
fuzz, serializes installation, records provenance and verifies cached executable
bytes. `MY_VERYL_CACHE_DIR` selects a compiler cache; the default is `.run/tools`
inside this checkout. `VERYL_BUILD_JOBS` defaults to four. Existing verified
installations can be reused by selecting their cache; this is not a fresh build.
No system/user installation, project manifest or simulator option is overwritten.

Build prerequisites: Linux x86_64, Bash, curl, tar, patch, coreutils, flock,
C compiler/linker and rustup with Rust 1.97.0. Proxy configuration belongs to
the caller's environment. Compiler artifacts stay ignored and are not design
snapshots. Consumers pin a repository commit, choose their recipe and own their
downstream qualification.

## Regression and retirement

Regressions are ordinary Veryl projects. Run `veryl test` from each project with
the chosen compiler on PATH and `VERYL_DUT_REUSE=0`. The `basic` project is shared;
`generic-width` and `wide-array` preserve the two compiler-fix reproducers.
`struct-member-width` specifically requires the three-patch recipe and is a
known failing input on the older recipe, not a passing test to skip silently.
Additional patch regressions are retained in the patches themselves.
See [provenance](PROVENANCE.md) and [upstream status](UPSTREAM.md).

When an official release contains the needed fixes and passes the minimal and
downstream gates, consumers switch to official tooling and remove this dependency.
The repository can then be archived. Do not add general RTL-flow responsibilities
that would prevent retirement. Reusable cells live in
[my-veryl-cells](https://github.com/shady831213/my-veryl-cells).

Original project-authored material is MIT OR Apache-2.0; retain the upstream
Veryl licenses for patch context and compiler source. No compiler source tree,
private RTL, vendor library or license-server configuration is included.

Extraction checks on 2026-11-16: six installer tests passed. Both recipes passed
the two basic tests plus one generic-width and one wide-array test on requested
CC and Cranelift, with backend validation enabled. The member-width case failed
its actual neighbor-field assertion on each older-recipe run and passed on each
three-patch run. No analysis failure or zero-test selection counted as evidence.
These runs reused checksummed compiler artifacts; no new cold-build claim.
