import React, { useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Checkbox,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Description as DescriptionIcon,
    Analytics as AnalyticsIcon,
    Folder as FolderIcon,
    Delete as DeleteIcon,
    Star as StarIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import JobDescriptionSelector from './JobDescriptionSelector';
import ResumeManager from './ResumeManager';
import ResumeDetails from './ResumeDetails';

const ResumeScreeningDashboard = () => {
    const [selectedJob, setSelectedJob] = useState('');
    const [showResumeManager, setShowResumeManager] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [analysisResults, setAnalysisResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleJobSelect = (jobContent) => {
        console.log('Job selected:', jobContent);
        setSelectedJob(jobContent);
    };

    const handleResumeSelect = (resume) => {
        console.log('Selecting resume:', resume);
        setSelectedResumes(prev => {
            // Check if the resume is already selected
            const isSelected = prev.find(r => r.id === resume.id);
            console.log('Is resume already selected:', isSelected);

            if (isSelected) {
                console.log('Removing resume:', resume);
                return prev.filter(r => r.id !== resume.id);
            }

            console.log('Adding resume:', resume);
            // Add the new resume to the selection
            const newSelection = [...prev, resume];
            console.log('New selection:', newSelection);
            return newSelection;
        });
    };

    const handleAnalyze = async () => {
        console.log('Starting analysis with:', {
            selectedJob,
            selectedResumes
        });

        if (!selectedJob) {
            setError('Please select a job description first');
            return;
        }

        if (selectedResumes.length === 0) {
            setError('Please select at least one resume to analyze');
            return;
        }

        try {
            setAnalyzing(true);
            setError(null);
            console.log('Analyzing resumes:', selectedResumes);

            // Fetch resume contents
            const resumesWithContent = await Promise.all(
                selectedResumes.map(async (resume) => {
                    try {
                        const response = await axios.get(`/api/resume/${resume.name}`);
                        return {
                            id: resume.id,
                            name: resume.name,
                            content: response.data.content
                        };
                    } catch (err) {
                        console.error(`Error fetching content for ${resume.name}:`, err);
                        return {
                            id: resume.id,
                            name: resume.name,
                            content: ''
                        };
                    }
                })
            );

            // Prepare the data for analysis
            const analysisData = {
                jobDescription: selectedJob,
                resumes: resumesWithContent
            };

            console.log('Sending analysis request with data:', {
                jobDescriptionLength: selectedJob.length,
                resumeCount: resumesWithContent.length,
                resumeContents: resumesWithContent.map(r => ({
                    name: r.name,
                    contentLength: r.content.length
                }))
            });

            // Make API call to analyze resumes
            const response = await axios.post('/api/analyze-resumes', analysisData);

            if (response.data && Array.isArray(response.data)) {
                // Sort results by score in descending order
                const sortedResults = response.data.sort((a, b) => b.score - a.score);
                setAnalysisResults(sortedResults);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to analyze resumes: ' + (err.response?.data?.message || err.message));
        } finally {
            setAnalyzing(false);
        }
    };

    const handleResumeManagerClose = (updatedResumes) => {
        setShowResumeManager(false);
        if (updatedResumes) {
            setResumes(updatedResumes);
        }
    };

    const handleViewDetails = (result) => {
        setSelectedResult(result);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedResult(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                Resume Screening
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Job Description Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <JobDescriptionSelector onJobSelect={handleJobSelect} />
                    </Paper>
                </Grid>

                {/* Actions Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Actions
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <Button
                                variant="contained"
                                startIcon={<FolderIcon />}
                                onClick={() => setShowResumeManager(true)}
                                disabled={analyzing}
                                sx={{
                                    backgroundColor: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }}
                            >
                                Manage Resumes
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
                                onClick={handleAnalyze}
                                disabled={!selectedJob || selectedResumes.length === 0 || analyzing}
                                sx={{
                                    backgroundColor: 'secondary.main',
                                    '&:hover': {
                                        backgroundColor: 'secondary.dark',
                                    },
                                    minWidth: '200px'
                                }}
                            >
                                {analyzing ? 'Analyzing...' : 'Analyze Selected Resumes'}
                            </Button>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {selectedResumes.length} resume(s) selected
                        </Typography>
                    </Paper>
                </Grid>

                {/* Selected Resumes Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Selected Resumes ({selectedResumes.length})
                        </Typography>
                        {selectedResumes.length === 0 ? (
                            <Typography color="text.secondary" align="center">
                                No resumes selected. Use the Manage Resumes button to add resumes.
                            </Typography>
                        ) : (
                            <List>
                                {selectedResumes.map((resume, index) => (
                                    <React.Fragment key={resume.id}>
                                        <ListItem>
                                            <Checkbox
                                                edge="start"
                                                checked={true}
                                                onChange={() => handleResumeSelect(resume)}
                                            />
                                            <ListItemText
                                                primary={resume.name}
                                                secondary={`Type: ${resume.type}${resume.type === 'file' ? ` | Uploaded: ${new Date(resume.uploadDate).toLocaleDateString()}` : ''}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleResumeSelect(resume)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < selectedResumes.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Analysis Results Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Analysis Results
                        </Typography>
                        {analyzing ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <CircularProgress color="primary" />
                            </Box>
                        ) : analysisResults.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Rank</TableCell>
                                            <TableCell>Candidate</TableCell>
                                            <TableCell>Overall Score</TableCell>
                                            <TableCell>Skills Match</TableCell>
                                            <TableCell>Experience Match</TableCell>
                                            <TableCell>Education Match</TableCell>
                                            <TableCell>Details</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {analysisResults.map((result, index) => (
                                            <TableRow key={result.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{result.name}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <StarIcon color="primary" />
                                                        {result.score}%
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{result.skills.match_score}%</TableCell>
                                                <TableCell>{result.experience.match_score}%</TableCell>
                                                <TableCell>{result.education.match_score}%</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleViewDetails(result)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography color="text.secondary" align="center">
                                {selectedResumes.length === 0
                                    ? 'Select resumes to analyze'
                                    : 'Click "Analyze Selected Resumes" to see results'}
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Details Dialog */}
            <Dialog
                open={detailsOpen}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon color="primary" />
                        Resume Analysis Details
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedResult && <ResumeDetails resume={selectedResult} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Resume Manager Dialog */}
            <ResumeManager
                open={showResumeManager}
                onClose={handleResumeManagerClose}
                onResumeSelect={handleResumeSelect}
                selectedResumes={selectedResumes}
            />
        </Box>
    );
};

export default ResumeScreeningDashboard; 