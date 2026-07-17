import { useState, type CSSProperties } from "react";
import type { Area, Point } from "react-easy-crop";

import { CropEditor } from "@/components/crop-editor";
import { ExportControls } from "@/components/export-controls";
import { ModeToggle } from "@/components/mode-toggle";
import { UploadCard } from "@/components/upload-card";
import { downloadBlob, exportSquircle, type ExportFormat } from "@/lib/crop-canvas";
import { useObjectUrl } from "@/hooks/use-object-url";

const DEFAULT_RADIUS_RATIO = 0.27;
const DEFAULT_SMOOTHING = 0.6;
const DEFAULT_SCALE = 1;
const DEFAULT_FORMAT: ExportFormat = "png";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [radiusRatio, setRadiusRatio] = useState(DEFAULT_RADIUS_RATIO);
  const [smoothing, setSmoothing] = useState(DEFAULT_SMOOTHING);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [format, setFormat] = useState<ExportFormat>(DEFAULT_FORMAT);
  const [isExporting, setIsExporting] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">("idle");

  const imageSrc = useObjectUrl(file);

  const handleFileChange = (nextFile: File | null) => {
    setFile(nextFile);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleDownload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsExporting(true);
    try {
      const blob = await exportSquircle({
        imageSrc,
        cropPixels: croppedAreaPixels,
        outputSize: Math.round(croppedAreaPixels.width * scale),
        radiusRatio,
        smoothing,
        format,
      });
      const baseName = file?.name.replace(/\.[^.]+$/, "") ?? "image";
      downloadBlob(blob, `${baseName}-squircle.${format === "jpeg" ? "jpg" : format}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRadiusRatio(DEFAULT_RADIUS_RATIO);
    setSmoothing(DEFAULT_SMOOTHING);
    setScale(DEFAULT_SCALE);
    setFormat(DEFAULT_FORMAT);
  };

  const handleCopy = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCopyState("copying");
    try {
      // Clipboard supports PNG only; pass the promise directly so the write
      // stays within the user-gesture window (required by Safari).
      const item = new ClipboardItem({
        "image/png": exportSquircle({
          imageSrc,
          cropPixels: croppedAreaPixels,
          outputSize: Math.round(croppedAreaPixels.width * scale),
          radiusRatio,
          smoothing,
          format: "png",
        }),
      });
      await navigator.clipboard.write([item]);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("idle");
    }
  };

  const outputSize = croppedAreaPixels ? Math.round(croppedAreaPixels.width * scale) : null;

  return (
    <div className="relative min-h-svh overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "var(--ambient-gradient)" }}
      />
      <div className="fixed top-5 right-6 z-50">
        <ModeToggle />
      </div>
      <main className="relative mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16 md:py-24">
        <header className="rise-in space-y-4" style={{ "--index": 0 } as CSSProperties}>
          <h1 className="font-heading text-5xl leading-[1.1] tracking-[-0.02em] md:text-6xl">
            Squircrop
          </h1>
          <p className="font-mono text-xs text-muted-foreground/50 tracking-wide">
            /ˈskwɪr.krɒp/
            <span className="mx-2 text-muted-foreground/25">·</span>
            <span className="text-foreground/40">squircle</span>
            <span className="mx-1.5 text-muted-foreground/25">+</span>
            <span className="text-foreground/40">crop</span>
          </p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Crop any image into a smooth Figma-style squircle. Tune the corner radius and smoothing,
            then export as PNG, JPEG, or SVG. Free and open source.
          </p>
        </header>

        <div className="rise-in" style={{ "--index": 1 } as CSSProperties}>
          <UploadCard file={file} previewUrl={imageSrc} onFileChange={handleFileChange} />
        </div>

        {imageSrc && (
          <div className="grid items-start gap-6 md:grid-cols-[1fr_320px]">
            <section
              className="rise-in overflow-hidden rounded-xl border border-border bg-card"
              style={{ "--index": 2 } as CSSProperties}
            >
              <div className="relative flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-[#e3e2e0] dark:bg-[#3a3835]" />
                  <span className="size-2.5 rounded-full bg-[#e3e2e0] dark:bg-[#3a3835]" />
                  <span className="size-2.5 rounded-full bg-[#e3e2e0] dark:bg-[#3a3835]" />
                </div>
                <span className="pointer-events-none absolute inset-x-0 truncate px-20 text-center font-mono text-xs text-muted-foreground">
                  {file?.name}
                </span>
                <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
                  {outputSize !== null ? `${outputSize} × ${outputSize}` : "—"}
                </span>
              </div>
              <CropEditor
                imageSrc={imageSrc}
                crop={crop}
                zoom={zoom}
                radiusRatio={radiusRatio}
                smoothing={smoothing}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={setCroppedAreaPixels}
              />
            </section>
            <aside
              className="rise-in rounded-xl border border-border bg-card p-5"
              style={{ "--index": 3 } as CSSProperties}
            >
              <ExportControls
                zoom={zoom}
                radiusRatio={radiusRatio}
                smoothing={smoothing}
                scale={scale}
                format={format}
                cropWidth={croppedAreaPixels?.width ?? null}
                canDownload={croppedAreaPixels !== null}
                isExporting={isExporting}
                onZoomChange={setZoom}
                onRadiusRatioChange={setRadiusRatio}
                onSmoothingChange={setSmoothing}
                onScaleChange={setScale}
                copyState={copyState}
                onFormatChange={setFormat}
                onDownload={handleDownload}
                onCopy={handleCopy}
                onReset={handleReset}
              />
            </aside>
          </div>
        )}

        <footer
          className="rise-in border-t border-border pt-6"
          style={{ "--index": 4 } as CSSProperties}
        >
          <p className="font-mono text-xs text-muted-foreground">
            Runs entirely in your browser. Images never leave this page.
          </p>
        </footer>
      </main>
    </div>
  );
}
