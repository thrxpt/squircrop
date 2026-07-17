import { useRef, useState } from "react";

import { ImageUpIcon, XIcon } from "@/components/icons";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadCard({ file, previewUrl, onFileChange }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptFile = (candidate: File | undefined) => {
    if (candidate?.type.startsWith("image/")) {
      onFileChange(candidate);
    }
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="sr-only"
      onChange={(event) => {
        acceptFile(event.target.files?.[0]);
        event.target.value = "";
      }}
    />
  );

  if (!file) {
    return (
      <Attachment
        state="idle"
        className={cn(
          "w-full cursor-pointer focus-within:ring-0",
          isDragging && "border-ring bg-muted/50",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          acceptFile(event.dataTransfer.files?.[0]);
        }}
      >
        <AttachmentMedia>
          <ImageUpIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Upload an image</AttachmentTitle>
          <AttachmentDescription>Click or drop a PNG, JPG, or WebP here</AttachmentDescription>
        </AttachmentContent>
        <AttachmentTrigger aria-label="Upload an image" onClick={() => inputRef.current?.click()} />
        {input}
      </Attachment>
    );
  }

  return (
    <Attachment state="done" className="w-full focus-within:ring-0">
      <AttachmentMedia variant="image">
        {previewUrl && <img src={previewUrl} alt="" />}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>{formatBytes(file.size)}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Remove image" onClick={() => onFileChange(null)}>
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
      <AttachmentTrigger aria-label="Replace image" onClick={() => inputRef.current?.click()} />
      {input}
    </Attachment>
  );
}
