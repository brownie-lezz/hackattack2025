import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import supabase from "../../utils/supabase";

const ResetPasswordConfirm = () => {
  const navigate = useNavigate();
  const { updatePassword } = useContext(AuthContext);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hashFragment, setHashFragment] = useState("");

  // Extract hash fragment from URL (Supabase adds auth parameters to URL hash)
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setHashFragment(hash);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Must provide a new password.");
      return;
    } else if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      
      // If there's a hash fragment, we need to first recover the session
      if (hashFragment) {
        const params = new URLSearchParams(hashFragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
        }
      }
      
      // Update the password
      const { error } = await updatePassword(newPassword);
      
      if (error) throw error;
      
      // Success
      navigate("/login");
      setError("");
    } catch (err) {
      console.error("Error updating password:", err);
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
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
                      value={newPassword}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Reset Password"}
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

export default ResetPasswordConfirm;
