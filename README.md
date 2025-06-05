# Supabase Authentication Setup

This project uses Supabase for authentication. Follow these steps to set up Supabase authentication for this application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in.
2. Create a new project and note your project URL and anon key.

## 2. Configure Environment Variables

1. Update the `.env` file in the project root with your Supabase credentials:

```
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. Set Up Database Tables

1. In the Supabase dashboard, go to the SQL Editor and create the profiles tables:

```sql
-- Create profiles table with common fields and specific fields for each role
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role VARCHAR NOT NULL CHECK (role IN ('seeker', 'employer')),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seeker profiles table for job seekers
CREATE TABLE seeker_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  job_title VARCHAR NOT NULL,
  experience VARCHAR NOT NULL,
  skills JSONB NOT NULL,
  location VARCHAR NOT NULL,
  resume_url VARCHAR NOT NULL
);

-- Create employer profiles table for companies
CREATE TABLE employer_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  industry VARCHAR NOT NULL,
  company_size VARCHAR NOT NULL,
  company_website VARCHAR NOT NULL,
  company_location VARCHAR NOT NULL,
  company_description TEXT NOT NULL,
  contact_person VARCHAR NOT NULL
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  required_skills JSONB NOT NULL,
  company_id UUID NOT NULL REFERENCES profiles(id),
  company_name VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  salary_range VARCHAR,
  job_type VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'shortlisted', 'interview', 'rejected', 'hired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resume_url VARCHAR,
  cover_letter TEXT,
  UNIQUE(job_id, seeker_id)
);

-- Create policies to control access
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Seeker profile policies
CREATE POLICY "Seeker profiles are viewable by everyone." 
  ON seeker_profiles FOR SELECT USING (true);

CREATE POLICY "Seekers can insert their own profile." 
  ON seeker_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Seekers can update their own profile." 
  ON seeker_profiles FOR UPDATE USING (auth.uid() = id);

-- Employer profile policies
CREATE POLICY "Employer profiles are viewable by everyone." 
  ON employer_profiles FOR SELECT USING (true);

CREATE POLICY "Employers can insert their own profile." 
  ON employer_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Employers can update their own profile." 
  ON employer_profiles FOR UPDATE USING (auth.uid() = id);

-- Job policies
CREATE POLICY "Jobs are viewable by everyone." 
  ON jobs FOR SELECT USING (true);

CREATE POLICY "Employers can insert their own jobs." 
  ON jobs FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Employers can update their own jobs." 
  ON jobs FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Employers can delete their own jobs." 
  ON jobs FOR DELETE USING (auth.uid() = company_id);

-- Application policies
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

CREATE POLICY "Employers can update applications for their jobs." 
  ON applications FOR UPDATE USING (EXISTS (
    SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.company_id = auth.uid()
  ));
```

## 4. Set Up Storage for Resumes

1. In the Supabase dashboard, go to Storage:
   - Create a bucket called `resumes`
   - Set the bucket's privacy setting to "Private"

2. Create policies for the resumes bucket:

```sql
-- Allow users to upload their own resumes
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    (bucket_id = 'resumes') AND 
    (auth.uid() = SUBSTRING(name FROM 'users/(.+?)/'))
  );

-- Allow users to read their own resumes
CREATE POLICY "Users can read their own resumes" ON storage.objects
  FOR SELECT USING (
    (bucket_id = 'resumes') AND 
    (auth.uid() = SUBSTRING(name FROM 'users/(.+?)/'))
  );

-- Allow employers to read resumes from job applications
CREATE POLICY "Employers can read resumes from applications" ON storage.objects
  FOR SELECT USING (
    (bucket_id = 'resumes') AND 
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN applications a ON j.id = a.job_id
      WHERE j.company_id = auth.uid() AND a.resume_url = name
    )
  );
```

3. For handling resume uploads from the frontend:

```javascript
// Example of uploading a resume to Supabase Storage
import { supabase } from './supabase';

const uploadResume = async (file, userId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `users/${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (error) throw error;

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return { path: filePath, url: publicUrl };
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};
```

## 5. Configure Authentication Settings

1. In the Supabase dashboard, go to Authentication > Settings:
   - Set the Site URL to your application's URL (e.g., http://localhost:3000)
   - Configure email templates for signup, invitation, and password reset
   - Enable the authentication providers you want to use (Email, Google, etc.)

## 6. Enable Security Features

1. Set up Row Level Security (RLS) for all tables:
   - Go to Database > Tables
   - For each table, click the three dots and select "Edit Table"
   - Enable Row Level Security
   - Apply the policies defined above

## 7. Test Authentication

1. Run the application and test the following flows:
   - Sign up as a Seeker
   - Sign up as an Employer
   - Sign in with both account types
   - Password reset
   - Sign out

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [React Auth Hooks](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui) 