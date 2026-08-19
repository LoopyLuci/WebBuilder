import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - FileUpload Component
 * A drag-and-drop file upload component with preview.
 */
import React, { useState, useRef } from 'react';
const variantStyles = {
    default: 'p-8 border-2 border-dashed rounded-lg',
    compact: 'p-4 border border-dashed rounded-md',
    button: 'p-2',
};
export const FileUpload = React.forwardRef(({ label, accept, multiple = false, maxSize, maxFiles, variant = 'default', disabled = false, error, onChange, onRemove, value = [], showPreview = true, helperText, className = '', ...props }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);
    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled)
            setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled)
            return;
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };
    const handleFiles = (files) => {
        let filteredFiles = files;
        if (maxSize) {
            filteredFiles = files.filter((f) => f.size <= maxSize * 1024 * 1024);
        }
        if (maxFiles) {
            filteredFiles = filteredFiles.slice(0, maxFiles);
        }
        onChange?.(multiple ? [...value, ...filteredFiles] : filteredFiles);
    };
    const handleInputChange = (e) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };
    const removeFile = (index) => {
        const newFiles = value.filter((_, i) => i !== index);
        onChange?.(newFiles);
        onRemove?.(index);
    };
    return (_jsxs("div", { ref: ref, className: ['flex flex-col gap-2', className].filter(Boolean).join(' '), ...props, children: [label && (_jsx("label", { className: "text-sm font-medium text-gray-700", children: label })), _jsxs("div", { className: [
                    'relative transition-colors',
                    variantStyles[variant],
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400',
                    error ? 'border-red-500' : '',
                ].join(' '), onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onClick: () => !disabled && inputRef.current?.click(), children: [_jsx("input", { ref: inputRef, type: "file", accept: accept, multiple: multiple, disabled: disabled, onChange: handleInputChange, className: "sr-only" }), _jsxs("div", { className: "flex flex-col items-center justify-center text-center", children: [_jsx("svg", { className: "w-8 h-8 text-gray-400 mb-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) }), _jsxs("p", { className: "text-sm text-gray-600", children: [_jsx("span", { className: "font-medium text-blue-600", children: "Click to upload" }), " or drag and drop"] }), maxSize && (_jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Max file size: ", maxSize, "MB"] }))] })] }), showPreview && value.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: value.map((file, index) => (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md", children: [_jsx("svg", { className: "w-4 h-4 text-gray-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), _jsx("span", { className: "text-xs text-gray-700 truncate max-w-[120px]", children: file.name }), _jsx("button", { type: "button", onClick: (e) => { e.stopPropagation(); removeFile(index); }, className: "p-0.5 text-gray-400 hover:text-red-500", "aria-label": `Remove ${file.name}`, children: _jsx("svg", { className: "w-3 h-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, index))) })), error && _jsx("p", { className: "text-sm text-red-600", role: "alert", children: error }), helperText && !error && _jsx("p", { className: "text-sm text-gray-500", children: helperText })] }));
});
FileUpload.displayName = 'FileUpload';
export default FileUpload;
//# sourceMappingURL=file-upload.js.map