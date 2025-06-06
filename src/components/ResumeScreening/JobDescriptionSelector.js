import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
    Paper,
    IconButton,
    Tooltip,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Work as WorkIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from 'axios';

const JobDescriptionSelector = ({ onJobSelect }) => {
    const theme = useTheme();
    const [jobDescription, setJobDescription] = useState('');
    const [jobDescriptions, setJobDescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewJobDialog, setShowNewJobDialog] = useState(false);
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newJobDescription, setNewJobDescription] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');

    useEffect(() => {
        fetchJobDescriptions();
    }, []);

    const fetchJobDescriptions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:8000/api/job-descriptions');
            console.log('Fetched job descriptions:', response.data);
            setJobDescriptions(response.data);
        } catch (err) {
            console.error('Error fetching job descriptions:', err);
            setError('Failed to fetch job descriptions: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJobSelect = (jobId) => {
        console.log('Selecting job:', jobId);
        const selectedJob = jobDescriptions.find(job => job.id === jobId);
        console.log('Selected job:', selectedJob);

        if (selectedJob) {
            setSelectedJobId(jobId);
            const jobContent = selectedJob.content || selectedJob.description || '';
            console.log('Job content to display:', jobContent);
            setJobDescription(jobContent);
            onJobSelect(jobContent);
        } else {
            setSelectedJobId('');
            setJobDescription('');
            onJobSelect('');
        }
    };

    const handleCreateJob = async () => {
        if (!newJobTitle?.trim() || !newJobDescription?.trim()) {
            setError('Please fill in both title and description');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('http://localhost:8000/api/job-descriptions', {
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
            await axios.delete(`http://localhost:8000/api/job-descriptions/${job.id}`);
            setJobDescriptions(jobDescriptions.filter(j => j.id !== job.id));
            if (jobDescription === job.content) {
                setJobDescription('');
                onJobSelect('');
            }
        } catch (err) {
            setError('Failed to delete job description: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing={2}>
            {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <FormControl fullWidth>
                <InputLabel>Select Job Description</InputLabel>
                <Select
                    value={selectedJobId}
                    label="Select Job Description"
                    onChange={(e) => handleJobSelect(e.target.value)}
                    disabled={loading}
                >
                    {jobDescriptions.map((job) => (
                        <MenuItem key={job.id} value={job.id}>
                            {job.title}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Paper
                        elevation={1}
                        sx={{
                            p: 2,
                            minHeight: '200px',
                            maxHeight: '400px',
                            overflow: 'auto',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                        }}
                    >
                        {jobDescription ? (
                            <Typography
                                variant="body1"
                                sx={{
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.6,
                                    color: 'text.primary',
                                }}
                            >
                                {jobDescription}
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ textAlign: 'center' }}
                                >
                                    Select a job description to get started
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setShowNewJobDialog(true)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3,
                            }}
                        >
                            Add Job Description
                        </Button>
                    </Box>
                </>
            )}

            {/* New Job Dialog */}
            <Dialog
                open={showNewJobDialog}
                onClose={() => setShowNewJobDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                    }
                }}
            >
                <DialogTitle>Add New Job Description</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Job Title"
                            value={newJobTitle}
                            onChange={(e) => setNewJobTitle(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Job Description"
                            value={newJobDescription}
                            onChange={(e) => setNewJobDescription(e.target.value)}
                            multiline
                            rows={10}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowNewJobDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateJob}
                        variant="contained"
                        disabled={!newJobTitle?.trim() || !newJobDescription?.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default JobDescriptionSelector; 