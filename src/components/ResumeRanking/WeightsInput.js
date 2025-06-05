import React from 'react';
import {
    Box,
    Typography,
    Slider,
    TextField,
    Grid,
    Paper
} from '@mui/material';

const WeightsInput = ({ weights, onWeightChange }) => {
    const handleSliderChange = (name) => (event, newValue) => {
        const newWeights = { ...weights, [name]: newValue };
        onWeightChange(newWeights);
    };

    const handleInputChange = (name) => (event) => {
        const value = parseFloat(event.target.value);
        if (!isNaN(value) && value >= 0 && value <= 1) {
            const newWeights = { ...weights, [name]: value };
            onWeightChange(newWeights);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Ranking Weights
            </Typography>
            <Grid container spacing={3}>
                {Object.entries(weights).map(([name, value]) => (
                    <Grid item xs={12} key={name}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography gutterBottom>
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Slider
                                    value={value}
                                    onChange={handleSliderChange(name)}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    sx={{ flex: 1 }}
                                />
                                <TextField
                                    value={value}
                                    onChange={handleInputChange(name)}
                                    type="number"
                                    inputProps={{
                                        min: 0,
                                        max: 1,
                                        step: 0.1
                                    }}
                                    sx={{ width: '80px' }}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default WeightsInput; 