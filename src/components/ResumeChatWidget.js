import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const ResumeChatWidget = ({ selectedResumeText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            if (!selectedResumeText) {
                throw new Error('No resume content available');
            }

            const response = await fetch('/api/mistral/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resume_text: selectedResumeText,
                    question: userMessage,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { type: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'assistant',
                content: error instanceof Error && error.message === 'No resume content available'
                    ? 'Please select a resume first to analyze.'
                    : 'Sorry, I encountered an error while processing your question. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <IconButton
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                    zIndex: 1000,
                }}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </IconButton>

            {/* Chat Window */}
            {isOpen && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'fixed',
                        bottom: 80,
                        right: 20,
                        width: 350,
                        height: 500,
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 1000,
                    }}
                >
                    {/* Chat Header */}
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                        }}
                    >
                        <Typography variant="h6">Resume Assistant</Typography>
                    </Box>

                    {/* Messages Container */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        {!selectedResumeText && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Select a resume to start analyzing
                            </Alert>
                        )}
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                sx={{
                                    alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                }}
                            >
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: message.type === 'user' ? 'primary.light' : 'grey.100',
                                        color: message.type === 'user' ? 'white' : 'text.primary',
                                    }}
                                >
                                    <Typography variant="body1">{message.content}</Typography>
                                </Paper>
                            </Box>
                        ))}
                        {isLoading && (
                            <Box sx={{ alignSelf: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input Form */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            p: 2,
                            borderTop: 1,
                            borderColor: 'divider',
                            backgroundColor: 'background.paper',
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={selectedResumeText ? "Ask about the resume..." : "Select a resume first..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                            />
                            <IconButton
                                type="submit"
                                color="primary"
                                disabled={isLoading || !inputValue.trim()}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Paper>
            )}
        </>
    );
};

export default ResumeChatWidget; 