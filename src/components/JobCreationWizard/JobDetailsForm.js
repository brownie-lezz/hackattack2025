import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  Typography,
  Divider,
} from '@mui/material';

const experienceLevels = [
  'Internship',
  'Entry-Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive'
];

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Volunteer'
];

const JobDetailsForm = ({ formData, onChange }) => {
  const handleChange = (field) => (event) => {
    onChange(field, event.target.value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Job Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Start by providing the basic information about this job position.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="title"
            name="title"
            label="Job Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleChange('title')}
            helperText="Be specific with the job title (e.g., 'Senior Frontend React Developer' rather than just 'Developer')"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            id="description"
            name="description"
            label="Job Description"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={formData.description}
            onChange={handleChange('description')}
            helperText="Provide a detailed description of the role, including the purpose and main objectives"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="department"
            name="department"
            label="Department"
            fullWidth
            variant="outlined"
            value={formData.department}
            onChange={handleChange('department')}
            helperText="Department or team (e.g., Engineering, Marketing)"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="location"
            name="location"
            label="Location"
            fullWidth
            variant="outlined"
            value={formData.location}
            onChange={handleChange('location')}
            helperText="Physical location or 'Remote' if remote work is possible"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="type-label">Job Type</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              value={formData.type}
              label="Job Type"
              onChange={handleChange('type')}
            >
              {jobTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Choose the employment type for this position</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="experience-label">Experience Level</InputLabel>
            <Select
              labelId="experience-label"
              id="experience"
              value={formData.experience}
              label="Experience Level"
              onChange={handleChange('experience')}
            >
              {experienceLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select the required experience level</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDetailsForm; 