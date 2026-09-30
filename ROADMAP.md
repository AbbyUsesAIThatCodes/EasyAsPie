# EasyAsPie Roadmap

## Current Free Play Rebuild

[Issue #7](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/7) is the tracking checklist for the paired pie/bar rebuild. Follow the [implementation plan and preserved mockup](docs/FREE_PLAY_IMPLEMENTATION_PLAN.md). Merge its planning/reference PR first, then complete these issues **one conversation and one PR at a time**, always branching from current `main` after the preceding PR is merged.

| Order | Issue | Reviewable Result |
| --- | --- | --- |
| 1 | [#9 — Exact Free Play State](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/9) | Tested independent A/B fractions and exact serving/Cut/Regroup actions; existing playable retained |
| 2 | [#10 — Bakery Scene And Drawer](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/10) | Two blueberry pies and matching bars in a warm kitchen; clearly labeled visual preview |
| 3 | [#11 — Linked Selection](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/11) | Pointer/keyboard serving selection in either representation, Clear/Decrease/Increase, and matching focus feedback |
| 3A | [#18 — Full 3D Bakery](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/18) | Shared modeled environment, closed pie wedges, lit materials, spatial drawer, and screenshots/video for teacher visual review |
| 4 | [#12 — Cut And Regroup](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/12) | Physical 3D slicing/regrouping, exact amount preservation, explained blocked actions, and screenshots/video before merge |
| 5 | [#13 — Classroom Free Play Review](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/13) | Integrated visual/accessibility checks, accurate teacher notes, and evidence covering #7 |

Each PR closes its own issue on merge. Only the final PR also closes #7, once the full checklist is satisfied. Preserve a concise `docs/IMPLEMENTATION_STATUS.md` handoff from #9 onward, and update later issue descriptions when teacher review changes the plan. Learn and Challenge content are separate future work; the sequence establishes their shared interaction foundation.

Steps 01–03 are merged via PRs #15–#17. The teacher found the Step 03 rendering too flat and inserted **Step 03A / #18** before #12. Its mechanics remain the foundation; merging #17 did not approve its visuals. Review the new [screenshots and video](docs/review/issue-18/README.md) before merging #18. After visual approval and merge, begin #12 from current main.

## Initial Review History

The teacher merged PRs #1–#5 on September 28, 2026. Because #2–#5 still targeted preceding branches, main initially received only #1. [PR #6](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/6) integrates their approved game into main and adds Pages publishing. Future PRs target main directly unless an explicit dependency requires otherwise. Check the base before merging.

| Order | Branch | Bounded Increment |
| --- | --- | --- |
| [1](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/1) | docs/01-foundations | Design brief, curriculum provenance, and contribution rules |
| [2](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/2) | feat/02-fraction-core | Exact fraction math, exercise data, tests, and package scripts |
| [3](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/3) | feat/03-pie-scene | Two equal 3D pies, bakery shell, and local build |
| [4](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/4) | feat/04-guided-examples | Guided equivalence examples and keyboard serving controls |
| [5](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/5) | feat/05-challenge-mode | Untimed challenges, specific feedback, and learning summary |

## After The First Review

The following notes preserve the first-playable roadmap. For current work, use the rebuild sequence above. Actual ruler activities now belong in MeasureTwice; EasyAsPie uses unitless fraction bars. PR #6 has been merged; no new deployment work is required by this planning update.

- Teacher playtest on an actual classroom laptop and projector.
- Add a ruler transfer task only after reviewing how well students explain the pie model.
- Consider additional recipes, gentle serving animations, and more challenge variants.
- Merge the Pages integration PR, verify its deployment, then playtest the served game. See [Build Identity](docs/BUILD_IDENTITY.md) for current review versus deployed records.
- Review any future teacher guide or printed companion against the DM templates before authoring it.

## Definition Of Done For A Small PR

Explain the learning or technical change, identify its prerequisite, include the checks actually run, and record limitations. Keep mathematics independent of artwork. Inspect the playable screen at laptop sizes. Do not merge on the teacher's behalf.
