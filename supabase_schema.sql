-- Create profiles table with common fields
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role VARCHAR NOT NULL CHECK (role IN ('seeker', 'employer')),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seeker profiles table for job seekers
CREATE TABLE seeker_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  job_title VARCHAR,
  experience VARCHAR,
  skills JSONB DEFAULT '[]'::jsonb,
  location VARCHAR,
  resume_url VARCHAR
);

-- Create employer profiles table for companies
CREATE TABLE employer_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  industry VARCHAR,
  company_size VARCHAR,
  company_website VARCHAR,
  company_location VARCHAR,
  company_description TEXT,
  contact_person VARCHAR
);

-- Jobs table (for reference - already mentioned in the config)
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  company_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  requirements TEXT,
  salary_range VARCHAR,
  location VARCHAR,
  job_type VARCHAR,
  experience_level VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Applications table (for reference - already mentioned in the config)
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url VARCHAR,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmarks table for saved jobs
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Set up profile policies
CREATE POLICY "Profiles are viewable by the owner." 
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Set up seeker profile policies
CREATE POLICY "Seeker profiles are viewable by the owner." 
  ON seeker_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Seeker profiles are viewable by employers with applications."
  ON seeker_profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.seeker_id = seeker_profiles.id AND j.company_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own seeker profile." 
  ON seeker_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own seeker profile." 
  ON seeker_profiles FOR UPDATE USING (auth.uid() = id);

-- Set up employer profile policies
CREATE POLICY "Employer profiles are viewable by everyone." 
  ON employer_profiles FOR SELECT USING (true);

CREATE POLICY "Employers can insert their own profile." 
  ON employer_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Employers can update their own profile." 
  ON employer_profiles FOR UPDATE USING (auth.uid() = id);

-- Set up job policies
CREATE POLICY "Jobs are viewable by everyone." 
  ON jobs FOR SELECT USING (true);

CREATE POLICY "Employers can insert their own jobs." 
  ON jobs FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Employers can update their own jobs." 
  ON jobs FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Employers can delete their own jobs." 
  ON jobs FOR DELETE USING (auth.uid() = company_id);

-- Set up application policies
CREATE POLICY "Employers can view applications for their jobs." 
  ON applications FOR SELECT USING (EXISTS (
    SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.company_id = auth.uid()
  ));

CREATE POLICY "Seekers can view their own applications." 
  ON applications FOR SELECT USING (auth.uid() = seeker_id);

CREATE POLICY "Seekers can insert their own applications." 
  ON applications FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Seekers can update their own applications." 
  ON applications FOR UPDATE USING (auth.uid() = seeker_id);

-- Set up bookmark policies
CREATE POLICY "Users can view their own bookmarks." 
  ON bookmarks FOR SELECT USING (auth.uid() = seeker_id);

CREATE POLICY "Users can insert their own bookmarks." 
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Users can delete their own bookmarks." 
  ON bookmarks FOR DELETE USING (auth.uid() = seeker_id); 