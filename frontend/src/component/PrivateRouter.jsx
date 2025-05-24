// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
  
    return isAuthenticated ? children : <Navigate to="/auth" />;
  };

export default PrivateRoute;
