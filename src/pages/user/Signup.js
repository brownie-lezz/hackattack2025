import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import signupSvg from './signup.svg'
import './user.css'
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useContext(AuthContext);
  
  const [role, setRole] = useState("seeker");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Add validation states
  const [emailValid, setEmailValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0: none, 1: weak, 2: medium, 3: strong

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

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const checkPasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail(email);
    setEmailValid(isEmailValid);
    
    if (!isEmailValid || !email || !password || !name) {
      setError("Please fill out all required fields correctly.");
      return false;
    }
    
    if (passwordStrength < 2) {
      setError("Please use a stronger password.");
      return false;
    }
    
    // All other fields are now optional as requested
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      let userData;
      
      if (role === "seeker") {
        userData = {
          role,
          name,
          phone: phone || '',
          job_title: jobTitle || '',
          experience: experience || '',
          skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
          location: locationState || '',
          resume_url: resumeUrl || ''
        };
      } else {
        userData = {
          role,
          name,
          phone: phone || '',
          industry: industry || '',
          company_size: companySize || '',
          company_website: companyWebsite || '',
          company_location: companyLocation || '',
          company_description: companyDescription || '',
          contact_person: contactPerson || ''
        };
      }
      
      const { data, error } = await signUp(email, password, userData);
      
      if (error) throw error;
      
      // Success - redirect to login page with a message
      navigate("/login", { 
        state: { 
          message: "Account created successfully! A confirmation email has been sent to your email address. Please verify your email before logging in." 
        }
      });
      setError("");
    } catch (err) {
      let newErrorMessage = "Registration failed.";
      if (err.message) {
        newErrorMessage = err.message;
      }
      setError(newErrorMessage);
    } finally {
      setLoading(false);
    }
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

  // Update email validation when email changes
  useEffect(() => {
    if (email) {
      setEmailValid(validateEmail(email));
    }
  }, [email]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

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
                  <p className="text-black-50 mb-3">
                    Please enter your details!
                  </p>
                  <p className="text-black-50 mb-4">
                    <small>Fields marked with * are required. All other fields are optional and can be filled out later on your profile page.</small>
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

                  <div className="alert alert-info mb-4">
                    <small>
                      <strong>Quick signup:</strong> Fill in the required fields (*) now, and complete your profile details later in your account settings.
                    </small>
                  </div>

                  {/* Common Fields */}
                  <div className="form-outline form-white mb-4">
                    <input
                      type="email"
                      className={`form-control form-control-lg ${email && !emailValid ? 'is-invalid' : ''}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label className="form-label">Email <span className="text-danger">*</span></label>
                    <small className="text-muted">Required for login and notifications</small>
                    {email && !emailValid && (
                      <div className="invalid-feedback">Please enter a valid email address.</div>
                    )}
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
                      {role === "seeker" ? "Full Name " : "Company Name "}
                      <span className="text-danger">*</span>
                    </label>
                    <small className="text-muted">
                      {role === "seeker" 
                        ? "Your name as it will appear on your profile" 
                        : "Your company name as it will appear on job listings"}
                    </small>
                  </div>

                  <div className="form-outline form-black mb-3">
                    <input
                      type="password"
                      className={`form-control form-control-lg ${password ? (passwordStrength < 2 ? 'is-invalid' : 'is-valid') : ''}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="form-label">Password <span className="text-danger">*</span></label>
                    <small className="text-muted">Choose a secure password</small>
                    
                    {password && (
                      <div className={passwordStrength < 2 ? "invalid-feedback" : "valid-feedback"}>
                        {passwordStrength === 0 && "Password is too weak. Use at least 8 characters."}
                        {passwordStrength === 1 && "Password is weak. Add uppercase letters and numbers or symbols."}
                        {passwordStrength === 2 && "Password strength is good."}
                        {passwordStrength === 3 && "Password strength is excellent!"}
                      </div>
                    )}
                    
                    {password && (
                      <div className="password-strength-meter mt-2">
                        <div className="progress" style={{ height: "5px" }}>
                          <div 
                            className={`progress-bar ${
                              passwordStrength === 1 ? 'bg-danger' : 
                              passwordStrength === 2 ? 'bg-warning' : 
                              passwordStrength === 3 ? 'bg-success' : ''
                            }`} 
                            role="progressbar" 
                            style={{ width: `${passwordStrength * 33.33}%` }}
                            aria-valuenow={passwordStrength * 33.33} 
                            aria-valuemin="0" 
                            aria-valuemax="100">
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-outline form-black mb-3">
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <label className="form-label">Phone <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
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
                        />
                        <label className="form-label">Job Title <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="e.g., 3 years"
                        />
                        <label className="form-label">Experience <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="Enter skills separated by commas"
                        />
                        <label className="form-label">Skills <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={locationState}
                          onChange={(e) => setLocationState(e.target.value)}
                        />
                        <label className="form-label">Location <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="url"
                          className="form-control form-control-lg"
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                        />
                        <label className="form-label">Resume URL <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
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
                        />
                        <label className="form-label">Industry <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <select
                          className="form-select form-control-lg"
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501+">501+ employees</option>
                        </select>
                        <label className="form-label">Company Size <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="url"
                          className="form-control form-control-lg"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                        />
                        <label className="form-label">Company Website <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={companyLocation}
                          onChange={(e) => setCompanyLocation(e.target.value)}
                        />
                        <label className="form-label">Company Location <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <textarea
                          className="form-control form-control-lg"
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          rows="3"
                        />
                        <label className="form-label">Company Description <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>

                      <div className="form-outline form-black mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                        />
                        <label className="form-label">Contact Person <span className="badge bg-secondary bg-opacity-50">Optional</span></label>
                      </div>
                    </>
                  )}

                  <div className="error text-danger fw-bold mb-4">{error}</div>

                  <motion.button
                    className="btn btn-outline-dark btn-lg px-5"
                    type="submit"
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.1 }}
                    disabled={loading}
                  >
                    {loading ? "Signing up..." : "Sign Up"}
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
