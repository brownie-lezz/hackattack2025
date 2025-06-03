# Supabase Database Setup for TalentVerse

This document explains how to set up the Supabase database for the TalentVerse job platform. The application uses Supabase for authentication, data storage, and file storage.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- A new or existing Supabase project
- SQL Editor access in the Supabase dashboard

## Setup Steps

### 1. Configure Environment Variables

Create or update your `.env` file with your Supabase credentials:

```
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Tables Setup

Execute the SQL commands in the `supabase_schema.sql` file in the Supabase SQL Editor. This will create the following tables:

- `profiles`: Common user profile information
- `seeker_profiles`: Job seeker specific information 
- `employer_profiles`: Employer specific information
- `jobs`: Job listings
- `applications`: Job applications
- `bookmarks`: Saved jobs

The SQL script also sets up Row Level Security (RLS) policies to control access to the data.

### 3. Storage Setup

Execute the SQL commands in the `supabase_storage_schema.sql` file to create and configure storage buckets:

- `resumes`: Private bucket for storing user resume files
- `profile_pictures`: Public bucket for storing profile images

The script also sets up appropriate access policies for these buckets.

### 4. Authentication Settings

1. In the Supabase dashboard, go to Authentication → Settings:
   - Set the Site URL to your application's URL (e.g., http://localhost:3000)
   - Configure email templates for signup, invitation, and password reset
   - Enable email provider and any additional providers you want (Google, GitHub, etc.)

2. Configure Auth Redirect URLs:
   - Add your application's domain(s) to the allowed redirect URLs list
   - For local development, add `http://localhost:3000`

### 5. Verify Setup

After completing the setup:

1. Check that all database tables have been created
2. Verify that storage buckets are set up correctly
3. Test user signup and authentication flow
4. Confirm that Row Level Security is working as expected

## Database Structure

### User Profiles

Users are divided into two roles:

- **Job Seekers**: Users looking for employment
- **Employers**: Companies or recruiters posting jobs

Common profile data is stored in the `profiles` table, while role-specific data is stored in `seeker_profiles` or `employer_profiles`.

### Jobs and Applications

- Jobs are created by employers
- Job seekers can apply to jobs, creating applications
- Job seekers can bookmark jobs for later

## Security

The database uses Row Level Security to ensure:

- Users can only access and modify their own profiles
- Employers can only manage their own jobs and view applications to their jobs
- Job seekers can only manage their own applications and bookmarks

## Troubleshooting

If you encounter issues:

1. Check that all SQL commands executed without errors
2. Verify that RLS policies are correctly enabled
3. Ensure that environment variables are properly configured
4. Check browser console for any authentication or API errors 