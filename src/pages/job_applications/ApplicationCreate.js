import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import AuthContext from "../../context/AuthContext";
import axiosInstance from "../../utils/axios_instance";
import { urls } from "../../utils/config";
import {
  MyFloatingTextInput,
  MyFloatingTextArea,
} from "../../components/Inputs";

const ApplicationCreate = () => {
  const { user } = useContext(AuthContext);

  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);

  const handleSubmit = (formData) => {
    formData = { job: +id, ...formData, resume };
    axiosInstance
      .post(urls.JOB_APPLICATION_CREATE, formData, {
        // Change header to accept file upload
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log("Application sent:", res.data);
        navigate(-1);
      })
      .catch((error) => console.log("Form submit error:", error));
  };

  return (
    <>
      <div className="container">
        <div className="row h-100">
          <div className="col-sm-12 col-md-8 mx-auto mb-2">
            <div className="card">
              <div className="card-body">
                <h2 className="text-center mb-3 page-title">Apply</h2>
                {/* Pass initial values, validation and submit funciton */}
                <Formik
                  initialValues={{
                    name: user ? user.name : "",
                    email: user ? user.email : "",
                    phone_number: "",
                    message: "",
                  }}
                  validationSchema={Yup.object({
                    name: Yup.string().required("Required"),
                    email: Yup.string()
                      .email("Invalid email")
                      .required("Required"),
                    phoneNumber: Yup.number(),
                    message: Yup.string(),
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
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                    />
                    <MyFloatingTextInput
                      label="Phone Number"
                      name="phone_number"
                      type="number"
                      placeholder="Enter your phone number"
                    />

                    <MyFloatingTextArea
                      label="Message"
                      name="message"
                      type="text"
                      placeholder="Enter your message"
                    />

                    <div className="mb-3">
                      <label htmlFor="resume">Resume / Cover Letter</label>
                      <input
                        type="file"
                        className="form-control"
                        id="resume"
                        onChange={(e) => setResume(e.target.files[0])}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Apply
                    </button>
                  </Form>
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationCreate;
