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

Implementation arrives in small, ordered pull requests. Nothing in this review stack should be merged without the teacher's review.

## Run Locally

Install Node.js 22.12 or later, then run:

```sh
npm ci
npm run dev
```

Open the local URL shown by Vite. `npm test` checks the mathematics; `npm run build` produces a self-contained static `dist/` folder. `npm run preview` serves that build. Dependencies are bundled; no third-party requests are needed at play time. The game is not deployed by these PRs.

The scene uses original procedural Three.js meshes with equal geometry for each recipe; no external artwork or fonts are required. Relative build paths support a future project-hosted deployment. See [Three.js](https://threejs.org/docs/) and [Vite Build Documentation](https://vite.dev/guide/build).

## Play And Teach

Start with **Examples**, then select **Challenge**. Choose a recipe, compare two equal wholes, and use the right pie or the − / + controls to select a serving. Challenges are untimed and allow retries. The summary distinguishes first-try matches without help from supported practice. A page reload starts over.

[Teacher Notes And Worked Keys](docs/TEACHER.md) explain the goal mapping, controls, misconceptions, assessment limits, and a physical-ruler follow-up.
