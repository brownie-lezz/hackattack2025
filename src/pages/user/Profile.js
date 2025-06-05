import React, { useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './user.css'; // Assuming user.css contains relevant styling
import ProfilePicture from '../../components/ProfilePicture';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if no user is logged in
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Animation settings (can be reused from other components)
  let easeing = [0.6, -0.05, 0.01, 0.99];
  const fadeInUp = {
    initial: {
      y: 60,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: easeing
      }
    }
  };

  if (!user) {
    // Optionally render a loading state or nothing while redirecting
    return <div>Loading profile...</div>; 
  }

  // Check if the profile has any missing required fields
  const hasIncompleteProfile = () => {
    if (user.role === 'seeker') {
      // For job seekers, check if important fields are missing
      return !user.job_title || !user.experience || !user.skills || !user.location || !user.resume_url;
    } else if (user.role === 'employer') {
      // For employers, check if important fields are missing
      return !user.industry || !user.company_size || !user.company_website || !user.company_location || !user.company_description;
    }
    return false;
  };

  return (
    <section>
      <div className="main-container container-fluid">
        <motion.div className="row d-flex justify-content-center align-items-center py-5"
          variants={fadeInUp}
          initial='initial'
          animate='animate'>

          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto">
            <div className="card bg-light text-black" style={{ borderRadius: '0.5rem' }}>
              <div className="card-body p-4">
                
                {/* Profile header with image */}
                <div className="text-center mb-4">
                  <ProfilePicture
                    url={user.profile_picture_url}
                    name={user.name}
                    size="lg"
                  />
                  <h2 className="fw-bold mb-2">{user.name}</h2>
                  <p className="text-muted mb-4">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                </div>

                <div className="mb-4">
                  <strong>Email:</strong> {user.email}
                </div>

                {user.phone && (
                  <div className="mb-4">
                    <strong>Phone:</strong> {user.phone}
                  </div>
                )}

                {/* Role-specific fields */}
                {user.role === 'seeker' && (
                  <div>
                    <h4 className="mt-4 mb-3">Job Seeker Information</h4>
                    
                    {user.job_title ? (
                      <div className="mb-3">
                        <strong>Job Title:</strong> {user.job_title}
                      </div>
                    ) : null}
                    
                    {user.experience ? (
                      <div className="mb-3">
                        <strong>Experience:</strong> {user.experience}
                      </div>
                    ) : null}
                    
                    {user.skills && user.skills.length > 0 ? (
                      <div className="mb-3">
                        <strong>Skills:</strong> {Array.isArray(user.skills) ? user.skills.join(', ') : user.skills}
                      </div>
                    ) : null}
                    
                    {user.location ? (
                      <div className="mb-3">
                        <strong>Location:</strong> {user.location}
                      </div>
                    ) : null}
                    
                    {user.resume_url ? (
                      <div className="mb-3">
                        <strong>Resume:</strong> <a href={user.resume_url} target="_blank" rel="noopener noreferrer">View Resume</a>
                      </div>
                    ) : null}
                  </div>
                )}

                {user.role === 'employer' && (
                  <div>
                    <h4 className="mt-4 mb-3">Employer Information</h4>
                    
                    {user.industry ? (
                      <div className="mb-3">
                        <strong>Industry:</strong> {user.industry}
                      </div>
                    ) : null}
                    
                    {user.company_size ? (
                      <div className="mb-3">
                        <strong>Company Size:</strong> {user.company_size}
                      </div>
                    ) : null}
                    
                    {user.company_website ? (
                      <div className="mb-3">
                        <strong>Website:</strong> <a href={user.company_website} target="_blank" rel="noopener noreferrer">{user.company_website}</a>
                      </div>
                    ) : null}
                    
                    {user.company_location ? (
                      <div className="mb-3">
                        <strong>Location:</strong> {user.company_location}
                      </div>
                    ) : null}
                    
                    {user.company_description ? (
                      <div className="mb-3">
                        <strong>Description:</strong> {user.company_description}
                      </div>
                    ) : null}
                    
                    {user.contact_person ? (
                      <div className="mb-3">
                        <strong>Contact Person:</strong> {user.contact_person}
                      </div>
                    ) : null}
                  </div>
                )}

                {hasIncompleteProfile() && (
                  <div className="alert alert-info mt-4">
                    <strong>Complete your profile</strong>
                    <p>Some profile information is missing. Completing your profile helps you get the most out of our platform.</p>
                  </div>
                )}

                <div className="d-flex justify-content-center mt-4">
                  <Link to={user.role === 'seeker' ? "/profile/seeker/update" : "/profile/employer/update"} className="btn btn-outline-primary">
                    Update Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Profile; 