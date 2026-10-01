# Current Validation

The current [integrated PR30 evidence](review/issue-27/README.md) covers all three follow-up increments, including twenty-order report download and local recovery. [PR28](review/issue-25/README.md) and [PR29](review/issue-26/README.md) retain their independent exact artifacts. See [Implementation Status](IMPLEMENTATION_STATUS.md) for the current checked matrices and outstanding human review. The sections below preserve historical 0.1.0 behavior and do not describe current saving or modes.

# First Playable Validation

This section preserves the initial 0.1.0 review evidence. Current build identity and deployment records are described in [Build Identity](BUILD_IDENTITY.md).

## Automated Checks

`npm test`: six tests pass. Covers all allowed source/target partition combinations, exact reverse conversion, invalid counts and unsupported denominators, every authored exercise answer, retry gating, no duplicate scoring, hint/example assistance, next-task reset, zero/whole challenges, and round termination.

`npm run build`: production bundle succeeds. No external runtime image, font, or script requests were observed during browser play.

## Browser Checks Performed

A local Chromium run against the production build completed all eight examples and all ten challenges. It checked mouse raycasting, keyboard activation, focus retention after rerender, incorrect feedback, hints, an example detour, repeated selection of the active mode, locked correct answers, final summary, and restart. The deliberate test round produced 8 first-try matches without help, 2 tasks with help, and 1 task with a retry, as expected.

Screenshots were visually inspected at 1366 × 768 and 1280 × 720. Cherry challenge portions and an Apple top view retained matching whole sizes and readable cuts. The layout had no horizontal overflow. At shorter window heights, lower explanatory text may require normal page scrolling. A simulated unavailable WebGL context displayed the fallback while keeping fraction controls functional. Reduced-motion mode was exercised; there is no continuous scene animation. No uncaught browser errors occurred.

## Remaining Human Review

- Play on an actual classroom laptop and projector; local software-rendered Chromium is not a school hardware performance measurement.
- Review screen-reader announcements with the school's assistive technology.
- Ask learners to explain the multiplicative relationship, then locate equivalent values on a physical ruler. Visual matching alone is insufficient evidence of that transfer.

## Reproduce The Main Playthrough

Run `npm ci`, `npm test`, `npm run build`, then `npm run preview`. Open the displayed local URL. Work through Examples; change a serving and use Show The Match. In Challenge, submit a wrong first answer, request a hint, and solve it. Visit Examples during the second task, then return. Solve the remaining tasks with the teacher key and verify the 8/2/1 summary. Restart, switch all three recipes, use Top View, and check keyboard navigation. Reloading should start a fresh session.

## Deployment Integration Checks

The 0.1.1 build pipeline adds focused allocation tests and `npm run check:build`. Current build reports are generated into each artifact from its immutable manifest; they are not manually copied into this historical record. First live Pages verification remains pending the deployment PR merge.
