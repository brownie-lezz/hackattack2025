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
} from '@mui/icons-material';

const ResumeDetails = ({ resume }) => {
    const [expanded, setExpanded] = useState(false);

    if (!resume) return null;

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

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
                            Matching Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {resume.skills.matching_skills.map((skill, index) => (
                                <Chip
                                    key={index}
                                    label={`${skill.name} (${skill.level})`}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>

                    {resume.skills.additional_skills.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom color="primary">
                                Additional Valuable Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {resume.skills.additional_skills.map((skill, index) => (
                                    <Chip
                                        key={index}
                                        label={`${skill.name} (${skill.level})`}
                                        color="primary"
                                        variant="outlined"
                                        icon={<AddIcon />}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {resume.skills.missing_skills.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom color="error">
                                Missing Skills
                            </Typography>
                            <List dense>
                                {resume.skills.missing_skills.map((skill, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CancelIcon color="error" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={skill.name}
                                            secondary={`${skill.importance} priority: ${skill.reason}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary">
                            {resume.skills.skills_summary}
                        </Typography>
                    </Paper>
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
                            Match Score: {resume.experience.match_score}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {resume.experience.experience_summary}
                        </Typography>
                    </Box>

                    <Typography variant="subtitle1" gutterBottom>
                        Relevant Experience
                    </Typography>
                    <List>
                        {resume.experience.relevant_experience.map((exp, index) => (
                            <ListItem key={index} alignItems="flex-start">
                                <ListItemIcon>
                                    <CheckCircleIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${exp.role} at ${exp.company}`}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                {exp.duration}
                                            </Typography>
                                            <br />
                                            {exp.relevance}
                                            <br />
                                            <Typography variant="body2" color="text.secondary">
                                                Key Achievements:
                                            </Typography>
                                            <List dense>
                                                {exp.key_achievements.map((achievement, i) => (
                                                    <ListItem key={i}>
                                                        <ListItemIcon>
                                                            <StarIcon fontSize="small" color="primary" />
                                                        </ListItemIcon>
                                                        <ListItemText primary={achievement} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>

                    {resume.experience.additional_experience.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom color="primary">
                                Additional Valuable Experience
                            </Typography>
                            <List>
                                {resume.experience.additional_experience.map((exp, index) => (
                                    <ListItem key={index} alignItems="flex-start">
                                        <ListItemIcon>
                                            <AddIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${exp.role} at ${exp.company}`}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {exp.duration}
                                                    </Typography>
                                                    <br />
                                                    {exp.value}
                                                    <br />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Key Achievements:
                                                    </Typography>
                                                    <List dense>
                                                        {exp.key_achievements.map((achievement, i) => (
                                                            <ListItem key={i}>
                                                                <ListItemIcon>
                                                                    <StarIcon fontSize="small" color="primary" />
                                                                </ListItemIcon>
                                                                <ListItemText primary={achievement} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {resume.experience.missing_experience.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" color="error" gutterBottom>
                                Missing Experience
                            </Typography>
                            <List dense>
                                {resume.experience.missing_experience.map((exp, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CancelIcon color="error" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={exp.requirement}
                                            secondary={`${exp.importance} priority: ${exp.reason}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
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
                            Match Score: {resume.education.match_score}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {resume.education.education_summary}
                        </Typography>
                    </Box>
                    <List>
                        {resume.education.education_details.map((edu, index) => (
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
                    {resume.education.missing_education.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" color="error" gutterBottom>
                                Missing Education
                            </Typography>
                            <List dense>
                                {resume.education.missing_education.map((edu, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CancelIcon color="error" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={edu.requirement}
                                            secondary={`${edu.importance} priority: ${edu.reason}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default ResumeDetails; 