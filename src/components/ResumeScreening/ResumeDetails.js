import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Divider,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Link,
} from '@mui/material';
import {
    Score as ScoreIcon,
    Code as CodeIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Star as StarIcon,
    Add as AddIcon,
    Link as LinkIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ResumeDetails = ({ resume }) => {
    const [expanded, setExpanded] = useState(false);

    if (!resume) return null;

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // AI Detection data for pie chart
    const getAIDetectionData = () => {
        const aiScore = resume.aiDetection?.score || 0;
        return [
            { name: 'AI Generated', value: aiScore },
            { name: 'Human Written', value: 100 - aiScore }
        ];
    };

    const COLORS = ['#ff4444', '#00C851'];

    return (
        <Box sx={{ mt: 2 }}>
            {/* Overall Score */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    <ScoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Overall Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={resume.score || 0}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {resume.score || 0}%
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* AI Detection */}
            <Accordion expanded={expanded === 'aiDetection'} onChange={handleChange('aiDetection')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">AI Detection Analysis</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={getAIDetectionData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {getAIDetectionData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Verdict: {resume.aiDetection?.verdict || 'Not Analyzed'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {resume.aiDetection?.reasoning || 'No AI detection analysis available'}
                        </Typography>
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 3 }} />

            {/* Online Presence */}
            <Accordion expanded={expanded === 'onlinePresence'} onChange={handleChange('onlinePresence')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinkIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Online Presence</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {/* LinkedIn */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            LinkedIn Profile
                        </Typography>
                        <List>
                            {(resume.onlinePresence?.linkedIn?.urls || []).map((url, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <LinkIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Link href={url} target="_blank" rel="noopener noreferrer">
                                                {url}
                                            </Link>
                                        }
                                        secondary={`Status: ${resume.onlinePresence?.linkedIn?.status || 'Not Found'}`}
                                    />
                                </ListItem>
                            ))}
                            {(!resume.onlinePresence?.linkedIn?.urls || resume.onlinePresence?.linkedIn?.urls.length === 0) && (
                                <ListItem>
                                    <ListItemText
                                        primary="No LinkedIn profile found"
                                        secondary={
                                            resume.onlinePresence?.linkedIn?.search_url ? (
                                                <Link href={resume.onlinePresence.linkedIn.search_url} target="_blank" rel="noopener noreferrer">
                                                    Search for profile
                                                </Link>
                                            ) : (
                                                "No search URL available"
                                            )
                                        }
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Box>

                    {/* GitHub */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            GitHub Profile
                        </Typography>
                        <List>
                            {(resume.onlinePresence?.github?.urls || []).map((url, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <LinkIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Link href={url} target="_blank" rel="noopener noreferrer">
                                                {url}
                                            </Link>
                                        }
                                        secondary={`Status: ${resume.onlinePresence?.github?.status || 'Not Found'}`}
                                    />
                                </ListItem>
                            ))}
                            {(!resume.onlinePresence?.github?.urls || resume.onlinePresence?.github?.urls.length === 0) && (
                                <ListItem>
                                    <ListItemText
                                        primary="No GitHub profile found"
                                        secondary={
                                            resume.onlinePresence?.github?.search_url ? (
                                                <Link href={resume.onlinePresence.github.search_url} target="_blank" rel="noopener noreferrer">
                                                    Search for profile
                                                </Link>
                                            ) : (
                                                "No search URL available"
                                            )
                                        }
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Box>

                    {/* Personal Websites */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Personal Websites
                        </Typography>
                        <List>
                            {(resume.onlinePresence?.personalWebsites?.urls || []).map((url, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <LinkIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Link href={url} target="_blank" rel="noopener noreferrer">
                                                {url}
                                            </Link>
                                        }
                                        secondary={`Status: ${resume.onlinePresence?.personalWebsites?.status || 'Not Found'}`}
                                    />
                                </ListItem>
                            ))}
                            {(!resume.onlinePresence?.personalWebsites?.urls || resume.onlinePresence?.personalWebsites?.urls.length === 0) && (
                                <ListItem>
                                    <ListItemText primary="No personal websites found" />
                                </ListItem>
                            )}
                        </List>
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 3 }} />

            {/* Skills */}
            <Accordion expanded={expanded === 'skills'} onChange={handleChange('skills')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CodeIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Skills Match</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Match Score: {resume.skills?.match_score || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {resume.skills?.skill_summary || 'No skill summary available'}
                        </Typography>
                    </Box>

                    <Typography variant="subtitle1" gutterBottom>
                        Matched Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {(resume.skills?.matched_skills || []).map((skill, index) => (
                            <Chip
                                key={index}
                                icon={<CheckCircleIcon />}
                                label={skill}
                                color="success"
                                variant="outlined"
                            />
                        ))}
                    </Box>

                    <Typography variant="subtitle1" gutterBottom>
                        Missing Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(resume.skills?.missing_skills || []).map((skill, index) => (
                            <Chip
                                key={index}
                                icon={<CancelIcon />}
                                label={skill}
                                color="error"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 3 }} />

            {/* Experience */}
            <Accordion expanded={expanded === 'experience'} onChange={handleChange('experience')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Experience Match</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Match Score: {resume.experience?.match_score || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {resume.experience?.experience_summary || 'No experience summary available'}
                        </Typography>
                    </Box>

                    <Typography variant="subtitle1" gutterBottom>
                        Relevant Experience
                    </Typography>
                    <List>
                        {(resume.experience?.experience_details || []).map((exp, index) => (
                            <ListItem key={index} alignItems="flex-start">
                                <ListItemIcon>
                                    <CheckCircleIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${exp.title} at ${exp.company}`}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                {exp.duration}
                                            </Typography>
                                            <br />
                                            {exp.description}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 3 }} />

            {/* Education */}
            <Accordion expanded={expanded === 'education'} onChange={handleChange('education')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Education Match</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Match Score: {resume.education?.match_score || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {resume.education?.education_summary || 'No education summary available'}
                        </Typography>
                    </Box>
                    <List>
                        {(resume.education?.education_details || []).map((edu, index) => (
                            <ListItem key={index} alignItems="flex-start">
                                <ListItemIcon>
                                    <CheckCircleIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${edu.degree} in ${edu.field}`}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                {edu.institution} ({edu.graduation_year})
                                            </Typography>
                                            <br />
                                            {edu.gpa && `GPA: ${edu.gpa}`}
                                            <br />
                                            {edu.relevance}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default ResumeDetails; 