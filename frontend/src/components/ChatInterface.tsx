import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    onSendMessage: (message: string) => Promise<string>;
    isLoading: boolean;
}

const SUGGESTED_QUESTIONS = [
    "Does this candidate have a degree from a state university?",
    "Can they handle backend architecture?",
    "What programming languages do they know?",
    "How many years of experience do they have?",
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, isLoading }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isSending || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsSending(true);

        try {
            const response = await onSendMessage(userMessage.content);

            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInput(question);
        inputRef.current?.focus();
    };

    return (
        <div className="chat-interface slide-up">
            <h2 className="chat-title">
                <svg className="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Ask Questions About This Candidate
            </h2>

            {messages.length === 0 && (
                <div className="suggested-questions">
                    <p className="suggested-label">Try asking:</p>
                    <div className="suggested-grid">
                        {SUGGESTED_QUESTIONS.map((question, index) => (
                            <button
                                key={index}
                                className="suggested-btn"
                                onClick={() => handleSuggestedQuestion(question)}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                    >
                        <div className="message-avatar">
                            {message.role === 'user' ? (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            ) : (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            )}
                        </div>
                        <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isSending && (
                    <div className="message message-assistant">
                        <div className="message-avatar">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <textarea
                    ref={inputRef}
                    className="chat-input"
                    placeholder="Ask a question about the candidate..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending || isLoading}
                    rows={1}
                />
                <button
                    className="send-button"
                    onClick={handleSend}
                    disabled={!input.trim() || isSending || isLoading}
                >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
