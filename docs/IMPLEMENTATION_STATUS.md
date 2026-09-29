# Free Play Implementation Status

## Step 03 — Linked Pie And Bar Selection

Scope: [#11](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/11), third of the [five steps](FREE_PLAY_IMPLEMENTATION_PLAN.md). Branched directly from `main` at `5add3ede890b` after prerequisite [PR #16](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/16) was merged. Its review timeline contained no additional comments or submissions; its recorded back-center origin and Step 02 integration notes remain authoritative.

Implemented:

- Both pies and bars dispatch Step 01 serving actions against one latest immutable snapshot. Selecting piece k chooses the first k equal pieces. Each pair independently updates its pie, bar, fraction, selected-count/whole-count text, and polite announcement.
- Both pies have logical solid hit targets aligned to the visible cut plane. Decoration and plate meshes never choose a piece. Exact cut lines resolve to the following piece, and the common origin resolves to piece 1; nearby points on either side remain distinct. Selection retains solid wedge geometry and changes serving materials/outlines only.
- Clear/Decrease/Increase for each pair, with disabled semantics and no action at boundaries. `aria-disabled` preserves focus on the control just used; the action handler enforces the boundary.
- Corresponding dashed piece outlines and visible piece text for pointer hover and keyboard focus. The solid serving boundary, bar dots, and selected-count text stay distinct. Emphasis never changes the mathematical snapshot.
- One Tab stop per pie/bar, with arrow keys/Home/End to explore and Enter/Space to select. Every piece has a native button and accessible name describing its selected status and activation result. Pie buttons become visibly labeled when keyboard-focused.
- The drawer toggle precedes bar controls in DOM focus order while remaining on the visual drawer front. Escape closes the drawer from a bar and restores focus to the toggle before applying inert/hidden state. Camera/full-screen/resize and drawer actions preserve servings. Reduced motion remains immediate.
- Existing sixteenths and empty/whole fixtures now support serving interaction. Explicit halves/quarters/eighths starting fixtures support complete denominator review without adding a denominator-selection interface. Unknown names retain defaults.

## Decisions And Deferred Work

Version stays **0.2.0**, the accepted Free Play feature milestone; codename stays null / Unassigned. Existing build scripts, durable reservation ledger, Pages workflow, and historical first-playable/Step 02 evidence remain unchanged.

Cut And Regroup stay visibly Coming Later; the model supports them, but this PR does not expose or animate them. That is [#12](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/12). Integrated classroom/assistive-technology review remains #13. Learn/Challenge lessons or scoring, Compare Servings, recipes, actual ruler activities, and new curricular mappings remain outside scope. The current DM Activity 1.3 index was consulted; see [Curriculum Mapping](CURRICULUM.md#linked-selection-review).

The serving UI currently constructs one native piece button per starting denominator. Step 04 must reconcile those controls when Cut/Regroup changes d, preserving sensible focus and the same action/announcement path. Its animation must never commit stale snapshots. The existing renderer already rebuilds pie geometry when d changes; serving-only changes preserve it. No later acceptance criterion is removed or deferred beyond its existing issue.

## Review Evidence

[Issue 11 Review](review/issue-11/README.md) records the exact generated build, actual running screenshots at 1366 × 768 and 1280 × 720, normal and sixteenth selections, the complete pointer/keyboard matrix, and limitations. [Issue 10 Review](review/issue-10/README.md) remains historical evidence for the prior visual preview.

## Next Handoff

After teacher review and merge, start [#12 — Cut And Regroup](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/12) from current `main` in a new conversation. Read this status, [Free Play Actions](FREE_PLAY_ACTIONS.md), and any teacher decisions first. This PR closes only #11. Parent #7 was administratively closed during planning; that does not imply completion of all five steps. Leave merge and deployment to the teacher.
