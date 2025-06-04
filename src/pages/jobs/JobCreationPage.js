import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button,
  Typography,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import JobDetailsForm from '../../components/JobCreationWizard/JobDetailsForm';
import JobRequirementsForm from '../../components/JobCreationWizard/JobRequirementsForm';
import SalaryInsightsForm from '../../components/JobCreationWizard/SalaryInsightsForm';
import JobPreview from '../../components/JobCreationWizard/JobPreview';

const steps = [
  { id: 'job-details', label: 'Job Details' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'ai-insights', label: 'Salary Insights' },
  { id: 'preview', label: 'Preview' },
];

const JobCreationPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    type: 'Full-time',
    experience: 'Mid-Level',
    skills: [],
    responsibilities: [],
    qualifications: [],
    salary: { min: 0, max: 0, suggested: { min: 0, max: 0 }, isMonthly: true },
    similarJobs: []
  });
  
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveJob = async (status = 'Draft') => {
    try {
      // Here you would typically send the data to your backend
      // For now we'll just console log and navigate back
      console.log('Saving job with status:', status);
      console.log('Job data:', { ...formData, status });
      
      // Navigate back to jobs list
      navigate('/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <JobDetailsForm 
            formData={formData} 
            onChange={handleChange} 
          />
        );
      case 1:
        return (
          <JobRequirementsForm 
            formData={formData} 
            onChange={handleChange} 
          />
        );
      case 2:
        return (
          <SalaryInsightsForm 
            formData={formData} 
            onChange={handleChange} 
          />
        );
      case 3:
        return <JobPreview job={formData} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Job Position
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Fill in the details to create a complete job posting with AI-powered salary insights
      </Typography>
      
      <Box sx={{ my: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.id} completed={activeStep > index}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          transition: 'all 0.3s',
          animation: 'fadeIn 0.5s'
        }}
      >
        {renderStepContent()}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          disabled={activeStep === 0}
          sx={{ px: 3 }}
        >
          Back
        </Button>

        <Box>
          {activeStep === steps.length - 1 ? (
            <>
              <Button
                variant="outlined"
                onClick={() => handleSaveJob('Draft')}
                startIcon={<SaveIcon />}
                sx={{ mr: 2 }}
              >
                Save as Draft
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSaveJob('Published')}
                startIcon={<PublishIcon />}
                color="primary"
              >
                Publish Job
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              color="primary"
              sx={{ px: 3 }}
            >
              {activeStep === 2 ? 'Preview' : 'Next'}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default JobCreationPage; 