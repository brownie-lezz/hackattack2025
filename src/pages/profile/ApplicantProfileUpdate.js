import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import axiosInstance from "../../utils/axios_instance";
import { profile_urls } from "../../utils/config";
import {
  MyTextInput,
  MyTextArea,
  MyFloatingTextInput,
} from "../../components/Inputs";
import "./profile.css";

const ApplicantProfileUpdate = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(profile_urls.SEEKER_PROFILE)
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (formData) => {
    axiosInstance
      .put(profile_urls.SEEKER_PROFILE, formData)
      .then((res) => {
        navigate("/profile/applicant");
      })
      .catch((err) => console.log(err));
  };

  if (!profile) return <></>;

  return (
    <div className="profile-page">
      <div className="container-fluid px-4 py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="profile-form">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">
                  <i className="fas fa-user-edit me-2"></i>
                  Edit Profile
                </h2>

                <Formik
                  initialValues={{
                    name: profile.name,
                    email: profile.email,
                    city: profile.city || "",
                    country: profile.country || "",
                    phone_number: profile.phone_number || "",
                    github: profile.github || "",
                    linkedin: profile.linkedin || "",
                    website: profile.website || "",
                    bio: profile.bio || "",
                    job_title: profile.job_title || "",
                    skills: profile.skills || ""
                  }}
                  validationSchema={Yup.object({
                    name: Yup.string().required("Required"),
                    email: Yup.string().email().required("Required"),
                    city: Yup.string(),
                    country: Yup.string(),
                    phoneNumber: Yup.string(),
                    github: Yup.string().url("Enter a valid url"),
                    linkedin: Yup.string().url("Enter a valid url"),
                    website: Yup.string().url("Enter a valid url"),
                    bio: Yup.string(),
                    job_title: Yup.string(),
                    skills: Yup.string(),
                  })}
                  onSubmit={(formData) => {
                    handleSubmit(formData);
                  }}
                >
                  <Form>
                    <div className="form-section">
                      <h3 className="form-section-title">
                        <i className="fas fa-user me-2"></i>
                        Basic Information
                      </h3>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Job Title"
                            name="job_title"
                            type="text"
                            placeholder="Eg: Web Developer, Frontend, Data Scientist,.."
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Phone Number"
                            name="phone_number"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="form-section-title">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        Location
                      </h3>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="City"
                            name="city"
                            type="text"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Country"
                            name="country"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="form-section-title">
                        <i className="fas fa-link me-2"></i>
                        Social Links
                      </h3>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <MyFloatingTextInput
                            label="Github URL"
                            name="github"
                            type="text"
                            placeholder="url"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <MyFloatingTextInput
                            label="LinkedIn URL"
                            name="linkedin"
                            type="text"
                            placeholder="url"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <MyFloatingTextInput
                            label="Website URL"
                            name="website"
                            type="text"
                            placeholder="url"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="form-section-title">
                        <i className="fas fa-tools me-2"></i>
                        Professional Details
                      </h3>
                      <div className="mb-3">
                        <MyTextInput
                          label="Skills"
                          name="skills"
                          type="text"
                          placeholder="Enter skills separated by comma (eg: Web Developer, Data Scientist)"
                        />
                      </div>
                      <div className="mb-3">
                        <MyTextArea
                          label="Bio"
                          name="bio"
                          type="text"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <button type="submit" className="btn btn-primary btn-lg px-5">
                        <i className="fas fa-save me-2"></i>
                        Save Changes
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfileUpdate; 