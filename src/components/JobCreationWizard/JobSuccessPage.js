import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Container
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link } from 'react-router-dom';

const JobSuccessPage = ({ jobId, onViewJob, onCreateAnother }) => {
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom>
          Job Posted Successfully!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Your job has been published and is now visible to potential candidates.
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 3, mb: 4, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="subtitle2" color="text.secondary">Job ID</Typography>
          <Typography variant="body1" fontWeight="medium" sx={{ mb: 2 }}>
            {jobId}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            You can use this ID to reference your job posting in communications with our support team.
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onViewJob}
            component={Link}
            to={`/jobs/${jobId}`}
          >
            View Published Job
          </Button>
          <Button variant="outlined" onClick={onCreateAnother}>
            Create Another Job
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default JobSuccessPage; 