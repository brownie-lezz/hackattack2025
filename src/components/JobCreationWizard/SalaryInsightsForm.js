import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import { getSalaryPrediction, getSimilarJobs } from '../../utils/salaryPredictionService';

const SalaryInsightsForm = ({ formData, onChange }) => {
  const [minSalary, setMinSalary] = useState(formData.salary?.min || 0);
  const [maxSalary, setMaxSalary] = useState(formData.salary?.max || 0);
  const [loading, setLoading] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState(false);
  const [predictionResults, setPredictionResults] = useState(null);
  const [isMonthly, setIsMonthly] = useState(true);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have a job title or skills and haven't generated insights yet, do so
    if (!insightsGenerated && (formData.title || (formData.skills && formData.skills.length > 0))) {
      handleGenerateInsights();
    }
  }, []);

  const handleSalaryChange = () => {
    // Update the parent component with new salary data
    onChange('salary', {
      min: Number(minSalary),
      max: Number(maxSalary),
      suggested: formData.salary?.suggested || { min: minSalary, max: maxSalary },
      isMonthly: isMonthly
    });
  };

  const handleSalaryInputChange = (field, value) => {
    if (field === 'min') {
      setMinSalary(value);
    } else {
      setMaxSalary(value);
    }
    // Debounce the salary change
    setTimeout(handleSalaryChange, 300);
  };

  const handleSalaryFormat = (event) => {
    const isMonthlyFormat = event.target.value === 'monthly';
    setIsMonthly(isMonthlyFormat);
    onChange('salary', {
      ...formData.salary,
      isMonthly: isMonthlyFormat
    });
  };

  const handleGenerateInsights = async () => {
    if (!formData.title) {
      setError("Please provide a job title before generating insights");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get salary prediction from the API
      const prediction = await getSalaryPrediction(formData);
      
      // Get similar jobs
      const jobsData = await getSimilarJobs(formData);
      
      // Use the predicted salary as the midpoint
      const predictedSalaryValue = prediction.salaryValue;
      const minPredicted = Math.round(predictedSalaryValue * 0.9);
      const maxPredicted = Math.round(predictedSalaryValue * 1.1);
      
      setPredictionResults({
        estimatedSalary: prediction.estimatedSalary,
        minSalary: minPredicted,
        maxSalary: maxPredicted,
        isMonthly: prediction.isMonthly
      });
      
      setMinSalary(minPredicted);
      setMaxSalary(maxPredicted);
      
      // Update parent component with new data
      onChange('salary', {
        min: minPredicted,
        max: maxPredicted,
        suggested: {
          min: minPredicted,
          max: maxPredicted
        },
        isMonthly: prediction.isMonthly
      });
      
      setSimilarJobs(jobsData);
      onChange('similarJobs', jobsData);
      
      setInsightsGenerated(true);
    } catch (error) {
      console.error("Error generating insights:", error);
      setError("An error occurred while generating salary insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return isMonthly
      ? `$${value}k/month`
      : `$${value * 12}k/year`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Salary & Market Insights
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Get AI-powered salary recommendations based on your job description and market analysis.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
          <CircularProgress size={50} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Analyzing job data and predicting salary range...
          </Typography>
        </Box>
      ) : insightsGenerated ? (
        <Box>
          <Alert severity="info" variant="filled" sx={{ mb: 4 }}>
            <AlertTitle>Suggested Salary Range</AlertTitle>
            <Typography variant="h6">
              {formatCurrency(minSalary)} - {formatCurrency(maxSalary)}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              This prediction is based on machine learning analysis of similar job postings.
            </Typography>
          </Alert>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="minSalary"
                label="Minimum Salary"
                type="number"
                value={minSalary}
                onChange={(e) => handleSalaryInputChange('min', Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">k</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="maxSalary"
                label="Maximum Salary"
                type="number"
                value={maxSalary}
                onChange={(e) => handleSalaryInputChange('max', Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">k</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>

          <FormControl sx={{ mb: 4 }}>
            <FormLabel id="salary-format-group-label">Salary Format</FormLabel>
            <RadioGroup
              row
              aria-labelledby="salary-format-group-label"
              name="salary-format-group"
              value={isMonthly ? 'monthly' : 'yearly'}
              onChange={handleSalaryFormat}
            >
              <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
              <FormControlLabel value="yearly" control={<Radio />} label="Yearly" />
            </RadioGroup>
          </FormControl>

          {similarJobs.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Similar Jobs
              </Typography>
              <Grid container spacing={2}>
                {similarJobs.slice(0, 3).map((job, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {job.company} · {job.location}
                      </Typography>
                      {job.salary && (
                        <Typography variant="body2" color="primary.main" gutterBottom>
                          ${job.salary.min}k - ${job.salary.max}k
                        </Typography>
                      )}
                      {job.skills && job.skills.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {job.skills.map((skill, i) => (
                            <Chip
                              key={i}
                              label={skill}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateInsights}
            disabled={!formData.title}
            size="large"
          >
            Generate Salary Insights
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SalaryInsightsForm; 