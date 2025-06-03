import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import './user.css'
import loginSvg from "./login.svg"
import { motion } from 'framer-motion'

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, resendConfirmationEmail } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Update email validation when email changes
  useEffect(() => {
    if (email) {
      setEmailValid(validateEmail(email));
    }
  }, [email]);

  const handleResendConfirmation = async () => {
    if (!email || !emailValid) {
      setError("Please enter a valid email address first.");
      return;
    }

    try {
      setResendLoading(true);
      const { error } = await resendConfirmationEmail(email);
      
      if (error) throw error;
      
      setSuccess("Confirmation email has been resent. Please check your inbox.");
      setShowResendOption(false);
      setError("");
    } catch (err) {
      setError("Failed to resend confirmation email. Please try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    setEmailValid(isEmailValid);
    
    if (!isEmailValid || !email || !password) {
      setError("Please fill out all fields correctly.");
      return;
    }

    try {
      setLoading(true);
      setSuccess("");
      setShowResendOption(false);
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;

      setError("");
      // Get user role from the profile data or metadata
      const userRole = data.user.user_metadata?.role || 'seeker';
      
      // Redirect based on user role
      if (userRole === 'seeker') {
        navigate("/profile/seeker");
      } else if (userRole === 'employer') {
        navigate("/profile/employer");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Check if the error is about email confirmation
      if (err.message && err.message.includes("Email not confirmed")) {
        setError("Your email has not been confirmed. Please check your inbox for a verification link.");
        setShowResendOption(true);
      } else {
        setError(err.message || "Invalid email or password.");
      }
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

  return (
    <section>
      <div className="main-container container-fluid">
        <motion.div className="row d-flex justify-content-center align-items-center py-2 sign"
          variants={fadeInUp}
          initial='initial'
          animate='animate'
        >
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-6 px-0 mx-auto">
            <div
              className="signin bg-light text-black"
              style={{ borderRadius: 0.5 + "rem" }}
            >
              <div className="p-4 text-center">
                <div className="pb-5">
                  <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
                  <p className="text-black-50 mb-5">
                    Please enter your login and password!
                  </p>

                  <div className="form-outline form-white mb-4">
                    <input
                      autoFocus
                      type="email"
                      id="typeEmailX"
                      className={`form-control form-control-lg ${email && !emailValid ? 'is-invalid' : ''}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label className="form-label" htmlFor="typeEmailX">
                      Email <span className="text-danger">*</span>
                    </label>
                    {email && !emailValid && (
                      <div className="invalid-feedback">Please enter a valid email address.</div>
                    )}
                  </div>

                  <div className="form-outline form-white mb-4">
                    <input
                      type="password"
                      id="typePasswordX"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="form-label" htmlFor="typePasswordX">
                      Password <span className="text-danger">*</span>
                    </label>
                  </div>
                  
                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="error text-danger fw-bold mb-4">{error}</div>
                  )}

                  {showResendOption && (
                    <div className="mb-4">
                      <p className="text-muted">Didn't receive the confirmation email?</p>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleResendConfirmation}
                        disabled={resendLoading}
                      >
                        {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                      </button>
                    </div>
                  )}

                  <motion.p className="small mb-4 pb-lg-2 w-20"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}>
                    <a
                      href="/reset-password"
                      className="text-black-50 fw-bold"
                    >
                      Forgot password?
                    </a>
                  </motion.p>

                  <motion.button
                    className="btn btn-outline-dark btn-lg px-5"
                    type="submit"
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.1 }}
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          <div className="panel col-6 px-0">
            <div className="description">
              <div className="mb-4">
                <p className="text-light">
                  Don't have an account?{" "}
                </p>
                <motion.button className="btn btn-outline-primary btn-md px-3 text-white fw-bold"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => { navigate('/signup') }}>
                  Sign Up
                </motion.button>
              </div>
              <div>
                <img src={loginSvg} alt="Not Found" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Login;
