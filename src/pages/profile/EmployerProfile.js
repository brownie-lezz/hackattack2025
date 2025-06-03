import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./profile.css";
import axiosInstance from "../../utils/axios_instance";
import { profile_urls } from "../../utils/config";

const EmployerProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const url = id 
      ? profile_urls.COMPANY_PROFILE.replace(":id", id)
      : "api/profile/employer/";
      
    axiosInstance
      .get(url)
      .then((res) => {
        // console.table("Res:", res.data);
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!profile) return <></>;

  return (
    <div className="profile-page">
      <div className="container-fluid px-4 py-5">
        <div className="row">
          {/* Left Column - Company Info */}
          <div className="col-lg-4">
            <div className="profile-card card shadow-sm">
              <div className="card-body text-center p-4">
                <div className="company-logo-container mb-4">
                  <img
                    src={profile.company_logo || "https://via.placeholder.com/200"}
                    className="rounded-circle company-logo"
                    alt="Company Logo"
                  />
                </div>
                <h2 className="profile-name mb-2">{profile.company_name}</h2>
                <p className="text-muted mb-3">
                  <i className="fas fa-envelope me-2"></i>
                  {profile.contact_email}
                </p>
                <div className="contact-info mb-4">
                  {profile.company_location && profile.country && (
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      {profile.company_location}, {profile.country}
                    </p>
                  )}
                </div>
                <div className="social-links mb-4">
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
                    to="/profile/employer/update"
                    className="btn btn-primary btn-lg w-100"
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Company Details */}
          <div className="col-lg-8">
            <div className="profile-details">
              {/* Company Description Section */}
              {profile.company_description && (
                <div className="card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h3 className="section-title mb-3">
                      <i className="fas fa-building me-2"></i>
                      About Company
                    </h3>
                    <p className="profile-bio">{profile.company_description}</p>
                  </div>
                </div>
              )}

              {/* Posted Jobs Section - You can add this if you have job listings */}
              <div className="card shadow-sm mb-4">
                <div className="card-body p-4">
                  <h3 className="section-title mb-3">
                    <i className="fas fa-briefcase me-2"></i>
                    Posted Jobs
                  </h3>
                  <div className="text-center text-muted">
                    <i className="fas fa-briefcase fa-3x mb-3"></i>
                    <p>No jobs posted yet</p>
                    {!id && (
                      <Link to="/jobs/create" className="btn btn-outline-primary">
                        <i className="fas fa-plus me-2"></i>
                        Post a Job
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
