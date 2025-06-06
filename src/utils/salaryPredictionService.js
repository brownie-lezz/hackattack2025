/**
 * Service to interact with the Salary Prediction API
 */
import { API_URL, API_ENDPOINTS } from './config';

/**
 * Maps frontend experience levels to the model's expected format
 */
const mapExperienceLevel = (experience) => {
  const map = {
    'Internship': 'Internship',
    'Entry-Level': 'Entry level',
    'Junior': 'Entry level',
    'Mid-Level': 'Associate',
    'Senior': 'Mid-Senior level',
    'Lead': 'Mid-Senior level',
    'Manager': 'Director',
    'Director': 'Director',
    'Executive': 'Executive'
  };
  return map[experience] || 'Entry level';
};

/**
 * Maps frontend work types to the model's expected format
 */
const mapWorkType = (type) => {
  const map = {
    'Full-time': 'Full-time',
    'Part-time': 'Part-time',
    'Contract': 'Contract',
    'Temporary': 'Temporary',
    'Internship': 'Internship'
  };
  return map[type] || 'Full-time';
};

/**
 * Format skills array to string
 */
const formatSkills = (skills) => {
  return Array.isArray(skills) ? skills.join(', ') : '';
};

/**
 * Test the API connection
 */
export const testApiConnection = async () => {
  try {
    console.log("Testing API connection...");
    // Handle potential trailing slash in API_URL
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const response = await fetch(`${baseUrl}/api/test`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API test failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("API test result:", result);
    return true;
  } catch (error) {
    console.error('API connection test error:', error);
    return false;
  }
};

/**
 * Get salary prediction from the ML model
 */
export const getSalaryPrediction = async (jobData) => {
  try {
    console.log("getSalaryPrediction called with data:", jobData);

    // Test connection first
    const connectionOk = await testApiConnection();
    if (!connectionOk) {
      console.warn("API connection test failed, using fallback data");
      throw new Error("API connection failed");
    }

    // Format request data to match the model's expected input
    const requestData = {
      title: jobData.title || '',
      location: jobData.location || 'Remote',
      workType: mapWorkType(jobData.type || 'Full-time'),
      experienceLevel: mapExperienceLevel(jobData.experience || 'Mid-Level'),
      industry: jobData.department || 'Technology',
      skills: jobData.skills || [],
      education: jobData.qualifications?.find(q =>
        q.toLowerCase().includes('degree') || q.toLowerCase().includes('education')
      ) || '',
      certification: jobData.qualifications?.find(q =>
        q.toLowerCase().includes('certification') || q.toLowerCase().includes('license')
      ) || '',
      experience: jobData.qualifications?.find(q =>
        q.toLowerCase().includes('year') || q.toLowerCase().includes('experience')
      ) || '',
      remote: jobData.location?.toLowerCase().includes('remote') || false,
      companySize: 500, // Default value
      as_monthly: true
    };

    // Handle potential trailing slash in API_URL
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const endpoint = API_ENDPOINTS.SALARY_PREDICTION.startsWith('/') ?
      API_ENDPOINTS.SALARY_PREDICTION :
      '/' + API_ENDPOINTS.SALARY_PREDICTION;

    console.log("Making API call to:", `${baseUrl}${endpoint}`);
    console.log("With request data:", requestData);

    // Production API call with improved CORS handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Try the most compatible fetch options
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin',
        body: JSON.stringify(requestData),
        signal: controller.signal
      };

      console.log("Using fetch options:", fetchOptions);
      const response = await fetch(`${baseUrl}${endpoint}`, fetchOptions);

      clearTimeout(timeoutId);
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("API result:", result);

      if (result.success) {
        return {
          estimatedSalary: result.monthly || result.estimatedSalary,
          salaryValue: result.salaryValue,
          isMonthly: true
        };
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Fetch error in getSalaryPrediction:", fetchError);
      throw fetchError; // Still throw to trigger fallback
    }
  } catch (error) {
    console.error('Salary prediction error:', error);
    // Return a default fallback value as monthly salary
    const defaultMonthlySalary = 75000 / 12;
    return {
      estimatedSalary: `$${Math.round(defaultMonthlySalary).toLocaleString()}/month`,
      salaryValue: Math.round(defaultMonthlySalary / 1000),
      isMonthly: true
    };
  }
};

/**
 * Get similar job postings from the API
 */
export const getSimilarJobs = async (jobData) => {
  try {
    console.log("getSimilarJobs called with data:", jobData);

    // Test connection first
    const connectionOk = await testApiConnection();
    if (!connectionOk) {
      console.warn("API connection test failed, using fallback data");
      return getMockSimilarJobs();
    }

    // Prepare request data
    const requestData = {
      title: jobData.title || '',
      location: jobData.location || 'Remote',
      keywords: formatSkills(jobData.skills || []),
      workType: jobData.type || 'Full-time'
    };

    // Handle potential trailing slash in API_URL
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const endpoint = API_ENDPOINTS.SIMILAR_JOBS.startsWith('/') ?
      API_ENDPOINTS.SIMILAR_JOBS :
      '/' + API_ENDPOINTS.SIMILAR_JOBS;

    console.log("Making API call to:", `${baseUrl}${endpoint}`);
    console.log("With request data:", requestData);

    // Production API call with extended timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Try the most compatible fetch options first
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin',
        body: JSON.stringify(requestData),
        signal: controller.signal
      };

      console.log("Using fetch options:", fetchOptions);
      const response = await fetch(`${baseUrl}${endpoint}`, fetchOptions);

      clearTimeout(timeoutId);
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const results = await response.json();
      console.log("API results:", results);

      return Array.isArray(results) ? results : [];
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Fetch error in getSimilarJobs:", fetchError);

      // If we get a CORS error, try again with alternative approach or fall back to mock data
      console.log("Falling back to mock data due to fetch error");
      return getMockSimilarJobs();
    }

  } catch (error) {
    console.error('Similar jobs error:', error);
    return getMockSimilarJobs(); // Return mock data on error
  }
};

/**
 * Get mock similar jobs for fallback
 */
const getMockSimilarJobs = () => {
  return [
    {
      title: "Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      salary: { min: 10, max: 15 },
      url: "#",
      skills: ["JavaScript", "Python", "React"]
    },
    {
      title: "Frontend Developer",
      company: "Microsoft",
      location: "Seattle, WA",
      salary: { min: 9, max: 13 },
      url: "#",
      skills: ["JavaScript", "CSS", "React"]
    },
    {
      title: "Backend Developer",
      company: "Amazon",
      location: "Remote",
      salary: { min: 10, max: 14 },
      url: "#",
      skills: ["Python", "Django", "AWS"]
    }
  ];
}; 