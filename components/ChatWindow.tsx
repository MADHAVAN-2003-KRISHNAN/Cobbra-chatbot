
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { BotIcon, UserIcon, SendIcon } from './icons';

interface ChatWindowProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isReady: boolean;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.sender === 'model';
    return (
        <div className={`flex items-start gap-4 my-4 ${isModel ? '' : 'justify-end'}`}>
            {isModel && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-white" /></div>}
            <div className={`max-w-xl p-4 rounded-2xl ${isModel ? 'bg-slate-700/80 rounded-tl-none' : 'bg-indigo-600 text-white rounded-br-none'}`}>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
            </div>
            {!isModel && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-white" /></div>}
        </div>
    );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, isReady }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading && isReady) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-800/20">
            <div className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <BotIcon className="w-16 h-16 mb-4"/>
                        <h2 className="text-2xl font-medium text-slate-300">Welcome to DocuChat</h2>
                        <p className="mt-2">Upload your documents to begin the conversation.</p>
                    </div>
                )}
                {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                {isLoading && (
                    <div className="flex items-start gap-4 my-4">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-white" /></div>
                        <div className="max-w-xl p-4 rounded-2xl bg-slate-700/80 rounded-tl-none flex items-center space-x-2">
                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-slow delay-0"></span>
                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-slow" style={{animationDelay: '0.2s'}}></span>
                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-slow" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isReady ? "Ask a question about your documents..." : "Please upload documents first"}
                            disabled={!isReady || isLoading}
                            className="w-full bg-slate-700 border border-slate-600 rounded-full py-3 pl-5 pr-14 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!isReady || isLoading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
