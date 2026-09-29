# Free Play Action Contract

Implemented by `src/free-play.js` for [issue #9](https://github.com/AbbyUsesAIThatCodes/EasyAsPie/issues/9). This is the rendering-independent foundation for the [Current Direction](DESIGN-DISCUSSION-2026-09-28.md#current-direction), now used by the interactive #11 Free Play preview.

## State And Ownership

`createFreePlay()` returns an immutable `{ A: { n, d }, B: { n, d } }` snapshot, initially A = 1/2 and B = 2/4 as in the mockup. An optional `{ A, B }` supplies either or both starting fractions. Each is copied and validated through `fraction()` from `src/fractions.js`; invalid counts/denominators throw before any snapshot is returned. Caller-owned objects are never mutated or retained.

Each pair has exactly one authoritative fraction. Its pie, bar, and label read that same fraction. Denominators are 2, 4, 8, 16; numerator is an integer from 0 through d. Keep the displayed counts: 2/4 does not automatically become 1/2, and a whole remains d/d. Both pairs describe equal blueberry wholes; their bars have equal lengths, no units, and no ruler ticks.

Hover, focus, drawer/camera state, and animation progress belong outside this mathematical snapshot. They do not commit a serving. Adapters must dispatch against the latest snapshot and render both representations from the returned state; do not store separate pie/bar counts or commit a captured old state when an animation finishes. Interruption and animation policy belongs to #12.

## Actions And Results

Call `applyFreePlayAction(state, { pair, type, k })` with a snapshot produced by this model. `pair` is exactly `'A'` or `'B'`. `k` is used only for `'select'`. The pure function never modifies its arguments and returns `{ state, ok, reason }`.

- Accepted: `ok: true`, `reason: null`, and an immutable next snapshot. Only the addressed fraction may change. Selecting the existing count or clearing an empty serving succeeds with the existing snapshot.
- Refused: `ok: false`, `reason: { code, message }`, and the **identical original state**. Both pairs remain unchanged. Codes are stable adapter/test identifiers; messages supply plain-language feedback.
- Malformed/unknown actions, unknown pairs, and invalid selections are refused rather than rounded, clamped, or partially applied. Invalid caller-constructed state is a programming error; callers must use the constructor and returned snapshots.

| `type` | Result On The Addressed Pair | Refusal |
| --- | --- | --- |
| `select` | Select the first k pieces; `{n: k, d}`. k is an integer in 0..d; 0 means an empty serving. UI piece numbers run 1..d. | `invalid-selection` outside that range or for non-integers |
| `clear` | `{n: 0, d}` | None |
| `decrease` | `{n: n - 1, d}` | `empty-serving` at zero |
| `increase` | `{n: n + 1, d}` | `whole-serving` at d |
| `cut` | `{n: 2n, d: 2d}` using exact integer conversion | `finest-partition` at d = 16 |
| `regroup` | `{n: n/2, d: d/2}` using exact integer conversion | `coarsest-partition` at d = 2; otherwise `odd-serving` when n is odd |

`invalid-pair` reports an unknown/missing pair; `invalid-action` reports a malformed request or an unknown/missing type. Pair validation precedes type-specific validation. At halves, `coarsest-partition` takes precedence over `odd-serving`. Extra presentation metadata is ignored and never copied into state. No batch/multi-pair mutation API is introduced.

Cut and valid Regroup preserve the exact amount, including zero and whole. They change both counts together. Valid round trips restore the original notation. 12/16 → 6/8 → 3/4 and 1/2 → 2/4 → 4/8 → 8/16 are supported; 3/16 → eighths is refused without changing either pair.

## Integration Boundary

Step #9 deliberately retained the old Examples/Challenge session model. Step #10 introduced the state-derived scene. Step #11 dispatches pointer/keyboard serving actions against the latest immutable snapshot and immediately updates both representations, labels, and announcements. Hover/focus and drawer/camera/full-screen changes never write that snapshot. #12 adds Cut/Regroup controls, refusal feedback, and transitions. Keyboard operation, visible focus, non-color feedback, and reduced motion accompany each relevant UI increment.

`tests/free-play.test.js` checks all 34 valid fractions against all 34 partner states in both directions, every selectable count, bounded serving actions, exact transformations and round trips, rejection/recovery, and immutable ownership. These are mathematical behavior checks, not evidence of student assessment or ruler-reading mastery.
