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
import JobSuccessPage from '../../components/JobCreationWizard/JobSuccessPage';
import { createJob } from '../../utils/jobService';

const steps = [
  { id: 'job-details', label: 'Job Details' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'ai-insights', label: 'Salary Insights' },
  { id: 'preview', label: 'Preview' },
  { id: 'success', label: 'Success' }
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
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

  const handleCreateAnother = () => {
    setFormData({
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
    setSubmissionResult(null);
    setActiveStep(0);
  };

  const handleSaveJob = async (status = 'Draft') => {
    const jobData = {
      ...formData,
      status
    };
    
    setIsSubmitting(true);
    console.log('Attempting to save job with status:', status, jobData);
    
    try {
      const result = await createJob(jobData);
      console.log("Job save attempt result:", result);
      
      if (result && result.success) {
        setSubmissionResult(result);
        setActiveStep(4); // Index of the success step
      } else {
        // Handle cases where createJob resolves but indicates failure (e.g., { success: false, error: ... })
        const errorMessage = result?.error?.message || "Failed to save job. An unknown error occurred.";
        console.error("Job save failed (result.success was false):", errorMessage, result?.error);
        alert(`Error: ${errorMessage}`);
        // Ensure isSubmitting is reset even if not moving to success step
        // The finally block will also handle this, but being explicit here is fine for clarity.
      }
    } catch (error) {
      // Handle cases where createJob throws an error
      const errorMessage = error.message || "An unexpected error occurred while saving the job.";
      console.error("Error caught during handleSaveJob:", error);
      alert(`Error: ${errorMessage}`);
    } finally {
      console.log("Resetting isSubmitting in finally block.");
      setIsSubmitting(false);
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
      case 4:
        return <JobSuccessPage 
                 jobId={submissionResult?.jobId}
                 onViewJob={() => navigate(`/jobs/${submissionResult?.jobId}`)}
                 onCreateAnother={handleCreateAnother}
               />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {activeStep < 4 && (
        <>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Job Position
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Fill in the details to create a complete job posting with AI-powered salary insights
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.slice(0, 4).map((step, index) => (
                <Step key={step.id} completed={activeStep > index}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </>
      )}

      <Paper 
        elevation={activeStep < 4 ? 2 : 0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          transition: 'all 0.3s',
          animation: 'fadeIn 0.5s',
          backgroundColor: activeStep === 4 ? 'transparent' : 'background.paper',
          boxShadow: activeStep === 4 ? 'none' : undefined
        }}
      >
        {renderStepContent()}
      </Paper>

      {activeStep < 4 && (
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
            {activeStep === steps.length - 2 ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => handleSaveJob('Draft')}
                  startIcon={<SaveIcon />}
                  sx={{ mr: 2 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSaveJob('Published')}
                  startIcon={<PublishIcon />}
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Job'}
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
      )}
    </Container>
  );
};

export default JobCreationPage; 