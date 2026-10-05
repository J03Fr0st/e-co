---
target: S2 design foundation (showcase, shell, primitives)
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:D:\\Source\\e-co\\src\\ECo.Web\\src\\dev\\Showcase.tsx"
target_fingerprint: "sha256:a22440887cb1e1324903c5dcef410e151004b69a70d4e2e175552ccd4897cf0d"
target_path: "D:\\Source\\e-co\\src\\ECo.Web\\src\\dev\\Showcase.tsx"
timestamp: 2026-10-05T15-08-17Z
slug: src-eco-web-src-dev-showcase-tsx
---
# Critique: Long Cycle S2 design foundation (showcase, shell, primitives)

Method: two agents (A: design review · B: detector and browser evidence). Mode: Operate for the shell and primitives.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | A loading button looks the same as a disabled one |
| 2 | Match system / real world | 3 | "Machine 02 lost its connection" carries the metaphor into error copy |
| 3 | User control and freedom | 3 | Esc, cancel and dismiss work; search has no clear button |
| 4 | Consistency and standards | 2 | Palette law broken: in-progress is grey, a failure is shown as a toast, focus blue is off-palette |
| 5 | Error prevention | 3 | Ghost cells; the refund confirmation states the amount |
| 6 | Recognition rather than recall | 3 | Labels everywhere; suggestions appear after 2 characters |
| 7 | Flexibility and efficiency | 2 | Keyboard support comes from the libraries; no accelerators |
| 8 | Aesthetic and minimalist design | 3 | The error block stretches to full row height |
| 9 | Error recovery | 3 | Errors give examples; the error toast auto-dismisses after 6s |
| 10 | Help and documentation | 2 | Inline hints only |
| **Total** | | **27/40** | **Acceptable** |

## Design specificity verdict

The world is partly authored. It lives in the chrome and the copy, not yet in the materials.

- **Authored:**
  - the enamel sign with condensed caps
  - the `BAG 00` readout
  - ghost-cell sold-out sizes
  - tabular readouts
  - `E-404` "No machine at this address"
- **Generic:** every surface is a white 12px card with a soft shadow. There is no brushed steel, porthole, machine sticker or colour dial yet.
- **Detector:** one advisory, `codex-grid-background` at `tokens.css:52`, the same on every page and viewport. The grid is the brand material, so its intent is legitimate, but its execution (1px hairlines on a viewport-anchored 64px cell) is the generic pattern. Both reviews agree it reads as graph paper, not glazed tile.

## Priority issues

1. **[P0] Condensed signage breaks in WebKit.**
   - **Evidence:** `mobile-home.png` reads "BASI CS BUI LT … WASHI NG", and the wordmark letters collide. Chromium renders it correctly. Reproduced in Playwright WebKit on Windows; not yet checked on a real iPhone.
   - **Cause:** `.sign-type` relies on `font-stretch: 75%` on the variable wdth face. Body text also renders heavier in WebKit.
   - **Fix:** set the variation axes explicitly (`font-variation-settings`), and add a WebKit visual check.
   - **Command:** typeset
2. **[P1] The materials of the world are missing.**
   - **What:** S3's machine 01 needs a steel panel, a porthole frame, a colour dial (swatch radio) and a machine-number sticker. None exist, and white cards are the default surface.
   - **Commands:** shape, then bolder
3. **[P1] The loading state breaks the palette law and drops focus.**
   - **What:** `loading` sets `disabled` and turns the button grey (about 2.4:1 text contrast).
   - **Fix:** use `aria-disabled`, keep the enamel fill with the spinner, and add an amber progress readout.
   - **Command:** harden
4. **[P2] Errors are not shown on the machine's own display.**
   - **What:** ErrorState is a pink alert box that stretches with its row, and the showcase demonstrates a failure toast that disappears after 6s.
   - **Fix:** an ink display with an E-code and `self-start`. Error toasts persist, or aren't used for failures.
   - **Command:** clarify
5. **[P2] The grout grid is wallpaper, not structure.**
   - **What:** 1px lines anchored to the viewport, so content edges cut tiles mid-cell.
   - **Fix:** snap the container and panels to tile multiples, use 2px grout, and give the tile a subtle glaze.
   - **Command:** layout

## Persona red flags

- **Casey (mobile):**
  - The crushed wordmark on iPhone.
  - At 320px the wordmark wraps to two lines and XL drops to a second row.
  - The bag readout cannot be tapped.
- **Riley (stress):**
  - The error toast vanishes.
  - Retry clears the error with no retrying state.
- **Jordan (first-timer):**
  - "Machine 02" and "E-404" are not explained.
  - Shop and the logo both go to `/`.
  - The 11px "SOLD OUT" caption.
- **Sam (assistive technology):**
  - Focus is lost when a loading button disables itself.
  - Arrow-key users skip the disabled M and never hear "Sold out".
  - "STOCK 03" reads as "zero three", with no "left".

## Minor observations

- The focus colour `#0b63ce` is outside the palette.
- Delivery prices are not set in tabular readout figures.
- The disabled Select option uses line-through, which hurts legibility.
- The disabled discount field gives no reason.
- `--duration-drum` exists but the quarter-turn isn't specified or demonstrated yet.

## Questions to consider

- What if panels were tiles: snapped to the grout, steel or glazed, never white SaaS cards?
- Is a refund "needs action" red, or does destructive need its own honest state colour?
- Should every error, from a 404 to a declined card, speak through one E-code machine display?
