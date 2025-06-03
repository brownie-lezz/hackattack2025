import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Description as DescriptionIcon,
    Add as AddIcon,
    Save as SaveIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const JobDescriptionSelector = ({ onJobSelect }) => {
    const [jobDescriptions, setJobDescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState('');
    const [showNewJobDialog, setShowNewJobDialog] = useState(false);
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newJobDescription, setNewJobDescription] = useState('');

    useEffect(() => {
        fetchJobDescriptions();
    }, []);

    const fetchJobDescriptions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/job-descriptions');
            setJobDescriptions(response.data);
        } catch (err) {
            setError('Failed to fetch job descriptions: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJobSelect = (job) => {
        console.log('Current selected job:', selectedJob);
        console.log('Clicked job:', job);

        // If clicking the same job, deselect it
        if (selectedJob === job) {
            console.log('Deselecting job');
            setSelectedJob('');
            onJobSelect('');
        } else {
            // Select the new job
            console.log('Setting new selection:', job);
            setSelectedJob(job);
            onJobSelect(job.content);
        }
    };

    const handleCreateJob = async () => {
        if (!newJobTitle.trim() || !newJobDescription.trim()) {
            setError('Please fill in both title and description');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('/api/job-descriptions', {
                title: newJobTitle,
                content: newJobDescription
            });
            setJobDescriptions([...jobDescriptions, response.data]);
            setShowNewJobDialog(false);
            setNewJobTitle('');
            setNewJobDescription('');
        } catch (err) {
            setError('Failed to create job description: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async (job) => {
        if (!window.confirm('Are you sure you want to delete this job description?')) return;

        try {
            setLoading(true);
            setError(null);
            await axios.delete(`/api/job-descriptions/${job.id}`);
            setJobDescriptions(jobDescriptions.filter(j => j.id !== job.id));
            if (selectedJob === job) {
                setSelectedJob('');
                onJobSelect('');
            }
        } catch (err) {
            setError('Failed to delete job description: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
            }}>
                <Typography variant="h6" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'primary.main',
                    fontWeight: 600
                }}>
                    <DescriptionIcon color="primary" />
                    Job Description
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewJobDialog(true)}
                    sx={{
                        backgroundColor: 'primary.main',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                            transform: 'translateY(-1px)',
                            boxShadow: 2
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    New Job Description
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress color="primary" />
                </Box>
            ) : jobDescriptions.length === 0 ? (
                <Paper sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 1
                }}>
                    <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                        No Job Descriptions Found
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        Create a new job description to get started with resume screening.
                    </Typography>
                </Paper>
            ) : (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {jobDescriptions.map((job) => {
                        const isSelected = selectedJob === job;
                        console.log(`Rendering job:`, job);
                        console.log(`Is selected:`, isSelected);
                        return (
                            <Paper
                                key={job.title}
                                elevation={isSelected ? 3 : 1}
                                sx={{
                                    p: 2.5,
                                    border: '2px solid',
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        backgroundColor: isSelected ? 'primary.main' : 'action.hover',
                                        transform: 'translateY(-2px)',
                                        boxShadow: isSelected ? 4 : 2,
                                    },
                                    backgroundColor: isSelected ? 'primary.main' : 'background.paper',
                                    transition: 'all 0.3s ease-in-out',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onClick={() => handleJobSelect(job)}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    mb: 1
                                }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            color: isSelected ? 'white' : 'text.primary',
                                            fontSize: '1.1rem',
                                            transition: 'color 0.3s ease-in-out'
                                        }}
                                    >
                                        {job.title}
                                    </Typography>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteJob(job);
                                            }}
                                            sx={{
                                                color: isSelected ? 'white' : 'error.main',
                                                '&:hover': {
                                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'error.light',
                                                },
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Typography
                                    variant="body2"
                                    color={isSelected ? 'white' : 'text.secondary'}
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        lineHeight: 1.5,
                                        opacity: isSelected ? 1 : 0.9,
                                        transition: 'all 0.3s ease-in-out'
                                    }}
                                >
                                    {job.content}
                                </Typography>
                            </Paper>
                        );
                    })}
                </Box>
            )}

            {/* New Job Description Dialog */}
            <Dialog
                open={showNewJobDialog}
                onClose={() => setShowNewJobDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: 24,
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.main'
                }}>
                    Create New Job Description
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Job Title"
                        fullWidth
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                }
                            }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Job Description"
                        fullWidth
                        multiline
                        rows={6}
                        value={newJobDescription}
                        onChange={(e) => setNewJobDescription(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                }
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}>
                    <Button
                        onClick={() => setShowNewJobDialog(false)}
                        variant="outlined"
                        sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            borderRadius: 1,
                            '&:hover': {
                                borderColor: 'primary.dark',
                                backgroundColor: 'primary.light',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateJob}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={!newJobTitle.trim() || !newJobDescription.trim()}
                        sx={{
                            backgroundColor: 'primary.main',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobDescriptionSelector; 