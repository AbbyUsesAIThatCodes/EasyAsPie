# EasyAsPie

**Same amount. Different slices. Delicious fractions.**

A 3D fraction game for Design And Modeling, **1.3 — Measuring Matters**. Compare two equal-sized pies and discover why 1/2, 2/4, 4/8, and 8/16 describe the same amount.

## Current Free Play Preview

The **0.2.0 Free Play preview** now connects both blueberry pies to their matching fraction bars. It starts at **A = 1/2**, **B = 2/4**. Select a slice or bar segment to select that piece and all earlier pieces from the common back-center origin. Each pair has **Clear**, **Decrease**, and **Increase**; editing A leaves B unchanged. Pie, bar, fraction, selected-count label, and announcement update together.

**Cut And Regroup** remain visibly **Coming Later** for #12. **Learn** and **Challenge** are labeled **Coming Later** and disabled. The original Examples/Challenge modes are historical first-playable work, not completed redesigned lessons.

The pies, porcelain plates, wooden counter, cabinetry, moving drawer and paired bars share one lit 3D scene. Equal closed pastry/filling wedges carry baked rims, irregular glossy berries, and selected-serving outlines. The drawer moves in depth with live shadows; its native controls follow the 3D bars. Bars have no ruler units or ticks. This local instructional supplement supports fraction equivalence before ruler work; it does not independently assess physical measurement.

## Design And Curriculum

The [September 28 Design Discussion](docs/DESIGN-DISCUSSION-2026-09-28.md) records the current direction for future work, including paired pie/bar interactions, and preserves the full proposal. Its later decisions take precedence over earlier design notes; the implementation status distinguishes this preview from later interactive work.

The [Free Play Implementation Plan](docs/FREE_PLAY_IMPLEMENTATION_PLAN.md) preserves the teacher's chosen [paired-bar mockup](docs/mockups/paired-fraction-bars.png) and divides [issue #7](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/7) into sequential, one-PR handoffs. The teacher inserted **#18 — Full 3D Bakery** after #11 and before #12 following the initial visual review. Start each new issue only after the previous PR is reviewed and merged; the plan does not claim the redesign is already implemented.

- [Design Brief](docs/DESIGN.md)
- [Curriculum Mapping And Source Review](docs/CURRICULUM.md)
- [Small-Step Roadmap And Review Order](ROADMAP.md)
- [Implementation Status And Next Handoff](docs/IMPLEMENTATION_STATUS.md)
- [Design And Modeling Course Repository](https://github.com/AbbyUsesAIThatCodes/DesignAndModeling26-27)

Changes arrive in small PRs targeting `main`. Merge only after the teacher's review.

## Run Locally

Install Node.js 22.12 or later, then run:

```sh
npm ci
npm run dev
```

Open the local URL shown by Vite. `npm test` checks the mathematics, session behavior, and build allocation; `npm run build` produces a self-contained static `dist/` folder and an immutable `artifacts/FULL-BUILD-ID/` copy. `npm run check:build` verifies that identity across the output. `npm run preview` serves that build. Dependencies are bundled; no third-party requests are needed at play time. PRs verify and upload review builds. The Check And Deploy workflow publishes main after a merge.

The scene uses original procedural Three.js meshes with equal geometry for each recipe; no external artwork or fonts are required. Relative build paths support the `/EasyAsPie/` project URL. See [Three.js](https://threejs.org/docs/) and [Vite Build Documentation](https://vite.dev/guide/build).

## Review And Teach

Click either pie or its matching bar to select a contiguous serving; **Clear** selects zero. A solid pie outline and bar dots mark the selected serving. A separate dashed outline and piece caption follow hover or focus without changing the fraction.

Tab visits each pie, serving controls, the persistent drawer toggle, then each open bar. Within a pie or bar, arrow keys, Home, and End explore individual pieces; Enter or Space selects. Boundary controls use `aria-disabled` and ignore activation while retaining keyboard focus. **Escape** in the drawer closes it and returns focus to **Show Fraction Bars**; hidden controls are inert. **Top View / Angled View**, supported **Full Screen**, and drawer changes preserve both servings. Reduced motion removes drawer and camera transitions. The complete footer build ID is selectable text.

Built-artifact review fixtures are available at `?preview=halves`, `?preview=quarters`, `?preview=eighths`, `?preview=sixteenths` (A = 3/16, B = 8/16), and `?preview=empty-whole` (A = 0/16, B = 16/16). They are labeled starting fixtures with the same live serving controls; no denominator picker is introduced. Omit the query for normal Free Play.

[Teacher Notes](docs/TEACHER.md) explain current controls. [Issue 18 Review](docs/review/issue-18/README.md) contains the current screenshots, short gameplay video, selection checks, exact build identity and limitations. Teacher visual approval is pending; review the media before merging. [Issue 11 Review](docs/review/issue-11/README.md) preserves the interaction foundation’s historical evidence. With Playwright installed separately, run `node scripts/review-selection.mjs` against `dist/`; `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, and `REVIEW_OUTPUT` can point to existing installations and a separate output directory. It does not build or deploy. For static cut-face inspection, use `?preview=quarters&review=solids`; it is visibly labeled Model Review and does not implement slicing. `node scripts/review-bakery.mjs` captures the current video and geometry close-up from the production artifact (Playwright and FFmpeg required).

The [Step 02 screenshots and original harness](docs/review/issue-10/README.md) remain historical evidence for the read-only preview.

## GitHub Pages

The repository's Pages source should be **GitHub Actions** (already selected by the teacher). Merge the deployment PR into `main`, then watch **Actions → Check And Deploy**. A successful `verify` job produces the reviewed artifact; `deploy` publishes that same artifact. The deployment job exposes the live URL. No separate Jekyll/static workflow or branch publication is needed.

Expected play URL after the first successful deployment: **https://abbyusesaithatcodes.github.io/EasyAsPie/**. If a deployment fails, inspect that job's error before changing settings. A manual run on `main` can retry the workflow. A deployment-only retry preserves the existing build ID.

See [Build Identity](docs/BUILD_IDENTITY.md) for the version, codename status, per-PR counters, and exact location inventory. [Actions](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/actions) holds current review builds. The [served manifest](https://abbyusesaithatcodes.github.io/EasyAsPie/build.json) identifies the deployed build once publishing succeeds.
