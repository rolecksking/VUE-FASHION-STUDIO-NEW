import React, { useState, useRef } from "react";
import { Upload, Trash2, CheckCircle2 } from "lucide-react";

interface DragDropUploadProps {
  id: string;
  images: string[];
  maxFiles: number;
  onUpload: (newImages: string[]) => void;
  onRemove: (index: number) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "video";
}

export default function DragDropUpload({
  id,
  images = [],
  maxFiles,
  onUpload,
  onRemove,
  label,
  helperText,
  aspectRatio = "square"
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingState, setUploadingState] = useState<"idle" | "success">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: File[]) => {
    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = files.slice(0, remainingSlots);
    const loadedImages: string[] = [];
    let processedCount = 0;

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          loadedImages.push(reader.result);
        }
        processedCount++;
        if (processedCount === filesToProcess.length) {
          onUpload(loadedImages);
          setUploadingState("success");
          setTimeout(() => {
            setUploadingState("idle");
          }, 3000);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length < maxFiles) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (images.length >= maxFiles) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesList = Array.from(e.dataTransfer.files) as File[];
      processFiles(filesList);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesList = Array.from(e.target.files) as File[];
      processFiles(filesList);
    }
  };

  const triggerFileInput = () => {
    if (images.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const aspectClass = aspectRatio === "video" ? "aspect-video" : "aspect-square";

  return (
    <div className="space-y-3" id={`drag-drop-container-${id}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase font-semibold">
            {label}
          </label>
          <span className="text-[9px] text-neutral-500 font-mono">
            {images.length} / {maxFiles} Max
          </span>
        </div>
      )}

      {/* Grid containing Drop Zone and Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Upload Drop Zone Box */}
        {images.length < maxFiles && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`col-span-2 sm:col-span-2 ${aspectClass} border border-dashed rounded-sm flex flex-col items-center justify-center p-4 text-center cursor-pointer select-none transition-all duration-300 ${
              isDragging
                ? "border-white bg-neutral-900 scale-[1.02]"
                : "border-neutral-900 hover:border-neutral-700 bg-neutral-950/20 hover:bg-neutral-950/60"
            }`}
          >
            <Upload
              size={18}
              className={`mb-2 transition-colors duration-300 ${
                isDragging ? "text-white animate-bounce" : "text-neutral-500 group-hover:text-white"
              }`}
            />
            <span className="text-[10px] font-sans-luxury font-medium tracking-wider text-neutral-300 block">
              Drag & Drop Images
            </span>
            <span className="text-[9px] text-neutral-500 font-light mt-1 block">
              or click to browse
            </span>
            {helperText && (
              <span className="text-[8px] text-neutral-600 font-mono uppercase mt-1.5 block">
                {helperText}
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Uploaded Thumbnails */}
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`relative ${aspectClass} bg-neutral-950 border border-neutral-900 group overflow-hidden rounded-sm transition-all duration-300 hover:border-neutral-700`}
          >
            <img
              src={img}
              alt={`Upload ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Elegant Success Overlay Indicator */}
            <div className="absolute top-1.5 left-1.5 bg-neutral-950/95 border border-emerald-950 px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[8px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                Uploaded
              </span>
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(idx);
                }}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-white transition-all flex items-center justify-center cursor-pointer shadow-md"
                title="Remove image"
              >
                <Trash2 size={12} className="hover:scale-110 transition-transform" />
              </button>
              <span className="text-[8px] font-mono text-neutral-400 uppercase mt-1.5 tracking-wider">
                Delete
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Temporary visual confirmation toast/badge on successful drop */}
      {uploadingState === "success" && (
        <div className="flex items-center gap-2 text-emerald-400 text-[9px] font-mono uppercase bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-sm max-w-max animate-fade-in">
          <CheckCircle2 size={12} className="shrink-0" />
          <span>Images uploaded successfully & thumbnails generated</span>
        </div>
      )}
    </div>
  );
}
