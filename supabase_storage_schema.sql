-- Create resumes bucket for storing user resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

-- Create profile_pictures bucket for storing user profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile_pictures', 'profile_pictures', true);

-- Set up storage policies for resumes (private access)

-- Allow users to upload their own resumes
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    (bucket_id = 'resumes') AND 
    (auth.uid()::text = SUBSTRING(name FROM 'users/([^/]+)/'))
  );

-- Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes" ON storage.objects
  FOR UPDATE USING (
    (bucket_id = 'resumes') AND 
    (auth.uid()::text = SUBSTRING(name FROM 'users/([^/]+)/'))
  );

-- Allow users to read their own resumes
CREATE POLICY "Users can read their own resumes" ON storage.objects
  FOR SELECT USING (
    (bucket_id = 'resumes') AND 
    (auth.uid()::text = SUBSTRING(name FROM 'users/([^/]+)/'))
  );

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    (bucket_id = 'resumes') AND 
    (auth.uid()::text = SUBSTRING(name FROM 'users/([^/]+)/'))
  );

-- Allow employers to read resumes from job applications
CREATE POLICY "Employers can read resumes from applications" ON storage.objects
  FOR SELECT USING (
    (bucket_id = 'resumes') AND 
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.company_id = auth.uid() AND a.resume_url = name
    )
  );

-- Set up storage policies for profile pictures (public access)

-- Allow users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (
    (bucket_id = 'profile_pictures') AND 
    (auth.uid()::text = SUBSTRING(name FROM 'users/([^/]+)/'))
  );

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
  FOR UPDATE USING (
    (bucket_id = 'profile_pictures') AND 
    (auth.uid()::text = SUBSTRING(name FROM 'users/([^/]+)/'))
  );

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
  FOR DELETE USING (
    (bucket_id = 'profile_pictures') AND 
    (auth.uid()::text = SUBSTRING(name FROM 'users/([^/]+)/'))
  );

-- Allow anyone to read profile pictures (since bucket is public)
CREATE POLICY "Anyone can read profile pictures" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile_pictures'
  ); 