import supabase from '../utils/supabase';

export const createJob = async (jobData) => {
  if (!supabase) {
    console.error('Supabase client is not initialized (from supabase.js). Cannot create job.');
    // Fallback to mock for local development if Supabase is not configured
    return new Promise(resolve => setTimeout(() => {
      console.log('(Mock) Job submitted because Supabase is not configured:', jobData);
      resolve({ success: true, jobId: 'mock_job_' + Math.random().toString(36).substr(2, 9), data: [jobData] });
    }, 500));
  }

  try {
    // Transform jobData to match the user's current database schema
    const dataToInsert = {
      title: jobData.title,
      description: jobData.description,
      department: jobData.department,
      location: jobData.location,
      job_type: jobData.type,
      experience_level: jobData.experience,

      // User added these columns as JSONB or TEXT
      skills: Array.isArray(jobData.skills) ? jobData.skills : [],
      responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities : [],
      qualifications: Array.isArray(jobData.qualifications) ? jobData.qualifications : [],
      status: jobData.status, // User added this column as TEXT

      salary_range: (jobData.salary && typeof jobData.salary.min === 'number' && typeof jobData.salary.max === 'number')
        ? `${jobData.salary.min}k - ${jobData.salary.max}k${jobData.salary.isMonthly ? '/month' : '/year'}`
        : null,

    };

    console.log("Data being sent to Supabase:", dataToInsert);

    const { data, error } = await supabase
      .from('jobs')
      .insert([dataToInsert])
      .select();

    if (error) {
      console.error('Error creating job in Supabase:', error);
      console.error('Data that caused error:', dataToInsert);
      throw error;
    }

    console.log('Job created successfully in Supabase:', data);
    return { success: true, jobId: data && data.length > 0 ? data[0].id : null, data };
  } catch (error) {
    console.error('Supabase operation failed in createJob:', error);
    return { success: false, error };
  }
};

export const getJobs = async () => {
  if (!supabase) {
    console.error('Supabase client is not initialized (from supabase.js). Cannot fetch jobs.');
    // Fallback to mock for local development
    return new Promise(resolve => setTimeout(() => {
      console.log('(Mock) Fetched jobs because Supabase is not configured.');
      resolve({ success: true, data: [] }); // Return empty array for mock
    }, 500));
  }

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false }); // Fetch latest jobs first

    if (error) {
      console.error('Error fetching jobs from Supabase:', error);
      throw error;
    }
    return { success: true, data };
  } catch (error) {
    console.error('Supabase operation failed in getJobs:', error);
    return { success: false, error, data: [] };
  }
};

export const getJob = async (jobId) => {
  console.log("getJob called with jobId:", jobId);
  if (!supabase) {
    console.error('Supabase client is not initialized (from supabase.js). Cannot fetch job.');
    return new Promise(resolve => setTimeout(() => {
      console.log('(Mock) Fetched job because Supabase is not configured.');
      resolve({ success: true, job: { id: jobId, title: "Mock Job Detail", description: "This is a mock job loaded because Supabase is not configured." } });
    }, 500));
  }

  try {
    console.log("Fetching job from Supabase...");
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single(); // Use .single() if you expect only one row

    if (error) {
      console.error(`Error fetching job ${jobId} from Supabase:`, error);
      throw error;
    }
    console.log("Supabase response:", data);
    return { success: true, job: data };
  } catch (error) {
    console.error('Supabase operation failed in getJob:', error);
    return { success: false, error, job: null };
  }
}; 