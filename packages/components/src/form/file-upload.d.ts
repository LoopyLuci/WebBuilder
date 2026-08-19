/**
 * WebBuilder Components - FileUpload Component
 * A drag-and-drop file upload component with preview.
 */
import React from 'react';
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
export declare const FileUpload: React.ForwardRefExoticComponent<FileUploadProps & React.RefAttributes<HTMLDivElement>>;
export default FileUpload;
//# sourceMappingURL=file-upload.d.ts.map