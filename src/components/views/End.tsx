import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from '@mui/material/Button';
import { api } from 'helpers/api';
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Player from "./Player";
import "styles/views/Game.scss";

const GameEndPage = ({ victory, players }) => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        if (response.data && response.data.players) {
          setGameState(response.data.players);
        } else {
          throw new Error("Invalid response data");
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
        setError("Failed to load game state");
      }
    };

    fetchGameState();
    const intervalId = setInterval(fetchGameState, 2000);
    return () => clearInterval(intervalId);
  }, [gameId]);

  const handleExitGame = async () => {
    // const playerId = localStorage.getItem('userId');
    const playerId = sessionStorage.getItem('userId');

    try {
        const response = await api.post(`/games/${gameId}/quit`, null, {
            params: {
                playerId: playerId
            }
        });
        console.log("Exit response:", response.data);
        navigate("/lobby");
    } catch (error) {
        console.error("Failed to quit game:", error);
        setError("Failed to exit game");
    }
};



  const renderScoresAndWinners = () => {
    if (!gameState) return <div>Loading scores...</div>;
    const winners = gameState.filter(player => player.winner);

    return (
      <div className="game-column">
        <h3>Final Scores:</h3>
        <ul>
          {gameState.map((player, index) => (
            <li key={index}>{player.user.username}: {player.score} {player.winner ? '(Winner)' : ''}</li>
          ))}
        </ul>
        <h3>Winners:</h3>
        <ul>
          {winners.map((winner, index) => (
            <li key={index}>{winner.user.username}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <BaseContainer className="game container">
      {error && <div className="error">{error}</div>}
      <h1>{victory ? 'Congratulations, you win!' : 'Do not give up, try again!'}</h1>
      <div className="game user-list">
        {players && players.map(player => (
          <Player key={player.id} user={player} />
        ))}
      </div>
      <div className="game-details">
        <div className="game-column">
          <h3>Spy And Spy_music:</h3>
          {gameState && gameState.filter(player => player.spy).map((spy, index) => (
            <div key={spy.user.id || index}>
              <p>Spy:   {spy.user.username}</p>
              <p>Spy_music:   {spy.songInfo.title} by {spy.songInfo.artist}</p>
              <img src={spy.songInfo.imageUrl} alt={`Cover of ${spy.songInfo.title}`} style={{ width: '100px' }} />
              <a href={spy.songInfo.playUrl} target="_blank" rel="noopener noreferrer">Listen to Song</a>
            </div>
          ))}
        </div>
        {renderScoresAndWinners()}
        <div className="game-column">
          <h3>Common Song for Others:</h3>
          {gameState && (
            <div>
              <p>{gameState[0].songInfo.title} by {gameState[0].songInfo.artist}</p>
              <img src={gameState[0].songInfo.imageUrl} alt={`Cover of ${gameState[0].songInfo.title}`} style={{ width: '100px' }} />
              <a href={gameState[0].songInfo.playUrl} target="_blank" rel="noopener noreferrer">Listen to Song</a>
            </div>
          )}
        </div>
      </div>
      <div className="buttons">
        <Button onClick={handleExitGame} style={{ marginTop: '20px', marginRight: '10px', backgroundColor: '#DB70DB', color: '#00008B' }}>Exit Game</Button>
      </div>
    </BaseContainer>
  );
};

GameEndPage.propTypes = {
  victory: PropTypes.bool.isRequired,
  players: PropTypes.array.isRequired,
};

export default GameEndPage;
