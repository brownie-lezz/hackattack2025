import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import axiosInstance from "../../utils/axios_instance";
import { urls } from "../../utils/config";

import Spinner from "../../components/Spinner";
import ScoreTable from "./ScoreTable";
import ScoreBarChart from "./ScoreBarChart";
import WeightsInput from "./WeightsInput";
import ResumeManager from "../../components/ResumeScreening/ResumeManager";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  height: "100%",
}));

const ResumeRanking = () => {
  const [resumeRankings, setResumeRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get(urls.APPLICANT_RANKING.replace(":job_id", id), {
        timeout: 30000,
      })
      .then((res) => {
        console.table("Resume Rankings:", res.data);
        setResumeRankings(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load resume rankings. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
        <Typography variant="h6" gutterBottom>
          Running resume parser and ranker algorithm...
        </Typography>
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 120,
            },
          }}
        >
          <Tab label="Resume Manager" />
          <Tab label="Rankings" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <ResumeManager />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom color="primary">
                Resume Rankings
              </Typography>
              <WeightsInput
                resumeRankings={resumeRankings}
                setResumeRankings={setResumeRankings}
              />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom color="primary">
                Score Distribution
              </Typography>
              <ScoreBarChart resumeRankings={resumeRankings} />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom color="primary">
                Detailed Scores
              </Typography>
              <ScoreTable resumeRankings={resumeRankings} />
            </StyledPaper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ResumeRanking;
