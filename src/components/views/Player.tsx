import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";

const Player = ({ user }) => {
  if (!user) return null;

  const navigate = useNavigate();
  const navigateToProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <div
      className="player container"
      style={{ width: "350px", height: "250px" }}
    >
      <p>
        <Avatar
          alt="Avatar"
          src={user.avatar}
          sx={{
            width: 80,
            height: 80,
            cursor: "pointer",
            marginBottom: 2,
            marginTop: -4,
          }}
          //onClick={navigateToProfile}
        />
        ID: {user.id}
        <br />
        Username: {user.username}
        <br />
        Scores: {user.scores}
        <br />
      </p>
    </div>
  );
};

// Define the expected prop types
Player.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    scores: PropTypes.number.isRequired,
  }),
};

export default Player;
