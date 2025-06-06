import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const ResumeChatWidget = ({ selectedResumes, analysisResults }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
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
        if (!input.trim()) return;

        try {
            setIsLoading(true);
            setError(null);

            // Get the list of resumes from the original directory
            const resumesResponse = await fetch('http://localhost:8000/api/resumes?path=original');
            if (!resumesResponse.ok) {
                throw new Error('Failed to fetch resumes');
            }
            const resumes = await resumesResponse.json();

            // Prepare the message
            const userMessage = {
                type: 'user',
                content: input,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, userMessage]);
            setInput('');

            // Get the content of each resume
            const resumeContents = await Promise.all(
                resumes.map(async (resume) => {
                    if (resume.type === 'file' && resume.name.toLowerCase().endsWith('.pdf')) {
                        try {
                            // Convert original filename to parsed filename
                            const parsedFilename = `pypdf2_${resume.name.replace('.pdf', '.txt')}`;
                            console.log(`Looking for parsed file: ${parsedFilename}`);

                            const parsedResponse = await fetch(`http://localhost:8000/api/resumes?path=parsed&subdir=${encodeURIComponent(parsedFilename)}`);
                            const parsedData = await parsedResponse.json();

                            if (parsedData.content) {
                                console.log(`Found parsed content for ${resume.name}`);
                                return {
                                    name: resume.name,
                                    content: parsedData.content,
                                    type: 'parsed'
                                };
                            } else {
                                console.warn(`No parsed content found for ${resume.name}`);
                                return null;
                            }
                        } catch (error) {
                            console.warn(`Error fetching parsed content for ${resume.name}:`, error);
                            return null;
                        }
                    }
                    return null;
                })
            );

            // Filter out null values and empty contents
            const validResumes = resumeContents.filter(resume => resume && resume.content);

            if (validResumes.length === 0) {
                throw new Error('No parsed resume content found. Please make sure the resumes have been processed.');
            }

            // Prepare the request to the chatbot
            const requestData = {
                message: input,
                resumes: validResumes
            };

            console.log('Sending chat request with data:', {
                messageLength: input.length,
                resumeCount: validResumes.length,
                resumeNames: validResumes.map(r => r.name)
            });

            // Send the message to the chatbot
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Failed to get response from chatbot');
            }

            const data = await response.json();

            // Add the bot's response to the messages
            const botMessage = {
                type: 'bot',
                content: data.response,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error in chat:', error);
            setError(error.message || 'An error occurred while processing your request');

            // Add error message to chat
            const errorMessage = {
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
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
                                placeholder="Ask about the last analyzed resume..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <IconButton
                                type="submit"
                                color="primary"
                                disabled={isLoading || !input.trim()}
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