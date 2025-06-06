import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    LinearProgress,
    Tooltip,
} from '@mui/material';
import {
    TrendingUp,
    Work,
    LocationOn,
    MonetizationOn,
    BusinessCenter,
    School,
    Code,
    TrendingDown,
    TrendingFlat,
    Star,
    StarBorder,
} from '@mui/icons-material';
import { getSalaryPrediction, getSimilarJobs } from '../../utils/salaryPredictionService';

const MarketAnalysis = () => {
    const [searchData, setSearchData] = useState({
        title: '',
        location: '',
        type: 'Full-time',
        experience: 'Mid-Level',
        skills: [],
        industry: 'Technology',
        education: 'Bachelor\'s Degree',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [marketData, setMarketData] = useState(null);
    const [similarJobs, setSimilarJobs] = useState([]);

    const handleSearch = async () => {
        if (!searchData.title) {
            setError('Please enter a job title');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const prediction = await getSalaryPrediction(searchData);
            const jobsData = await getSimilarJobs(searchData);

            setMarketData(prediction);
            setSimilarJobs(jobsData || []);
        } catch (err) {
            console.error('Error fetching market data:', err);
            setError('Failed to fetch market data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field) => (event) => {
        setSearchData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp color="success" />;
            case 'down':
                return <TrendingDown color="error" />;
            default:
                return <TrendingFlat color="info" />;
        }
    };

    const getCompetitionLevel = (level) => {
        const stars = [];
        const totalStars = 5;
        const filledStars = Math.min(Math.max(level, 1), totalStars);

        for (let i = 0; i < totalStars; i++) {
            stars.push(
                i < filledStars ?
                    <Star key={i} color="primary" fontSize="small" /> :
                    <StarBorder key={i} color="primary" fontSize="small" />
            );
        }

        return stars;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Market Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Get real-time insights into job market trends, salary ranges, and competitive analysis.
            </Typography>

            {/* Search Form */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Job Title"
                            value={searchData.title}
                            onChange={handleInputChange('title')}
                            placeholder="e.g., Software Engineer"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Location"
                            value={searchData.location}
                            onChange={handleInputChange('location')}
                            placeholder="e.g., New York, Remote"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Job Type</InputLabel>
                            <Select
                                value={searchData.type}
                                label="Job Type"
                                onChange={handleInputChange('type')}
                            >
                                <MenuItem value="Full-time">Full-time</MenuItem>
                                <MenuItem value="Part-time">Part-time</MenuItem>
                                <MenuItem value="Contract">Contract</MenuItem>
                                <MenuItem value="Temporary">Temporary</MenuItem>
                                <MenuItem value="Internship">Internship</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Experience Level</InputLabel>
                            <Select
                                value={searchData.experience}
                                label="Experience Level"
                                onChange={handleInputChange('experience')}
                            >
                                <MenuItem value="Entry Level">Entry Level</MenuItem>
                                <MenuItem value="Mid-Level">Mid-Level</MenuItem>
                                <MenuItem value="Senior">Senior</MenuItem>
                                <MenuItem value="Lead">Lead</MenuItem>
                                <MenuItem value="Manager">Manager</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Industry</InputLabel>
                            <Select
                                value={searchData.industry}
                                label="Industry"
                                onChange={handleInputChange('industry')}
                            >
                                <MenuItem value="Technology">Technology</MenuItem>
                                <MenuItem value="Finance">Finance</MenuItem>
                                <MenuItem value="Healthcare">Healthcare</MenuItem>
                                <MenuItem value="Education">Education</MenuItem>
                                <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Education</InputLabel>
                            <Select
                                value={searchData.education}
                                label="Education"
                                onChange={handleInputChange('education')}
                            >
                                <MenuItem value="High School">High School</MenuItem>
                                <MenuItem value="Associate's Degree">Associate's Degree</MenuItem>
                                <MenuItem value="Bachelor's Degree">Bachelor's Degree</MenuItem>
                                <MenuItem value="Master's Degree">Master's Degree</MenuItem>
                                <MenuItem value="PhD">PhD</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSearch}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <TrendingUp />}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Market'}
                    </Button>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {marketData && (
                <>
                    {/* Market Insights */}
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Salary Insights
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <MonetizationOn color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Estimated Salary Range"
                                                secondary={marketData.estimatedSalary}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <TrendingUp color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Market Trend"
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {getTrendIcon(marketData.trend)}
                                                        <Typography variant="body2">
                                                            {marketData.trend === 'up' ? 'Growing' :
                                                                marketData.trend === 'down' ? 'Declining' : 'Stable'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <School color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Education Impact"
                                                secondary={`${marketData.educationImpact || 15}% salary increase`}
                                            />
                                        </ListItem>
                                        {marketData.salaryFactors && marketData.salaryFactors.length > 0 && (
                                            <ListItem>
                                                <ListItemIcon>
                                                    <BusinessCenter color="primary" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Salary Factors"
                                                    secondary={
                                                        <Box sx={{ mt: 1 }}>
                                                            {marketData.salaryFactors.map((factor, index) => (
                                                                <Typography
                                                                    key={index}
                                                                    variant="body2"
                                                                    color={factor.includes('+') ? 'success.main' :
                                                                        factor.includes('-') ? 'error.main' : 'text.secondary'}
                                                                    sx={{ mb: 0.5 }}
                                                                >
                                                                    • {factor}
                                                                </Typography>
                                                            ))}
                                                            <Typography
                                                                variant="body2"
                                                                color="primary"
                                                                sx={{ mt: 1, fontWeight: 'bold' }}
                                                            >
                                                                Total Impact: {marketData.totalImpact > 0 ? '+' : ''}{marketData.totalImpact}%
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Market Demand
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Work color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Job Availability"
                                                secondary={
                                                    <Box sx={{ width: '100%' }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={marketData.availability || 70}
                                                            color="success"
                                                        />
                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                            {marketData.availability || 70}% of positions are open
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <BusinessCenter color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Competition Level"
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        {getCompetitionLevel(marketData.competition || 3)}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Code color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Top Required Skills"
                                                secondary={
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                        {(marketData.topSkills || ['Python', 'JavaScript', 'React']).map((skill, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={skill}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Similar Jobs */}
                    {similarJobs.length > 0 && (
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Similar Jobs in the Market
                            </Typography>
                            <Grid container spacing={3}>
                                {similarJobs.map((job, index) => (
                                    <Grid item xs={12} md={6} lg={4} key={index}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {job.title}
                                                </Typography>
                                                <Box sx={{ mb: 2 }}>
                                                    <Chip
                                                        icon={<BusinessCenter />}
                                                        label={job.company}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Chip
                                                        icon={<LocationOn />}
                                                        label={job.location}
                                                        size="small"
                                                    />
                                                </Box>
                                                {job.salary && (
                                                    <Typography variant="body1" color="primary" gutterBottom>
                                                        ${job.salary.min}k - ${job.salary.max}k
                                                    </Typography>
                                                )}
                                                {job.skills && job.skills.length > 0 && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            Required Skills:
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {job.skills.map((skill, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={skill}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}
                                                {job.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                        {job.description}
                                                    </Typography>
                                                )}
                                                {job.url && (
                                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            href={job.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            startIcon={<Work />}
                                                        >
                                                            View Job
                                                        </Button>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default MarketAnalysis; 