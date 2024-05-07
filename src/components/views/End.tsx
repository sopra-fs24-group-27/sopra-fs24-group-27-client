import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Player from "./Player";
import "styles/views/Game.scss";


const GameEndPage = ({ victory, players }) => {
  const [songPlaying, setSongPlaying] = useState("");
  const { gameId } = useParams(); 

  const navigate = useNavigate();

  const handleExitGame = () => {
    navigate("/lobby");
  };

  const handleContinueGame = () => {
    navigate(`/games/${gameId}/waitingroom`);
  };

  return (
    <BaseContainer className="game container" >
      <h1>{victory ? "Congratulations, you win!" : "Do not give up, try again!"}</h1>
      <h2>Players:</h2>
      <div className="game user-list">
        {players && players.map(player => (
          <Player key={player.id} user={player} />
        ))}
      </div>
      <div className="buttons">
        <Button 
          onClick={handleExitGame}
          style={{ marginTop: "20px", marginRight: "10px", backgroundColor: "#DB70DB", color: "#00008B" }}
        >Exit Game</Button>
        <Button 
          onClick={handleContinueGame}
          style={{ marginTop: "20px", backgroundColor: "#AFEEEE", color: "#00008B" }}
        >Next Round</Button>
      </div>
    </BaseContainer>
  );
};

GameEndPage.propTypes = {
  victory: PropTypes.bool.isRequired,
  players: PropTypes.array.isRequired,
};

export default GameEndPage;
