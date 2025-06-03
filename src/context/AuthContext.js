import { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axios_instance";

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      setUser(null);
      return;
    }
    // make a GET request to /auth/users/me to fetch user information
    // and update the user state
    console.log("setting user context inside use effect...");

    axiosInstance.get("/auth/users/me").then((response) => {
      setUser(response.data);
      console.log(response.data);
    });
  }, []);

  let contextData = {
    user,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
