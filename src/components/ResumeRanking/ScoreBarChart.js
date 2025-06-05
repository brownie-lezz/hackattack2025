import React from 'react';
import { Box, Typography } from '@mui/material';

const ScoreBarChart = ({ scores }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Score Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {scores.map((score) => (
                    <Box key={score.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{score.name}</Typography>
                            <Typography variant="body2">{score.total}%</Typography>
                        </Box>
                        <Box
                            sx={{
                                height: 8,
                                bgcolor: 'grey.200',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                sx={{
                                    height: '100%',
                                    width: `${score.total}%`,
                                    bgcolor: 'primary.main',
                                    transition: 'width 0.3s ease'
                                }}
                            />
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default ScoreBarChart; 