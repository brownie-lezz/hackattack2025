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
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [jobDescriptions, setJobDescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewJobDialog, setShowNewJobDialog] = useState(false);
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newJobDescription, setNewJobDescription] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');

    const jobTemplates = [
        {
            id: 'software-engineer',
            title: 'Software Engineer',
            description: `Requirements:
• Bachelor's degree in Computer Science or related field
• 3+ years of experience in software development
• Strong proficiency in JavaScript, Python, or Java
• Experience with modern frameworks (React, Node.js, Django)
• Knowledge of database systems and SQL
• Understanding of software design patterns and principles
• Experience with version control systems (Git)
• Strong problem-solving and analytical skills
• Excellent communication and teamwork abilities

Responsibilities:
• Design and develop high-quality software solutions
• Write clean, maintainable, and efficient code
• Collaborate with cross-functional teams
• Participate in code reviews and technical discussions
• Debug and resolve technical issues
• Stay updated with emerging technologies
• Contribute to technical documentation
• Mentor junior developers`
        },
        {
            id: 'data-scientist',
            title: 'Data Scientist',
            description: `Requirements:
• Master's or PhD in Statistics, Mathematics, Computer Science, or related field
• 2+ years of experience in data science or machine learning
• Strong programming skills in Python or R
• Experience with data analysis and visualization tools
• Knowledge of machine learning algorithms and statistical methods
• Experience with big data technologies (Hadoop, Spark)
• Strong analytical and problem-solving skills
• Excellent communication and presentation abilities

Responsibilities:
• Develop and implement machine learning models
• Analyze large datasets to extract insights
• Create data-driven solutions for business problems
• Collaborate with stakeholders to understand requirements
• Present findings and recommendations to non-technical audiences
• Stay current with latest data science trends and technologies
• Document methodologies and results
• Mentor junior data scientists`
        },
        {
            id: 'product-manager',
            title: 'Product Manager',
            description: `Requirements:
• Bachelor's degree in Business, Computer Science, or related field
• 3+ years of product management experience
• Strong understanding of product development lifecycle
• Experience with agile methodologies
• Excellent analytical and problem-solving skills
• Strong communication and leadership abilities
• Experience with product analytics tools
• Understanding of user experience principles

Responsibilities:
• Define product vision and strategy
• Gather and prioritize product requirements
• Work closely with development teams
• Conduct market research and competitive analysis
• Create product roadmaps and timelines
• Monitor product performance and metrics
• Gather and analyze user feedback
• Coordinate with cross-functional teams
• Present product updates to stakeholders`
        }
    ];

    useEffect(() => {
        fetchJobDescriptions();
    }, []);

    const fetchJobDescriptions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/job-descriptions');
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

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template.id);
        setJobDescription(template.description);
        onJobSelect(template.description);
        setShowTemplates(false);
    };

    const handleSaveTemplate = () => {
        if (jobDescription?.trim()) {
            const newTemplate = {
                id: `custom-${Date.now()}`,
                title: 'Custom Template',
                description: jobDescription
            };
            jobTemplates.push(newTemplate);
            setSelectedTemplate(newTemplate.id);
            setShowTemplates(false);
        }
    };

    const handleDeleteTemplate = (templateId) => {
        const updatedTemplates = jobTemplates.filter(t => t.id !== templateId);
        if (selectedTemplate === templateId) {
            setSelectedTemplate('');
            setJobDescription('');
            onJobSelect('');
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Stack spacing={2}>
                {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <>
                        <FormControl fullWidth>
                            <InputLabel>Select Job Description</InputLabel>
                            <Select
                                value={selectedJobId}
                                onChange={(e) => handleJobSelect(e.target.value)}
                                label="Select Job Description"
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'divider',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select a job description to analyze</em>
                                </MenuItem>
                                {jobDescriptions.map((job) => (
                                    <MenuItem key={job.id} value={job.id}>
                                        {job.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                minHeight: '200px',
                                maxHeight: '400px',
                                overflow: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#888',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        background: '#666',
                                    },
                                },
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
                                        Select a job description or use a template to get started
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
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setShowTemplates(true)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3,
                                }}
                            >
                                Browse Templates
                            </Button>
                        </Box>
                    </>
                )}
            </Stack>

            {/* Templates Dialog */}
            <Dialog
                open={showTemplates}
                onClose={() => setShowTemplates(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        maxHeight: '90vh',
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 2,
                }}>
                    <Typography variant="h6">Job Description Templates</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        {jobTemplates.map((template) => (
                            <Paper
                                key={template.id}
                                elevation={1}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                                onClick={() => handleTemplateSelect(template)}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {template.title}
                                    </Typography>
                                    <Tooltip title="Delete Template">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTemplate(template.id);
                                            }}
                                            sx={{ color: 'error.main' }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,
                                        whiteSpace: 'pre-line',
                                        maxHeight: '150px',
                                        overflow: 'auto',
                                    }}
                                >
                                    {template.description}
                                </Typography>
                            </Paper>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        onClick={() => setShowTemplates(false)}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* New Job Description Dialog */}
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
                <DialogTitle sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 2,
                }}>
                    <Typography variant="h6">Create New Job Description</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <TextField
                            autoFocus
                            label="Job Title"
                            fullWidth
                            value={newJobTitle}
                            onChange={(e) => setNewJobTitle(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <TextField
                            label="Job Description"
                            fullWidth
                            multiline
                            rows={6}
                            value={newJobDescription}
                            onChange={(e) => setNewJobDescription(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        onClick={() => setShowNewJobDialog(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
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
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
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