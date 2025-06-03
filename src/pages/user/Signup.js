import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axios_instance";
import { auth_urls } from "../../utils/config";
import signupSvg from './signup.svg'
import './user.css'
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("seeker");
  const [error, setError] = useState("");

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Seeker specific fields
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [locationState, setLocationState] = useState(""); // Renamed to avoid conflict with useLocation
  const [resumeUrl, setResumeUrl] = useState("");

  // Employer specific fields
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // Read role from URL query parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && (roleParam === 'seeker' || roleParam === 'employer')) {
      setRole(roleParam);
    } else {
      setRole('seeker'); // Default to seeker if no valid role parameter
    }
  }, [location.search]); // Re-run effect if query parameter changes

  const validateForm = () => {
    if (!email || !password || !name || !phone) {
      setError("Please fill out all required fields.");
      return false;
    }

    if (role === "seeker") {
      if (!jobTitle || !experience || !skills || !locationState || !resumeUrl) {
        setError("Please fill out all required fields for job seeker.");
        return false;
      }
    } else {
      if (!industry || !companySize || !companyWebsite || !companyLocation || !companyDescription || !contactPerson) {
        setError("Please fill out all required fields for employer.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = {
      role,
      email,
      password,
      re_password: password,
      name,
      phone,
      ...(role === "seeker" ? {
        job_title: jobTitle,
        experience,
        skills: skills.split(',').map(skill => skill.trim()),
        location: locationState,
        resume_url: resumeUrl
      } : {
        industry,
        company_size: companySize,
        company_website: companyWebsite,
        company_location: companyLocation,
        company_description: companyDescription,
        contact_person: contactPerson
      })
    };

    axiosInstance
      .post(auth_urls.SIGNUP, formData)
      .then((res) => {
        navigate("/login");
        console.log("New user account created:", name, email);
        setError("");
      })
      .catch((err) => {
        let newErrorMessage = "Email or Password is invalid.";
        if (err.response?.data?.email)
          newErrorMessage = err.response.data.email[0];
        else if (err.response?.data?.password)
          newErrorMessage = err.response.data.password[0];
        setError(newErrorMessage);
      });
  };

  let easeing = [0.6, -0.05, 0.01, 0.99];

  const fadeInUp = {
    initial: {
      y: 60,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: easeing
      }
    }
  };

  return (
    <section>
      <div className="main-container1 container-fluid">
        <motion.div className="row d-flex justify-content-center align-items-center py-2 sign-up"
          variants={fadeInUp}
          initial='initial'
          animate='animate'>
          <div className="panel1 col-6 px-0">
            <div className="description">
              <div className="mb-4">
                <p className="text-light">
                  Already have an account?{" "}
                </p>
                <motion.button className="btn btn-outline-dark btn-md px-3 text-white fw-bold"
                  onClick={() => { navigate('/login') }}
                  whileHover={{ scale: 1.1 }}>
                  Login
                </motion.button>
              </div>
              <div>
                <img src={signupSvg} alt="Not Found" />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 px-0 mx-auto">
            <div className="signin bg-light text-black" style={{ borderRadius: 0.5 + "rem" }}>
              <div className="card-body p-4 text-center">
                <div className="pb-3">
                  <h2 className="fw-bold mb-2 text-uppercase">
                    {role === "seeker" ? "Seeker" : "Employer"} Sign Up
                  </h2>
                  <p className="text-black-50 mb-5">
                    Please enter your details!
                  </p>

                  {/* Role Selection */}
                  <div className="mb-4">
                    <div className="btn-group" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="role"
                        id="seeker"
                        value="seeker"
                        checked={role === "seeker"}
                        onChange={() => setRole("seeker")}
                      />
                      <label className="btn btn-outline-dark" htmlFor="seeker">
                        Job Seeker
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="role"
                        id="employer"
                        value="employer"
                        checked={role === "employer"}
                        onChange={() => setRole("employer")}
                      />
                      <label className="btn btn-outline-dark" htmlFor="employer">
                        Employer
                      </label>
                    </div>
                  </div>

                  {/* Common Fields */}
                  <div className="form-outline form-white mb-4">
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label className="form-label">Email</label>
                  </div>

                  <div className="form-outline form-black mb-3">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === "seeker" ? "Full Name" : "Company Name"}
                      required
                    />
                    <label className="form-label">
                      {role === "seeker" ? "Full Name" : "Company Name"}
                    </label>
                  </div>

                  <div className="form-outline form-black mb-3">
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="form-label">Password</label>
                  </div>

                  <div className="form-outline form-black mb-3">
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <label className="form-label">Phone</label>
                  </div>

                  {/* Role Specific Fields */}
                  {role === "seeker" ? (
                    <>
                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          required
                        />
                        <label className="form-label">Job Title</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="e.g., 3 years"
                          required
                        />
                        <label className="form-label">Experience</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="Enter skills separated by commas"
                          required
                        />
                        <label className="form-label">Skills</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={locationState}
                          onChange={(e) => setLocationState(e.target.value)}
                          required
                        />
                        <label className="form-label">Location</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="url"
                          className="form-control form-control-lg"
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                          required
                        />
                        <label className="form-label">Resume URL</label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          required
                        />
                        <label className="form-label">Industry</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <select
                          className="form-select form-control-lg"
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          required
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501+">501+ employees</option>
                        </select>
                        <label className="form-label">Company Size</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="url"
                          className="form-control form-control-lg"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          required
                        />
                        <label className="form-label">Company Website</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={companyLocation}
                          onChange={(e) => setCompanyLocation(e.target.value)}
                          required
                        />
                        <label className="form-label">Company Location</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <textarea
                          className="form-control form-control-lg"
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          rows="3"
                          required
                        />
                        <label className="form-label">Company Description</label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          required
                        />
                        <label className="form-label">Contact Person</label>
                      </div>
                    </>
                  )}

                  <div className="error text-danger fw-bold mb-3">{error}</div>

                  <motion.button
                    className="btn btn-outline-dark btn-lg px-5"
                    type="submit"
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.1 }}
                  >
                    Sign Up
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Signup;
