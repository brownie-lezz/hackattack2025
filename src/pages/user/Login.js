import { useContext, useState } from "react";
import { useNavigate} from "react-router-dom";
import axiosInstance from "../../utils/axios_instance";
import { auth_urls } from "../../utils/config";
import AuthContext from "../../context/AuthContext";
import './user.css'
import loginSvg from "./login.svg"
import {motion} from 'framer-motion'

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    axiosInstance
      .post(auth_urls.LOGIN, { email: email, password: password })
      .then((res) => {
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        axiosInstance.defaults.headers["Authorization"] =
          "JWT " + localStorage.getItem("access_token");

        // Update the user context with the user information returned by the API
        axiosInstance.get("/auth/users/me").then((response) => {
          setUser(response.data);
        });
        navigate("/");
        setError("");
      })
      .catch((err) => {
        // console.log("Login error", err.request.responseText);
        setError("Email or Password is invalid.");
      });
    setEmail("");
    setPassword("");
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
                      className="form-control form-control-lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="form-label" htmlFor="typeEmailX">
                      Email
                    </label>
                  </div>

                  <div className="form-outline form-white mb-4">
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

                  <div className="error text-danger fw-bold mb-4">{error}</div>

                  <motion.p className="small mb-4 pb-lg-2 w-20"
                   whileHover={{scale:1.1}}
                   transition={{type:'spring',stiffness:300}}>
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
                    whileHover={{scale:1.1}}
                  >
                    Login
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
                 whileHover={{scale:1.1}}
                 onClick={()=> {navigate('/signup')}}>
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
