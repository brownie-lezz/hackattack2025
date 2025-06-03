import React, { useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './user.css'; // Assuming user.css contains relevant styling

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

  return (
    <section>
      <div className="main-container container-fluid">
        <motion.div className="row d-flex justify-content-center align-items-center py-5"
          variants={fadeInUp}
          initial='initial'
          animate='animate'>

          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto">
            <div className="card bg-light text-black" style={{ borderRadius: '0.5rem' }}>
              <div className="card-body p-4 text-center">
                <div className="pb-3">
                  <h2 className="fw-bold mb-2 text-uppercase">{user.name}'s Profile</h2>
                  <p className="text-black-50 mb-4">View your profile details</p>

                  <div className="mb-3">
                    <strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                  {/* Add more user details here as needed */}
                  {/* For seeker: job_title, experience, skills, etc. */}
                  {/* For employer: industry, company_size, etc. */}
                  {/* You would fetch full user details here in a real app */}

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