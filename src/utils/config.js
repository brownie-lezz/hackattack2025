const API_URL = "http://localhost:8000/";

const auth_urls = {
  LOGIN: "api/login",
  SIGNUP: "api/signup",
  RESET_PASSWORD: "auth/users/reset_password/",
  RESET_PASSWORD_CONFIRM: "auth/users/reset_password_confirm/",
};

const profile_urls = {
  SEEKER_PROFILE: "api/profile/seeker/",
  EMPLOYER_PROFILE: "api/profile/employer/",
  COMPANY_PROFILE: "api/profile/employer/:id",
  APPLICANT_PROFILE: "api/profile/seeker/:id",
};

const urls = {
  JOB_LIST: "api/jobs/",
  JOB_CREATE: "api/jobs/create/",
  JOB_DETAIL: "api/jobs/:id",
  JOB_UPDATE: "api/jobs/:id/update/",
  JOB_SCRAPED: "api/jobs/scraped/",
  JOB_RECOMMENDED: "api/jobs/recommendations/",
  EMPLOYER_JOBS: "api/jobs/employer/",
  JOB_BOOKMARK: "api/jobs/:job_id/bookmark/",
  JOB_BOOKMARK_DELETE: "api/jobs/:job_id/bookmark/delete/",
  JOB_BOOKMARK_LIST: "api/jobs/bookmarks/",
  JOB_APPLICATION_CREATE: "api/jobs/applications/create/",
  JOB_APPLICATION_DETAIL: "api/jobs/applications/:id/",
  USER_APPLICATIONS: "api/jobs/user-applications/",
  JOB_APPLICATIONS_LIST: "api/jobs/:job_id/applications/",
  JOB_APPLICATIONS_LIST_DOWNLOAD: "api/jobs/:job_id/applications/download/",
  APPLICANT_RANKING: "api/jobs/applicant-ranking/:job_id/",
};

export { API_URL, auth_urls, profile_urls, urls };
