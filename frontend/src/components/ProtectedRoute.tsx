import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper that redirects to /login if no access_token is found in localStorage.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;