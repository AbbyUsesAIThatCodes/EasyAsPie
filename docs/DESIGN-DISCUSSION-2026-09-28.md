# EasyAsPie Design Discussion — September 28, 2026

This record preserves the attached morning proposal and the teacher's subsequent decisions after the planning conversation was interrupted. It is the starting point for smaller implementation issues; it does not describe features already implemented.

## Current Direction

These decisions take precedence over the original ruler proposal below and the first-playable design wherever they differ:

- **Central Idea:** Changing the number of equal pieces does not necessarily change the amount.
- **Presentation:** Two equal-sized, bright, cartoony 3D pies in a full-screen bakery, initially blueberry, with compact mode controls and contextual instructions.
- **Modes:** **Free**, **Learn**, and **Challenge**. The original proposal calls free exploration **Free Play**. Learn has a freely navigable lesson menu; Challenge uses untimed bakery orders.
- **Fractions:** Equal halves, quarters, eighths, and sixteenths, from zero through one whole. Cut and regroup while preserving the selected amount. Never silently round or change a serving to fit a denominator.
- **Prediction:** Students predict before testing or seeing the demonstration that reveals the result.
- **Paired Bars:** Each pie has its own ruler-shaped rectangular fraction bar at the bottom of the screen. Divide it into equal segments matching that pie's denominator, and mirror the selected serving and any cutting or regrouping.
- **Two-Way Connection:** Pie and bar are tied together: interacting with either updates its corresponding representation. Keep the two pies independently editable for comparisons.
- **Drawer:** Preserve the smooth drawer-reveal concept for the paired bars.
- **Ruler Work:** Actual rulers belong in MeasureTwice. EasyAsPie uses fraction bars representing one whole, without inch or centimeter measurements.
- **Curriculum:** Base each lesson and challenge on the Measuring Matters curricular goals and document its source connection. Record the correct response, likely misconception, feedback, and assistance; distinguish independent success from success after help.

## How To Use The Preserved Proposal

The complete supplied `Pasted markdown.md` follows unchanged. It contains the curricular rationale, discovery examples, five proposed lessons, challenge bank, sample feedback, interface ideas, and suggested implementation order. Detailed lesson wording and implementation boundaries remain proposals to refine when creating issues.

Apply these updates when turning the proposal into issues:

| Original Proposal | Current Planning Direction |
| --- | --- |
| Reveal a fraction strip and inch ruler | Reveal one denominator-segmented bar for each pie; keep each pair synchronized. |
| **From Pie To Ruler** lesson | Adapt to **From Pie To Bar**, using corresponding fractions of a whole. |
| Locate 5/8 inch or rename a ruler position | Reserve actual ruler-position tasks for MeasureTwice; adapt EasyAsPie checks to pie/bar representations. |
| Ruler tasks provide direct evidence for G11–G12 | EasyAsPie provides prerequisite fraction evidence; ruler-reading transfer must be checked separately. |

G10, G11, G12, and the possible later G13 expansion are local IDs from the cited DM audit, not official standards codes. Preserve the pinned source links as historical provenance; references to PR status below describe the original discussion, not a current status check. Consult the [current Measuring Matters lesson](https://github.com/AbbyUsesAIThatCodes/DesignAndModeling26-27/tree/main/units/01-introduction-to-design/1.3-measuring-matters) and [Curriculum Mapping](CURRICULUM.md) before implementation.

The original suggested PR order is retained for context. Splitting this record into small issues is the next planning step.

## Original Attached Proposal

Good morning, sis! 💛 **Yes—let’s rebuild EasyAsPie around what students should discover through playing.** I’ll treat **Free Play, Learn, and Challenge**, with bright, cartoony 3D presentation, as our shared baseline for the educational games.

I read the [Measuring Matters Curricular Goals Document](https://github.com/AbbyUsesAIThatCodes/DesignAndModeling26-27/blob/1713a3bd537035f2ce09dfc7fe05ce6bf6b70cc3/units/01-introduction-to-design/1.3-measuring-matters/teacher-guides/measuring-matters-curricular-goals.docx). That edition is currently in the still-open DM PR #21. Here is my proposed starting point for our discussion.

**EasyAsPie’s central idea should be: “Changing the number of equal pieces does not necessarily change the amount.”**

The strongest curricular connections are:

| Audit Goal     | What Students Need To Understand                         | EasyAsPie’s Contribution                                                                                        |
| -------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **DM-1.3 G10** | Ruler marks divide a unit into smaller, equal intervals. | Cutting one whole pie into progressively smaller equal slices develops the underlying idea.                     |
| **DM-1.3 G12** | Equivalent fractions identify the same ruler position.   | Students construct different fraction names for the same serving, then connect them to one position on a ruler. |
| **DM-1.3 G11** | Read fractional-inch positions through sixteenths.       | A short ruler activity checks whether students can apply the fraction understanding beyond the pies.            |

These are the audit’s local target IDs. The pie activities support those goals; the ruler activities provide evidence of transfer.

**G13—whole inches plus a fractional remainder—would make a sensible later expansion.** I would keep the first redesign focused on quantities from zero through one whole.

**1. Free Play should let students discover the relationships through three actions.**

Picture two substantial blueberry pies on a cheerful bakery counter. Both represent the same-sized whole. Students can:

- **Cut And Regroup.** Divide a pie into halves, quarters, eighths, or sixteenths. Select half, then cut each quarter in two: the selected region stays fixed while its label changes from **2/4 to 4/8**.
- **Serve And Compare.** Select slices on either pie independently. Make three quarters on one pie, then experiment with eighths on the other until the servings match.
- **Show The Connection.** Request a comparison overlay or reveal a linked fraction strip and ruler. The game makes the relationship visible without changing the student’s serving.

The mathematical feedback should follow every action: slices highlight, selected portions lift slightly, and the numerator and denominator refer visibly to **selected pieces** and **pieces in the whole**.

Some discoveries we should deliberately make possible:

| Student Experiment                                  | Intended Discovery                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| Compare one half with one eighth.                   | More pieces in the whole means smaller individual pieces.                    |
| Compare two quarters with four eighths.             | More selected pieces can still represent the same amount.                    |
| Keep cutting a selected half.                       | Both numbers change together while the amount stays fixed.                   |
| Regroup twelve sixteenths.                          | The same serving can be named 6/8 and 3/4.                                   |
| Try to regroup three sixteenths into whole eighths. | Some servings cannot be expressed using whole slices of a coarser partition. |

That last interaction matters: **the game must never silently round a serving or change its amount to accommodate a denominator.**

Free Play can make these ideas available, but exploration alone may leave a misconception untouched. Learn should draw students’ attention to the relationships; Challenge should ask them to demonstrate understanding.

**2. I recommend five short, freely selectable lessons.**

Each would follow a small cycle: **brief explanation → student action → visible consequence → one check**. Aim for roughly one to three minutes each, with replayable animations and no required waiting.

Here is a concrete first draft:

| Lesson                         | Proposed Student Text                                                                              | Task And Animation                                                                                                                                        | Completion Check                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Meet The Whole**             | “This pie is one whole. Cut it into four equal pieces. Each piece is one fourth.”                  | Student chooses four pieces and serves three. The four pieces briefly separate; the selected three lift.                                                  | “What fraction did you serve?” Student supplies **3/4**. Feedback identifies what each number counts.        |
| **Same Serving, More Pieces**  | “You have half a pie. Predict what happens when every piece is cut in two.”                        | Student predicts, then cuts halves into quarters. The serving boundary stays fixed; **1/2 → 2/4** appears beside it. Repeat with eighths.                 | “Make the same serving using sixteenths.” Student selects **8/16** before the comparison appears.            |
| **Same Serving, Fewer Pieces** | “These twelve sixteenths can be grouped into larger equal pieces.”                                 | Student groups pairs: **12/16 → 6/8 → 3/4**. Internal boundaries fade while the amount stays fixed.                                                       | Student regroups **6/16 as 3/8**, then examines why **3/16** cannot become a whole number of eighths.        |
| **Which Serving Is Larger?**   | “Both pies are the same size. Does a larger denominator always mean more pie?”                     | Student compares **1/4 and 1/8**, predicts, then aligns their serving outlines. A second comparison uses **3/4 and 3/8**.                                 | Choose the larger serving and explain: “The fourths are larger pieces, and both servings have three pieces.” |
| **From Pie To Ruler**          | “A whole pie and a whole inch are different things. Both can be divided into sixteen equal parts.” | A selected **3/8** serving appears alongside **6/16** of a fraction strip and a ruler position at **3/8 inch**. Matching subdivisions highlight together. | With the connection hidden, student locates **5/8 inch**, then reads a different marked position.            |

I particularly want **prediction before animation**. Otherwise, students can watch a pleasing demonstration without committing to an idea we can help them examine.

**3. Challenge should use bakery orders that require the same mathematical actions.**

Students receive an order, build a serving, and submit it. A successful order adds a completed plate to the bakery display. I recommend an untimed first version, with progress based on demonstrated skills.

Here are candidate questions with explicit connections:

| Challenge Prompt                                                                         | Expected Response                                      | Curricular Connection                                                                     |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| “Serve three eighths of this pie.”                                                       | Select three of eight equal slices.                    | Prerequisite support for **G10–G11**: interpret equal subdivisions and fraction notation. |
| “Match this half-pie serving using sixteenths.”                                          | **8/16**                                               | Supports **G12**: construct an equivalent fraction.                                       |
| “Match three quarters using eighths.”                                                    | **6/8**                                                | Supports **G12** with a different serving size.                                           |
| “Rename twelve sixteenths using the fewest equal pieces in the whole.”                   | **3/4**, using the available partitions.               | Supports **G12** through regrouping.                                                      |
| “A baker says 3/8 and 3/16 are equal because both have three pieces. Correct the order.” | Identify the mismatch; make **6/16** to match **3/8**. | Supports **G10 and G12**; exposes the same-numerator misconception.                       |
| “Place the marker at 5/8 inch on this ruler.”                                            | Select the tenth sixteenth-inch position from zero.    | Direct digital practice of **G11–G12**.                                                   |
| “This mark is at 12/16 inch. Give another fraction name for its position.”               | **6/8 inch** or **3/4 inch**                           | Direct digital practice of **G12**.                                                       |

For every eventual question, we should record **its goal ID, correct response, likely misconception, feedback, and whether help was used**.

For example, if a student submits **3/16** to match **3/8**, feedback could say:

> “You selected three pieces on each pie. But each sixteenth is smaller than an eighth. How many sixteenths cover one eighth?”

Then animate **one eighth splitting into two sixteenths**, leaving the student to finish the order. Track independent success separately from success after that help.

**For the interface, my first mockup would show the two pies dominating a full-screen 3D bakery.** Compact mode controls sit above them; contextual cutting and serving controls sit near each plate. Learn adds one small instruction card. Challenge replaces that card with an order ticket. An overhead comparison view keeps the mathematics easy to inspect.

A second mockup could explore the ruler connection: a small drawer opens beneath the pies, revealing the fraction strip and inch ruler while keeping both pies visible.

After we settle the design, the document can capture these decisions and the question mappings. The first two implementation issues could then be:

1. **Rebuild The 3D Bakery And Free Play Mechanics**
2. **Add The Guided Lesson Menu And Lessons**

Challenge would follow once those shared interactions work well.

**The biggest choice I’d like us to discuss first, sis: should EasyAsPie include that small ruler connection?** My recommendation is yes—it gives the pie discoveries a clear route back to Measuring Matters, while MeasureTwice can handle the fuller ruler experience. 💛