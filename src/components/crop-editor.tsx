import Cropper, { type Area, type Point } from "react-easy-crop";

import { getSquirclePath } from "@/lib/squircle";

// Fixed SVG coordinate space; radius is a ratio so the path scales cleanly.
const VIEWBOX_SIZE = 1000;

interface CropEditorProps {
  imageSrc: string;
  crop: Point;
  zoom: number;
  radiusRatio: number;
  smoothing: number;
  onCropChange: (crop: Point) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedAreaPixels: Area) => void;
}

export function CropEditor({
  imageSrc,
  crop,
  zoom,
  radiusRatio,
  smoothing,
  onCropChange,
  onZoomChange,
  onCropComplete,
}: CropEditorProps) {
  const squirclePath = getSquirclePath({
    size: VIEWBOX_SIZE,
    radiusRatio,
    smoothing,
  });

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-muted">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1}
        minZoom={1}
        maxZoom={4}
        objectFit="cover"
        showGrid={false}
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onCropComplete={(_, croppedAreaPixels) => onCropComplete(croppedAreaPixels)}
        style={{
          cropAreaStyle: {
            border: "none",
            boxShadow: "none",
            color: "transparent",
          },
        }}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        preserveAspectRatio="none"
      >
        <path
          fillRule="evenodd"
          d={`M0 0H${VIEWBOX_SIZE}V${VIEWBOX_SIZE}H0Z ${squirclePath}`}
          className="fill-background/70"
        />
        <path
          d={squirclePath}
          fill="none"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          className="stroke-ring/60"
        />
      </svg>
    </div>
  );
}
