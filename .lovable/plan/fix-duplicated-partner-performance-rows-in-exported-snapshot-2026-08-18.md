# Fix duplicated Partner Performance rows in exported snapshot

## What's happening

The dashboard renders each partner row once. The duplication only appears in the exported PDF because of how the snapshot image is split across pages.

The export renders the whole dashboard into one tall image, then places that same full image on each PDF page, shifted upward by a fixed step. The step used is smaller than the visible page area (it subtracts the page margins twice), and nothing masks the margin band. jsPDF clips at the page edge instead of hiding those strips, so the rows that sat at the bottom of one page reappear at the top of the next. With the current layout that overlap band happens to land on partner rows 4 and 5.

## The fix

Slice the captured canvas into page-sized pieces instead of re-drawing the full image with an offset:

- Compute the usable page height, convert it back to source-pixel height on the canvas.
- For each page, draw that exact vertical strip of the source canvas onto a temporary canvas, export it to JPEG, and add it as a single full-page image.
- Advance strictly by one strip height, with no overlap and no negative Y offsets.
- Keep the existing filename, margins, quality, and PNG export path unchanged.

## Technical details

- File: `src/lib/export.ts`, `exportSnapshot("pdf")` branch only.
- Replace the `while (remaining > 0)` loop that calls `pdf.addImage(img, ..., margin - offset, imgW, imgH)` with per-page canvas cropping via `ctx.drawImage(source, 0, sy, sw, sh, 0, 0, sw, sh)`.
- Last page uses the remaining height so the final strip is not stretched.
- PNG export and `SNAPSHOT_ID` stay as they are.

## Verification

Export a PDF and confirm the partner list shows each rank exactly once and no content is cut at page seams.
