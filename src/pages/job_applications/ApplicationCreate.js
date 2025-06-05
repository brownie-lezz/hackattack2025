import { useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
    <div className="container-fluid py-5 px-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="page-title mb-4">Apply for Job</h2>
              <Formik
                initialValues={{
                  phone_number: "",
                  message: "",
                }}
                validationSchema={Yup.object({
                  phone_number: Yup.string().required("Required"),
                  message: Yup.string().required("Required"),
                })}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <MyFloatingTextInput
                      label="Phone Number"
                      name="phone_number"
                      type="tel"
                    />
                    <MyFloatingTextArea
                      label="Message"
                      name="message"
                      rows="4"
                    />
                    <div className="mb-3">
                      <label htmlFor="resume" className="form-label">
                        Resume
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="resume"
                        onChange={(e) => setResume(e.target.files[0])}
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                    <div className="d-flex justify-content-between">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </button>
                      <Link
                        to={`/jobs/${id}/ai-examination`}
                        className="btn btn-success btn-lg"
                      >
                        Take AI Examination
                      </Link>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCreate;
