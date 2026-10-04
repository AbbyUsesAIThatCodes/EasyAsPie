# Locally Verified Pages Release

## Release Candidate

Promote `0.4.1_Unassigned_pr-38_build-006_20261003T221730Z_gb3901d2b07bb_web`, built 2026-10-03T22:17:30.290Z from clean runtime source `b3901d2b07bbc31380b1d1cb027b1aa3d087b6d1`. Gameplay, lesson sequence, save keys and existing build identity are unchanged. Copying the existing artifact consumes no new build ordinal. The merge commit identifies release orchestration; the app manifest identifies the actual runtime build.

The October 4 owner approval covers bounded release preparation, source/workflow pushes, consolidated PR integration and Pages publication for this game. Previous no-deployment statements describe the earlier review phase. Mean Machine and unrelated projects are outside this release.

## Public Payload

Only `site/` is uploaded. `deployment/payload.json` inventories every path, byte count and SHA-256; `node deployment/verify.mjs` rejects additional or altered files, links, unsafe names, incorrect identity and payloads over 5 MiB. Archive launchers, review evidence, teacher keys, worksheet authoring files, private documents and student records are excluded.

## Local Checks And Publication

Run the required model/browser suites on Abigail against this payload and record their results in `deployment/LOCAL_VALIDATION.md`. Do not substitute old PR CI results for this release check. Inspect the full main-to-candidate diff and preserve all earlier branches and artifacts.

The workflow is manual-only, main-only and uses the existing Pages configuration. A merge alone does not run Actions. After allowance/storage is confirmed, dispatch check.yml on main with `expected_build_id` equal to the exact ID above. One standard Ubuntu job verifies hashes, uploads one artifact with one-day retention, and deploys. It installs no project dependencies, builds nothing, runs no browser suite and creates no Actions cache. No settings or billing changes are needed.

After success, verify the real public URL, rendered identity, loaded runtime hashes, reference links and essential worksheet flows in a fresh browser. Report any physical school-device testing limits.

## Rollback

Previous main/deployment: `6bd108c35f6591efbe51334fb42b64fcd3cb107f`. A local HTTP snapshot and SHA-256 inventory were saved on Abigail before release under the October 4 task-2 rollback folder; EasyAsPie additionally retains Actions artifact 11095322692. Keep those copies outside this public repository. Roll back by preparing the preserved public runtime as another explicit, locally verified deployment; never reset branches, overwrite review artifacts, erase browser saves or change settings as a shortcut. Apply the same public-file exclusions to rollback: retain the safe student reference instead of republishing historical teacher-facing documents.
