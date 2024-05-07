import React from "react";
import PropTypes from "prop-types";

const Player = ({ user }) => {
  if (!user) return null;

  return (
    <div className="player container" style={{ width: "350px", height: "250px" }}>
      <p>
        ID: {user.id}<br />
        Username: {user.username}<br />
        Scores: {user.scores}<br />
      </p>
    </div>
  );
};

// Define the expected prop types
Player.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    scores: PropTypes.number.isRequired,
  })
};

export default Player;