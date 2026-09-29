# EasyAsPie Teacher Notes

## Current Free Play Preview — Step 03A

Two equal blueberry pies and their unitless fraction bars start at 1/2 and 2/4. Select piece k in either representation to serve the first k pieces, beginning at the back-center cut and moving down the left in Top View. This chooses an amount; it does not toggle isolated slices. A and B are independent. **Clear**, **Decrease**, and **Increase** also update the paired pie, bar, fraction label, count, and polite announcement together. The whole stays fixed.

A solid outline marks the selected pie serving, and dots mark selected bar segments. A dashed outline and piece caption identify hover/keyboard focus in both representations without changing the serving. Muted pieces still belong to the whole. No scoring or correctness colors are used in Free Play.

Tab reaches each pie, serving controls, the drawer toggle, then each open bar. Arrow keys, Home, and End move among pieces within the focused pie/bar; Enter or Space selects. **Clear** reaches zero. At an empty serving, Clear/Decrease have disabled semantics; Increase has them at a whole. These buttons keep their place in the focus order so reaching a boundary never drops keyboard focus. **Escape** from a bar closes the drawer and returns focus to its toggle. Closed bars and bars still traveling out from beneath the counter cannot receive focus; they become available when the drawer has opened. The normal pie keyboard controls display a named piece button when focused, with the corresponding outline directly on the 3D slice.

**Show Fraction Bars / Close Fraction Bars**, **Top View / Angled View**, and supported **Full Screen** preserve the amounts. Reduced motion makes both the spatial drawer and camera transitions immediate; selection feedback is immediate. Reload starts over. Labeled starting fixtures cover other denominators for review; see [README](../README.md#review-and-teach).

**Cut And Regroup** remain visibly **Coming Later** for #12. Learn and Challenge remain disabled. This is an exploratory preview, not an assessment. No student data or scores are collected. It supports the existing audit-local G10/G12 connections and prerequisites for G11; actual ruler work belongs in MeasureTwice. Classroom hardware/projector and screen-reader signoff remain part of #13.

The environment is now one modeled scene. Native bar buttons sit over the projected 3D bar tiles, preserving keyboard operation and visible focus. Opening the drawer does not shrink or move the pies. Both pies always share one orthographic camera and apparent scale.

The explicit `?preview=quarters&review=solids` **Model Review · Separated Solids** fixture offsets one wedge in each pie to expose its crust, filling and cut faces. It is a static inspection view, not a Cut control or cutting demonstration. Serving buttons still edit the exact fractions; direct pie picking is disabled in this labeled geometry view because wedges are displaced. Return to the plain game URL for normal play.

Review [the screenshots and short video](review/issue-18/README.md) before approving this visual milestone. Visual acceptance is pending. After teacher approval and merge, #12 supplies physical slicing and regrouping and must also include actual-game screenshots and video.

## Historical First-Playable Notes

Everything below records the earlier Examples/Challenge game and its keys. Those modes and cosmetic recipes are not available in the current preview. Preserve this history without using it as the control guide for the rebuild. [Implementation Status](IMPLEMENTATION_STATUS.md) is the current handoff.

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
