
import React, { useState, useCallback } from 'react';
import { ChatMessage, FileProcessingStatus } from './types';
import FileUploader from './components/FileUploader';
import ChatWindow from './components/ChatWindow';
import { extractTextFromFile } from './services/documentProcessor';
import { askQuestion } from './services/geminiService';

const App: React.FC = () => {
    const [files, setFiles] = useState<FileProcessingStatus[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [documentContext, setDocumentContext] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFilesChange = useCallback(async (newFiles: File[]) => {
        if (newFiles.length === 0) return;

        setIsProcessing(true);
        setError(null);
        setDocumentContext('');
        setChatHistory([]);

        const initialFileStatuses = newFiles.map(file => ({ file, status: 'processing' as const, text: '' }));
        setFiles(initialFileStatuses);

        let fullText = '';
        const processedFiles = await Promise.all(
            initialFileStatuses.map(async (fs) => {
                try {
                    const text = await extractTextFromFile(fs.file);
                    fullText += `\n\n--- Content from ${fs.file.name} ---\n\n${text}`;
                    return { ...fs, status: 'processed' as const, text };
                } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
                    console.error(`Error processing ${fs.file.name}:`, e);
                    return { ...fs, status: 'error' as const, error: errorMessage };
                }
            })
        );
        
        setFiles(processedFiles);
        setDocumentContext(fullText);
        setIsProcessing(false);

        if (processedFiles.some(f => f.status === 'processed')) {
            setChatHistory([{ sender: 'model', text: 'Documents processed successfully. You can now ask questions about their content.' }]);
        } else {
            setError("Failed to process any documents. Please try again with valid files.");
        }
    }, []);

    const handleSendMessage = useCallback(async (message: string) => {
        if (!message.trim() || isLoading || !documentContext) return;

        setIsLoading(true);
        setError(null);

        const newUserMessage: ChatMessage = { sender: 'user', text: message };
        setChatHistory(prev => [...prev, newUserMessage]);

        try {
            const responseText = await askQuestion(documentContext, message);
            const newModelMessage: ChatMessage = { sender: 'model', text: responseText };
            setChatHistory(prev => [...prev, newModelMessage]);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An error occurred while fetching the response.';
            console.error("Error from Gemini API:", e);
            setError(errorMessage);
            const errorModelMessage: ChatMessage = { sender: 'model', text: `Sorry, I encountered an error: ${errorMessage}` };
            setChatHistory(prev => [...prev, errorModelMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, documentContext]);
    
    const handleClear = useCallback(() => {
      setFiles([]);
      setDocumentContext('');
      setChatHistory([]);
      setError(null);
      setIsLoading(false);
      setIsProcessing(false);
    }, []);


    return (
        <div className="min-h-screen bg-slate-900 font-sans flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/3 lg:max-w-md bg-slate-800/50 p-6 flex flex-col border-r border-slate-700">
               <FileUploader 
                  files={files} 
                  isProcessing={isProcessing} 
                  onFilesChange={handleFilesChange}
                  onClear={handleClear}
                />
            </div>

            <div className="flex-1 flex flex-col h-screen max-h-screen">
                <ChatWindow 
                    messages={chatHistory} 
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    isReady={!!documentContext && !isProcessing}
                />
            </div>
        </div>
    );
};

export default App;
