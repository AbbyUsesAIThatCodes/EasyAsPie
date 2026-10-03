# New-Task Glimmer — Local Review Recipe

Consumer: EasyAsPie #35. Shared planning home: [EdugamesGraphicsStorage #11](https://github.com/AbbyUsesAIThatCodes/EdugamesGraphicsStorage/issues/11). This local recipe is ready for later review/archive in the existing shared standards home; no other repository or game was changed.

The instruction panel uses a single 1.25-second ease-out border/glow: bright purple `#bd70ed`, silver `#d9d4de`, then gold `#f1ca54`, settling to its ordinary warm border. Text and background remain stable. There is no flashing loop, layout shift, focus capture, queued reminder, or catch-up burst.

The cue key is mode + task index + completion state. An ordinary edit, hover, focus, resize, reference reopening or tab return does not change it. A visited-key set suppresses another cue when returning to the same instruction through mode navigation. An explicitly new round clears its own visited keys. A rapid transition cancels the earlier CSS animation. Reduced motion uses a static purple/gold frame. The textual task heading and order always carry the meaning.

This cue is distinct from the single 0.7-second gold success pulse on the upper order highlight. The old drawer-discovery loop is inactive because opening the empty drawer is no longer a learning prerequisite. Native handle access and reduced-motion drawer travel remain. The drawer contains no surprise.

Editable source: `src/beginner.css` (`new-task-glimmer`, `success-gold`), keyed by `renderActivity()` in `src/beginner-main.js`. The final review report pins the source/build and visual evidence. Palette, timing, upper-highlight target and the whole-pie serving reveal remain provisional teacher-review choices.
