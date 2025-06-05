import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Divider,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
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

  // Store the base yearly 'k' prediction to facilitate format changes
  const [baseYearlyPredictionK, setBaseYearlyPredictionK] = useState(null);

  // Memoize handleGenerateInsights to stabilize its reference for useEffect
  const handleGenerateInsights = useCallback(async () => {
    if (!formData.title) {
      setError("Please provide a job title before generating insights");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const prediction = await getSalaryPrediction(formData);
      const jobsData = await getSimilarJobs(formData);
      
      const yearlyKPointEstimate = prediction.salaryValue; 
      setBaseYearlyPredictionK(yearlyKPointEstimate); 

      let initialMinK, initialMaxK;
      if (isMonthly) { 
        initialMinK = Math.round((yearlyKPointEstimate / 12) * 0.90); 
        initialMaxK = Math.round((yearlyKPointEstimate / 12) * 1.10); 
      } else {
        initialMinK = Math.round(yearlyKPointEstimate * 0.90); 
        initialMaxK = Math.round(yearlyKPointEstimate * 1.10); 
      }
      
      setPredictionResults(prediction); 
      setMinSalary(initialMinK);
      setMaxSalary(initialMaxK);
      
      onChange('salary', {
        min: initialMinK,
        max: initialMaxK,
        suggested: {
            yearlyK: yearlyKPointEstimate,
            formattedValue: prediction.estimatedSalary,
            derivedMinK: initialMinK,
            derivedMaxK: initialMaxK
        },
        isMonthly: isMonthly
      });
      
      setSimilarJobs(jobsData || []);
      onChange('similarJobs', jobsData || []);
      setInsightsGenerated(true);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("An error occurred while generating salary insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [formData, isMonthly, onChange]);

  useEffect(() => {
    if (!insightsGenerated && (formData.title || (formData.skills && formData.skills.length > 0))) {
      handleGenerateInsights();
    }
  }, [formData.title, formData.skills, insightsGenerated, handleGenerateInsights]);

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
    const newIsMonthly = event.target.value === 'monthly';
    const oldIsMonthly = isMonthly; // Get the current format before changing state

    setIsMonthly(newIsMonthly); // Update the format state immediately

    // Get current values from state (which reflect user input)
    const currentMinValK = parseFloat(minSalary);
    const currentMaxValK = parseFloat(maxSalary);

    let newMinConvertedK = currentMinValK;
    let newMaxConvertedK = currentMaxValK;

    // Only convert if the format actually changed and values are numbers
    if (oldIsMonthly !== newIsMonthly && !isNaN(currentMinValK) && !isNaN(currentMaxValK)) {
      if (oldIsMonthly === true && newIsMonthly === false) { // Monthly to Yearly
        newMinConvertedK = Math.round(currentMinValK * 12);
        newMaxConvertedK = Math.round(currentMaxValK * 12);
      } else if (oldIsMonthly === false && newIsMonthly === true) { // Yearly to Monthly
        newMinConvertedK = currentMinValK === 0 ? 0 : Math.round(currentMinValK / 12);
        newMaxConvertedK = currentMaxValK === 0 ? 0 : Math.round(currentMaxValK / 12);
      }
      setMinSalary(newMinConvertedK);
      setMaxSalary(newMaxConvertedK);
      onChange('salary', { 
        min: newMinConvertedK, 
        max: newMaxConvertedK, 
        // suggested can hold the AI point estimate if needed, or be derived. 
        // For now, it mirrors min/max of user inputs.
        suggested: { min: newMinConvertedK, max: newMaxConvertedK }, 
        isMonthly: newIsMonthly 
      });
    } else if (oldIsMonthly === newIsMonthly) {
      // If format didn't change (e.g. re-clicking same radio), ensure parent is synced with current state
      onChange('salary', { 
          min: currentMinValK, 
          max: currentMaxValK, 
          suggested: { min: currentMinValK, max: currentMaxValK },
          isMonthly: newIsMonthly 
      });
    } else {
      // If values are not numbers (e.g. initial state before insights), just update format in parent
      onChange('salary', {
        ...formData.salary,
        min: currentMinValK, // or some default like 0 if NaN
        max: currentMaxValK, // or some default like 0 if NaN
        isMonthly: newIsMonthly
      });
    }
  };

  // Helper function to format salary type
  const formatSalaryType = (type) => {
    if (!type || typeof type !== 'string' || type.toLowerCase() === 'not specified' || type.toLowerCase() === 'unknown' || type.trim() === '') {
      return '';
    }
    // Capitalize first letter
    return ` (${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()})`;
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
            <AlertTitle>
              AI Salary Estimate
            </AlertTitle>
            <Typography variant="h6">
              {predictionResults?.estimatedSalary || "Calculating..."}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              This estimate is based on AI analysis of this job's details.
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
                {similarJobs.slice(0, 5).map((job, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        maxHeight: 200
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        p: 2, 
                        pb: 1,
                        alignItems: 'center'
                      }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: index === 0 ? 'secondary.main' : 'primary.main',
                            width: 38,
                            height: 38,
                            mr: 2
                          }}
                        >
                          {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 'bold',
                                maxWidth: '85%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {job.title || "N/A"}
                            </Typography>
                            {index === 0 && (
                              <Chip
                                label="Best Fit"
                                color="secondary"
                                size="small"
                                sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {job.company || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        px: 2, 
                        pb: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5
                      }}>
                        {job.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {job.location}
                            </Typography>
                          </Box>
                        )}
                        
                        {job.salary && job.salary.min && job.salary.max && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MonetizationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main', fontSize: '1rem' }} />
                            <Typography variant="body2" fontWeight="medium" color="success.main">
                              ${job.salary.min}k - ${job.salary.max}k{job.salary.type && formatSalaryType(job.salary.type)}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {job.skills && job.skills.length > 0 && job.skills[0] !== "Not specified" && (
                        <Box sx={{ px: 2, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {job.skills.slice(0, 3).map((skill, i) => (
                            <Chip
                              key={i}
                              label={skill}
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem' 
                              }}
                            />
                          ))}
                          {job.skills.length > 3 && (
                            <Chip
                              label={`+${job.skills.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Box>
                      )}
                      
                      <Box sx={{ flexGrow: 1 }} />
                      
                      <Box 
                        sx={{ 
                          borderTop: '1px solid', 
                          borderColor: 'divider',
                          px: 2,
                          py: 1,
                          mt: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Similar position
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          sx={{ 
                            py: 0,
                            height: 24,
                            minWidth: 60,
                            fontSize: '0.7rem'
                          }}
                          href={job.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Button>
                      </Box>
                    </Card>
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