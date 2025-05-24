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

const EmployerProfileUpdate = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(profile_urls.EMPLOYER_PROFILE)
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (formData) => {
    axiosInstance
      .put(profile_urls.EMPLOYER_PROFILE, formData)
      .then((res) => {
        navigate("/profile/employer");
      })
      .catch((err) => console.log(err));
  };

  if (!profile) return <></>;

  return (
    <div className="container">
      <div className="row h-100">
        <div className="col-sm-12 col-md-8 mx-auto">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-3">Update Profile</h2>
              {/* Pass initial values, validation and submit funciton */}
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
                    .email("Invalid email"),
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
                  <MyFloatingTextInput
                    label="Company Name"
                    name="company_name"
                    type="text"
                    placeholder="Enter your name"
                    required
                  />

                  <MyFloatingTextInput
                    label="Compnay Location"
                    name="company_location"
                    type="text"
                  />
                  <MyFloatingTextInput
                    label="Country"
                    name="country"
                    type="text"
                  />

                  <MyFloatingTextInput
                    label="LinkedIn URL"
                    name="linkedin"
                    type="text"
                    placeholder="url"
                  />
                  <MyFloatingTextInput
                    label="Website URL"
                    name="website"
                    type="text"
                    placeholder="url"
                  />
                  <MyFloatingTextInput
                    label="Contact Email"
                    name="contact_email"
                    type="email"
                    placeholder="name@example.com"
                  />
                  <MyTextArea
                    label="Company Description"
                    name="company_description"
                    type="text"
                  />

                  <button type="submit" className="btn btn-outline-success">
                    Update
                  </button>
                </Form>
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfileUpdate;
