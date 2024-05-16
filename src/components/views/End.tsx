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
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

  const MediaControlCard = ({ player }) => {

    return (
      <Card sx={{ display: 'flex' }}>
        <Avatar alt="Avatar" src={player.user.avatar} sx={{ width: 100, height: 100 }} />
        <Typography component="div" variant="h5">
          @{player.user.username}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5">
              {player.songInfo.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {player.songInfo.artist}
            </Typography>
          </CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <IconButton aria-label="previous">
              {defaultTheme.direction === 'rtl' ? <SkipNextIcon /> : <SkipPreviousIcon />}
            </IconButton>
            <IconButton aria-label="play/pause">
              <PlayArrowIcon sx={{ height: 38, width: 38 }} />
            </IconButton>
            <IconButton aria-label="next">
              {defaultTheme.direction === 'rtl' ? <SkipPreviousIcon /> : <SkipNextIcon />}
            </IconButton>
          </Box>
        </Box>
        <CardMedia
          component="img"
          sx={{ width: 151 }}
          image={player.songInfo.imageUrl}
          alt={`Cover of ${player.songInfo.title}`}
        />
      </Card>
    );
  }



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

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="md">
        {error && <div className="error">{error}</div>}
        <h1>{victory ? 'Congratulations, you win!' : 'Do not give up, try again!'}</h1>
        <div className="game user-list">
          {players && players.map(player => (
            <Player key={player.id} user={player} />
          ))}
        </div>
        <div className="game-details">
          <div className="game-column">
            <h3 style={{ color: '#AFEEEE', fontFamily: 'Comic Sans MS', textAlign: 'center' }}>SPY</h3>
            {gameState && gameState.filter(player => player.spy).map((spy, index) => (
              <div key={spy.user.id || index}>
                <MediaControlCard player={{ ...spy }} />
              </div>
            ))}
          </div>
          {renderScoresAndWinners()}
          <div className="game-column">
            <h3 style={{ color: '#AFEEEE', fontFamily: 'Comic Sans MS', textAlign: 'center' }}>DETECTIVES</h3>
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
          <Button onClick={handleExitGame} style={{ marginTop: '20px', marginRight: '10px', backgroundColor: '#AFEEEE', color: '#00008B' }}>Exit Game</Button>
        </div>
      </Container>
    </ThemeProvider >
  );
};

GameEndPage.propTypes = {
  victory: PropTypes.bool.isRequired,
  players: PropTypes.array.isRequired,
};

export default GameEndPage;
