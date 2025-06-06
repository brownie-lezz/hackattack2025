import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';

import { AuthProvider } from "./context/AuthContext";
import HealthCheck from "./components/HealthCheck";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
// Auth
import Login from "./pages/user/Login";
import Logout from "./pages/user/Logout";
import Signup from "./pages/user/Signup";
import EmployerSignup from "./pages/user/EmployerSignup";
import ResetPassword from "./pages/user/ResetPassword";
import ResetPasswordConfirm from "./pages/user/ResetPasswordConfirm";
// Profile
import SeekerProfile from "./pages/profile/SeekerProfile";
import SeekerProfileUpdate from "./pages/profile/SeekerProfileUpdate";
import EmployerProfile from "./pages/profile/EmployerProfile";
import EmployerProfileUpdate from "./pages/profile/EmployerProfileUpdate";
import CompanyProfile from "./pages/profile/CompanyProfile";
import ApplicantProfile from "./pages/profile/ApplicantProfile";
import UpdateProfile from "./pages/user/UpdateProfile";
// Jobs
import JobList from "./pages/jobs/list/JobList";
import JobCreate from "./pages/jobs/crud/JobCreate";
import JobCreationPage from "./pages/jobs/JobCreationPage";
import JobDetail from "./pages/jobs/crud/JobDetail";
import JobUpdate from "./pages/jobs/crud/JobUpdate";
import JobDelete from "./pages/jobs/crud/JobDelete";
import EmployerJobList from "./pages/jobs/employer/EmployerJobList";
import ScrapedJobList from "./pages/jobs/scrapped_jobs/ScrapedJobList";
// Bookmarked Jobs
import BookmarkJobList from "./pages/jobs/bookmarks/BookmarkList";
// Recommended Jobs
import RecommendedJobList from "./pages/jobs/list/RecommendedJobList";
// Job-Applications
import SeekerApplicationsList from "./pages/job_applications/SeekerApplications";
import JobApplicationsList from "./pages/job_applications/JobApplications";
import ApplicationCreate from "./pages/job_applications/ApplicationCreate";
// Applicant Ranking
import ResumeRanking from "./components/ResumeRanking/ResumeRanking";
// Resume
// import ResumeBuilder from "./pages/resume/ResumeBuilder";
import Letter from "./pages/cover_letter/Letter";
import ResumeScreeningDashboard from './components/ResumeScreening/ResumeScreeningDashboard';
import AIExamination from './pages/ai-examination/AIExamination';
import Footer from "./components/Footer";
import MarketAnalysis from './pages/market-analysis/MarketAnalysis';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <HealthCheck />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/logout" element={<Logout />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route exact path="/signup-employer" element={<EmployerSignup />} />
            <Route exact path="/reset-password" element={<ResetPassword />} />
            <Route exact path="/reset-password-confirm" element={<ResetPasswordConfirm />} />

            {/* Profile Routes */}
            <Route exact path="/profile/seeker" element={<SeekerProfile />} />
            <Route exact path="/profile/seeker/update" element={<SeekerProfileUpdate />} />
            <Route exact path="/profile/seeker/update-new" element={<UpdateProfile />} />
            <Route exact path="/profile/seeker/:id" element={<ApplicantProfile />} />
            <Route exact path="/profile/employer" element={<EmployerProfile />} />
            <Route exact path="/profile/employer/update" element={<EmployerProfileUpdate />} />
            <Route exact path="/profile/employer/update-new" element={<UpdateProfile />} />
            <Route exact path="/profile/employer/:id" element={<CompanyProfile />} />

            {/* Job Routes */}
            <Route exact path="/jobs" element={<JobList />} />
            <Route exact path="/jobs/:id" element={<JobDetail />} />
            <Route exact path="/jobs/:id/update" element={<JobUpdate />} />
            <Route exact path="/jobs/:id/delete" element={<JobDelete />} />
            <Route exact path="/jobs/create" element={<JobCreate />} />
            <Route exact path="/jobs/create-ai" element={<JobCreationPage />} />
            <Route exact path="/jobs/employer" element={<EmployerJobList />} />
            <Route exact path="/jobs/explore" element={<ScrapedJobList />} />
            <Route exact path="/jobs/recommendations" element={<RecommendedJobList />} />
            <Route exact path="/jobs/applications" element={<SeekerApplicationsList />} />
            <Route exact path="/jobs/:id/applications" element={<JobApplicationsList />} />
            <Route exact path="/jobs/:id/apply" element={<ApplicationCreate />} />
            <Route exact path="/jobs/:id/applicant-ranking" element={<ResumeRanking />} />
            <Route exact path="/jobs/:id/ai-examination" element={<AIExamination />} />

            {/* Other Routes */}
            <Route exact path="/cover-letter" element={<Letter />} />
            <Route path="/resume-screening" element={<ResumeScreeningDashboard />} />
            <Route path="/mbti-analysis" element={<div>MBTI Analysis Page (Coming Soon)</div>} />
            <Route path="/market-analysis" element={<MarketAnalysis />} />

            {/* 404 Route */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
          <Footer />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
