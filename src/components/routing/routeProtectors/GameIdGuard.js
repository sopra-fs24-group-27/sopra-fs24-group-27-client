import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * GameIdGuard
 * @Guard
 * @param props
 */
export const GameIdGuard = () => {
  // Check if gameId exists in sessionStorage
  const gameId = sessionStorage.getItem("gameId");

  if (gameId) {
    return <Outlet />;
  }

  return <Navigate to="/lobby" replace />;
};

GameIdGuard.propTypes = {
  children: PropTypes.node
};
