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
    DialogActions,
    Card,
    CardContent,
    Stack,
    Tooltip,
    useTheme,
    Container,
} from '@mui/material';
import {
    Description as DescriptionIcon,
    Analytics as AnalyticsIcon,
    Folder as FolderIcon,
    Delete as DeleteIcon,
    Star as StarIcon,
    Visibility as VisibilityIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Code as CodeIcon,
    CloudUpload as CloudUploadIcon,
    Assessment as AssessmentIcon,
    Speed as SpeedIcon,
    Warning as WarningIcon,
    Link as LinkIcon,
} from '@mui/icons-material';
import axios from 'axios';
import JobDescriptionSelector from './JobDescriptionSelector';
import ResumeManager from './ResumeManager';
import ResumeDetails from './ResumeDetails';
import ResumeChatWidget from './ResumeChatWidget';

const ResumeScreeningDashboard = () => {
    const theme = useTheme();
    const [selectedJob, setSelectedJob] = useState('');
    const [showResumeManager, setShowResumeManager] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [analysisResults, setAnalysisResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [aiAnalysisResults, setAiAnalysisResults] = useState({});

    const handleJobSelect = (jobContent) => {
        console.log('Job selected:', jobContent);
        setSelectedJob(jobContent);
    };

    const analyzeResumeForAI = async (resumeText) => {
        try {
            console.log('Starting AI analysis for resume text:', resumeText?.substring(0, 100) + '...');

            if (!resumeText) {
                console.warn('Resume text is undefined or null');
                return {
                    verdict: 'Not Analyzed',
                    reasoning: 'Resume content is missing'
                };
            }

            // The AI detection will now be handled by the backend
            // We'll just return a placeholder that will be updated by the backend
            return {
                verdict: 'Analyzing...',
                reasoning: 'AI detection in progress'
            };
        } catch (error) {
            console.error('Error in analyzeResumeForAI:', error);
            return {
                verdict: 'Not Analyzed',
                reasoning: 'Failed to analyze resume for AI generation'
            };
        }
    };

    const verifyUrls = async (resumeText) => {
        console.log('Starting URL verification for resume text:', resumeText?.substring(0, 100) + '...');

        // Initialize default result structure
        const result = {
            linkedIn: { urls: [], status: 'not found' },
            github: { urls: [], status: 'not found' },
            personalWebsites: { urls: [], status: 'not found' }
        };

        // Return early if resumeText is undefined or null
        if (!resumeText) {
            console.warn('Resume text is undefined or null');
            return result;
        }

        try {
            // Extract URLs using regex
            const linkedInRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi;
            const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/gi;
            const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w-.]+(?:\/[\w-./?%&=]*)?/gi;

            // Extract URLs with null checks
            const linkedInMatches = resumeText.match(linkedInRegex) || [];
            const githubMatches = resumeText.match(githubRegex) || [];
            const websiteMatches = resumeText.match(websiteRegex) || [];

            console.log('Found URLs:', {
                linkedIn: linkedInMatches,
                github: githubMatches,
                websites: websiteMatches
            });

            // Remove duplicates and filter out LinkedIn and GitHub URLs from website matches
            result.linkedIn.urls = [...new Set(linkedInMatches)];
            result.github.urls = [...new Set(githubMatches)];
            result.personalWebsites.urls = [...new Set(websiteMatches)]
                .filter(url => !url.includes('linkedin.com') && !url.includes('github.com'));

            // Verify GitHub profiles
            if (result.github.urls.length > 0) {
                try {
                    const username = result.github.urls[0].split('github.com/')[1];
                    console.log('Verifying GitHub profile:', username);
                    const response = await fetch(`https://api.github.com/users/${username}`);
                    result.github.status = response.status === 200 ? 'valid' : 'invalid';
                    console.log('GitHub verification result:', {
                        username,
                        status: response.status,
                        result: result.github.status
                    });
                } catch (error) {
                    console.error('Error verifying GitHub profile:', error);
                    result.github.status = 'invalid';
                }
            }

            // Verify LinkedIn profiles
            if (result.linkedIn.urls.length > 0) {
                try {
                    const linkedInUrl = result.linkedIn.urls[0];
                    console.log('Verifying LinkedIn profile:', linkedInUrl);
                    const fullUrl = linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`;
                    const response = await fetch(fullUrl, {
                        method: 'HEAD',
                        mode: 'no-cors'
                    });
                    result.linkedIn.status = 'unverified';
                    console.log('LinkedIn verification result:', {
                        url: fullUrl,
                        status: result.linkedIn.status
                    });
                } catch (error) {
                    console.error('Error verifying LinkedIn profile:', error);
                    result.linkedIn.status = 'unverified';
                }
            }

            // Verify personal websites
            if (result.personalWebsites.urls.length > 0) {
                try {
                    const websiteUrl = result.personalWebsites.urls[0];
                    console.log('Verifying personal website:', websiteUrl);
                    const fullUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
                    const response = await fetch(fullUrl, {
                        method: 'HEAD',
                        mode: 'no-cors'
                    });
                    result.personalWebsites.status = 'unverified';
                    console.log('Personal website verification result:', {
                        url: fullUrl,
                        status: result.personalWebsites.status
                    });
                } catch (error) {
                    console.error('Error verifying personal website:', error);
                    result.personalWebsites.status = 'unverified';
                }
            }

            console.log('Final URL verification results:', result);
            return result;
        } catch (error) {
            console.error('Error in verifyUrls:', error);
            return result;
        }
    };

    const handleResumeSelect = async (resume) => {
        console.log('Selecting resume:', {
            id: resume.id,
            name: resume.name,
            hasContent: !!resume.content,
            contentLength: resume.content?.length || 0,
            contentPreview: resume.content?.substring(0, 100) + '...'
        });

        // Check if the resume is already selected
        const isSelected = selectedResumes.find(r => r.id === resume.id);

        if (isSelected) {
            console.log('Removing resume:', resume.name);
            setSelectedResumes(prev => prev.filter(r => r.id !== resume.id));
            // Remove from AI analysis results
            setAiAnalysisResults(prev => {
                const newResults = { ...prev };
                delete newResults[resume.id];
                return newResults;
            });
        } else {
            console.log('Adding resume:', resume.name);
            try {
                // Load the resume content from the original resumes directory
                const response = await fetch(`http://localhost:8000/api/resumes?path=original&subdir=${encodeURIComponent(resume.path)}`);
                if (!response.ok) {
                    throw new Error('Failed to load resume content');
                }
                const data = await response.json();

                // Create the new resume object with content
                const newResume = {
                    ...resume,
                    content: data.content || '',
                    type: data.type || 'text'
                };

                // Add to selected resumes
                setSelectedResumes(prev => [...prev, newResume]);

                // Log the selection
                console.log('Added resume to selection:', {
                    id: newResume.id,
                    name: newResume.name,
                    hasContent: !!newResume.content,
                    contentLength: newResume.content?.length || 0
                });
            } catch (error) {
                console.error('Error loading resume content:', error);
                setError('Failed to load resume content: ' + error.message);
            }
        }
    };

    const handleAnalyze = async () => {
        console.log('Starting analysis process...');
        console.log('Selected job:', selectedJob?.substring(0, 100) + '...');
        console.log('Selected resumes:', selectedResumes.map(r => ({
            id: r.id,
            name: r.name,
            hasContent: !!r.content,
            contentLength: r.content?.length || 0
        })));

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

            // Prepare the data for the main analysis
            const analysisData = {
                jobDescription: selectedJob,
                resumes: selectedResumes.map(resume => ({
                    id: resume.id,
                    name: resume.name,
                    path: resume.path,
                    content: resume.content
                }))
            };

            console.log('Sending analysis request to backend:', {
                jobDescriptionLength: selectedJob.length,
                resumeCount: selectedResumes.length,
                resumeDetails: selectedResumes.map(r => ({
                    name: r.name,
                    hasContent: !!r.content,
                    contentLength: r.content?.length || 0
                }))
            });

            // Make API call to analyze resumes
            const response = await axios.post('http://localhost:8000/api/analyze-resumes', analysisData);
            console.log('Received analysis response from backend:', response.data);

            if (response.data && Array.isArray(response.data)) {
                // Process the results which now include AI detection and online presence from the backend
                const processedResults = response.data.map(result => {
                    // Log the raw result for debugging
                    console.log('Processing result:', {
                        name: result.name,
                        score: result.score,
                        aiDetection: result.aiDetection,
                        onlinePresence: result.onlinePresence
                    });

                    // Ensure we have all required fields with default values if missing
                    const processedResult = {
                        ...result,
                        id: result.id || 'unknown',
                        name: result.name || 'Unknown Resume',
                        score: result.score || 0,
                        skills: result.skills || { match_score: 0 },
                        experience: result.experience || { match_score: 0 },
                        education: result.education || { match_score: 0 },
                        aiDetection: result.aiDetection || {
                            verdict: 'Not Analyzed',
                            reasoning: 'AI analysis not performed'
                        },
                        onlinePresence: result.onlinePresence || {
                            linkedIn: { urls: [], status: 'not found' },
                            github: { urls: [], status: 'not found' },
                            personalWebsites: { urls: [], status: 'not found' }
                        }
                    };

                    // Log the processed result for debugging
                    console.log('Processed result:', {
                        name: processedResult.name,
                        score: processedResult.score,
                        aiDetection: processedResult.aiDetection,
                        onlinePresence: processedResult.onlinePresence
                    });

                    return processedResult;
                });

                // Sort results by score in descending order
                const sortedResults = processedResults.sort((a, b) => b.score - a.score);

                // Log final results for debugging
                console.log('Final sorted results:', sortedResults.map(result => ({
                    name: result.name,
                    score: result.score,
                    aiDetection: result.aiDetection,
                    onlinePresence: result.onlinePresence
                })));

                setAnalysisResults(sortedResults);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            console.error('Analysis error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack
            });
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

    const handleRemoveResume = (resumeId) => {
        console.log('Removing resume:', resumeId);
        setResumes(prevResumes => prevResumes.filter(resume => resume.id !== resumeId));
        setSelectedResumes(prevSelected => prevSelected.filter(resume => resume.id !== resumeId));
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Hero Section */}
            <Paper
                elevation={0}
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 6,
                    mb: 4,
                    borderRadius: 0,
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={3} alignItems="center" textAlign="center">
                        <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                            AI-Powered Resume Screening
                        </Typography>
                        <Typography variant="h6" sx={{ maxWidth: '800px', opacity: 0.9 }}>
                            Streamline your hiring process with our advanced AI resume screening system.
                            Get instant analysis and matching scores for your candidates.
                        </Typography>
                    </Stack>
                </Container>
            </Paper>

            <Container maxWidth="lg" sx={{ pb: 6 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Main Content Area */}
                <Stack spacing={4}>
                    {/* Top Row - Job Description and Resumes */}
                    <Grid container spacing={3}>
                        {/* Job Description */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={2} sx={{
                                borderRadius: 2,
                                height: '100%',
                                width: '100%',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: '2px solid',
                                        borderColor: 'primary.light'
                                    }}>
                                        <WorkIcon color="primary" sx={{ fontSize: 28 }} />
                                        <Typography variant="h6" sx={{
                                            fontWeight: 600,
                                            color: 'primary.main',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Job Description
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        <JobDescriptionSelector onJobSelect={handleJobSelect} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Resumes */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={2} sx={{
                                borderRadius: 2,
                                height: '100%',
                                width: '100%',
                                maxWidth: '100%',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <CardContent sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    maxWidth: '100%'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: '2px solid',
                                        borderColor: 'primary.light',
                                        width: '100%'
                                    }}>
                                        <AnalyticsIcon color="primary" sx={{ fontSize: 28 }} />
                                        <Typography variant="h6" sx={{
                                            fontWeight: 600,
                                            color: 'primary.main',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Resumes
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        height: 'calc(100% - 80px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                        maxWidth: '100%'
                                    }}>
                                        <Stack spacing={3} sx={{
                                            height: '100%',
                                            width: '100%',
                                            maxWidth: '100%'
                                        }}>
                                            {/* Actions Section */}
                                            <Box sx={{ width: '100%' }}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<FolderIcon />}
                                                    onClick={() => setShowResumeManager(true)}
                                                    disabled={analyzing}
                                                    fullWidth
                                                    sx={{
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontSize: '1rem',
                                                        boxShadow: 2,
                                                    }}
                                                >
                                                    Manage Resumes
                                                </Button>
                                            </Box>

                                            {/* Selected Resumes Section */}
                                            <Box sx={{
                                                flex: 1,
                                                overflow: 'auto',
                                                height: 'calc(100% - 60px)',
                                                width: '100%',
                                                maxWidth: '100%'
                                            }}>
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                                    Selected Resumes ({selectedResumes.length})
                                                </Typography>
                                                <List sx={{
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    overflow: 'auto',
                                                    height: 'calc(100% - 30px)'
                                                }}>
                                                    {selectedResumes.map((resume) => (
                                                        <ListItem
                                                            key={resume.id}
                                                            sx={{
                                                                borderBottom: '1px solid',
                                                                borderColor: 'divider',
                                                                '&:last-child': {
                                                                    borderBottom: 'none'
                                                                },
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover'
                                                                },
                                                                width: '100%',
                                                                maxWidth: '100%'
                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        {resume.name}
                                                                        {aiAnalysisResults[resume.id] && (
                                                                            <>
                                                                                <Tooltip title={aiAnalysisResults[resume.id].reasoning}>
                                                                                    <Box
                                                                                        sx={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: 0.5,
                                                                                            ml: 1,
                                                                                            px: 1,
                                                                                            py: 0.5,
                                                                                            borderRadius: 1,
                                                                                            bgcolor: aiAnalysisResults[resume.id].verdict === 'Likely AI-Generated'
                                                                                                ? 'error.light'
                                                                                                : aiAnalysisResults[resume.id].verdict === 'Possibly AI-Assisted'
                                                                                                    ? 'warning.light'
                                                                                                    : 'success.light',
                                                                                            color: aiAnalysisResults[resume.id].verdict === 'Likely AI-Generated'
                                                                                                ? 'error.dark'
                                                                                                : aiAnalysisResults[resume.id].verdict === 'Possibly AI-Assisted'
                                                                                                    ? 'warning.dark'
                                                                                                    : 'success.dark',
                                                                                        }}
                                                                                    >
                                                                                        <WarningIcon fontSize="small" />
                                                                                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                                                            {aiAnalysisResults[resume.id].verdict}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                </Tooltip>
                                                                            </>
                                                                        )}
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    <Box sx={{ mt: 1 }}>
                                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                            {resume.type}
                                                                        </Typography>
                                                                        {aiAnalysisResults[resume.id]?.urlVerification && (
                                                                            <Box sx={{ mt: 1 }}>
                                                                                {aiAnalysisResults[resume.id].urlVerification.linkedIn.urls.length > 0 && (
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                                        <LinkIcon fontSize="small" color="primary" />
                                                                                        <Typography
                                                                                            variant="caption"
                                                                                            component="a"
                                                                                            href={aiAnalysisResults[resume.id].urlVerification.linkedIn.urls[0]}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            sx={{
                                                                                                color: 'primary.main',
                                                                                                textDecoration: 'none',
                                                                                                '&:hover': { textDecoration: 'underline' }
                                                                                            }}
                                                                                        >
                                                                                            LinkedIn Profile
                                                                                        </Typography>
                                                                                        <Typography
                                                                                            variant="caption"
                                                                                            sx={{
                                                                                                color: aiAnalysisResults[resume.id].urlVerification.linkedIn.status === 'valid'
                                                                                                    ? 'success.main'
                                                                                                    : aiAnalysisResults[resume.id].urlVerification.linkedIn.status === 'unverified'
                                                                                                        ? 'warning.main'
                                                                                                        : 'error.main'
                                                                                            }}
                                                                                        >
                                                                                            ({aiAnalysisResults[resume.id].urlVerification.linkedIn.status})
                                                                                        </Typography>
                                                                                    </Box>
                                                                                )}
                                                                                {aiAnalysisResults[resume.id].urlVerification.github.urls.length > 0 && (
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                                        <CodeIcon fontSize="small" color="primary" />
                                                                                        <Typography
                                                                                            variant="caption"
                                                                                            component="a"
                                                                                            href={aiAnalysisResults[resume.id].urlVerification.github.urls[0]}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            sx={{
                                                                                                color: 'primary.main',
                                                                                                textDecoration: 'none',
                                                                                                '&:hover': { textDecoration: 'underline' }
                                                                                            }}
                                                                                        >
                                                                                            GitHub Profile
                                                                                        </Typography>
                                                                                        <Typography
                                                                                            variant="caption"
                                                                                            sx={{
                                                                                                color: aiAnalysisResults[resume.id].urlVerification.github.status === 'valid'
                                                                                                    ? 'success.main'
                                                                                                    : 'error.main'
                                                                                            }}
                                                                                        >
                                                                                            ({aiAnalysisResults[resume.id].urlVerification.github.status})
                                                                                        </Typography>
                                                                                    </Box>
                                                                                )}
                                                                                {aiAnalysisResults[resume.id].urlVerification.personalWebsites.urls.length > 0 && (
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                        <LinkIcon fontSize="small" color="primary" />
                                                                                        <Typography
                                                                                            variant="caption"
                                                                                            component="a"
                                                                                            href={aiAnalysisResults[resume.id].urlVerification.personalWebsites.urls[0]}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            sx={{
                                                                                                color: 'primary.main',
                                                                                                textDecoration: 'none',
                                                                                                '&:hover': { textDecoration: 'underline' }
                                                                                            }}
                                                                                        >
                                                                                            Personal Website
                                                                                        </Typography>
                                                                                        <Typography
                                                                                            variant="caption"
                                                                                            sx={{
                                                                                                color: aiAnalysisResults[resume.id].urlVerification.personalWebsites.status === 'valid'
                                                                                                    ? 'success.main'
                                                                                                    : 'error.main'
                                                                                            }}
                                                                                        >
                                                                                            ({aiAnalysisResults[resume.id].urlVerification.personalWebsites.status})
                                                                                        </Typography>
                                                                                    </Box>
                                                                                )}
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                }
                                                                primaryTypographyProps={{
                                                                    variant: 'body1',
                                                                    fontWeight: 500,
                                                                    noWrap: true
                                                                }}
                                                            />
                                                            <ListItemSecondaryAction>
                                                                <IconButton
                                                                    edge="end"
                                                                    onClick={() => handleRemoveResume(resume.id)}
                                                                    sx={{ color: 'error.main' }}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </ListItemSecondaryAction>
                                                        </ListItem>
                                                    ))}
                                                    {selectedResumes.length === 0 && (
                                                        <Box sx={{
                                                            p: 3,
                                                            textAlign: 'center',
                                                            color: 'text.secondary',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            width: '100%'
                                                        }}>
                                                            <Typography variant="body2">
                                                                No resumes selected
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                                                Click "Manage Resumes" to add resumes for analysis
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </List>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Features Section */}
                    <Card elevation={2} sx={{
                        borderRadius: 2,
                        width: '100%'
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SpeedIcon color="primary" />
                                Features
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <CloudUploadIcon color="primary" sx={{ fontSize: 32 }} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                Easy Upload
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Upload multiple resume formats for quick analysis
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                Smart Analysis
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Detailed analysis of skills and experience
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <SpeedIcon color="primary" sx={{ fontSize: 32 }} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                Instant Results
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Get comprehensive matching scores instantly
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Analyze Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
                            onClick={handleAnalyze}
                            disabled={!selectedJob || selectedResumes.length === 0 || analyzing}
                            sx={{
                                py: 2,
                                px: 4,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                bgcolor: 'secondary.main',
                                boxShadow: 2,
                                '&:hover': {
                                    bgcolor: 'secondary.dark',
                                }
                            }}
                        >
                            {analyzing ? 'Analyzing...' : 'Analyze'}
                        </Button>
                    </Box>

                    {/* Analysis Results */}
                    {analysisResults.length > 0 && (
                        <Card elevation={2} sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AnalyticsIcon color="primary" />
                                    Analysis Results
                                </Typography>
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
                                                <TableCell>AI Detection</TableCell>
                                                <TableCell>Online Presence</TableCell>
                                                <TableCell>Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {analysisResults.map((result, index) => (
                                                <TableRow
                                                    key={result.id}
                                                    sx={{
                                                        '&:hover': {
                                                            bgcolor: 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{result.name}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <StarIcon color="primary" />
                                                            {result.score || 0}%
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <CodeIcon color="primary" />
                                                            {result.skills?.match_score || 0}%
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <WorkIcon color="primary" />
                                                            {result.experience?.match_score || 0}%
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <SchoolIcon color="primary" />
                                                            {result.education?.match_score || 0}%
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        {result.aiDetection ? (
                                                            <Tooltip title={result.aiDetection.reasoning || 'No reasoning provided'}>
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.5,
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        bgcolor: result.aiDetection.verdict === 'Likely AI-Generated'
                                                                            ? 'error.light'
                                                                            : result.aiDetection.verdict === 'Possibly AI-Assisted'
                                                                                ? 'warning.light'
                                                                                : 'success.light',
                                                                        color: result.aiDetection.verdict === 'Likely AI-Generated'
                                                                            ? 'error.dark'
                                                                            : result.aiDetection.verdict === 'Possibly AI-Assisted'
                                                                                ? 'warning.dark'
                                                                                : 'success.dark',
                                                                        width: 'fit-content'
                                                                    }}
                                                                >
                                                                    <WarningIcon fontSize="small" />
                                                                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                                        {result.aiDetection.verdict || 'Not Analyzed'}
                                                                    </Typography>
                                                                </Box>
                                                            </Tooltip>
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Not Analyzed
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {result.onlinePresence ? (
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                {result.onlinePresence.linkedIn?.urls?.length > 0 && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <LinkIcon fontSize="small" color="primary" />
                                                                        <Typography
                                                                            variant="caption"
                                                                            component="a"
                                                                            href={result.onlinePresence.linkedIn.urls[0]}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            sx={{
                                                                                color: 'primary.main',
                                                                                textDecoration: 'none',
                                                                                '&:hover': { textDecoration: 'underline' }
                                                                            }}
                                                                        >
                                                                            LinkedIn
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: result.onlinePresence.linkedIn.status === 'valid'
                                                                                    ? 'success.main'
                                                                                    : result.onlinePresence.linkedIn.status === 'unverified'
                                                                                        ? 'warning.main'
                                                                                        : 'error.main'
                                                                            }}
                                                                        >
                                                                            ({result.onlinePresence.linkedIn.status})
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                {result.onlinePresence.github?.urls?.length > 0 && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <CodeIcon fontSize="small" color="primary" />
                                                                        <Typography
                                                                            variant="caption"
                                                                            component="a"
                                                                            href={result.onlinePresence.github.urls[0]}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            sx={{
                                                                                color: 'primary.main',
                                                                                textDecoration: 'none',
                                                                                '&:hover': { textDecoration: 'underline' }
                                                                            }}
                                                                        >
                                                                            GitHub
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: result.onlinePresence.github.status === 'valid'
                                                                                    ? 'success.main'
                                                                                    : 'error.main'
                                                                            }}
                                                                        >
                                                                            ({result.onlinePresence.github.status})
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                {result.onlinePresence.personalWebsites?.urls?.length > 0 && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <LinkIcon fontSize="small" color="primary" />
                                                                        <Typography
                                                                            variant="caption"
                                                                            component="a"
                                                                            href={result.onlinePresence.personalWebsites.urls[0]}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            sx={{
                                                                                color: 'primary.main',
                                                                                textDecoration: 'none',
                                                                                '&:hover': { textDecoration: 'underline' }
                                                                            }}
                                                                        >
                                                                            Website
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: result.onlinePresence.personalWebsites.status === 'valid'
                                                                                    ? 'success.main'
                                                                                    : 'error.main'
                                                                            }}
                                                                        >
                                                                            ({result.onlinePresence.personalWebsites.status})
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                {(!result.onlinePresence.linkedIn?.urls?.length &&
                                                                    !result.onlinePresence.github?.urls?.length &&
                                                                    !result.onlinePresence.personalWebsites?.urls?.length) && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            No online presence found
                                                                        </Typography>
                                                                    )}
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Not Analyzed
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<VisibilityIcon />}
                                                            onClick={() => handleViewDetails(result)}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none'
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </Container>

            {/* Details Dialog */}
            <Dialog
                open={detailsOpen}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        maxHeight: '90vh'
                    }
                }}
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
                    <Button
                        onClick={handleCloseDetails}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Resume Manager Dialog */}
            <ResumeManager
                open={showResumeManager}
                onClose={handleResumeManagerClose}
                onResumeSelect={handleResumeSelect}
                selectedResumes={selectedResumes}
            />

            {/* Add chat widget */}
            <ResumeChatWidget
                selectedResumes={selectedResumes}
                analysisResults={analysisResults}
            />
        </Box>
    );
};

export default ResumeScreeningDashboard; 