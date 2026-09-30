# EasyAsPie

**Same amount. Different slices. Delicious fractions.**

A full-viewport 3D fraction bakery for Design And Modeling, **1.3 — Measuring Matters**. Two equal blueberry pies and equal-length unitless bars connect the same exact fraction state.

## Current 0.4.0 Draft Review

The authorized follow-up starts with [PR28 / issue25](docs/review/issue-25/README.md): aligned near/far bars, mode-specific pie names, independent strawberry and existing flavors, and a written Challenge target with the example hidden. Further handle guidance and local progress/report increments follow as drafts. Current main has the earlier integrated source through PR24.

## Preserved 0.3.1 Review

The provisional overnight stack is **PR19 → PR20 → PR22**. Review the [integrated playable build and evidence](docs/review/issue-21/README.md). The teacher will test and merge manually; visual acceptance is still pending. The [overnight authorization](docs/OVERNIGHT_REVIEW.md) permits this bounded stack while preserving the earlier Step03A-before-Cut/Regroup order.

- **Free Play:** select a contiguous serving in either pie or bar, clear/increase/decrease it, then physically Cut or Regroup while preserving the amount. A and B stay independent. Cut stops at sixteenths; Regroup refuses an odd numerator or a denominator below two, with an explanation.
- **Learn:** three prediction → real 3D demonstration → matching-serving lessons. Each has specific feedback, replay and a completion check.
- **Challenge:** ten untimed orders using the existing exact fraction tasks. Wrong answers cannot advance; hints, reference use and learning detours count as assistance. The summary distinguishes helped work, retries and first tries without help.

The pies have closed pastry/filling solids, glossy varied berry meshes, warm lighting and live shadows. A real wooden drawer carries the physical bars. Drag the scene or use the orbit buttons to move the shared orthographic camera. Comic Sans controls float above the scene. Purple serving outlines and dashed hover/focus marks remain distinct; assessment red/green also includes explicit text.

Bold vocabulary has nested hover/focus-safe explanations and opens a reference. Definitions are locally written; no official glossary or standards crosswalk is claimed. This model supports fraction equivalence before ruler work; it does not independently assess measurement mastery.

## Run And Review

Install Node.js 22.12 or later, then run `npm ci`, `npm run dev`. For production use `npm test`, `npm run build`, `npm run check:build`, then `npm run preview`. The exact production artifact is also copied to `artifacts/FULL-BUILD-ID/`; its manifest, report, console and visible footer share one fixed build identity. The existing codename remains **Unassigned**, pending the owner's choice.

Each review ZIP includes Start Review.cmd and a small localhost-only Node server. No deployment is required. The final integrated preview on Jess_PC uses port 4187; PR20 uses 4188, and PR19 uses 4189. These task-owned previews are separate from live Pages.

Tab reaches the scene's native pie controls, serving controls and drawer. Arrow keys, Home and End explore pieces; Enter or Space selects. Clear chooses zero. Escape in a bar closes the drawer and restores toggle focus. Escape also closes the reference. Closed/traveling bars are inert. Reduced motion commits slicing, drawer and view changes immediately. Reset affects the active mode; reload starts a fresh session. No student identity or performance data is stored or transmitted.

Review fixtures: `?preview=halves`, `quarters`, `eighths`, `sixteenths` or `empty-whole`. The normal start is A = 1/2, B = 2/4. `?preview=quarters&review=solids` is an explicitly labeled static geometry inspection, separate from actual cutting gameplay.

With Playwright installed separately, run `scripts/review-selection.mjs`, `scripts/review-transforms.mjs` and `scripts/review-modes.mjs` against the production `dist/`. Set PLAYWRIGHT_MODULE, CHROMIUM_PATH and REVIEW_OUTPUT as needed. These launch isolated browsers/ephemeral localhost ports; they do not build or deploy. RECORD_MODES=1 records the integrated playthrough when Playwright's FFmpeg is available.

## Curriculum And Review History

- [Teacher Notes And Exact Answer Keys](docs/TEACHER.md)
- [Curriculum Mapping And Source Limits](docs/CURRICULUM.md)
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md), [Build Identity](docs/BUILD_IDENTITY.md), [Roadmap](ROADMAP.md)
- [Approved Concept B](docs/mockups/paired-fraction-bars.png), [PR19 Review](docs/review/issue-18/jess-pc/README.md), [PR20 Review](docs/review/issue-12/README.md)
- [Graphics Handoff](docs/ASSET_HANDOFF.md), [Design Discussion](docs/DESIGN-DISCUSSION-2026-09-28.md)

Real touch hardware, classroom projector and screen-reader signoff remain pending under #13. The procedural scene is not a claim of pixel equivalence with Concept B. Earlier artifacts retain their original build identities.

## GitHub Pages

The existing Check And Deploy workflow verifies PRs targeting main, and publishes pushes to main. Draft branches do not deploy. Tonight's review commits skip CI to conserve allowance/storage and include locally verified artifacts instead. No workflow, Pages setting, live-site or billing change is part of this stack. The [served manifest](https://abbyusesaithatcodes.github.io/EasyAsPie/build.json) identifies the live build separately.
