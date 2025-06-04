/**
 * @typedef {Object} SalaryRange
 * @property {number} min - Minimum salary amount
 * @property {number} max - Maximum salary amount
 * @property {SalaryRange} [suggested] - Suggested salary range from ML model
 * @property {boolean} [isMonthly=true] - Whether the salary is monthly (true) or yearly (false)
 */

/**
 * @typedef {Object} Job
 * @property {string} [id] - Unique identifier
 * @property {string} title - Job title
 * @property {string} description - Job description
 * @property {string} [department] - Department
 * @property {string} [location] - Location 
 * @property {string} [type] - Job type (Full-time, Part-time, etc.)
 * @property {string} [experience] - Experience level
 * @property {string[]} skills - Required skills
 * @property {string[]} responsibilities - Job responsibilities
 * @property {string[]} qualifications - Job qualifications
 * @property {SalaryRange} [salary] - Salary range
 * @property {Array<Object>} [similarJobs] - Similar job postings
 * @property {'Draft'|'Published'|'Archived'} [status] - Job status
 * @property {string} [createdAt] - Creation date
 */

export const DEFAULT_JOB = {
  title: '',
  description: '',
  department: '',
  location: '',
  type: 'Full-time',
  experience: 'Mid-Level',
  skills: [],
  responsibilities: [],
  qualifications: [],
  salary: {
    min: 0,
    max: 0,
    isMonthly: true
  },
  similarJobs: [],
  status: 'Draft'
};

/**
 * Create an initial job object with default values
 * 
 * @returns {Job} Initial job object with default values
 */
export const createInitialJob = () => ({
  ...DEFAULT_JOB,
  id: Date.now().toString(),
  createdAt: new Date().toISOString()
});

export default {}; 