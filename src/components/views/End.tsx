import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from '@mui/material/Button';
import { api } from 'helpers/api';
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Player from "./Player";
import "styles/views/Game.scss";

const GameEndPage = ({ victory, players }) => {
  const [songPlaying, setSongPlaying] = useState('');
  const { gameId } = useParams(); 
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState(null);
  const handleExitGame = () => {
    navigate("/lobby");
  };
  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        console.log('测试:', response.data)
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
    const intervalId = setInterval(fetchGameState, 2000); // Fetch every 2 seconds
    return () => clearInterval(intervalId);
}, [gameId]);
  const handleContinueGame = () => {
    navigate(`/games/${gameId}/waitingroom`);
  };

  const renderScoresAndWinners = () => {
    if (!gameState) return <div>Loading scores...</div>;

    const winners = gameState.filter(player => player.winner);

  
    return (
      <div>
        <h3>Final Scores:</h3>
        <ul>
          {gameState.map((player, index) => (
            <li key={index}>{player.user.username}: {player.score} {player.winner ? '(Winner)' : ''}</li>
          ))}
        </ul>
        {winners.length > 0 && (
          <div>
            <h3>Winners:</h3>
            <ul>
              {winners.map((winner, index) => (
                <li key={index}>{winner.user.username}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
    </div>
    <div>
      <h3>Spy And Spy_music:</h3>
      <ul>
        {gameState.filter(player => player.spy).map((spy, index) => (
          <li key={spy.user.id || index}>
            {spy.user.username}
            <div>
              <p>Song: {spy.songInfo.title} by {spy.songInfo.artist}</p>
              <img src={spy.songInfo.imageUrl} alt={`Cover of ${spy.songInfo.title}`} style={{ width: '100px' }} />
              <p><a href={spy.songInfo.playUrl} target="_blank" rel="noopener noreferrer">Listen to Song</a></p>
            </div>
          </li>
        ))}
      </ul>
      <h3>Common Song for Others:</h3>
        <div>
          <p>Song: {gameState[0].songInfo.title} by {gameState[0].songInfo.artist}</p>
          <img src={gameState[0].songInfo.imageUrl} alt={`Cover of ${gameState[0].songInfo.title}`} style={{ width: '100px' }} />
          <p><a href={gameState[0].songInfo.playUrl} target="_blank" rel="noopener noreferrer">Listen to Song</a></p>
        </div>
    </div>
      </div>
    );
  };
  return (
    <BaseContainer className="game container">
      {error && <div className="error">{error}</div>}
      <h1>{victory ? 'Congratulations, you win!' : 'Do not give up, try again!'}</h1>
      <h2>Players:</h2>
      <div className="game user-list">
        {players && players.map(player => (
          <Player key={player.id} user={player} />
        ))}
      </div>
      {renderScoresAndWinners()}
      <div className="buttons">
        <Button 
          onClick={handleExitGame}
          style={{ marginTop: '20px', marginRight: '10px', backgroundColor: '#DB70DB', color: '#00008B' }}
        >Exit Game</Button>
        <Button 
          onClick={handleContinueGame}
          style={{ marginTop: '20px', backgroundColor: '#AFEEEE', color: '#00008B' }}
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
