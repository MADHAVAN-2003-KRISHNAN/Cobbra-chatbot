
export interface ChatMessage {
    sender: 'user' | 'model';
    text: string;
}

export interface FileProcessingStatus {
    file: File;
    status: 'processing' | 'processed' | 'error';
    text?: string;
    error?: string;
}
