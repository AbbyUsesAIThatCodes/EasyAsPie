# Build Identity

## Current Finishing Mechanics Checkpoint

The PR #38 mechanics handoff is pinned in [the finishing review](review/issue-31-finishing/README.md), including its immutable manifest, UTC, source SHA, durable `easyaspie-builds/pr-38` reservation, visible footer, ZIP hash and validation. Build 007 remains separately preserved in the original issue-31 review. Later evidence-only commits do not relabel either artifact. No review build is deployed.

## Current Local Development Revision

The approved beginner review retains release record **0.4.1 / Unassigned** while the preceding release awaits acceptance. This is unfinished local development, not a newly accepted release or invented codename. Every artifact has an explicit local scope, its own durable ordinal, fixed build UTC and exact source provenance. [Current review](review/issue-31/README.md) identifies the new artifact separately from PR30 and live Pages. No existing artifact is relabeled.

Active UI entry: `index.html` → `src/beginner-main.js`, whose visible `#build-identity` reads the injected manifest. New persistence/report surface: `src/construction-progress.js`, key `easyaspie.construction.v2`, schema 2/taskset `beginner-24-v2`. The previous schema 1 key and report modules remain for preserved legacy data. Build scripts, allocator, immutable artifact directories and workflow are unchanged. New verification scripts compare the displayed identity and downloaded report metadata; `check:build` still verifies manifest/output/bundle/report consistency.

## Previous Release Identity Contract

The current release record is **0.4.1**, a bounded restore-validation correction in PR30: a completed Learn scene must contain the correct serving. PR30 build 002 remains the preserved 0.4.0 review artifact; the correction receives its own later ordinal and fixed identity. Save schema/taskset compatibility is unchanged.

`package.json` is the authoritative release record. Version **0.4.0** introduced the authorized comparison, flavor, drawer guidance and local progress feature increment. Earlier 0.3.1 records remain unchanged. PR22 build 001 retains its original 0.3.0 identity. Earlier PR19/PR20 artifacts retain 0.2.0 and their original identities. Teacher visual/classroom acceptance remains pending. During 0.x development, minor versions introduce game features and patches fix behavior or delivery. The local save format uses schema 1 and taskset equivalence-20-v1; the build identity is recorded separately, so compatible future builds can preserve work. Unsupported schema/taskset data is not overwritten. `releaseCodename` is null: the owner has not selected a codename. The literal **Unassigned** is an explicit placeholder, not an invented milestone name. Replace that one field when a name is approved; document its version range here.

Canonical ID: `VERSION_CODENAME_SCOPE_build-NNN_UTC_gREVISION[_dirty-FINGERPRINT]_TARGET`. Scope is `pr-N`, `main`, or explicitly `local-...`; target is `web` or `web-dev`. The manifest keeps the full SHA, SHA-256 source fingerprint, full UTC precision, PR head when applicable, and dirty flag. The displayed revision has 12 characters. A single timestamp is captured immediately before Vite receives its build metadata; page loads never generate an identity.

## Durable Build Numbers

In `.github/workflows/check.yml`, the `reserve` step uses `scripts/reserve-build.cjs` to atomically create `refs/tags/easyaspie-builds/SCOPE/NNNNNN`. The next reservation is one beyond the highest existing ordinal in that scope. Concurrent attempts retry on collision. **Never delete these reservation tags.** They are an allocation ledger, not release tags. Failed builds retain their reservations, so gaps are normal. The allocator runs inside the build job, including on a rerun of a failed build job. Retrying only deployment reuses the already-built artifact and identity.

The verification job needs `contents: write` solely for these reservations. Checkout does not persist credentials. Publishing permissions are confined to the separate deployment job. Fork PRs skip the write step and produce explicitly local builds; they never claim a PR ordinal. Workflow dispatch is restricted to main.

Local builds reserve exclusive numbered files under the Git common directory's `easyaspie-builds/local-SCOPE/`. The local scope identifies the host/checkout by a hash. Local counters are not PR counters and are not shared with CI. Do not delete their ledger while reusing a local scope. `npm run dev` reserves a clearly marked `web-dev` session. Local dirty builds include a source fingerprint in the ID. Direct `vite build` is rejected; use `npm run build` so every supported artifact build goes through the allocator.

## Generated Outputs And Current Builds

Each invocation creates an immutable manifest in `.build/ID.json`, builds into `artifacts/ID/`, and writes matching `build.json` and `BUILD.md` into that output. `dist/` is a convenient copy of the latest local output for preview; it preserves the same identity. Generated data is ignored by Git, avoiding timestamp-triggered rebuild loops.

- **Previous Draft Review Builds:** see `docs/review/issue-27/correction-build003/README.md` for the bounded restore correction; `docs/review/issue-27/README.md` preserves build 002 for the final integrated PR30 ZIP. PR28 and PR29 have independent exact packages in issue-25 and issue-26. Historical overnight builds remain preserved. Local production checks replace CI for this bounded session to conserve allowance/storage. Ordinary PR runs still report the same identity; PR builds do not deploy.
- **Deployed Build:** after the first successful main deployment, inspect [the served manifest](https://abbyusesaithatcodes.github.io/EasyAsPie/build.json) and [build report](https://abbyusesaithatcodes.github.io/EasyAsPie/BUILD.md). Until that deployment succeeds, no live build is claimed.
- **Local Current Build:** `dist/build.json` and `dist/BUILD.md`.
- **Validation:** `npm run check:build` verifies the copied manifest, output name, bundled UI label, report, and relative asset URLs without rebuilding.

## Identifier Location Inventory

| Surface | Exact Location | Source / Check | Status |
| --- | --- | --- | --- |
| Version and codename | `package.json`; package-lock version mirrors it | `createIdentity()` reads the release record | Version implemented; codename awaiting owner choice |
| CI ordinal ledger | `refs/tags/easyaspie-builds/SCOPE/NNNNNN` | Atomic `reserve-build.cjs`; concurrency/rerun tests | Implemented |
| Local ordinal ledger | Git common directory, `easyaspie-builds/local-SCOPE/*.json` | Exclusive file creation; process-concurrency test | Implemented |
| Immutable manifest | `.build/ID.json`, `artifacts/ID/build.json` | Generated once in `scripts/build.mjs` | Implemented |
| Local build/dev consoles | `npm run build`, `npm run dev`, Vite config | Full ID at start and result; dev target explicit | Implemented |
| CI build/deploy consoles | `verify` / `deploy` jobs | Same manifest ID in logs and step summaries | Implemented; live main identity read separately |
| Delivered folder and download | `artifacts/ID/`; Actions artifact named ID | Manifest-derived path/name | Implemented |
| Game label | `src/main.js`, `#build-identity` in the always-visible footer | Vite injects the same manifest; visible/copyable text | Implemented |
| Build/test report | `BUILD.md`, Actions job summary; `check:build` output | Same immutable manifest | Implemented |
| Screenshot/video review | `docs/review/issue-18/jess-pc/`, `docs/review/issue-12/`, `docs/review/issue-21/`: `build.json`, `BUILD.md`, media and visible footer | Same running artifact for screenshots/video; earlier test-build identity identified separately if reused | Implemented for each overnight and follow-up increment |
| Current README/roadmap | `README.md`, `ROADMAP.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/VALIDATION.md` | Link to generated/current records; preserve old evidence | Implemented |
| PR description/template | `.github/pull_request_template.md` | Link to exact check run and build ID | Implemented |
| Agent instructions | `AGENTS.md` | Links to this contract | Implemented |
| Hosted identity | `/EasyAsPie/build.json`, `/EasyAsPie/BUILD.md`, visible label | Deploy existing artifact without rebuilding | Existing live main build; separate from review stack |
| Local work and activity download | `src/progress.js`, `src/activity-report.js`; browser key `easyaspie.progress.v1` and downloaded HTML | Save/export embeds the actual manifest identity; original session build retained | Implemented in the local-progress draft |
| IDE/About displays | None exist in this game | IDE terminals use the documented npm commands | N/A |

Adding a build entrypoint or identity display requires updating this inventory. Never edit generated timestamps, reset shared counters, rename an existing build, or claim a review build is deployed.
