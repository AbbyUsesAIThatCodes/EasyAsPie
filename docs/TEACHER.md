# EasyAsPie Teacher Notes

## Integrated Overnight Review

The current provisional build combines PR19's 3D bakery, PR20's physical slicing and PR22's three modes. [Playable build and exact evidence](review/issue-21/README.md). Manual merge order is PR19 → PR20 → PR22; teacher visual acceptance and #13 classroom review remain pending.

In **Free Play**, each pie/bar pair has its own exact serving. Selecting piece k serves the first k pieces from the back-center origin, moving down the left in Top View. Clear chooses zero. Cut doubles numerator and denominator and shows a knife passing through the solid pie. Regroup halves both numbers when representable. The whole and amount stay fixed; an odd numerator cannot be halved into whole larger pieces. Refusals explain why. Servings cannot change mid-animation; Reset cancels it safely.

In **Learn**, commit a prediction before revealing the physical change, then build an equivalent serving in Pie B. The prediction selector is disabled during motion; feedback and the completion record evaluate the original committed answer. Pie A stays the reference. The three local lessons are:

| Lesson | Prediction | Matching Pie B | Explanation |
| --- | --- | --- | --- |
| Same Serving, More Pieces | 1/2 → 2/4: numerator 2 | 4/8 | Double both numbers; the amount stays fixed. |
| Same Serving, Fewer Pieces | 12/16 → 6/8: numerator 6 | 3/4 | Combine pairs; divide both numbers. |
| From Pie To Bar | 3/8 → 6/16: numerator 6 | 6/16 | One eighth becomes two sixteenths in both representations. |

In **Challenge**, match ten orders using Pie B's fixed denominator. The ten answer keys in the historical table below are reused unchanged. Incorrect answers cannot advance. A hint, reference use or detour to Learn marks a previously started unfinished order as helped, including a route through Free Play. Prior selected responses survive these visits. Help viewed before starting an order is not counted retroactively. First-try-without-help, helped and retried counts are separate; helped/retried can overlap. Repeated correct submission cannot inflate results. Reset starts a fresh round. There is no timer, identity collection, persistent storage or score transmission.

The solid purple border marks a serving; dots mark selected bar pieces. A dashed outline and shader glow show the same hovered/focused piece without selecting. Red/green assessment feedback is supplemented by explicit Correct/Not Yet text and a fraction explanation. Changing the answer clears stale feedback. A completed round remains practice evidence, not measurement mastery.

Drag the background or use the orbit buttons to move the camera. Top View resets its comparison angle. Both pies always use equal orthographic scale. The drawer physically slides while its native bar targets follow. Tab, arrows, Home/End and Enter/Space operate pieces. Escape from a bar closes the drawer and returns focus. Bold vocabulary supports nested hover/focus explanations; activating it opens the reference, which Escape closes. Reduced motion commits transitions immediately. Free Play state survives visits to the other modes; Reset affects only the active mode.

This supports audit-local DM1.3 G10/G12, with G11 prerequisite vocabulary only. The current curricular-goals DOCX was read in full at the pinned revision recorded in [Curriculum Mapping](CURRICULUM.md). The official glossary remains missing in the audit; definitions in the game are explicitly locally written. Ask students to explain why both numbers change together, then check transfer separately with an actual ruler.

Real touch-device, classroom projector and assistive-technology review remain pending. The approved Concept B is still richer in microtexture/lighting than the procedural game. Static Model Review screenshots expose closed cut faces; actual Cut/Regroup is demonstrated separately in the gameplay video.

## Historical First-Playable Notes

Everything below records the earlier Examples/Challenge game and its keys. The earlier eight-example presentation and cosmetic recipes are historical; the ten exact Challenge keys are reused by the new mode. Preserve this history without using it as the control guide for the rebuild. [Implementation Status](IMPLEMENTATION_STATUS.md) is the current handoff.

## Before Play

Use Examples first. Ask students to name the whole, the number of equal pieces, and the selected serving. Both pies are the same size. A muted piece is still part of the whole; it is simply not selected. Blueberry, Cherry, and Apple use identical geometry and answers.

The game supports **DM 1.3 G12**, with equal partitions supporting G10 and fraction vocabulary supporting G11. See [the source review](CURRICULUM.md). All tasks below are locally authored practice. No official PLTW assessment or full ruler proficiency is claimed.

## Worked Examples And Keys

| Example | Equivalent Fractions | Intended Explanation |
| --- | --- | --- |
| Half A Pie | 1/2 = 2/4 | Multiply both numbers by 2. |
| Smaller Slices | 2/4 = 4/8 | Each original slice becomes two equal pieces. |
| Into Sixteenths | 4/8 = 8/16 | More selected pieces can still be the same amount. |
| Three Quarters | 3/4 = 6/8 | The idea works for portions other than half. |
| Three Eighths | 3/8 = 6/16 | Double both numbers. |
| Group Them Again | 12/16 = 3/4 | Divide both numbers by 4. |
| The Whole Pie | 2/2 = 16/16 | Every piece selected is one whole. |
| An Empty Serving | 0/4 = 0/16 | Repartitioning does not create a serving from zero. |

## Challenge Keys

| Task | Prompt | Answer |
| --- | --- | --- |
| 1 | 1/2 = ?/4 | 2/4 |
| 2 | 1/4 = ?/8 | 2/8 |
| 3 | 3/4 = ?/8 | 6/8 |
| 4 | 3/8 = ?/16 | 6/16 |
| 5 | 7/8 = ?/16 | 14/16 |
| 6 | 12/16 = ?/4 | 3/4 |
| 7 | 2/16 = ?/8 | 1/8 |
| 8 | 6/8 = ?/4 | 3/4 |
| 9 | 2/2 = ?/16 | 16/16 |
| 10 | 0/8 = ?/16 | 0/16 |

Every example and challenge above targets G12. Partition comparisons support G10; vocabulary through sixteenths supports G11 but does not measure ruler-location skill. Examples are explicitly assisted. Challenge mode asks for an answer before explaining the exact match, although the visible pie comparison itself remains scaffolding.

## Controls And Evidence

Click a slice on the right pie to select that many consecutive slices from the front-center radial boundary. This is a serving-size selector, not a freeform toggle of unrelated pieces. The − and + buttons perform the same action from the keyboard, including clearing the selection to zero. Tab reaches every control; Enter or Space activates a button. Top View changes both pies together. Full Screen is shown only when the browser supports it.

There is no timer, penalty, or speed score. A round has ten fixed prompts. The summary reports completion, first-try matches without help, tasks with hints or a return to Examples, and tasks solved after a retry. Help and retry categories can overlap. Returning to the active Challenge tab is not help; leaving an unfinished task to view Examples is. Starting a new round resets these counts. Page reload also resets them. The game collects no student identity and stores or transmits no performance data.

## Prompts For The Teacher

- “What stayed the same when we made more cuts?” Expected: the size of the whole and the selected amount.
- “Why does 1/4 differ from 1/2 when both numerators are one?” Expected: the pieces have different sizes.
- “Could 3/16 be a whole number of eighth slices?” Expected: no; every eighth contains two sixteenths, so three cannot be grouped into whole eighths.
- “Point to 1/4 inch, 2/8 inch, and 4/16 inch on your ruler.” This physical follow-up checks transfer to the source's measurement target; it is not part of the game score.

Ask for an explanation alongside the correct serving. Students can match areas visually without yet understanding the multiplicative relationship. A completed round is practice evidence, not a mastery claim. Actual classroom laptop, projector, and assistive-technology review remain necessary before classroom adoption.
