
import React, { useCallback, useState } from 'react';
import { FileProcessingStatus } from '../types';
import { FileIcon, UploadIcon, CheckCircleIcon, XCircleIcon, TrashIcon } from './icons';

interface FileUploaderProps {
    files: FileProcessingStatus[];
    isProcessing: boolean;
    onFilesChange: (files: File[]) => void;
    onClear: () => void;
}

const getFileExtension = (filename: string) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

const FileListItem: React.FC<{ status: FileProcessingStatus }> = ({ status }) => {
    const { file, status: procStatus, error } = status;
    const extension = getFileExtension(file.name);
    
    let statusIndicator;
    switch (procStatus) {
        case 'processing':
            statusIndicator = <div className="w-4 h-4 border-2 border-slate-400 border-t-blue-500 rounded-full animate-spin"></div>;
            break;
        case 'processed':
            statusIndicator = <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            break;
        case 'error':
            statusIndicator = <XCircleIcon className="w-5 h-5 text-red-500" />;
            break;
    }

    return (
        <div className="bg-slate-700/50 p-3 rounded-lg mb-2 flex items-center justify-between" title={error}>
            <div className="flex items-center overflow-hidden">
                <FileIcon type={extension} className="w-6 h-6 mr-3 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{procStatus}{error ? ': ' + error : ''}</p>
                </div>
            </div>
            <div className="ml-3 flex-shrink-0">
                {statusIndicator}
            </div>
        </div>
    );
};


const FileUploader: React.FC<FileUploaderProps> = ({ files, isProcessing, onFilesChange, onClear }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesChange(Array.from(e.dataTransfer.files));
        }
    }, [onFilesChange]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesChange(Array.from(e.target.files));
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">DocuChat RAG</h1>
                <p className="text-slate-400 mt-2">
                    Ask questions about your documents. Upload PDF, DOCX, or XLSX files to get started.
                </p>
            </header>

            <div className="flex-grow">
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,.docx,.xlsx"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                />
                <label
                    htmlFor="file-upload"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDragging ? 'border-indigo-500 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800'
                        } ${isProcessing ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                    <UploadIcon className="w-10 h-10 mb-3 text-slate-500" />
                    <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">PDF, DOCX, or XLSX</p>
                </label>

                {isProcessing && <div className="text-center mt-4 text-sm text-slate-400">Processing files...</div>}

                {files.length > 0 && (
                    <div className="mt-6 flex-grow overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 350px)'}}>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold text-slate-300">Uploaded Files</h2>
                            <button onClick={onClear} disabled={isProcessing} className="p-1.5 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                <TrashIcon className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        {files.map((fileStatus, index) => (
                            <FileListItem key={index} status={fileStatus} />
                        ))}
                    </div>
                )}
            </div>
             <footer className="text-center text-xs text-slate-500 mt-auto pt-4">
                Powered by Gemini API
            </footer>
        </div>
    );
};

export default FileUploader;
