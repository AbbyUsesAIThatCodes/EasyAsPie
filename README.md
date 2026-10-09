# EasyAsPie

**[Play EasyAsPie Online](https://abbyusesaithatcodes.github.io/EasyAsPie/)**

## October 4 Pages Release

The owner has approved publishing the tested runtime. [Release Status And Procedure](docs/LOCAL_PAGES_RELEASE.md) supersedes the earlier review-only deployment restrictions below. Local validation and actual deployment remain separate gates.

## Accepted Mechanics And Worksheet Baseline

On October 3, 2026, the teacher accepted [draft PR #38](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/38) build 006 mechanics and authorized the worksheet. Its instructional interface, lesson sequence and mechanics are frozen for materials at runtime source `b3901d2b07bbc31380b1d1cb027b1aa3d087b6d1`, with evidence `dcc9bb7c762d5bdc557249903b8d6c08e5238ef5`. See [the identified playable build and evidence](docs/review/issue-31-finishing/README.md), [the student workflow](docs/TEACHER.md), and [remaining visual scope](docs/FINISHING_REVIEW.md). The parent worksheet task authors from that baseline. Full room/fan and wallpaper polish stay deferred until materials are complete. Classroom hardware and accessibility acceptance remain open under #13; no main merge or deployment is authorized.

The build-007 section below remains preserved history.

## Beginner Construction — Local Development Review

The approved October 3 revision (#31–#36) is on `review/31-beginner-pie-building`, based on corrected PR30 head `dae9277`. [Review contract](docs/BEGINNER_REVIEW_CONTRACT.md) · [Exact review build and evidence](docs/review/issue-31/README.md). PR28 → PR29 → PR30, main, live Pages and workflows remain untouched.

Start in **Learn**: build a whole, halves and quarters; read visual amounts into written fractions; explore equivalence; then make one whole plus a proper fraction. **Challenge** retains the twenty exact orders and adds four mixed-number extensions. Start empty to ADD; start occupied to ERASE. Drag operation stays latched, units remain exact, and CUT PIES is the only answer commitment. Wrong answers keep the work for revision. Free Play retains its independent prefix servings and physical Cut/Regroup.

Counter bars mirror the active plates. Pie Cards have native Piece Controls; arrows explore, Enter/Space toggles, Shift + arrows previews a range, Enter commits, Escape cancels. Background drags orbit; Reset View restores the camera. The empty drawer remains openable. No surprise or worksheet is implemented.

New work saves under `easyaspie.construction.v2`. Previous `easyaspie.progress.v1` bytes are preserved; a version notice and Previous Work download prevent old assessment evidence being mistaken for new completion. The local Activity Report includes committed masks, answers, retries, help, archived rounds and build/source identity. No account, upload or expiry. Small portrait screens scroll vertically and offer larger native piece buttons.

Use the existing `npm ci`, `npm test`, `npm run build`, `npm run check:build` entrypoints. `index.html` now loads `src/beginner-main.js`; historical controllers remain inactive for legacy validation/report provenance. New actual-input suites: `scripts/review-beginner.mjs` and `scripts/review-beginner-recovery.mjs`. Set `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH` and optionally `REVIEW_OUTPUT`. Teacher visual acceptance, actual touch hardware, screen reader and projector checks remain under #13.

The earlier sections below are preserved review history, including superseded controls and instructions.

## Preserved Review History

**Same amount. Different slices. Delicious fractions.**

A full-viewport 3D fraction bakery for Design And Modeling, **1.3 — Measuring Matters**. Two equal-sized pies and equal-length unitless bars connect the same exact fraction state.

## Current 0.4.1 Draft Review

[PR30 build 003](docs/review/issue-27/correction-build003/README.md) adds only the completed-Learn restore validation correction. Build 002 and its broader review evidence remain preserved below; the correction has separate affected-suite evidence and a localhost:4193 preview.

Review the [integrated PR30 playable ZIP, screenshots, gameplay video and activity-report sample](docs/review/issue-27/README.md). The manual merge order is **PR28 → PR29 → PR30**, with issues #25, #26 and #27 respectively. Retarget each successor to main after its predecessor is accepted and merged. All remain drafts; current main is the earlier integrated source through PR24.

- **PR28:** parallel near/far bars, accurate mode-specific names, independent strawberry and existing flavors, exact instruction copy, and a hidden Challenge example with a written target.
- **PR29:** physical brass handle activation, keyboard equivalent, intermittent green discovery cue and ten-minute quiet cycle, available-action emphasis, and clearer Learn layout.
- **PR30:** twenty distinct orders, validated browser-only recovery without expiry, explicit clearing, help/retry history and a downloadable activity report. This ZIP includes all three increments.

## Preserved 0.3.1 Review

The provisional overnight stack is **PR19 → PR20 → PR22**. Review the [integrated playable build and evidence](docs/review/issue-21/README.md). The teacher will test and merge manually; visual acceptance is still pending. The [overnight authorization](docs/OVERNIGHT_REVIEW.md) permits this bounded stack while preserving the earlier Step03A-before-Cut/Regroup order.

- **Free Play:** select a contiguous serving in either pie or bar, clear/increase/decrease it, then physically Cut or Regroup while preserving the amount. A and B stay independent. Cut stops at sixteenths; Regroup refuses an odd numerator or a denominator below two, with an explanation.
- **Learn:** three prediction → real 3D demonstration → matching-serving lessons. Each has specific feedback, replay and a completion check.
- **Challenge:** twenty untimed orders using the existing exact fraction tasks. Wrong answers cannot advance; hints, reference use and learning detours count as assistance. The summary distinguishes helped work, retries and first tries without help.

The pies have closed pastry/filling solids, glossy varied berry meshes, warm lighting and live shadows. A real wooden drawer carries the physical bars. Drag the scene or use the orbit buttons to move the shared orthographic camera. Comic Sans controls float above the scene. Purple serving outlines and dashed hover/focus marks remain distinct; assessment red/green also includes explicit text.

Bold vocabulary has nested hover/focus-safe explanations and opens a reference. Definitions are locally written; no official glossary or standards crosswalk is claimed. This model supports fraction equivalence before ruler work; it does not independently assess measurement mastery.

## Run And Review

Install Node.js 22.12 or later, then run `npm ci`, `npm run dev`. For production use `npm test`, `npm run build`, `npm run check:build`, then `npm run preview`. The exact production artifact is also copied to `artifacts/FULL-BUILD-ID/`; its manifest, report, console and visible footer share one fixed build identity. The existing codename remains **Unassigned**, pending the owner's choice.

Each review ZIP includes Start Review.cmd and a small localhost-only Node server. No deployment is required. The current integrated preview on Jess_PC uses port 4192; PR29 uses 4191 and PR28 uses 4190. Historical previews use 4187–4189. These task-owned previews are separate from live Pages.

Tab reaches the scene's native pie controls, serving controls and drawer. Arrow keys, Home and End explore pieces; Enter or Space selects. Clear chooses zero. Escape in a bar closes the drawer and restores toggle focus. Escape also closes the reference. Closed/traveling bars are inert. Reduced motion commits slicing, drawer and view changes immediately. Reset Mode affects the active mode. Work, independent flavors, committed predictions, submitted order responses and help history are saved only in this browser until Clear Saved Work is chosen; there is no automatic expiry, account or server upload. Reload restores validated committed work. Unsupported/corrupt saves are retained without overwriting until explicitly cleared. Completing Challenge enables a local HTML activity-report download with responses, retries, help and exact build identity.

Review fixtures: `?preview=halves`, `quarters`, `eighths`, `sixteenths` or `empty-whole`. The normal start is A = 1/2, B = 2/4. `?preview=quarters&review=solids` is an explicitly labeled static geometry inspection, separate from actual cutting gameplay.

With Playwright installed separately, run the selection, transforms, modes, presentation, handle and recovery scripts under `scripts/review-*.mjs` against the production `dist/`. Set PLAYWRIGHT_MODULE, CHROMIUM_PATH and REVIEW_OUTPUT as needed. These launch isolated browsers/ephemeral localhost ports; they do not build or deploy. RECORD_MODES=1 records the integrated playthrough when Playwright's FFmpeg is available.

## Curriculum And Review History

- [Teacher Notes And Exact Answer Keys](docs/TEACHER.md)
- [Curriculum Mapping And Source Limits](docs/CURRICULUM.md)
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md), [Build Identity](docs/BUILD_IDENTITY.md), [Roadmap](ROADMAP.md)
- [Approved Concept B](docs/mockups/paired-fraction-bars.png), [PR19 Review](docs/review/issue-18/jess-pc/README.md), [PR20 Review](docs/review/issue-12/README.md)
- [Graphics Handoff](docs/ASSET_HANDOFF.md), [Design Discussion](docs/DESIGN-DISCUSSION-2026-09-28.md)

Real touch hardware, classroom projector and screen-reader signoff remain pending under #13. The procedural scene is not a claim of pixel equivalence with Concept B. Earlier artifacts retain their original build identities.

## GitHub Pages

The existing Check And Deploy workflow verifies PRs targeting main, and publishes pushes to main. Draft branches do not deploy. Tonight's review commits skip CI to conserve allowance/storage and include locally verified artifacts instead. No workflow, Pages setting, live-site or billing change is part of this stack. The [served manifest](https://abbyusesaithatcodes.github.io/EasyAsPie/build.json) identifies the live build separately.
