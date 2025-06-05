import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const JobPreview = ({ job }) => {
  const formatSalary = () => {
    if (!job.salary || !job.salary.min || !job.salary.max) {
      return 'Not specified';
    }

    const format = (value) => value.toLocaleString();
    
    if (job.salary.isMonthly) {
      return `$${format(job.salary.min)}k - $${format(job.salary.max)}k per month`;
    } else {
      return `$${format(job.salary.min * 12)}k - $${format(job.salary.max * 12)}k per year`;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Job Preview
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review your job listing before publishing.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom component="div">
          {job.title || 'Job Title'}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {job.department && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon color="action" sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">{job.department}</Typography>
              </Box>
            </Grid>
          )}
          
          {job.location && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon color="action" sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">{job.location}</Typography>
              </Box>
            </Grid>
          )}
          
          {job.type && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon color="action" sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">{job.type}</Typography>
              </Box>
            </Grid>
          )}
          
          {job.experience && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon color="action" sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">{job.experience}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {job.salary && (job.salary.min > 0 || job.salary.max > 0) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="primary.main">
              {formatSalary()}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Job Description
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {job.description || 'No description provided.'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={4}>
          {/* Skills Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Required Skills
            </Typography>
            {job.skills && job.skills.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {job.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No skills specified.
              </Typography>
            )}
          </Grid>

          {/* Responsibilities Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Key Responsibilities
            </Typography>
            {job.responsibilities && job.responsibilities.length > 0 ? (
              <List dense sx={{ pl: 0 }}>
                {job.responsibilities.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No responsibilities specified.
              </Typography>
            )}
          </Grid>

          {/* Qualifications Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Qualifications
            </Typography>
            {job.qualifications && job.qualifications.length > 0 ? (
              <List dense sx={{ pl: 0 }}>
                {job.qualifications.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No qualifications specified.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {job.similarJobs && job.similarJobs.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Similar Jobs in the Market
          </Typography>
          <Grid container spacing={2}>
            {job.similarJobs.map((similarJob, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">{similarJob.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {similarJob.company} · {similarJob.location}
                  </Typography>
                  {similarJob.salary && (
                    <Typography variant="body2" color="primary.main">
                      ${similarJob.salary.min}k - ${similarJob.salary.max}k
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default JobPreview; 