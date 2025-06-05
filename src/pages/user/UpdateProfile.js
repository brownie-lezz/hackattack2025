import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import FileUpload from '../../components/FileUpload';
import { motion } from 'framer-motion';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Common fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  
  // Seeker specific fields
  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  
  // Employer specific fields
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  
  // Animation settings
  const easeing = [0.6, -0.05, 0.01, 0.99];
  const fadeInUp = {
    initial: {
      y: 60,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: easeing
      }
    }
  };
  
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Populate form fields with user data
    setName(user.name || '');
    setPhone(user.phone || '');
    setProfilePictureUrl(user.profile_picture_url || '');
    
    if (user.role === 'seeker') {
      setJobTitle(user.job_title || '');
      setExperience(user.experience || '');
      setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''));
      setLocation(user.location || '');
      setResumeUrl(user.resume_url || '');
    } else if (user.role === 'employer') {
      setIndustry(user.industry || '');
      setCompanySize(user.company_size || '');
      setCompanyWebsite(user.company_website || '');
      setCompanyLocation(user.company_location || '');
      setCompanyDescription(user.company_description || '');
      setContactPerson(user.contact_person || '');
    }
  }, [user, navigate]);
  
  const handleProfilePictureUpload = (url) => {
    setProfilePictureUrl(url);
    setSuccess('Profile picture uploaded successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const handleResumeUpload = (url) => {
    setResumeUrl(url);
    setSuccess('Resume uploaded successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      let profileData = {
        name,
        phone,
        profile_picture_url: profilePictureUrl
      };
      
      if (user.role === 'seeker') {
        profileData = {
          ...profileData,
          job_title: jobTitle,
          experience,
          skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
          location,
          resume_url: resumeUrl
        };
      } else if (user.role === 'employer') {
        profileData = {
          ...profileData,
          industry,
          company_size: companySize,
          company_website: companyWebsite,
          company_location: companyLocation,
          company_description: companyDescription,
          contact_person: contactPerson
        };
      }
      
      const { error } = await updateProfile(profileData);
      
      if (error) throw error;
      
      setSuccess('Profile updated successfully!');
      
      // Redirect to profile page after short delay
      setTimeout(() => {
        navigate(user.role === 'seeker' ? '/profile/seeker' : '/profile/employer');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return <div className="text-center p-5">Loading...</div>;
  }
  
  return (
    <section>
      <div className="container-fluid py-5">
        <motion.div 
          className="row justify-content-center"
          variants={fadeInUp}
          initial='initial'
          animate='animate'
        >
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card bg-light">
              <div className="card-body p-4">
                <h2 className="card-title text-center mb-4">Update Your Profile</h2>
                
                {success && (
                  <div className="alert alert-success mb-4" role="alert">
                    {success}
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger mb-4" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="row mb-4">
                    <div className="col-12 col-md-6">
                      {/* Common Fields */}
                      <h4 className="mb-3">Basic Information</h4>
                      
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          {user.role === 'seeker' ? 'Full Name' : 'Company Name'}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      
                      <FileUpload
                        type="profile_picture"
                        userId={user.id}
                        onUploadSuccess={handleProfilePictureUpload}
                        onUploadError={handleUploadError}
                        accept="image/*"
                        currentFileUrl={profilePictureUrl}
                      />
                    </div>
                    
                    <div className="col-12 col-md-6">
                      {/* Role Specific Fields */}
                      {user.role === 'seeker' ? (
                        <>
                          <h4 className="mb-3">Professional Information</h4>
                          
                          <div className="mb-3">
                            <label htmlFor="jobTitle" className="form-label">Job Title</label>
                            <input
                              type="text"
                              className="form-control"
                              id="jobTitle"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="experience" className="form-label">Experience</label>
                            <input
                              type="text"
                              className="form-control"
                              id="experience"
                              placeholder="e.g., 3 years"
                              value={experience}
                              onChange={(e) => setExperience(e.target.value)}
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="skills" className="form-label">Skills</label>
                            <input
                              type="text"
                              className="form-control"
                              id="skills"
                              placeholder="Separate skills with commas"
                              value={skills}
                              onChange={(e) => setSkills(e.target.value)}
                            />
                            <small className="form-text text-muted">
                              Enter skills separated by commas (e.g., HTML, CSS, JavaScript)
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="location" className="form-label">Location</label>
                            <input
                              type="text"
                              className="form-control"
                              id="location"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                            />
                          </div>
                          
                          <FileUpload
                            type="resume"
                            userId={user.id}
                            onUploadSuccess={handleResumeUpload}
                            onUploadError={handleUploadError}
                            accept=".pdf,.doc,.docx"
                            currentFileUrl={resumeUrl}
                          />
                        </>
                      ) : (
                        <>
                          <h4 className="mb-3">Company Information</h4>
                          
                          <div className="mb-3">
                            <label htmlFor="industry" className="form-label">Industry</label>
                            <input
                              type="text"
                              className="form-control"
                              id="industry"
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="companySize" className="form-label">Company Size</label>
                            <select
                              className="form-select"
                              id="companySize"
                              value={companySize}
                              onChange={(e) => setCompanySize(e.target.value)}
                            >
                              <option value="">Select company size</option>
                              <option value="1-10">1-10 employees</option>
                              <option value="11-50">11-50 employees</option>
                              <option value="51-200">51-200 employees</option>
                              <option value="201-500">201-500 employees</option>
                              <option value="501+">501+ employees</option>
                            </select>
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="companyWebsite" className="form-label">Company Website</label>
                            <input
                              type="url"
                              className="form-control"
                              id="companyWebsite"
                              value={companyWebsite}
                              onChange={(e) => setCompanyWebsite(e.target.value)}
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="companyLocation" className="form-label">Company Location</label>
                            <input
                              type="text"
                              className="form-control"
                              id="companyLocation"
                              value={companyLocation}
                              onChange={(e) => setCompanyLocation(e.target.value)}
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="companyDescription" className="form-label">Company Description</label>
                            <textarea
                              className="form-control"
                              id="companyDescription"
                              rows="3"
                              value={companyDescription}
                              onChange={(e) => setCompanyDescription(e.target.value)}
                            ></textarea>
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="contactPerson" className="form-label">Contact Person</label>
                            <input
                              type="text"
                              className="form-control"
                              id="contactPerson"
                              value={contactPerson}
                              onChange={(e) => setContactPerson(e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-md-2"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UpdateProfile; 