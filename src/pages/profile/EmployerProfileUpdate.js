import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import axiosInstance from "../../utils/axios_instance";
import { profile_urls } from "../../utils/config";
import {
  MyFloatingTextInput,
  MyTextArea,
} from "../../components/Inputs";
import "./profile.css";

const EmployerProfileUpdate = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(profile_urls.EMPLOYER_PROFILE)
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = async (formData) => {
    setUploading(true);
    try {
      const response = await axiosInstance.put(profile_urls.EMPLOYER_PROFILE, formData);
      if (response.data) {
        navigate("/profile/employer");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
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
                  <i className="fas fa-building me-2"></i>
                  Edit Company Profile
                </h2>

                <Formik
                  initialValues={{
                    company_name: profile.company_name,
                    company_location: profile.company_location || "",
                    country: profile.country || "",
                    company_description: profile.company_description || "",
                    linkedin: profile.linkedin || "",
                    website: profile.website || "",
                    contact_email: profile.contact_email,
                  }}
                  validationSchema={Yup.object({
                    company_name: Yup.string().required("Required"),
                    contact_email: Yup.string()
                      .email("Invalid email")
                      .required("Required"),
                    company_location: Yup.string(),
                    country: Yup.string(),
                    linkedin: Yup.string().url("Invalid url"),
                    website: Yup.string().url("Invalid url"),
                    company_description: Yup.string(),
                  })}
                  onSubmit={(formData) => {
                    handleSubmit(formData);
                  }}
                >
                  <Form>
                    <div className="form-section">
                      <h3 className="form-section-title">
                        <i className="fas fa-building me-2"></i>
                        Company Information
                      </h3>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Company Name"
                            name="company_name"
                            type="text"
                            placeholder="Enter company name"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Contact Email"
                            name="contact_email"
                            type="email"
                            placeholder="company@example.com"
                            required
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
                            label="Company Location"
                            name="company_location"
                            type="text"
                            placeholder="City, State"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Country"
                            name="country"
                            type="text"
                            placeholder="Country"
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
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="LinkedIn URL"
                            name="linkedin"
                            type="text"
                            placeholder="https://linkedin.com/company/..."
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <MyFloatingTextInput
                            label="Website URL"
                            name="website"
                            type="text"
                            placeholder="https://www.company.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="form-section-title">
                        <i className="fas fa-info-circle me-2"></i>
                        Company Details
                      </h3>
                      <div className="mb-3">
                        <MyTextArea
                          label="Company Description"
                          name="company_description"
                          type="text"
                          placeholder="Tell us about your company..."
                        />
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg px-5"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Save Changes
                          </>
                        )}
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

export default EmployerProfileUpdate;
