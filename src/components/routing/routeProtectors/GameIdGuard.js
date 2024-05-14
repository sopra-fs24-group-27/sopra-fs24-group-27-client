import React from "react";
import { Navigate, Outlet, useParams} from "react-router-dom";
import PropTypes from "prop-types";

/**
 * GameIdGuard
 * @Guard
 * @param props
 */
export const GameIdGuard = () => {
// Get gameId from sessionStorage
  const storedGameId = sessionStorage.getItem("gameId");

  // Get gameId from URL params
  const { gameId } = useParams();

  // Check if the stored gameId matches the one in the URL
  if (storedGameId === gameId) {
    return <Outlet />;
  }

  return <Navigate to="/lobby" replace />;
};

GameIdGuard.propTypes = {
  children: PropTypes.node
};
