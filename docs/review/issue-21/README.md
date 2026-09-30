# Integrated Bakery Review

**0.3.0_Unassigned_pr-22_build-001_20260930T033257Z_ge3c0846d2599_web**

This is the summative production build of **PR19 → PR20 → PR22**. [Download The Playable ZIP](0.3.0_Unassigned_pr-22_build-001_20260930T033257Z_ge3c0846d2599_web.zip), extract it and run Start Review.cmd (Node.js 22.12+). The isolated Jess_PC preview is **http://127.0.0.1:4187**. No deployment is needed. Teacher visual acceptance remains pending.

## What To Review

Free Play has independently editable equal pies and unitless bars, a physical wooden drawer, orbitable full-viewport 3D, solid pastry/filling interiors, glossy varied berries, warm lighting and live shadows. Cut lowers a solid knife, opens and settles smaller wedges; Regroup closes them before larger wedges replace them. Both preserve the amount. Try 1/2 → 2/4 → 4/8 → 8/16, then 12/16 → 6/8 → 3/4. Try the refused 3/16 → eighths case and Reset during motion.

Learn has three prediction/demo/build lessons. Challenge has ten untimed exact orders with wrong-answer gating, hints, assistance and retry reporting. Bold vocabulary supports nested hover/focus tooltips and opens the reference. Correct/Not Yet text accompanies green/red shader and outline feedback. All modes retain the same whole and exact integer fractions.

## Evidence From This Exact Build

- [Actual Integrated Gameplay Video](integrated-gameplay.webm), 46.36 seconds, recorded from the running production game. The browser decoded and played the complete video; the capture script took 51.964 seconds wall time.
- [1366 × 768 Free Play](1366x768-free.png), [1280 × 720 Free Play](1280x720-normal-open.png), [Physical Cut](physical-cut.png), [Sixteenths](1280x720-sixteenths-open.png).
- [Guided Lesson](1366x768-learn.png), [Challenge Feedback](1366x768-challenge.png), [Ten-Order Summary](orders-complete.png), [Nested Tooltip](nested-tooltip.png).
- [1280 × 720 Learn](1280x720-learn.png), [390 × 844 Learn](390x844-learn.png), [390 × 844 Challenge](390x844-challenge.png).
- [Selection Results](browser-results.json), [Transformation Results](transform-results.json), [Mode Results And Video Chapters](mode-results.json), [Build Manifest](build.json), [Build Report](BUILD.md), [Live-Site Comparison](pages-verification.json), [Delivery/Video Playback Check](delivery-results.json).

All 24 automated tests passed, including exact fractions, independent pairs, closed equal-volume solids, build allocation and existing session semantics. Production build and manifest/artifact/UI/report checks passed. The clean source is e3c0846d25998babb027dd6cecd3e66ec3ebf7ab; PR22 ordinal 1 was durably reserved before building. The existing codename is still explicitly Unassigned; 0.3.0 identifies the new integrated feature milestone. Earlier review builds are not renamed.

The preserved selection harness completed **577 activations, 378 hover/focus checks and 240 boundary clicks**, covering all 34 fraction states in both pairs by pie/bar pointer and keyboard. It also checked real Tab order, drawer focus recovery, resize, full-screen and reduced motion. Its traversal bound derives from the actual controls.

The transformation harness passed **136 accepted changes and 68 refusals**, animated changes, rapid input, reset cancellation, and both old-piece-16 regressions during B 8/16 → 4/8. Hover clears, keyboard focus clamps to piece 8, and the amount remains exactly 4/8. These results are from this final stack, not substituted from PR20.

The mode harness completed all three lessons, wrong/missing predictions, wrong/correct servings, mode changes during motion, nested hover/reference interaction, reset/restart, all ten orders including zero and whole, and laptop/phone layouts with accessible drawer controls. The deliberate round correctly reported **7 first tries without help, 3 helped orders and 1 retried order**. There were no page or WebGL errors. Chrome 154 / Intel Iris Xe / ANGLE; the selection report retains the known ANGLE X4122 shader precision warning.

## Exact Manual Merge Order

| Order | Draft PR / Issue | Adds | Independent Review |
| --- | --- | --- | --- |
| 1 | [PR19](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/19) / #18 | Full 3D visual foundation and movable camera | [Build 006](../issue-18/jess-pc/README.md), localhost:4189 |
| 2 | [PR20](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/20) / #12 | Physical Cut/Regroup and safe exact transitions | [Build 002](../issue-12/README.md), localhost:4188 |
| 3 | [PR22](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/22) / #21 | Three modes, reference and summative 0.3.0 review | This build, localhost:4187 |

After accepting and merging each predecessor, retarget the successor to main and inspect its diff before merging. Do not merge the final draft alone. The teacher's overnight permission allowed this provisional stack; it did not approve the graphics or authorize a merge. #13 and tracking #7 remain open for classroom/teacher acceptance.

## Limits And Preservation

The approved Concept B and rejected PR17 image were both inspected from their exact pinned repository revisions before changes. Pies now dominate the laptop scene with real closed 3D solids and physical slicing. Concept B still has richer food microtexture, background detail and cinematic lighting; this implementation does not claim pixel equivalence. Phone pies and sixteenth pointer targets are smaller; native serving/keyboard controls remain available. Real touch hardware, classroom projector and screen-reader signoff remain untested. The model supports DM1.3 G10/G12 prerequisites, not ruler-reading mastery; the official glossary remains missing and local definitions say so.

Live Pages remains **0.2.0_Unassigned_main_build-006_20260929T011239Z_gea9da524dc33_web**, with matching before/after manifest, source revision and fingerprint. The workflow blob matches main; no merge, deployment, Pages-setting change, paid hosting or billing change occurred. Tonight's commits deliberately skip CI to conserve allowance/storage; no new Actions run was created. Existing review artifacts retain their original identities.

[Asset Handoff](../../ASSET_HANDOFF.md) and [Machine-Readable Source Manifest](../../ASSET_HANDOFF.json) identify the reusable procedural assets and exact source hashes for the parent's shared-graphics consolidation. This task made no shared-root catalog changes. Only task-owned browser processes and localhost servers were used; other projects and the user's browser session were untouched.
