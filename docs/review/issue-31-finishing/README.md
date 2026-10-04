# Mechanics And Lesson Checkpoint

## Teacher-Accepted Worksheet Baseline

On October 3, 2026, the teacher accepted PR #38 build 006 mechanics and authorized worksheet creation. Freeze its instructional interface, mechanics, lesson labels and task sequence at runtime `b3901d2b07bbc31380b1d1cb027b1aa3d087b6d1`, with evidence checkpoint `dcc9bb7c762d5bdc557249903b8d6c08e5238ef5`. The parent worksheet task uses this version; [Teacher Notes](../../TEACHER.md) and [Exact Answer Key](../../BEGINNER_ANSWER_KEY.md) describe the student workflow. This acceptance record changes no runtime files or packaged artifact.

Visual fixes remain deferred until the materials are complete. Hardware, projector, actual touch-device and screen-reader acceptance remain open under #13. PR #38 stays draft and unmerged, with no deployment.

## Playable Baseline

**Play On Abigail: http://127.0.0.1:4216/**

[Playable ZIP](0.4.1_Unassigned_pr-38_build-006_20261003T221730Z_gb3901d2b07bb_web.zip) · [Gameplay Video](build006/video/beginner-gameplay.webm) · [Mixed-Number Construction](build006/video/mixed-built.png) · [Draft PR #38](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/38)

This checkpoint follows the teacher's mechanics → lesson acceptance → worksheet → aesthetics priority. The teacher has now released the worksheet gate for this frozen version. Build 007 and its original branch/worktree are preserved; its Abigail preview remains http://127.0.0.1:4201/.

## What Changed Since Build 007

| Requested Change | This Checkpoint |
| --- | --- |
| Cabinet/table and arriving-plate clearance | Counter shortened, supply cabinet separated, rear wall moved back; plates leave the open cabinet and lower below doors before spreading. |
| Complete room enclosure and ceiling fan | Deferred polish; existing scenery retained. |
| Empty/occupied hover outline | Alternating black/white at the actual plate or current pie height. |
| Outward knife handles | Serving knives point their handles outside the rim, with blades toward the center; all boundary angles tested. |
| Automatic next question | Advances exactly once when fresh plates settle; no manual Next Order step. |
| Correct fresh-plate count | One for a single-plate next task, two for a mixed task; no unused next order after completion. |
| Reversible circular drag span | Current signed span replaces accumulated visits; backtracking shrinks, crossing the start reverses, origin wrapping stays continuous. |
| Lemon-vine and bee wallpaper | Deferred polish; physical props remain until that replacement. |

The first prompt is preserved. Incorrect answers retain work. Each gesture latches ADD/ERASE and keeps its starting surface height; ordinary hover follows the physical surface. Leaving the plate pauses selection; returning within the last end unit resumes without an unseen connecting path. All 8 Learn steps, the 20 original equivalence orders plus 4 mixed extensions, and Free Play remain available. Top View and native Piece Controls expose units hidden behind tall slices in an angled view.

## Exact Build And Source

`0.4.1_Unassigned_pr-38_build-006_20261003T221730Z_gb3901d2b07bb_web`

- Runtime source: `b3901d2b07bbc31380b1d1cb027b1aa3d087b6d1` (clean).
- Branch: `review/31-finishing-revision`; PR #38 targets preserved `review/31-beginner-pie-building`.
- UTC: `2026-10-03T22:17:30.290Z`.
- Durable reservation: `refs/tags/easyaspie-builds/pr-38/000006`.
- [Manifest](build006/build.json) · [Build Report](build006/BUILD.md) · [Consistency Check](build006/build-check.txt).
- ZIP SHA-256: `3461b60ea6f7bb66c0f4a35690ed06c26b5f0b641caebb57ac3ef15a6851bd30`; 13,333,137 bytes. All archive entries pass CRC; every runtime file matches the production artifact byte for byte.

Run `Start Review.cmd` in the extracted package with Node 22.12+ installed; it serves localhost only. This output is not relabeled when evidence commits are added.

The extracted package was launched independently and checked against the persistent preview and preserved build 007. [Package And Preview Verification](package-validation.txt).

## Verification

**43/43 tests pass.** [Unit Log](build006/unit-tests.txt). Three real-input browser suites pass on Chromium 153.0.8010.12 with no page errors:

- [Gameplay](build006/gameplay/results.json): all 8 Learn steps and 24 Challenge orders, wrong/correct written responses, keyboard ranges, pointer cancellation/camera ownership, Free Play amounts at every denominator, drawer/view controls, laptop/mobile reference layout, reports and archived rounds.
- [Recovery And Touch](build006/recovery/results.json): all serving stages interrupted by skip, reduced motion, navigation or reload; one answer/advance only; CDP touch drag/cancel and native taps; corrupt/unsupported/external saves retained, old bytes and old reports preserved, explicit clear confirmation and unavailable storage.
- [Finishing Mechanics](build006/targeted/results.json): actual ADD/ERASE forward/backtracking, wrap, reversal, full-circle shrink, outside resume, correct hover heights, twenty immediate repeated clicks, outward handles, and frame-sampled one/two-plate arrival clearance and automatic activation.

[New Report Download](build006/gameplay/activity-report.html) · [Legacy Report Download](build006/recovery/legacy-activity-report.html). These contain anonymous synthetic review data. [Video Chapters And Network Check](build006/video/video.json) · [Video Decode And Playback](build006/video/video-validation.txt).

[Empty Hover](build006/targeted/empty-hover.png) · [Occupied Hover](build006/targeted/occupied-hover.png) · [Shrinking ADD Span](build006/targeted/challenge-add-backtrack.png) · [Shrinking ERASE Span](build006/targeted/challenge-erase-backtrack.png) · [Single Arrival](build006/targeted/learn-one-arriving.png) · [Mixed Arrival](build006/targeted/learn-two-arriving.png) · [Next Prompt](build006/targeted/learn-mixed-next-prompt.png) · [Mobile](build006/gameplay/390x844-challenge.png).

## Remaining Work And Preserved Boundaries

Full enclosure, higher ceiling/fan, lemon-vine/bee wallpaper, and comprehensive all-camera scenery acceptance remain unfinished by the teacher's revised priority. Existing artwork is preserved, not accepted as final. Teacher mechanics acceptance and worksheet authorization are recorded above; visual acceptance and real classroom laptop/projector, touch hardware and screen-reader checks remain pending under #13. No classroom-readiness or measurement-mastery claim is made.

No main merge, deployment, worksheet, shared-standard rewrite, or changes to draft PRs #28–#30 were made. Build 007 remains immutable. The JavaScript bundle is about 176 KB gzipped; Vite's existing 650 KB uncompressed warning remains reported. [Finishing Contract And Resume Notes](../../FINISHING_REVIEW.md) retain the exact scope and earlier WIP history.
