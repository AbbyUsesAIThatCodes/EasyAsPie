# Full 3D Bakery Review

**0.2.0_Unassigned_pr-19_build-006_20260930T025713Z_ge72fbf9c9c35_web**

PR19 / issue18. Teacher visual acceptance remains pending. [Playable ZIP](0.2.0_Unassigned_pr-19_build-006_20260930T025713Z_ge72fbf9c9c35_web.zip) contains the exact production artifact. Serve it locally with the included Start Review.cmd (Node.js required), or use the isolated Jess_PC preview at http://127.0.0.1:4189. This is not the live Pages site.

[Actual-Game Video](bakery-review.webm) (about 36 seconds), [1366 × 768 Open Drawer](1366x768-normal-open.png), [1280 × 720 Sixteenths](1280x720-sixteenths-open.png), [Cut-Face Inspection](cut-face-inspection.png), [Keyboard Focus](keyboard-focus.png), [390 × 844 Phone](390x844-open.png). All media in this folder uses the identity above. The model-review image is static separated-solid inspection, not slicing gameplay.

## Verified

- 24 automated tests: closed outward-facing equal-volume solids, exact fractions and independent pairs, build allocation and historical session logic.
- Production build and manifest/artifact/UI/report identity check passed. PR19 ordinal 6 was reserved in the existing durable tag ledger. Build 5 is retained locally as a prior attempt; its deprecated-shadow warning was corrected before this build.
- Chrome 154.0.8037.92; ANGLE / Intel Iris Xe / Direct3D11. Full selection matrix: 577 actions, 378 noncommitting hover/focus checks, 240 boundary clicks; all 34 states per pair through pointer and keyboard. Both laptop sizes, zero/whole, repeated drawer actions, full-screen, camera, resize, focus recovery and reduced motion passed.
- [Browser Results](browser-results.json) and [Media Results](media-results.json) retain exact runtime details. No page errors or WebGL errors; an ANGLE X4122 shader constant-folding precision warning was recorded and classified, not hidden.

## Comparison And Limits

Pies now dominate a real lit 3D counter, with solid pastry/filling interiors, glossy irregular berry meshes, a moving wooden drawer and live shadows. Camera orbit keeps equal orthographic scale and native bar targets track the projected surfaces. Comic Sans controls float above the full-viewport scene. The approved Concept B remains richer in food microtexture, background detail and cinematic lighting; this procedural scene does not claim pixel equivalence or teacher acceptance. Phone pies and sixteenth pointer targets are smaller; native serving buttons and keyboard controls remain available. Classroom projector, real touch hardware and screen-reader signoff remain untested.

Merge PR19 first only after visual review. Tonight's authorized successor for issue12 is provisional and adds actual physical slicing; this artifact intentionally retains that boundary. Learn/Challenge remain disabled here. No merge, Pages configuration change or deployment was performed.
