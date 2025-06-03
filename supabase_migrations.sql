-- Migration to add profile picture URL field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR;

-- Migration to add indexes for common query patterns

-- Index on profiles.role for filtering by role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);

-- Index on jobs.company_id for filtering jobs by company
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs (company_id);

-- Index on applications.job_id for filtering applications by job
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications (job_id);

-- Index on applications.seeker_id for filtering applications by seeker
CREATE INDEX IF NOT EXISTS idx_applications_seeker_id ON applications (seeker_id);

-- Index on bookmarks.seeker_id for filtering bookmarks by seeker
CREATE INDEX IF NOT EXISTS idx_bookmarks_seeker_id ON bookmarks (seeker_id);

-- Index on jobs.created_at for sorting jobs by date
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);

-- Index on jobs.location for filtering jobs by location
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs (location);

-- Add timestamp columns if they don't already exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create update_updated_at function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at timestamp automatically
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_seeker_profiles_updated_at ON seeker_profiles;
CREATE TRIGGER trigger_seeker_profiles_updated_at
BEFORE UPDATE ON seeker_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_employer_profiles_updated_at ON employer_profiles;
CREATE TRIGGER trigger_employer_profiles_updated_at
BEFORE UPDATE ON employer_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Add full-text search for jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION jobs_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.requirements, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_jobs_search_update ON jobs;
CREATE TRIGGER trigger_jobs_search_update
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION jobs_search_update();

CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON jobs USING gin(search_vector);

-- Update any existing records
UPDATE jobs SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(requirements, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(location, '')), 'D');

COMMENT ON COLUMN profiles.profile_picture_url IS 'URL to the user''s profile picture in storage'; 