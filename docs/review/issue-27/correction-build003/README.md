# Completed Learn Restore Correction

**0.4.1_Unassigned_pr-30_build-003_20261001T002857Z_gf2659f310169_web**

[Download The Playable ZIP](0.4.1_Unassigned_pr-30_build-003_20261001T002857Z_gf2659f310169_web.zip). Extract and run Start Review.cmd with Node.js 22.12+; localhost:4193 serves this exact bundled artifact. Source `f2659f3101696d422b007366659c568e02238004` (clean), fixed UTC `2026-10-01T00:28:57.037Z`. ZIP SHA-256: `39ec391b56c48b2e24a243964f7d18142e46cafa47fa6831bed6465852ea0b9e`.

The targeted regression reproduced a missing validation error on build 002's source: a completed Learn save could contain 0/8 when the correct serving was 4/8. One runtime guard now rejects a completed Learn scene unless its serving exactly matches the target. The existing retained-invalid-save behavior displays a notice without overwriting those bytes. Unfinished responses, wrong committed predictions, valid completions and Free Play with prior Learn progress remain valid.

The initial targeted test failed with Missing expected exception; after the fix all **34** unit/geometry/allocation tests passed. The new regression rejects every incorrect numerator across all three lesson denominators (28 inconsistent completions). Production build and identity checks passed. The full [recovery suite](recovery-results.json), including a corrupt completed-Learn browser save, and the [three-mode/twenty-order suite](mode-results.json) passed on this exact artifact. [The rejection screenshot](rejected-learn-completion.png) shows the retained-save notice and playable fallback. No external runtime requests or page errors were recorded.

[Build 002's review](../README.md), ZIP, screenshots, 47.72-second video and localhost:4192 preview are preserved unchanged. Their full selection/transform/layout evidence remains labeled build 002; those unaffected suites and video were not regenerated for this one-line validation correction. This build 003 has its own manifest, ZIP and affected checks. Manual merge order remains PR28 → PR29 → PR30, with successors retargeted to main after accepting/merging predecessors. No merge, deployment or new Actions run was requested.

Graphics and all five asset-source hashes are unchanged from the [existing asset manifest](../../../ASSET_HANDOFF.json), pinned to source 1f4dda81be6e591bd961316512272956051f6071. No shared catalog changes. Library delivery is coordinated by the parent; no additional Library write was attempted for this correction.

Actual touch hardware, projector, screen-reader and teacher visual/classroom acceptance remain pending.
