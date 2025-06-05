import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const ResumeChatWidget = ({ selectedResumes, analysisResults }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
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

        try {
            // Get all parsed resume content
            const response = await fetch('/api/resumes?path=parsed');
            if (!response.ok) {
                throw new Error('Failed to fetch resume content');
            }

            const files = await response.json();
            // Find all pypdf2_ files
            const parsedFiles = files.filter(file =>
                file.name.startsWith('pypdf2_') && file.name.endsWith('.txt')
            );

            if (parsedFiles.length === 0) {
                throw new Error('No parsed resume content found');
            }

            // Get content from all parsed resumes
            const allResumeContent = await Promise.all(
                parsedFiles.map(async (file) => {
                    const contentResponse = await fetch(`/api/resumes?path=parsed&subdir=${file.name}`);
                    if (!contentResponse.ok) {
                        console.error(`Failed to fetch content for resume: ${file.name}`);
                        return null;
                    }
                    const data = await contentResponse.json();
                    return data.content ? {
                        name: file.name.replace('pypdf2_', '').replace('.txt', ''),
                        content: data.content
                    } : null;
                })
            );

            // Filter out any failed fetches
            const validResumes = allResumeContent.filter(resume => resume !== null);

            if (validResumes.length === 0) {
                throw new Error('No valid resume content found');
            }

            // Add user message to chat
            const userMessage = { role: 'user', content: inputValue };
            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setError(null);

            // Show loading state
            setIsLoading(true);

            // Combine all resume content
            const combinedResumeContent = validResumes.map(resume =>
                `=== Resume: ${resume.name} ===\n${resume.content}\n\n`
            ).join('');

            // Send to API
            const chatResponse = await fetch('/api/mistral/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resume_text: combinedResumeContent,
                    question: inputValue,
                    analysis: analysisResults // Use the latest analysis results if available
                }),
            });

            if (!chatResponse.ok) {
                throw new Error('Failed to get response from AI');
            }

            const chatData = await chatResponse.json();

            // Add AI response to chat
            setMessages(prev => [...prev, { role: 'assistant', content: chatData.response }]);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'An error occurred while processing your request');
            // Add error message to chat
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I apologize, but I encountered an error: ${error.message}. Please try again.`
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
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                            Using last analyzed resume
                        </Typography>
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
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                sx={{
                                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                }}
                            >
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: message.role === 'user' ? 'primary.light' : 'grey.100',
                                        color: message.role === 'user' ? 'white' : 'text.primary',
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
                                placeholder="Ask about the last analyzed resume..."
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