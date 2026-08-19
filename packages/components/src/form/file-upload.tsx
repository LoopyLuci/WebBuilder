/**
 * WebBuilder Components - FileUpload Component
 * A drag-and-drop file upload component with preview.
 */

import React, { useState, useRef } from 'react';

export type FileUploadVariant = 'default' | 'compact' | 'button';

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  variant?: FileUploadVariant;
  disabled?: boolean;
  error?: string;
  onChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  value?: File[];
  showPreview?: boolean;
  helperText?: string;
}

const variantStyles: Record<FileUploadVariant, string> = {
  default: 'p-8 border-2 border-dashed rounded-lg',
  compact: 'p-4 border border-dashed rounded-md',
  button: 'p-2',
};

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      label,
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      variant = 'default',
      disabled = false,
      error,
      onChange,
      onRemove,
      value = [],
      showPreview = true,
      helperText,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
      let filteredFiles = files;
      if (maxSize) {
        filteredFiles = files.filter((f) => f.size <= maxSize * 1024 * 1024);
      }
      if (maxFiles) {
        filteredFiles = filteredFiles.slice(0, maxFiles);
      }
      onChange?.(multiple ? [...value, ...filteredFiles] : filteredFiles);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(Array.from(e.target.files));
      }
    };

    const removeFile = (index: number) => {
      const newFiles = value.filter((_, i) => i !== index);
      onChange?.(newFiles);
      onRemove?.(index);
    };

    return (
      <div ref={ref} className={['flex flex-col gap-2', className].filter(Boolean).join(' ')} {...props}>
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <div
          className={[
            'relative transition-colors',
            variantStyles[variant],
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400',
            error ? 'border-red-500' : '',
          ].join(' ')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleInputChange}
            className="sr-only"
          />
          <div className="flex flex-col items-center justify-center text-center">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            {maxSize && (
              <p className="text-xs text-gray-500 mt-1">Max file size: {maxSize}MB</p>
            )}
          </div>
        </div>
        {showPreview && value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((file, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs text-gray-700 truncate max-w-[120px]">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="p-0.5 text-gray-400 hover:text-red-500"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;