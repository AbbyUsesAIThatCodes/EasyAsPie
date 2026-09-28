# Build Identity

## Identity Contract

`package.json` is the authoritative release record. `version` is **0.1.1** for the deployment/build-identification patch to the accepted 0.1.0 first playable. During 0.x development, minor versions introduce game features and patches fix behavior or delivery. There is no persistent save format yet. `releaseCodename` is null: the owner has not selected a codename. The literal **Unassigned** is an explicit placeholder, not an invented milestone name. Replace that one field when a name is approved; document its version range here.

Canonical ID: `VERSION_CODENAME_SCOPE_build-NNN_UTC_gREVISION[_dirty-FINGERPRINT]_TARGET`. Scope is `pr-N`, `main`, or explicitly `local-...`; target is `web` or `web-dev`. The manifest keeps the full SHA, SHA-256 source fingerprint, full UTC precision, PR head when applicable, and dirty flag. The displayed revision has 12 characters. A single timestamp is captured immediately before Vite receives its build metadata; page loads never generate an identity.

## Durable Build Numbers

In `.github/workflows/check.yml`, the `reserve` step uses `scripts/reserve-build.cjs` to atomically create `refs/tags/easyaspie-builds/SCOPE/NNNNNN`. The next reservation is one beyond the highest existing ordinal in that scope. Concurrent attempts retry on collision. **Never delete these reservation tags.** They are an allocation ledger, not release tags. Failed builds retain their reservations, so gaps are normal. The allocator runs inside the build job, including on a rerun of a failed build job. Retrying only deployment reuses the already-built artifact and identity.

The verification job needs `contents: write` solely for these reservations. Checkout does not persist credentials. Publishing permissions are confined to the separate deployment job. Fork PRs skip the write step and produce explicitly local builds; they never claim a PR ordinal. Workflow dispatch is restricted to main.

Local builds reserve exclusive numbered files under the Git common directory's `easyaspie-builds/local-SCOPE/`. The local scope identifies the host/checkout by a hash. Local counters are not PR counters and are not shared with CI. Do not delete their ledger while reusing a local scope. `npm run dev` reserves a clearly marked `web-dev` session. Local dirty builds include a source fingerprint in the ID. Direct `vite build` is rejected; use `npm run build` so every supported artifact build goes through the allocator.

## Generated Outputs And Current Builds

Each invocation creates an immutable manifest in `.build/ID.json`, builds into `artifacts/ID/`, and writes matching `build.json` and `BUILD.md` into that output. `dist/` is a convenient copy of the latest local output for preview; it preserves the same identity. Generated data is ignored by Git, avoiding timestamp-triggered rebuild loops.

- **Latest Review Build:** open the PR's Check And Deploy run. Its summary and downloadable artifact carry the exact ID. PR builds do not deploy.
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
| CI build/deploy consoles | `verify` / `deploy` jobs | Same manifest ID in logs and step summaries | Implemented; first main deployment pending |
| Delivered folder and download | `artifacts/ID/`; Actions artifact named ID | Manifest-derived path/name | Implemented |
| Game label | `src/main.js`, `#build-identity` below the header | Vite injects the same manifest; visible/copyable text | Implemented |
| Build/test report | `BUILD.md`, Actions job summary; `check:build` output | Same immutable manifest | Implemented |
| Current README/roadmap | `README.md`, `ROADMAP.md`, `docs/VALIDATION.md` | Link to generated/current records; preserve old evidence | Implemented |
| PR description/template | `.github/pull_request_template.md` | Link to exact check run and build ID | Implemented |
| Agent instructions | `AGENTS.md` | Links to this contract | Implemented |
| Hosted identity | `/EasyAsPie/build.json`, `/EasyAsPie/BUILD.md`, visible label | Deploy existing artifact without rebuilding | First main deployment pending |
| IDE/About displays | None exist in this game | IDE terminals use the documented npm commands | N/A |

Adding a build entrypoint or identity display requires updating this inventory. Never edit generated timestamps, reset shared counters, rename an existing build, or claim a review build is deployed.
