import { getSquirclePath } from "@/lib/squircle";

export type ExportFormat = "png" | "jpeg" | "svg";

export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExportOptions {
  /** Source image URL (object URL). */
  imageSrc: string;
  /** Crop rect in natural image pixels (from react-easy-crop). */
  cropPixels: CropPixels;
  /** Output canvas size in px (square). */
  outputSize: number;
  radiusRatio: number;
  smoothing: number;
  format: ExportFormat;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Failed to encode ${type}`));
      },
      type,
      quality,
    );
  });
}

/** Render the cropped region clipped to a squircle in the requested format. */
export async function exportSquircle({
  imageSrc,
  cropPixels,
  outputSize,
  radiusRatio,
  smoothing,
  format,
}: ExportOptions): Promise<Blob> {
  const img = new Image();
  img.src = imageSrc;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const path = getSquirclePath({ size: outputSize, radiusRatio, smoothing });

  if (format === "svg") {
    // Vector squircle clip over an embedded raster of the crop region.
    ctx.drawImage(
      img,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      outputSize,
      outputSize,
    );
    const href = canvas.toDataURL("image/png");
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="0 0 ${outputSize} ${outputSize}">` +
      `<clipPath id="squircle"><path d="${path}"/></clipPath>` +
      `<image href="${href}" width="${outputSize}" height="${outputSize}" clip-path="url(#squircle)"/>` +
      `</svg>`;
    return new Blob([svg], { type: "image/svg+xml" });
  }

  if (format === "jpeg") {
    // JPEG has no alpha channel; fill the outside of the squircle with white.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);
  }
  ctx.clip(new Path2D(path));
  ctx.drawImage(
    img,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  if (format === "jpeg") return toBlob(canvas, "image/jpeg", 0.92);
  return toBlob(canvas, "image/png");
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
