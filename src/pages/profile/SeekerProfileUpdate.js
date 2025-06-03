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

const SeekerProfileUpdate = () => {
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
        navigate("/profile/seeker");
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
                  <MyFloatingTextInput
                    label="Name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    required
                  />
                  <MyFloatingTextInput
                    label="Job Title"
                    name="job_title"
                    type="text"
                    placeholder="Eg: Web Developer, Frontend, Data Scientist,.."
                    required
                  />
                  <MyFloatingTextInput
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                  />
                  <MyFloatingTextInput
                    label="Phone Number"
                    name="phone_number"
                    type="text"
                    // placeholder="Enter your phone number"
                  />

                  <MyFloatingTextInput label="City" name="city" type="text" />
                  <MyFloatingTextInput
                    label="Country"
                    name="country"
                    type="text"
                  />
                  <MyFloatingTextInput
                    label="Github URL"
                    name="github"
                    type="text"
                    placeholder="url"
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

                  <MyTextInput
                    label="Skills"
                    name="skills"
                    type="text"
                    placeholder="Enter skills seperated by comma (eg: Web Developer, Data Scientist)"
                  />

                  <MyTextArea label="Bio" name="bio" type="text" />

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

export default SeekerProfileUpdate;
