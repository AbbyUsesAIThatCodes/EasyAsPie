# EasyAsPie Roadmap

## Initial Review History

The teacher merged PRs #1–#5 on September 28, 2026. Because #2–#5 still targeted preceding branches, main initially received only #1. [PR #6](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/6) integrates their approved game into main and adds Pages publishing. Future PRs target main directly unless an explicit dependency requires otherwise. Check the base before merging.

| Order | Branch | Bounded Increment |
| --- | --- | --- |
| [1](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/1) | docs/01-foundations | Design brief, curriculum provenance, and contribution rules |
| [2](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/2) | feat/02-fraction-core | Exact fraction math, exercise data, tests, and package scripts |
| [3](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/3) | feat/03-pie-scene | Two equal 3D pies, bakery shell, and local build |
| [4](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/4) | feat/04-guided-examples | Guided equivalence examples and keyboard serving controls |
| [5](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/5) | feat/05-challenge-mode | Untimed challenges, specific feedback, and learning summary |

## After The First Review

- Teacher playtest on an actual classroom laptop and projector.
- Add a ruler transfer task only after reviewing how well students explain the pie model.
- Consider additional recipes, gentle serving animations, and more challenge variants.
- Merge the Pages integration PR, verify its deployment, then playtest the served game. See [Build Identity](docs/BUILD_IDENTITY.md) for current review versus deployed records.
- Review any future teacher guide or printed companion against the DM templates before authoring it.

## Definition Of Done For A Small PR

Explain the learning or technical change, identify its prerequisite, include the checks actually run, and record limitations. Keep mathematics independent of artwork. Inspect the playable screen at laptop sizes. Do not merge on the teacher's behalf.
