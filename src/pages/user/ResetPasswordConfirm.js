import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axios_instance";
import { auth_urls } from "../../utils/config";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();

  const [new_password, setNewPassword] = useState("");
  const [re_new_password, setReNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!new_password || !re_new_password) {
      setError("Must provide a new password.");
      return;
    } else if (new_password !== re_new_password) {
      setError("Passwords do not match.");
      return;
    }

    axiosInstance
      .post(auth_urls.RESET_PASSWORD_CONFIRM, {
        uid,
        token,
        new_password,
        re_new_password,
      })
      .then((res) => navigate("/login"))
      .catch((err) => {
        // console.log(err.request.responseText);
        if (err.response.data.new_password) setError(err.response.data.new_password[0]);
        else setError("Password is weak.");
      });
    setNewPassword("");
    setReNewPassword("");
    setError("");
  };

  return (
    <section>
      <div className="container vh-100">
        <div className="row d-flex justify-content-center align-items-center py-2">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div
              className="card bg-dark text-white"
              style={{ borderRadius: 1 + "rem" }}
            >
              <div className="card-body p-5 text-center">
                <div className="pb-5">
                  <h2 className="fw-bold mb-2 text-uppercase">
                    Reset password
                  </h2>
                  <p className="text-white-50 mb-5">Enter new password.</p>

                  <div className="form-outline form-white mb-4">
                    <input
                      type="password"
                      id="typePasswordX"
                      className="form-control form-control-lg"
                      value={new_password}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <label className="form-label" htmlFor="typePasswordX">
                      Password
                    </label>
                  </div>

                  <div className="form-outline form-white mb-4">
                    <input
                      type="password"
                      id="typePasswordY"
                      className="form-control form-control-lg"
                      value={re_new_password}
                      onChange={(e) => setReNewPassword(e.target.value)}
                    />
                    <label className="form-label" htmlFor="typePasswordY">
                      Confirm Password
                    </label>
                  </div>

                  <div className="error text-danger fw-bold mb-4">{error}</div>

                  <button
                    className="btn btn-outline-light btn-lg px-5"
                    type="submit"
                    onClick={handleSubmit}
                  >
                    Reset Password
                  </button>
                </div>

                <div>
                  <p className="mb-0">
                    <Link to="/login" className="text-white-50 fw-bold">
                      Back to Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
