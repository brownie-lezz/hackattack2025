import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    TextField,
    Alert,
    CircularProgress,
    Tooltip,
    Chip,
    Divider,
    LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import axios from 'axios';
import ResumeManager from './ResumeManager';
import ResumeDetails from './ResumeDetails';

const Dashboard = () => {
    const [resumes, setResumes] = useState([]);
    const [jobDescriptions, setJobDescriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedResume, setSelectedResume] = useState(null);
    const [showResumeManager, setShowResumeManager] = useState(false);
    const [showResumeDetails, setShowResumeDetails] = useState(false);
    const [newJobDescription, setNewJobDescription] = useState({ title: '', description: '' });
    const [showNewJobDescription, setShowNewJobDescription] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);

    useEffect(() => {
        fetchResumes();
        fetchJobDescriptions();
    }, []);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/api/resumes');
            setResumes(response.data);
        } catch (err) {
            setError('Failed to fetch resumes: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchJobDescriptions = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/api/job-descriptions');
            setJobDescriptions(response.data);
        } catch (err) {
            setError('Failed to fetch job descriptions: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setError('');
            const formData = new FormData();
            formData.append('file', file);

            await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setAnalysisProgress(percentCompleted);
                },
            });
            await fetchResumes();
        } catch (err) {
            setError('Failed to upload resume: ' + (err.message || 'Unknown error'));
        } finally {
            setUploading(false);
            setAnalysisProgress(0);
        }
    };

    const handleJobDescriptionUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setError('');
            const formData = new FormData();
            formData.append('file', file);

            await axios.post('/api/job-descriptions/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await fetchJobDescriptions();
        } catch (err) {
            setError('Failed to upload job description: ' + (err.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteJobDescription = async (filename) => {
        if (!window.confirm('Are you sure you want to delete this job description?')) return;

        try {
            setError('');
            await axios.delete('/api/delete', {
                data: { path: `Job_Description/${filename}` }
            });
            await fetchJobDescriptions();
        } catch (err) {
            console.error('Error deleting job description:', err);
            setError('Failed to delete job description: ' + (err.response?.data?.detail || err.message || 'Unknown error'));
        }
    };

    const handleAnalyzeResume = async (resume) => {
        try {
            setAnalyzing(true);
            setError('');
            console.log('Analyzing resume:', resume);

            // Get the selected job description
            const selectedJobDescription = jobDescriptions.find(jd => jd.selected)?.content ||
                jobDescriptions[0]?.content || '';

            console.log('Selected job description:', selectedJobDescription);

            // Get resume content
            const resumeContent = await getResumeContent(resume);
            console.log('Resume content length:', resumeContent.length);

            // Prepare the analysis request
            const analysisRequest = {
                jobDescription: selectedJobDescription,
                resumes: [{
                    id: resume,
                    name: resume,
                    content: resumeContent
                }]
            };

            console.log('Sending analysis request:', {
                jobDescriptionLength: selectedJobDescription.length,
                resumeCount: analysisRequest.resumes.length
            });

            const response = await axios.post('/api/analyze-resumes', analysisRequest);
            console.log('Analysis response:', response.data);

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format from server');
            }

            // Update the selected resume with analysis results
            const analysisResult = response.data[0];
            setSelectedResume({
                ...analysisResult,
                filename: resume,
                name: resume
            });
            setShowResumeDetails(true);
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to analyze resume: ' + (err.response?.data?.detail || err.message || 'Unknown error'));
        } finally {
            setAnalyzing(false);
        }
    };

    // Helper function to get resume content
    const getResumeContent = async (resume) => {
        try {
            const response = await axios.get(`/api/resume/${resume}`);
            console.log('Resume content response:', response.data);
            return response.data.content || '';
        } catch (err) {
            console.error('Error getting resume content:', err);
            return '';
        }
    };

    const handleViewResumeDetails = async (resume) => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`/api/resume/${resume}`);
            setSelectedResume(response.data);
            setShowResumeDetails(true);
        } catch (err) {
            setError('Failed to get resume details: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadResume = async (resume) => {
        try {
            const response = await axios.get(`/api/resume/file/${resume}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', resume);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to download resume: ' + (err.message || 'Unknown error'));
        }
    };

    const handleViewJobDescription = (jd) => {
        // TODO: Implement job description view functionality
        console.log('View job description:', jd);
    };

    const handleSaveJobDescription = async () => {
        try {
            setLoading(true);
            setError('');
            await axios.post('/api/save-job-description', newJobDescription);
            await fetchJobDescriptions();
            setShowNewJobDescription(false);
            setNewJobDescription({ title: '', description: '' });
        } catch (err) {
            console.error('Error saving job description:', err);
            setError('Failed to save job description: ' + (err.response?.data?.detail || err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Resume Section */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader
                            title="Resumes"
                            action={
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<UploadFileIcon />}
                                        component="label"
                                        disabled={uploading}
                                    >
                                        Upload Resume
                                        <input
                                            type="file"
                                            hidden
                                            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png"
                                            onChange={handleFileUpload}
                                        />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<FolderIcon />}
                                        onClick={() => setShowResumeManager(true)}
                                    >
                                        Manage Resumes
                                    </Button>
                                </Box>
                            }
                        />
                        <CardContent>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <List>
                                    {resumes.map((resume) => (
                                        <ListItem
                                            key={resume}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <DescriptionIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                            <ListItemText
                                                primary={resume}
                                                secondary={`Uploaded: ${new Date().toLocaleString()}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            onClick={() => handleViewResumeDetails(resume)}
                                                            color="primary"
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Download">
                                                        <IconButton
                                                            onClick={() => handleDownloadResume(resume)}
                                                            color="primary"
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Analyze">
                                                        <IconButton
                                                            onClick={() => handleAnalyzeResume(resume)}
                                                            color="primary"
                                                            disabled={analyzing}
                                                        >
                                                            <AssessmentIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                    {resumes.length === 0 && (
                                        <Typography color="text.secondary" align="center">
                                            No resumes uploaded yet
                                        </Typography>
                                    )}
                                </List>
                            )}
                            {uploading && (
                                <Box sx={{ width: '100%', mt: 2 }}>
                                    <LinearProgress variant="determinate" value={analysisProgress} />
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                                        Uploading... {analysisProgress}%
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Job Descriptions Section */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader
                            title="Job Descriptions"
                            action={
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<UploadFileIcon />}
                                        component="label"
                                        disabled={uploading}
                                    >
                                        Upload Job Description
                                        <input
                                            type="file"
                                            hidden
                                            accept=".pdf,.doc,.docx,.txt"
                                            onChange={handleJobDescriptionUpload}
                                        />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => setShowNewJobDescription(true)}
                                    >
                                        Create New
                                    </Button>
                                </Box>
                            }
                        />
                        <CardContent>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <List>
                                    {jobDescriptions.map((jd) => (
                                        <ListItem
                                            key={jd.name}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <DescriptionIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                            <ListItemText
                                                primary={jd.title}
                                                secondary={`Last modified: ${new Date(jd.modified).toLocaleString()}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            onClick={() => handleViewJobDescription(jd)}
                                                            color="primary"
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            onClick={() => handleDeleteJobDescription(jd.name)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                    {jobDescriptions.length === 0 && (
                                        <Typography color="text.secondary" align="center">
                                            No job descriptions uploaded yet
                                        </Typography>
                                    )}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Resume Manager Dialog */}
            <ResumeManager
                open={showResumeManager}
                onClose={() => setShowResumeManager(false)}
            />

            {/* Resume Details Dialog */}
            <Dialog
                open={showResumeDetails}
                onClose={() => setShowResumeDetails(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Resume Analysis</DialogTitle>
                <DialogContent dividers>
                    {selectedResume && <ResumeDetails resume={selectedResume} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowResumeDetails(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* New Job Description Dialog */}
            <Dialog
                open={showNewJobDescription}
                onClose={() => setShowNewJobDescription(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Create New Job Description</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={newJobDescription.title}
                        onChange={(e) => setNewJobDescription({ ...newJobDescription, title: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={newJobDescription.description}
                        onChange={(e) => setNewJobDescription({ ...newJobDescription, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={10}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowNewJobDescription(false)}>Cancel</Button>
                    <Button onClick={handleSaveJobDescription} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard; 