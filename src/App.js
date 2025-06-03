import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

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
// Jobs
import JobList from "./pages/jobs/list/JobList";
import JobCreate from "./pages/jobs/crud/JobCreate";
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
import ResumeRanking from "./pages/resume_ranking/ResumeRanking";
// AI Examination
import AIExamination from "./pages/ai-examination/AIExamination";
// Resume
// import ResumeBuilder from "./pages/resume/ResumeBuilder";
import Letter from "./pages/cover_letter/Letter";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Navbar />

      <Routes>
        <Route exact path="/" element={<Home />} />
        {/* user pages */}
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/logout" element={<Logout />} />
        <Route exact path="/signup" element={<Signup />} />
        <Route exact path="/signup-employer" element={<EmployerSignup />} />
        <Route exact path="/reset-password" element={<ResetPassword />} />
        <Route
          exact
          path="/password/reset/confirm/:uid/:token"
          element={<ResetPasswordConfirm />}
        />
        {/* profile pages */}
        <Route exact path="/profile/seeker" element={<SeekerProfile />} />
        <Route
          exact
          path="/profile/seeker/update"
          element={<SeekerProfileUpdate />}
        />
        <Route
          exact
          path="/profile/seeker/:id"
          element={<ApplicantProfile />}
        />
        <Route
          exact
          path="/profile/employer/:id"
          element={<CompanyProfile />}
        />
        <Route exact path="/profile/employer" element={<EmployerProfile />} />
        <Route
          exact
          path="/profile/employer/update"
          element={<EmployerProfileUpdate />}
        />
        {/* Job pages */}
        <Route exact path="/jobs" element={<JobList />} />
        <Route exact path="/jobs/:id" element={<JobDetail />} />
        <Route exact path="/jobs/:id/update" element={<JobUpdate />} />
        <Route exact path="/jobs/:id/delete" element={<JobDelete />} />
        <Route exact path="/jobs/create" element={<JobCreate />} />
        <Route exact path="/jobs/employer" element={<EmployerJobList />} />
        <Route exact path="/jobs/explore" element={<ScrapedJobList />} />
        <Route exact path="/jobs/bookmarks" element={<BookmarkJobList />} />
        {/* Recommendations */}
        <Route
          exact
          path="/jobs/recommendations"
          element={<RecommendedJobList />}
        />
        {/* Job Applications */}
        <Route
          exact
          path="/jobs/applications"
          element={<SeekerApplicationsList />}
        />
        <Route
          exact
          path="/jobs/:id/applications"
          element={<JobApplicationsList />}
        />
        <Route exact path="/jobs/:id/apply" element={<ApplicationCreate />} />
        {/* Applicant Ranking */}
        <Route
          exact
          path="/jobs/:id/applicant-ranking"
          element={<ResumeRanking />}
        />
        {/* AI Examination */}
        <Route
          exact
          path="/ai-examination/:id"
          element={<AIExamination />}
        />
        {/* Resume */}
        {/* <Route exact path="/resume" element={<ResumeBuilder />} /> */}
        <Route exact path="/cover-letter" element={<Letter />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
