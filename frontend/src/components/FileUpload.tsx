import React, { useState, useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
    label: string;
    accept: string;
    onFileSelect: (file: File) => void;
    disabled?: boolean;
    fileName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    accept,
    onFileSelect,
    disabled = false,
    fileName,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'pdf' && ext !== 'txt') {
            alert('Only PDF and TXT files are supported');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('File size must be less than 10MB');
            return;
        }

        onFileSelect(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="file-upload-container">
            <label className="file-upload-label">{label}</label>
            <div
                className={`file-upload-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''} ${fileName ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={disabled}
                    className="file-input-hidden"
                />

                {fileName ? (
                    <div className="file-selected">
                        <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <div className="file-name">{fileName}</div>
                            <div className="file-status">✓ Uploaded successfully</div>
                        </div>
                    </div>
                ) : (
                    <div className="file-upload-prompt">
                        <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="upload-text">
                            <span className="upload-text-main">Drop file here or click to browse</span>
                            <span className="upload-text-sub">PDF or TXT • Max 10MB</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
