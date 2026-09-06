import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleBasedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // User doesn't have the required role, redirect to their dashboard
    if (user.role === "FARMER") {
      return <Navigate to="/farmer" replace />;
    } else if (user.role === "BUSINESS") {
      return <Navigate to="/business" replace />;
    } else if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    // Fallback to login if role is unknown
    return <Navigate to="/login" replace />;
  }

  // User has the required role, render the children components
  return children;
}

export default RoleBasedRoute;
