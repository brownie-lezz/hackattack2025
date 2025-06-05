import { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Chip, Button, CircularProgress, Alert, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { BusinessCenter, LocationOn, MonetizationOn, Schedule, Description, Checklist, School, Category, WorkHistory, Person } from '@mui/icons-material';
import AuthContext from "../../../context/AuthContext";
import { getJob } from "../../../utils/jobService";

const JobDetail = () => {
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("Job ID is missing.");
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getJob(id);
        if (response.success && response.job) {
          console.log("Fetched job:", response.job);
          setJob(response.job);
        } else {
          console.error("Job not found or error fetching job:", response.error);
          setError(response.error?.message || "Job not found or could not be loaded.");
          setJob(null);
        }
      } catch (err) {
        console.error("Unexpected error fetching job:", err);
        setError(err.message || "An unexpected error occurred.");
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading job details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5">Job not found.</Typography>
        <Button variant="outlined" onClick={() => navigate('/jobs')} sx={{ mt: 2 }}>Back to Jobs</Button>
      </Container>
    );
  }

  const renderListItems = (items, icon) => {
    if (!items || items.length === 0) return <Typography variant="body2" color="text.secondary">Not specified</Typography>;
    return (
      <List dense disablePadding>
        {items.map((item, index) => (
          <ListItem key={index} disableGutters sx={{ pl: 0}}>
            {icon && <ListItemIcon sx={{ minWidth: '30px'}}>{icon}</ListItemIcon>}
            <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={item} />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {job.title || "Job Title Not Available"}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {job.location && (
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn color="action" sx={{ mr: 1 }} /> 
              <Typography variant="body1">{job.location}</Typography>
            </Grid>
          )}
          {job.job_type && (
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessCenter color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{job.job_type}</Typography>
            </Grid>
          )}
          {job.salary_range && (
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <MonetizationOn color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{job.salary_range}</Typography>
            </Grid>
          )}
          {job.experience_level && (
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkHistory color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">Experience: {job.experience_level}</Typography>
            </Grid>
          )}
          {job.department && (
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Category color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">Department: {job.department}</Typography>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Job Description</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
            {job.description || "No description provided."}
          </Typography>
        </Box>

        {job.skills && job.skills.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Skills</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {job.skills.map((skill, index) => (
                <Chip key={index} label={skill} color="primary" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {job.responsibilities && job.responsibilities.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Responsibilities</Typography>
            {renderListItems(job.responsibilities, <Checklist fontSize="small" color="primary" />)}
          </Box>
        )}

        {job.qualifications && job.qualifications.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Qualifications</Typography>
            {renderListItems(job.qualifications, <School fontSize="small" color="primary" />)}
          </Box>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          {user && user.is_seeker && (
             <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to={`/jobs/${id}/apply`}
                size="large"
              >
                Apply Now
              </Button>
          )}
           <Button 
              variant="outlined" 
              onClick={() => navigate(-1)}
              sx={{ ml: user && user.is_seeker ? 2 : 0 }}
            >
              Back
            </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default JobDetail;
