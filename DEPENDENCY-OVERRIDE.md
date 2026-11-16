# Root dependency override identity

Tracked in [issue #3709](https://github.com/veryl-lang/veryl/issues/3709) and
[PR #3710](https://github.com/veryl-lang/veryl/pull/3710), based on upstream
`56c9c11789c85b4fb633c456f7889197ee9b325f`. The standalone fix commit is
`a9f7a444` in the Veryl fork; the local recipe backports the same implementation
and tests onto the existing 0.22.1 recipe.

A root `git + version + path` development override and a transitive reference
to the same release were deduplicated by UUID, but disagreed under equality/hash
because only the root record carried the local path hint. Analyzer lookup then
panicked; metadata v2 could emit an edge using an unresolved dependency alias.
The fix keeps the override for loading/serialization, but excludes it from
repository identity. UUID, URL, project path/name, version and revision remain
identity fields. It does not ignore missing dependencies or swallow panics.

## Evidence

- The actual graph panic reproduced on unmodified upstream master, and on the
  existing patched 0.22.1 recipe. No unpatched-0.22.1 run is claimed here.
- Two new metadata tests failed before the fix. Afterward all 80 metadata tests
  passed, including other-field identity controls and local/fallback loading.
- An offline temporary-Git three-project analyzer test passed and verified the
  selected local source rather than silently using the published library.
- Full workspace tests were run: analyzer 1470 PASS/17 existing ignored, emitter
  94 PASS, simulator 1424 PASS; only `veryl-tests::filelist::test` failed. The
  captured unmodified master CLI generated the identical normalized 37-entry
  actual filelist on that fixture, which differs from the test's expected order.
  This is not an entirely green workspace result. Assertions/snapshots were not
  changed; nominal test skips do not establish WASM execution coverage.
- Full workspace/all-target strict Clippy, fmt, CLI build and frozen source
  hashes passed. No hardware source or consumer compiler pin changed.
- The four-patch recipe was cold-built from the checked archive in 545.41s wall.
  It passed common-cell11, generic-provider3, basic2, generic-width1, wide-array1
  and struct-member-width1 tests on each requested CC and Cranelift backend.
  All runs retained backend validation, explicit no-reuse and zero ignored tests.
  Native metadata resolved exactly the two intended local development packages.

Raw local runs live under `.run/extraction`; they are not published design
snapshots. Published consumers without local overrides retain their existing
qualified recipes. Recheck the reproducer against a future official release
before retiring the patch or this repository.
