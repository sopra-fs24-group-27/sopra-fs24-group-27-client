import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BaseContainer from "components/ui/BaseContainer";
import ReactPlayer from "react-player";

import { api, handleError } from 'helpers/api';
import Player from './Player';

// TODO: configure default theme in an independent file and import it here
const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#7e57c2',
    },
    secondary: {
      main: '#ba68c8',
    },
  },
  typography: {
    fontFamily: 'Comic Sans MS',
  },
});

const GameEndPage = ({ players }) => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [songs, setSongs] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [userIds, setUserIds] = useState([]);

  useEffect(() => {
    if (!gameId) return;

    const fetchSongs = async () => {
      try {
        const response = await api.get(`/games/${gameId}/songs`);
        setSongs(response.data);
      } catch (error) {
        console.error("Error fetching songs:", error);
        setError("Failed to load songs");
      }
    };

    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setGameState(response.data.players);
      } catch (error) {
        console.error("Error fetching game state:", error);
        setError("Failed to load game state");
      }
    };

    fetchSongs();
    fetchGameState();
  }, [gameId]);

  useEffect(() => {
    if (gameState) {
      const winners = gameState.filter(player => player.winner);
      const ids = winners.map(winner => winner.user.id);
      setUserIds(ids);
    }
  }, [gameState]);

  const handleExitGame = async () => {
    const playerId = sessionStorage.getItem('playerId');

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
        <h3>Scoreboard</h3>
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

  const currentUserIsWinner = () => {
    const playerId = Number(sessionStorage.getItem('userId'));
    return userIds.includes(playerId);
  };
  const renderSongPlayer = (song) => (
    <div key={song.id} style={{ textAlign: 'center', marginBottom: '20px' }}> {/* Ensures all contents are centered and spaced appropriately */}
      <p><b>{song.songTitle}</b> by <b>{song.songArtist}</b></p>
      <img src={song.imageUrl} alt={`Cover of ${song.songTitle}`} style={{ width: '300px', display: 'block', margin: '0 auto 10px' }} />
      <ReactPlayer
        url={song.playUrl}
        controls
        style={{ display: 'block', margin: 'auto' }} // Center align the React player
        width="300px"
        height="50px"
      />
    </div>
  );
  
  return (
    <BaseContainer className="game container">
      {error && <div className="error">{error}</div>}
      <h1>{currentUserIsWinner() ? 'Congratulations, you win!' : 'Do not give up, try again!'}</h1>
      <div className="game user-list">
        {players && players.map(player => (
          <Player key={player.id} user={player} />
        ))}
      </div>
      <div className="game-details">
        <div className="game-column">
          <h3 style={{ color: '#AFEEEE', fontFamily: 'Comic Sans MS', textAlign: 'center' }}><b>SPY</b></h3>
          <div>
            <p><b>Spy user:</b> {gameState && gameState.filter(player => player.spy).map(player => player.user.username).join(', ')}</p>
            {songs.filter(song => song.spy).map(renderSongPlayer)}
          </div>
        </div>
        {renderScoresAndWinners()}
        <div className="game-column">
          <h3 style={{ color: '#AFEEEE', fontFamily: 'Comic Sans MS', textAlign: 'center' }}><b>DETECTIVES</b></h3>
          <div>
            <p><b>Detective users:</b> {gameState && gameState.filter(player => !player.spy).map(player => player.user.username).join(', ')}</p>
            {songs.filter(song => !song.spy).slice(0, 1).map(renderSongPlayer)}
          </div>
        </div>
      </div>
      <div className="buttons">
        <Button onClick={handleExitGame} style={{ marginTop: '20px', marginRight: '10px', backgroundColor: '#AFEEEE', color: '#00008B' }}>Exit Game</Button>
      </div>
    </BaseContainer>
  );
}


GameEndPage.propTypes = {
  players: PropTypes.array.isRequired,
};

export default GameEndPage;
