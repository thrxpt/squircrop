import type { ReactNode } from "react";

import { Apple } from "@/components/ui/svgs/apple";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CheckIcon, CopyIcon, DownloadIcon, ResetIcon, SpinnerIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/lib/crop-canvas";

const OUTPUT_SCALES = [0.5, 0.75, 1, 1.5, 2, 3, 4] as const;
const EXPORT_FORMATS = ["png", "jpeg", "svg"] as const satisfies readonly ExportFormat[];

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
  badge?: ReactNode;
}

function SliderRow({ label, value, min, max, step, format, onChange, badge }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          {badge}
        </div>
        <span className="font-mono text-xs tabular-nums">{format(value)}</span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => onChange(Array.isArray(next) ? (next[0] ?? value) : next)}
      />
    </div>
  );
}

interface SegmentedRowProps<T extends string | number> {
  options: readonly T[];
  value: T;
  renderOption: (option: T) => string;
  onChange: (option: T) => void;
}

function SegmentedRow<T extends string | number>({
  options,
  value,
  renderOption,
  onChange,
}: SegmentedRowProps<T>) {
  const selectedIndex = options.findIndex((o) => o === value);

  return (
    <div className="relative grid auto-cols-fr grid-flow-col rounded-md border border-border bg-muted p-0.5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-[5px] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform duration-200 ease-out"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(calc(${selectedIndex} * 100%))`,
        }}
      />
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
          className={cn(
            "relative z-10 rounded-[5px] px-1 py-1 font-mono text-xs tabular-nums transition-colors duration-200",
            option === value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {renderOption(option)}
        </button>
      ))}
    </div>
  );
}

interface ExportControlsProps {
  zoom: number;
  radiusRatio: number;
  smoothing: number;
  scale: number;
  format: ExportFormat;
  /** Width of the crop region in natural image pixels, if known. */
  cropWidth: number | null;
  canDownload: boolean;
  isExporting: boolean;
  copyState: "idle" | "copying" | "copied";
  onZoomChange: (zoom: number) => void;
  onRadiusRatioChange: (radiusRatio: number) => void;
  onSmoothingChange: (smoothing: number) => void;
  onScaleChange: (scale: number) => void;
  onFormatChange: (format: ExportFormat) => void;
  onDownload: () => void;
  onCopy: () => void;
  onReset: () => void;
}

export function ExportControls({
  zoom,
  radiusRatio,
  smoothing,
  scale,
  format,
  cropWidth,
  canDownload,
  isExporting,
  copyState,
  onZoomChange,
  onRadiusRatioChange,
  onSmoothingChange,
  onScaleChange,
  onFormatChange,
  onDownload,
  onCopy,
  onReset,
}: ExportControlsProps) {
  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Shape
        </span>
        <Button variant="ghost" size="xs" onClick={onReset}>
          <ResetIcon />
          Reset
        </Button>
      </div>
      <SliderRow
        label="Zoom"
        value={zoom}
        min={1}
        max={4}
        step={0.01}
        format={(v) => `${v.toFixed(2)}x`}
        onChange={onZoomChange}
      />
      <SliderRow
        label="Corner radius"
        value={radiusRatio}
        min={0}
        max={0.5}
        step={0.005}
        format={(v) => `${Math.round((v / 0.5) * 100)}%`}
        onChange={onRadiusRatioChange}
      />
      <SliderRow
        label="Corner smoothing"
        value={smoothing}
        min={0}
        max={1}
        step={0.01}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={onSmoothingChange}
        badge={
          <Apple
            className={cn(
              "size-3 fill-current text-muted-foreground transition-opacity duration-200",
              smoothing !== 0.6 && "opacity-0",
            )}
          />
        }
      />

      <div className="border-t border-border" />

      <span className="block text-xs font-medium tracking-wider text-muted-foreground uppercase">
        Export
      </span>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Scale</Label>
          {cropWidth !== null && (
            <span className="font-mono text-xs tabular-nums">
              {Math.round(cropWidth * scale)}px
            </span>
          )}
        </div>
        <SegmentedRow
          options={OUTPUT_SCALES}
          value={scale}
          renderOption={(s) => `${String(s).replace(/^0(?=\.)/, "")}×`}
          onChange={onScaleChange}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Format</Label>
        <SegmentedRow
          options={EXPORT_FORMATS}
          value={format}
          renderOption={(f) => f.toUpperCase()}
          onChange={onFormatChange}
        />
      </div>
      <div className="grid gap-2">
        <Button
          className="w-full rounded-md"
          disabled={!canDownload || isExporting}
          onClick={onDownload}
        >
          {isExporting ? <SpinnerIcon className="animate-spin" /> : <DownloadIcon />}
          Download {format.toUpperCase()}
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-md"
          disabled={!canDownload || copyState === "copying"}
          onClick={onCopy}
          title="Copy to clipboard as PNG"
        >
          {copyState === "copying" ? (
            <SpinnerIcon className="animate-spin" />
          ) : copyState === "copied" ? (
            <CheckIcon />
          ) : (
            <CopyIcon />
          )}
          {copyState === "copied" ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
