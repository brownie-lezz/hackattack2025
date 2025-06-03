import { useState } from "react";
import { useNavigate} from "react-router-dom";
import axiosInstance from "../../utils/axios_instance";
import { auth_urls } from "../../utils/config";
import signupSvg from './signup.svg'
import './user.css'
import {motion} from 'framer-motion'

const EmployerSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError("Please fill out all fields.");
      return;
    }
    axiosInstance
      .post(auth_urls.SIGNUP, {
        email: email,
        password: password,
        re_password: password,
        name: name,
        is_employer: true,
      })
      .then((res) => {
        navigate("/login");
        console.log("Employer account created:", name, email);
        setError("");
      })
      .catch((err) => {
        // console.log(err.request.responseText);
        // console.log(err.response.data.email, err.response.data.password);

        let newErrorMessage = "Email or Password is invalid.";
        if (err.response.data.email)
          newErrorMessage = err.response.data.email[0];
        else if (err.response.data.password)
          newErrorMessage = err.response.data.password[0];
        setError(newErrorMessage);
      });
    setEmail("");
    setPassword("");
    setName("");
  };

  let easeing = [0.6,-0.05,0.01,0.99];

  const fadeInUp = {
    initial:{
      y:60,
      opacity:0,
    },
    animate:{
      y:0,
      opacity:1,
      transition:{
        duration:1,
        ease:easeing
      }
    }
  };

  return (
    <section>
      <motion.div className="main-container1 container-fluid">
        <div className="row d-flex justify-content-center align-items-center py-2"
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
                 onClick={()=> {navigate('/login')}}
                 whileHover={{scale:1.1}}>
                    Login
                </motion.button>
              </div>
              <div>
                <img src={signupSvg} alt="Not Found" />
              </div>
            </div>
          </div>
          <div className="sign-up col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 px-0 mx-auto">
            <div
              className="signin bg-light text-black"
              style={{ borderRadius: 0.5 + "rem" }}
            >
              <div className="card-body p-4 text-center">
                <div className="pb-3">
                  <h2 className="fw-bold mb-2 text-uppercase">
                    Employer Sign Up
                  </h2>
                  <p className="text-black-50 mb-5">
                    Please enter your login and password!
                  </p>

                  <div className="form-outline form-white mb-4">
                    <input
                      autoFocus
                      type="email"
                      id="typeEmailX"
                      className="form-control form-control-lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="form-label" htmlFor="typeEmailX">
                      Email
                    </label>
                  </div>

                  <div className="form-outline form-black mb-3">
                    <input
                      type="text"
                      id="typeUsernameX"
                      className="form-control form-control-lg"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <label className="form-label" htmlFor="typeUsernameX">
                      Company Name
                    </label>
                  </div>

                  <div className="form-outline form-black mb-3">
                    <input
                      type="password"
                      id="typePasswordX"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label className="form-label" htmlFor="typePasswordX">
                      Password
                    </label>
                  </div>

                  <div className="error text-danger fw-bold mb-3">{error}</div>

                  <motion.button
                    className="btn btn-outline-dark btn-lg px-5"
                    type="submit"
                    onClick={handleSubmit}
                    whileHover={{scale:1.1}}
                  >
                    Sign Up
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default EmployerSignup;
