import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./profile.css";
import axiosInstance from "../../utils/axios_instance";
import { profile_urls } from "../../utils/config";

const ApplicantProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const url = id 
      ? profile_urls.APPLICANT_PROFILE.replace(":id", id)
      : "api/profile/seeker/";
      
    axiosInstance
      .get(url)
      .then((res) => {
        // console.table("Res:", res.data);
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    setUploading(true);
    try {
      // First check if the server is accessible
      await axiosInstance.get(profile_urls.SEEKER_PROFILE);
      
      // If server is accessible, proceed with upload
      const response = await axiosInstance.put(
        profile_urls.SEEKER_PROFILE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );
      
      if (response.data) {
        setProfile(response.data);
        alert('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      
      if (error.code === 'ERR_NETWORK') {
        alert('Unable to connect to the server. Please check if the server is running and try again.');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        alert(`Upload failed: ${error.response.data.detail || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        alert('Error setting up the request. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <></>;

  return (
    <div className="profile-page">
      <div className="container-fluid px-4 py-5">
        <div className="row">
          {/* Left Column - Profile Picture and Basic Info */}
          <div className="col-lg-4">
            <div className="profile-card card shadow-sm">
              <div className="card-body text-center p-4">
                <div className="profile-picture-container mb-4">
                  <img
                    src={profile.profile_picture || "https://via.placeholder.com/200"}
                    className="rounded-circle profile-picture"
                    alt="Profile"
                  />
                  {!id && (
                    <div className="profile-picture-overlay">
                      <label htmlFor="profile-picture-upload" className="btn btn-light btn-sm">
                        {uploading ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-camera"></i>
                        )}
                      </label>
                      <input
                        type="file"
                        id="profile-picture-upload"
                        className="d-none"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        disabled={uploading}
                      />
                    </div>
                  )}
                </div>
                <h2 className="profile-name mb-2">{profile.name}</h2>
                <p className="text-muted mb-3">
                  {profile.job_title || "No job title specified"}
                </p>
                <div className="contact-info mb-4">
                  <p className="mb-1">
                    <i className="fas fa-envelope me-2"></i>
                    {profile.email}
                  </p>
                  {profile.phone_number && (
                    <p className="mb-1">
                      <i className="fas fa-phone me-2"></i>
                      {profile.phone_number}
                    </p>
                  )}
                  {profile.city && profile.country && (
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      {profile.city}, {profile.country}
                    </p>
                  )}
                </div>
                <div className="social-links mb-4">
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fab fa-github"></i>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fas fa-globe"></i>
                    </a>
                  )}
                </div>
                {!id && (
                  <Link
                    to="/profile/applicant/update"
                    className="btn btn-primary btn-lg w-100"
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="col-lg-8">
            <div className="profile-details">
              {/* Bio Section */}
              {profile.bio && (
                <div className="card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h3 className="section-title mb-3">
                      <i className="fas fa-user me-2"></i>
                      About Me
                    </h3>
                    <p className="profile-bio">{profile.bio}</p>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {profile.skills && (
                <div className="card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h3 className="section-title mb-3">
                      <i className="fas fa-tools me-2"></i>
                      Skills
                    </h3>
                    <div className="skills-container">
                      {profile.skills.split(',').map((skill, index) => (
                        <span key={index} className="skill-badge">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfile;
