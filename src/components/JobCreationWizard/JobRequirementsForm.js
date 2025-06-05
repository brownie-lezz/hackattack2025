import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Grid,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const JobRequirementsForm = ({ formData, onChange }) => {
  // Local state for input values
  const [skillInput, setSkillInput] = useState('');
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');

  // Handlers for adding items
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const updatedSkills = [...formData.skills, skillInput.trim()];
      onChange('skills', updatedSkills);
      setSkillInput('');
    }
  };

  const handleAddResponsibility = () => {
    if (responsibilityInput.trim()) {
      const updatedResponsibilities = [...formData.responsibilities, responsibilityInput.trim()];
      onChange('responsibilities', updatedResponsibilities);
      setResponsibilityInput('');
    }
  };

  const handleAddQualification = () => {
    if (qualificationInput.trim()) {
      const updatedQualifications = [...formData.qualifications, qualificationInput.trim()];
      onChange('qualifications', updatedQualifications);
      setQualificationInput('');
    }
  };

  // Handlers for removing items
  const handleRemoveSkill = (index) => {
    const updatedSkills = [...formData.skills];
    updatedSkills.splice(index, 1);
    onChange('skills', updatedSkills);
  };

  const handleRemoveResponsibility = (index) => {
    const updatedResponsibilities = [...formData.responsibilities];
    updatedResponsibilities.splice(index, 1);
    onChange('responsibilities', updatedResponsibilities);
  };

  const handleRemoveQualification = (index) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications.splice(index, 1);
    onChange('qualifications', updatedQualifications);
  };

  // Handler for key press (add on Enter)
  const handleKeyPress = (handler) => (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handler();
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Job Requirements
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Specify the requirements and skills needed for this position.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={4}>
        {/* Skills Section */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Required Skills
          </Typography>
          <Box sx={{ mb: 2, display: 'flex' }}>
            <TextField
              fullWidth
              label="Add a skill"
              variant="outlined"
              size="small"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleKeyPress(handleAddSkill)}
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleAddSkill}
              sx={{ ml: 1 }}
              disabled={!skillInput.trim()}
            >
              <AddIcon />
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ p: 1, minHeight: 200 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {formData.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            {formData.skills.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                No skills added yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Responsibilities Section */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Key Responsibilities
          </Typography>
          <Box sx={{ mb: 2, display: 'flex' }}>
            <TextField
              fullWidth
              label="Add a responsibility"
              variant="outlined"
              size="small"
              value={responsibilityInput}
              onChange={(e) => setResponsibilityInput(e.target.value)}
              onKeyPress={handleKeyPress(handleAddResponsibility)}
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleAddResponsibility}
              sx={{ ml: 1 }}
              disabled={!responsibilityInput.trim()}
            >
              <AddIcon />
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ p: 1, minHeight: 200 }}>
            <List dense sx={{ p: 0 }}>
              {formData.responsibilities.map((item, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveResponsibility(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
            {formData.responsibilities.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                No responsibilities added yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Qualifications Section */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Qualifications
          </Typography>
          <Box sx={{ mb: 2, display: 'flex' }}>
            <TextField
              fullWidth
              label="Add a qualification"
              variant="outlined"
              size="small"
              value={qualificationInput}
              onChange={(e) => setQualificationInput(e.target.value)}
              onKeyPress={handleKeyPress(handleAddQualification)}
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleAddQualification}
              sx={{ ml: 1 }}
              disabled={!qualificationInput.trim()}
            >
              <AddIcon />
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ p: 1, minHeight: 200 }}>
            <List dense sx={{ p: 0 }}>
              {formData.qualifications.map((item, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveQualification(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
            {formData.qualifications.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                No qualifications added yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          * Skills will be used for salary prediction and job matching
        </Typography>
      </Box>
    </Box>
  );
};

export default JobRequirementsForm; 