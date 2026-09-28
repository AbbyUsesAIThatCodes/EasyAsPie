# EasyAsPie Roadmap

## Review Stack

Each branch builds on the preceding branch so each PR contains one small increment. Review and merge in order. Use a merge commit to preserve ancestry; keep predecessor branches until the next PR has been retargeted to main. Do not merge a later PR into an unmerged feature branch. No automatic merges or deployment are part of this stack.

| Order | Branch | Bounded Increment |
| --- | --- | --- |
| [1](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/1) | docs/01-foundations | Design brief, curriculum provenance, and contribution rules |
| [2](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/2) | feat/02-fraction-core | Exact fraction math, exercise data, tests, and package scripts |
| [3](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/3) | feat/03-pie-scene | Two equal 3D pies, bakery shell, and local build |
| [4](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/pull/4) | feat/04-guided-examples | Guided equivalence examples and keyboard serving controls |
| 5 | feat/05-challenge-mode | Untimed challenges, specific feedback, and learning summary |

## After The First Review

- Teacher playtest on an actual classroom laptop and projector.
- Add a ruler transfer task only after reviewing how well students explain the pie model.
- Consider additional recipes, gentle serving animations, and more challenge variants.
- Add optional GitHub Pages publishing in a separate reviewed change.
- Review any future teacher guide or printed companion against the DM templates before authoring it.

## Definition Of Done For A Small PR

Explain the learning or technical change, identify its prerequisite, include the checks actually run, and record limitations. Keep mathematics independent of artwork. Inspect the playable screen at laptop sizes. Do not merge on the teacher's behalf.
