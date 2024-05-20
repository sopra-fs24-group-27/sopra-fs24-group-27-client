import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import Profile from "../../views/Profile";

/**
 *
 * Another way to export directly your functional component is to write 'export const'
 * instead of 'export default' at the end of the file.
 */
export const ProfileGuard = () => {
  // if (localStorage.getItem("token"))
  if (sessionStorage.getItem("token")) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

ProfileGuard.propTypes = {
  children: PropTypes.node,
};
