import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./profile.css";
import axiosInstance from "../../utils/axios_instance";
import { profile_urls } from "../../utils/config";

const CompanyProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(profile_urls.COMPANY_PROFILE.replace(":id", id))
      .then((res) => {
        // console.table("Res:", res.data);
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

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
              {/* <span className="bg-secondary p-1 px-4 rounded text-white">
                Web Developer
              </span> */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
