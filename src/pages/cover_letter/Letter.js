import { useState, useRef, useContext } from "react";
// Rich text editor input
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// Print HTML as PDF
import ReactToPrint from "react-to-print";

import AuthContext from "../../context/AuthContext";
import axiosInstance from "../../utils/axios_instance";
import { profile_urls } from "../../utils/config";
import CoverLetter from "./CoverLetter";
import CompanyInput from "./CompnayInput";
import ProfileInput from "./ProfileInput";

const Letter = () => {
  // To refrence the cover letter HTML, used for printing as pdf
  const coverLetterRef = useRef();

  // Input States
  const [activeColor, setActiveColor] = useState("#3437A8");
  const [profile, setProfile] = useState({
    name: "Van Rossum",
    job_title: "Python Developer",
    email: "vanrossum@gmail.com",
    phone: "9824567869",
    address: "New York",
  });
  const [company, setCompany] = useState({
    department: "",
    company_name: "",
    address: "",
  });
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [body, setBody] = useState(
    "<p>Dear Hiring Manager,</p><p>... Letter Body ...</p><p>Sincerely,</p><i>Your Name</i>"
  );

  // If the seeker is logged-in allow to populate some fields with profile data
  const { user } = useContext(AuthContext);
  const handleFetchFromProfile = () => {
    axiosInstance
      .get(profile_urls.SEEKER_PROFILE)
      .then((res) => {
        const { name, email, city, phone_number, bio, job_title } = res.data;
        const newProfile = {
          name: name,
          job_title: job_title,
          email: email,
          phone: phone_number,
          address: city,
        };
        setProfile(newProfile);
        // Create boilerplate letter_body from Profile bio
        if (bio) {
          const letter_body = `<p>Dear Hiring Manager,</p><p> ${bio}</p><p>Sincerely,</p><i>${name}</i>`;
          setBody(letter_body);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleProfileSubmit = (formData) => {
    setProfile({ ...formData });
  };
  const handleCompnaySubmit = (formData) => {
    setCompany({ ...formData });
  };

  return (
    <div className="container cover-letter-input my-5">
      <div className="row">
        <div className="col-md-6">
          {/* Cover Letter, Color Picker and Download Button */}
          <div className="cover-letter-input-card mb-4 border bg-white">
            <div className="d-flex justify-content-between align-items-center p-2">
              <div className="my-3 text-center page-title fs-1">
                Cover Letter
              </div>
              <div className="d-flex align-items-center">
                <span className="my-auto mx-2">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={activeColor}
                    onChange={(e) => setActiveColor(e.target.value)}
                    style={{ display: "inline-block" }}
                  />
                </span>
                <span>
                  <ReactToPrint
                    trigger={() => {
                      return (
                        <button
                          style={{ background: activeColor }}
                          className="btn text-white p-1"
                        >
                          Download{" "}
                          <i
                            className="bi bi-file-earmark-arrow-down-fill fa-lg"
                            role="button"
                          ></i>
                        </button>
                      );
                    }}
                    content={() => coverLetterRef.current}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="accordion" id="accordionExample">
            <div className="accordion-item cover-letter-input-card my-4 mb-4">
              <h2 className="accordion-header" id="headingOne">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  Letter Head
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse"
                aria-labelledby="headingOne"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <div className="border-bottom my-2">
                    <div className="h4">{profile.name}</div>
                    <p className="text-lead">{profile.job_title}</p>
                    <div>
                      <div className="my-1">
                        <i className="bi bi-envelope text-success">{"  "}</i>
                        {profile.email}
                      </div>
                      <div className="my-1">
                        <i className="bi bi-telephone text-success">{"  "}</i>
                        {profile.phone}
                      </div>
                      <div className="my-1">
                        <i className="bi bi-geo-alt-fill text-success">
                          {"  "}
                        </i>
                        {profile.address}
                      </div>
                      {/* If seeker, allow to fetch data from Profile */}
                      {user && !user.is_employer && (
                        <button
                          className="btn btn-outline-primary btn-sm my-2"
                          onClick={handleFetchFromProfile}
                        >
                          Fetch Profile Data
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <ProfileInput
                      profile={profile}
                      handleProfileSubmit={handleProfileSubmit}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="accordion-item cover-letter-input-card my-4 mb-4">
              <h2 className="accordion-header" id="headingTwo">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="false"
                  aria-controls="collapseTwo"
                >
                  Letter Date
                </button>
              </h2>
              <div
                id="collapseTwo"
                className="accordion-collapse collapse"
                aria-labelledby="headingTwo"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  {" "}
                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label">Date</label>
                    <div className="col-sm-10">
                      <input
                        type="date"
                        className="form-control"
                        id="letter-date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="accordion-item cover-letter-input-card my-4 mb-4">
              <h2 className="accordion-header" id="headingThree">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="false"
                  aria-controls="collapseThree"
                >
                  Recipient Details
                </button>
              </h2>
              <div
                id="collapseThree"
                className="accordion-collapse collapse"
                aria-labelledby="headingThree"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <CompanyInput
                    company={company}
                    handleCompnaySubmit={handleCompnaySubmit}
                  />
                </div>
              </div>
            </div>
            <div className="accordion-item cover-letter-input-card my-4 mb-4">
              <h2 className="accordion-header" id="headingFour">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseFour"
                  aria-expanded="false"
                  aria-controls="collapseFour"
                >
                  Body
                </button>
              </h2>
              <div
                id="collapseFour"
                className="accordion-collapse collapse"
                aria-labelledby="headingFour"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body" style={{ height: "400px" }}>
                  <ReactQuill
                    theme="snow"
                    value={body}
                    onChange={setBody}
                    placeholder="Enter letter body here"
                    style={{ height: "300px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Letter Design */}
        <div className="col-md-6">
          <CoverLetter
            ref={coverLetterRef}
            profile={profile}
            date={date}
            company={company}
            body={body}
            activeColor={activeColor}
          />
        </div>
      </div>
    </div>
  );
};

export default Letter;
