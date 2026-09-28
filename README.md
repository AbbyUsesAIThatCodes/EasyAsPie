# EasyAsPie

**Same amount. Different slices. Delicious fractions.**

A 3D fraction game for Design And Modeling, **1.3 — Measuring Matters**. Compare two equal-sized pies and discover why 1/2, 2/4, 4/8, and 8/16 describe the same amount.

## Current Preview

The **0.2.0 Free Play visual preview** introduces the blueberry bakery and fraction-bar drawer. Both pies read the tested exact state: **A = 1/2**, **B = 2/4**. Open **Show Fraction Bars** to see the corresponding equal-length bars. **Top View / Angled View** and supported **Full Screen** controls work without changing either serving.

This increment is deliberately read-only: serving selection, Clear/Decrease/Increase, and Cut/Regroup arrive in #11–#12. **Learn** and **Challenge** are labeled **Coming Later** and disabled. The original Examples/Challenge modes are historical first-playable work, not completed redesigned lessons.

The pies use equal modeled geometry, golden scalloped crusts, blueberry filling, and selected-serving outlines. Bars have no ruler units or ticks. This local instructional supplement supports fraction equivalence before ruler work; it does not independently assess physical measurement.

## Design And Curriculum

The [September 28 Design Discussion](docs/DESIGN-DISCUSSION-2026-09-28.md) records the current direction for future work, including paired pie/bar interactions, and preserves the full proposal. Its later decisions take precedence over earlier design notes; the implementation status distinguishes this preview from later interactive work.

The [Free Play Implementation Plan](docs/FREE_PLAY_IMPLEMENTATION_PLAN.md) preserves the teacher's chosen [paired-bar mockup](docs/mockups/paired-fraction-bars.png) and divides [issue #7](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/7) into five sequential, one-PR handoffs. Start each new issue only after the previous PR is reviewed and merged; the plan does not claim the redesign is already implemented.

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

Tab reaches the available controls; Enter or Space operates a button. The drawer retains focus on its toggle and opens immediately with reduced motion enabled. Muted pieces remain part of the same whole. The full build ID in the footer is selectable text.

Read-only review fixtures are available at `?preview=sixteenths` (A = 3/16, B = 8/16) and `?preview=empty-whole` (A = 0/16, B = 16/16). They are visibly labeled test fixtures, use the same validated model, and work in the built artifact; omit the query for the normal preview.

[Teacher Notes](docs/TEACHER.md) distinguish current controls from historical worked keys. [Issue 10 Review](docs/review/issue-10/README.md) includes real running-game screenshots, mockup comparison, and browser checks. With Playwright installed separately, `node scripts/review-browser.mjs` runs the optional browser acceptance harness against `dist/`; `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` may point to existing installations. It does not build or deploy.

## GitHub Pages

The repository's Pages source should be **GitHub Actions** (already selected by the teacher). Merge the deployment PR into `main`, then watch **Actions → Check And Deploy**. A successful `verify` job produces the reviewed artifact; `deploy` publishes that same artifact. The deployment job exposes the live URL. No separate Jekyll/static workflow or branch publication is needed.

Expected play URL after the first successful deployment: **https://abbyusesaithatcodes.github.io/EasyAsPie/**. If a deployment fails, inspect that job's error before changing settings. A manual run on `main` can retry the workflow. A deployment-only retry preserves the existing build ID.

See [Build Identity](docs/BUILD_IDENTITY.md) for the version, codename status, per-PR counters, and exact location inventory. [Actions](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/actions) holds current review builds. The [served manifest](https://abbyusesaithatcodes.github.io/EasyAsPie/build.json) identifies the deployed build once publishing succeeds.
