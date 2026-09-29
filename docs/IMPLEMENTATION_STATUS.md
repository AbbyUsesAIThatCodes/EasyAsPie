# Free Play Implementation Status

## Step 03A — Full 3D Bakery

Scope: [#18](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/18), the teacher-requested visual milestone between #11 and #12. Started from `main` at `ea9da524dc33` after the teacher merged [PR #17](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/17). That merge accepts the linked-selection foundation; the teacher specifically requested replacement of its flat-looking scene. **Visual acceptance of this new scene is pending.**

Implemented:

- Pies, ceramic plates, wooden countertop, paneled cabinetry, window, drawer, brass handle and fraction bars occupy one Three.js scene with warm directional light, fill, glossy food materials and grounded live shadows.
- Each pie has equal, closed pastry and filling sectors with radial interior faces; bounded surface decoration adds fluted baked rims, varied berries and cut-face fruit. Denominators 2/4/8/16 retain the same tessellated whole volume. Slice transforms are independent and ready for later cutting choreography.
- The drawer physically travels along depth. Native bar buttons and text follow its projected tiles on each frame and become available once the drawer clears the counter. During travel, hidden controls are inert. Both bars retain equal total lengths and equal subdivisions, with selected dots. Opening the drawer leaves pie positions and scale unchanged.
- Existing independent first-k selection, Clear/Decrease/Increase, exact fraction/count labels, announcements, matching hover/focus, arrow/Home/End/Enter/Space access, disabled boundaries, and Escape focus recovery remain on the Step 01 action path. Hidden bars are inert.
- Both equal wholes share one orthographic camera. Angled/Top View interpolates camera position and framing; reduced motion makes camera and drawer changes immediate, including when the preference changes during a transition. Selection feedback is immediate.
- `?preview=quarters&review=solids` is a visibly labeled static model-inspection fixture. One wedge per pie is displaced to reveal pastry/filling depth and radial faces. It is not a cutting animation; direct pie picking is disabled there because wedges are displaced. Normal URLs retain complete pointer and keyboard behavior.

## Review Evidence And Limits

[Issue 18 Review](review/issue-18/README.md) records actual production-game screenshots, video, exact local and CI identities, checks and remaining visual differences from Concept B. [Issue 11 Review](review/issue-11/README.md), [Issue 10 Review](review/issue-10/README.md), and historical first-playable evidence remain unchanged.

The procedural scene remains stylized; the mockup is a visual target, not proof of implementation. A small original reflection map and a 1024-square live shadow map limit rendering cost while retaining lit food materials and moving shadows. Browser evidence uses Chromium/WebGL 2 with SwiftShader software rendering. Classroom laptop/projector responsiveness and screen-reader signoff are still untested. No performance or instructional mastery claim is inferred from automated checks.

Version remains **0.2.0**, codename null / **Unassigned**. Package release record, Pages workflow, build allocator and durable reservation tags are unchanged. The exact media build comes from its generated [manifest](review/issue-18/build.json) and [report](review/issue-18/BUILD.md), separately from the PR's CI artifact.

## Next Handoff

Record the teacher's decision after reviewing the screenshots and video, and resolve any requested visual changes before merging #18. Then start [#12 — Animate Exact Cut And Regroup](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/12) from current main in a new conversation. #12 must provide physical moving 3D slices, synchronized bars, refusal feedback, interruption handling, reduced motion, and **actual-game screenshots AND a short video** before its merge.

The current native piece controls are created for the starting denominator. #12 must reconcile them when d changes and preserve focus. Its animation must never write stale fraction snapshots. The renderer rebuilds solids/bars on a denominator change; serving-only updates reuse solids. Mathematical Cut/Regroup already exists in the model, but no UI or slicing choreography is introduced here.

After #12, #13 integrates classroom review. Learn/Challenge lessons, scoring, comparison overlays, recipes, actual ruler activities and new curricular mappings remain outside this milestone. Current DM Activity 1.3 was consulted; G10/G12 and prerequisite G11 limits are unchanged. This PR closes only #18. Parent #7's administrative closure during planning does not establish completion. Leave merge and deployment to the teacher.
