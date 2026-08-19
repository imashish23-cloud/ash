export const SNAPSHOT_ID = "leadership-snapshot";

export async function exportSnapshot(kind: "pdf" | "png"): Promise<void> {
  const node = document.getElementById(SNAPSHOT_ID);
  if (!node) return;

  node.classList.add("export-snapshot");

  let canvas: HTMLCanvasElement;
  try {
    const { toCanvas } = await import("html-to-image");
    canvas = await toCanvas(node, {
      backgroundColor: "#F5F7FA",
      pixelRatio: Math.min(2, window.devicePixelRatio || 1.5),
      cacheBust: true,
    });
  } finally {
    node.classList.remove("export-snapshot");
  }



  const stamp = new Date().toISOString().slice(0, 10);

  if (kind === "png") {
    const link = document.createElement("a");
    link.download = `camps-leadership-snapshot-${stamp}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    return;
  }

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const imgW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  // Height (in source canvas px) that fits one page at the target width.
  const scale = canvas.width / imgW;
  const sliceH = Math.floor(usableH * scale);

  const slice = document.createElement("canvas");
  const ctx = slice.getContext("2d");
  if (!ctx) return;

  const src = canvas.getContext("2d", { willReadFrequently: true });

  // A row is "blank" when every sampled pixel matches the row's first pixel.
  const isBlankRow = (y: number): boolean => {
    if (!src) return false;
    try {
      const { data } = src.getImageData(0, y, canvas.width, 1);
      const step = 4 * Math.max(1, Math.floor(canvas.width / 220));
      const r = data[0] ?? 0;
      const g = data[1] ?? 0;
      const b = data[2] ?? 0;
      for (let i = step; i < data.length; i += step) {
        if (
          Math.abs((data[i] ?? 0) - r) > 6 ||
          Math.abs((data[i + 1] ?? 0) - g) > 6 ||
          Math.abs((data[i + 2] ?? 0) - b) > 6
        ) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  // Search upward from the ideal cut for a band of blank rows (a gap between
  // sections) so headings/rows are never sliced in half.
  const findCut = (start: number, ideal: number): number => {
    const band = Math.max(6, Math.round(sliceH * 0.006));
    const limit = start + Math.round(sliceH * 0.6);
    for (let y = ideal; y > limit; y -= 2) {
      let ok = true;
      for (let k = 0; k < band; k += 2) {
        if (!isBlankRow(y - k)) {
          ok = false;
          break;
        }
      }
      if (ok) return y;
    }
    return ideal;
  };

  let sy = 0;
  let first = true;
  while (sy < canvas.height) {
    let h = Math.min(sliceH, canvas.height - sy);
    if (sy + h < canvas.height) {
      h = findCut(sy, sy + h) - sy;
    }
    slice.width = canvas.width;
    slice.height = h;
    ctx.fillStyle = "#F5F7FA";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, sy, canvas.width, h, 0, 0, canvas.width, h);

    if (!first) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.92),
      "JPEG",
      margin,
      margin,
      imgW,
      h / scale,
      undefined,
      "FAST",
    );
    first = false;
    sy += h;
  }

  pdf.save(`camps-leadership-snapshot-${stamp}.pdf`);
}

