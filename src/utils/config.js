// API Base URL
const API_URL = "http://localhost:8000/";

// Supabase configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Supabase table names
const SUPABASE_TABLES = {
  PROFILES: 'profiles',
  SEEKER_PROFILES: 'seeker_profiles',
  EMPLOYER_PROFILES: 'employer_profiles',
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  BOOKMARKS: 'bookmarks'
};

// Supabase storage buckets
const SUPABASE_STORAGE = {
  RESUMES: 'resumes',
  PROFILE_PICTURES: 'profile_pictures'
};

// Backend API endpoints
const API_ENDPOINTS = {
  // Auth
  LOGIN: "api/login",
  SIGNUP: "api/signup",
  RESET_PASSWORD: "api/reset-password",
  RESET_PASSWORD_CONFIRM: "api/reset-password-confirm",

  // Profiles
  SEEKER_PROFILE: "api/profile/seeker",
  EMPLOYER_PROFILE: "api/profile/employer",
  COMPANY_PROFILE: "api/profile/employer/:id",
  APPLICANT_PROFILE: "api/profile/seeker/:id",

  // Jobs
  JOBS: "api/jobs",
  JOB_CREATE: "api/jobs/create",
  JOB_DETAIL: "api/jobs/:id",
  JOB_UPDATE: "api/jobs/:id/update",
  JOB_DELETE: "api/jobs/:id/delete",
  SCRAPED_JOBS: "api/jobs/scraped",
  RECOMMENDED_JOBS: "api/jobs/recommendations",
  EMPLOYER_JOBS: "api/jobs/employer",
  JOB_BOOKMARK: "api/jobs/:job_id/bookmark",
  JOB_BOOKMARK_DELETE: "api/jobs/:job_id/bookmark/delete",
  JOB_BOOKMARK_LIST: "api/jobs/bookmarks",

  // Applications
  JOB_APPLICATIONS: "api/jobs/:id/applications",
  USER_APPLICATIONS: "api/jobs/user-applications",
  APPLICATION_CREATE: "api/jobs/applications/create",
  APPLICATION_DETAIL: "api/jobs/applications/:id",

  // AI Features
  GENERATE_QUESTIONS: "api/generate-questions",
  APPLICANT_RANKING: "api/jobs/applicant-ranking/:id",
  SALARY_PREDICTION: "api/jobs/salary-prediction",
  SIMILAR_JOBS: "api/jobs/similar-jobs"
};

// For backward compatibility
const auth_urls = {
  LOGIN: API_ENDPOINTS.LOGIN,
  SIGNUP: API_ENDPOINTS.SIGNUP,
  RESET_PASSWORD: API_ENDPOINTS.RESET_PASSWORD,
  RESET_PASSWORD_CONFIRM: API_ENDPOINTS.RESET_PASSWORD_CONFIRM,
};

// For backward compatibility
const profile_urls = {
  SEEKER_PROFILE: API_ENDPOINTS.SEEKER_PROFILE,
  EMPLOYER_PROFILE: API_ENDPOINTS.EMPLOYER_PROFILE,
  COMPANY_PROFILE: API_ENDPOINTS.COMPANY_PROFILE,
  APPLICANT_PROFILE: API_ENDPOINTS.APPLICANT_PROFILE,
};

// For backward compatibility
const urls = {
  JOB_LIST: API_ENDPOINTS.JOBS,
  JOB_CREATE: API_ENDPOINTS.JOB_CREATE,
  JOB_DETAIL: API_ENDPOINTS.JOB_DETAIL,
  JOB_UPDATE: API_ENDPOINTS.JOB_UPDATE,
  JOB_SCRAPED: API_ENDPOINTS.SCRAPED_JOBS,
  JOB_RECOMMENDED: API_ENDPOINTS.RECOMMENDED_JOBS,
  EMPLOYER_JOBS: API_ENDPOINTS.EMPLOYER_JOBS,
  JOB_BOOKMARK: API_ENDPOINTS.JOB_BOOKMARK,
  JOB_BOOKMARK_DELETE: API_ENDPOINTS.JOB_BOOKMARK_DELETE,
  JOB_BOOKMARK_LIST: API_ENDPOINTS.JOB_BOOKMARK_LIST,
  JOB_APPLICATION_CREATE: API_ENDPOINTS.APPLICATION_CREATE,
  JOB_APPLICATION_DETAIL: API_ENDPOINTS.APPLICATION_DETAIL,
  USER_APPLICATIONS: API_ENDPOINTS.USER_APPLICATIONS,
  JOB_APPLICATIONS_LIST: API_ENDPOINTS.JOB_APPLICATIONS,
  APPLICANT_RANKING: API_ENDPOINTS.APPLICANT_RANKING,
  SALARY_PREDICTION: API_ENDPOINTS.SALARY_PREDICTION,
  SIMILAR_JOBS: API_ENDPOINTS.SIMILAR_JOBS
};

export {
  API_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_TABLES,
  SUPABASE_STORAGE,
  API_ENDPOINTS,
  // Legacy exports for backward compatibility
  auth_urls,
  profile_urls,
  urls
};
