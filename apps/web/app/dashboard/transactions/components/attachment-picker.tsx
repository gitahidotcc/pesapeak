"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, X, File, Image as ImageIcon, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExistingAttachment {
  url: string;
  fileName: string;
  mimeType: string;
}

interface AttachmentPickerProps {
  attachment: File | null;
  existingAttachment?: ExistingAttachment | null;
  onSelect: (file: File | null) => void;
  onRemoveExisting?: () => void;
}

export function AttachmentPicker({ attachment, existingAttachment, onSelect, onRemoveExisting }: AttachmentPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Set preview from existing attachment when component mounts or existingAttachment changes
  useEffect(() => {
    if (existingAttachment && !attachment) {
      if (existingAttachment.mimeType.startsWith("image/")) {
        setPreview(existingAttachment.url);
      } else {
        setPreview(null);
      }
    } else if (!attachment) {
      setPreview(null);
    }
  }, [existingAttachment, attachment]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        alert("Please select an image (JPEG, PNG, WebP) or PDF file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      onSelect(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleRemove = () => {
    onSelect(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Determine what to display
  const displayAttachment = attachment || existingAttachment;
  const isImage = attachment 
    ? attachment.type.startsWith("image/")
    : existingAttachment?.mimeType.startsWith("image/");
  const isPdf = attachment
    ? attachment.type === "application/pdf"
    : existingAttachment?.mimeType === "application/pdf";
  const displayName = attachment?.name || existingAttachment?.fileName || "";
  const displaySize = attachment ? `${(attachment.size / 1024).toFixed(2)} KB` : "";
  const displayUrl = existingAttachment?.url || preview || undefined;

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // For now, we'll just trigger the file input
      // In a real implementation, you'd want to use a camera capture library
      fileInputRef.current?.click();
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error accessing camera:", error);
      // Fallback to file input
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        Attachment
      </label>

      {displayAttachment ? (
        <div className="relative rounded-xl border border-border bg-muted/30 p-4">
          {(attachment || existingAttachment) && (
            <button
              type="button"
              onClick={() => {
                if (attachment) {
                  handleRemove();
                } else if (existingAttachment && onRemoveExisting) {
                  onRemoveExisting();
                }
              }}
              className="absolute right-2 top-2 rounded-full bg-background p-1.5 shadow-sm transition-colors hover:bg-muted z-10"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {isImage && displayUrl ? (
            <div className="space-y-2">
              <img
                src={displayUrl}
                alt="Preview"
                className="h-32 w-full rounded-lg object-cover"
              />
              <p className="text-xs text-muted-foreground">{displayName}</p>
            </div>
          ) : isPdf && existingAttachment ? (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <iframe
                  src={displayUrl}
                  title={displayName}
                  className="h-32 w-full rounded-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground">{displayName}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                {displaySize && (
                  <p className="text-xs text-muted-foreground">{displaySize}</p>
                )}
                {existingAttachment && !attachment && (
                  <p className="text-xs text-muted-foreground">Existing attachment</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={handleCameraClick}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-muted"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Supported formats: JPEG, PNG, WebP, PDF (max 10MB)
      </p>
    </div>
  );
}

