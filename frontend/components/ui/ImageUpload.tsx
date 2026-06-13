'use client';

import { useRef } from 'react';

interface ImageUploadProps {
  existingImages: string[];
  onRemoveExisting: (url: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

export default function ImageUpload({
  existingImages,
  onRemoveExisting,
  files,
  onFilesChange,
  maxFiles = 5,
  error,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalCount = existingImages.length + files.length;
  const remainingSlots = Math.max(0, maxFiles - totalCount);

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    const newFiles = Array.from(selected).slice(0, remainingSlots);
    onFilesChange([...files, ...newFiles]);
  };

  const removeNewFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-700">
        Images <span className="text-gray-400 font-normal">(up to {maxFiles}, optional)</span>
      </label>

      <div className="flex flex-wrap gap-3">
        {existingImages.map((url) => (
          <div key={url} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Product" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(url)}
              className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}

        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewFile(index)}
              className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs mt-1">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
