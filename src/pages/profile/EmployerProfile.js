import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./profile.css";
import axiosInstance from "../../utils/axios_instance";

const EmployerProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("api/profile/employer/")
      .then((res) => {
        // console.table("Res:", res.data);
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  if (!profile) return <></>;

  return (
    <div className="container mt-5">
      <div className="row d-flex justify-content-center">
        <div className="col-md-7">
          <div className="profile-card card p-3 py-4">
            {/* <div className="text-center">
              <img
                src="https://via.placeholder.com/100"
                className="rounded-circle"
                alt="Profile Pic"
              />
            </div> */}

            <div className="text-center mt-3">
              <h5 className="mt-2 mb-0 page-title">{profile.company_name}</h5>
              <p className="small text-muted">{profile.contact_email}</p>
              <span>
                {profile.company_location}, {profile.country}
              </span>

              {profile.company_description && (
                <div className="px-4 mt-1">
                  <p className="profile-fonts">{profile.company_description}</p>
                </div>
              )}

              <ul className="social-list">
                <li>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa fa-linkedin"></i>
                  </a>
                </li>
                <li>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa fa-globe"></i>
                  </a>
                </li>
              </ul>
              <Link
                to="/profile/employer/update"
                className="profile-btn btn btn-outline-primary px-4"
              >
                Update
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
