import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import ScoreTable from './ScoreTable';
import WeightsInput from './WeightsInput';
import ScoreBarChart from './ScoreBarChart';
import axios from 'axios';

const ResumeRanking = () => {
    const [scores, setScores] = useState([]);
    const [weights, setWeights] = useState({
        skills: 0.4,
        experience: 0.3,
        education: 0.2,
        onlinePresence: 0.1
    });

    useEffect(() => {
        // Fetch initial scores
        fetchScores();
    }, []);

    const fetchScores = async () => {
        try {
            const response = await axios.get('/api/resume-scores');
            setScores(response.data);
        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    };

    const handleWeightChange = (newWeights) => {
        setWeights(newWeights);
        // Recalculate scores with new weights
        recalculateScores(newWeights);
    };

    const recalculateScores = async (newWeights) => {
        try {
            const response = await axios.post('/api/recalculate-scores', { weights: newWeights });
            setScores(response.data);
        } catch (error) {
            console.error('Error recalculating scores:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Applicant Ranking
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <WeightsInput
                            weights={weights}
                            onWeightChange={handleWeightChange}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <ScoreBarChart scores={scores} />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <ScoreTable scores={scores} />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ResumeRanking; 