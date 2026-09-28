# EasyAsPie

**Same amount. Different slices. Delicious fractions.**

A 3D fraction game for Design And Modeling, **1.3 — Measuring Matters**. Compare two equal-sized pies and discover why 1/2, 2/4, 4/8, and 8/16 describe the same amount.

## First Playable Scope

- Two detailed, cartoony pies on a bakery counter; Blueberry first, then Cherry and Apple.
- Equal partitions into 2, 4, 8, or 16 slices.
- Guided examples before an untimed challenge mode.
- Mouse, trackpad, and keyboard controls for classroom laptops.
- Correct mathematics and clear selected portions take priority over decoration.

This is a local instructional supplement. It supports fraction equivalence before ruler work; it does not independently assess physical measurement.

## Design And Curriculum

- [Design Brief](docs/DESIGN.md)
- [Curriculum Mapping And Source Review](docs/CURRICULUM.md)
- [Small-Step Roadmap And Review Order](ROADMAP.md)
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

## Play And Teach

Start with **Examples**, then select **Challenge**. Choose a recipe, compare two equal wholes, and use the right pie or the − / + controls to select a serving. Challenges are untimed and allow retries. The summary distinguishes first-try matches without help from supported practice. A page reload starts over.

[Teacher Notes And Worked Keys](docs/TEACHER.md) explain the goal mapping, controls, misconceptions, assessment limits, and a physical-ruler follow-up.


## GitHub Pages

The repository's Pages source should be **GitHub Actions** (already selected by the teacher). Merge the deployment PR into `main`, then watch **Actions → Check And Deploy**. A successful `verify` job produces the reviewed artifact; `deploy` publishes that same artifact. The deployment job exposes the live URL. No separate Jekyll/static workflow or branch publication is needed.

Expected play URL after the first successful deployment: **https://abbyusesaithatcodes.github.io/EasyAsPie/**. If a deployment fails, inspect that job's error before changing settings. A manual run on `main` can retry the workflow. A deployment-only retry preserves the existing build ID.

See [Build Identity](docs/BUILD_IDENTITY.md) for the version, codename status, per-PR counters, and exact location inventory. [Actions](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/actions) holds current review builds. The [served manifest](https://abbyusesaithatcodes.github.io/EasyAsPie/build.json) identifies the deployed build once publishing succeeds.
