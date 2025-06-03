import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

const Logout = () => {
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      navigate("/login");
    };
    
    performLogout();
  }, [signOut, navigate]);
  
  return null;
};

export default Logout;
