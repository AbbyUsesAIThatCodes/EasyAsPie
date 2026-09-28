# EasyAsPie Design Brief

## Current Direction And Implementation Boundary

The [preserved Current Direction](DESIGN-DISCUSSION-2026-09-28.md#current-direction) governs the paired pie/bar redesign. Each independent pair shares one exact fraction; its equal-length bar mirrors its pie without units or ruler ticks. The [Free Play Action Contract](FREE_PLAY_ACTIONS.md) now defines the tested state foundation, serving changes, and exact Cut/Regroup behavior. See [Implementation Status](IMPLEMENTATION_STATUS.md) for what is connected to the UI.

The sections below preserve the historical first-playable design, including its Examples/Challenge teaching sequence and cosmetic recipes. The current #10 visual preview replaces the runtime entrypoint with two blueberry pies, the Free Play shell, and a working state-derived drawer. Linked serving controls remain future work in #11–#12. Old mode modules and validation evidence remain preserved; they are not exposed as redesigned modes. Prediction before revealing results belongs to future Learn/Challenge content; Free Play is exploratory.

## The Idea

Two pies. The same size. Different numbers of equal slices. Select the same amount on each and see that the fraction changes while the quantity stays fixed. Blueberry filling, golden scalloped crust, little sugar crystals, and porcelain plates make the mathematics inviting.

## Three Mechanics

1. **Slice The Whole.** Repartition one pie into halves, quarters, eighths, or sixteenths. In examples, preserve the highlighted amount and show both numbers scaling together.
2. **Match The Serving.** Select equal slices of the second pie to match a reference fraction. More slices do not necessarily mean more pie.
3. **Explain The Match.** Check the serving, read specific feedback, and name the equivalent fraction. Challenge feedback shows the relationship only after a submitted answer; examples openly demonstrate it.

## Mathematical Invariants

Both pies use the same radius, height, camera scale, slice origin, and equal angular partitions. Serving selection changes emphasis, never the size of a slice or whole. Fillings are cosmetic. A different recipe cannot change the correct answer. Selected slices form one contiguous serving for easy comparison. Whole plate outlines remain visible. Denominators are 2, 4, 8, 16; numerators range from zero through the denominator. One whole is included as n/n. No improper fractions, arbitrary denominator conversions, addition, timers, or speed scoring in this first slice of the project.

## Visual Direction

Warm cream, berry purple, gingham, honey-colored pastry, and a quiet bakery setting. Large 3D pies dominate the screen. The shell has compact controls, readable fractions, and explanatory text below the action. Use genuine modeled depth, scalloped pastry edges, glossy filling, fruit pieces, and sugar specks. Avoid decorations that obscure equal cuts. Two pies only in the initial scene. No mandatory audio or motion. Fixed equal camera projection; a plan view may help inspect the amount.

## Teaching Sequence

Start with 1/2 = 2/4, advance to eighths and sixteenths, then reverse the conversion. Include 3/4 = 6/8, 3/8 = 6/16, zero, and a whole. Challenge tasks fix a target denominator and ask for the numerator. A student may retry without penalty, request a hint, revisit examples, or restart. Record first-attempt success separately from completion and assistance. Avoid describing a practice score as mastery.

## Classroom Constraints

Laptop and desktop layouts, including 1366 × 768 and 1280 × 720. Keyboard alternatives for all pointer actions, visible focus, text feedback in addition to color, reduced-motion support. No student names, accounts, external analytics, or server dependency. Bundle runtime code locally. Browser storage is unnecessary for this first version.
