import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { api, handleError } from 'helpers/api';


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

const Vote = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  // const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUserId"));
  const [currentUser, setCurrentUser] = useState(sessionStorage.getItem("currentUserId"));
  const [currentTurn, setCurrentTurn] = useState(1);
  const [votes, setVotes] = useState({});
  const [error, setError] = useState(null);
  const [voteResult, setVoteResult] = useState(null);
  const [votingDisabled, setVotingDisabled] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setGameState(response.data.players);
        setRoomInfo(response.data);
        setCurrentTurn(response.data.currentTurn);

        console.log("roominfo:", roomInfo);
        const votesData = response.data.players.reduce((acc, player) => {
          acc[player.id] = player.votes || 0; // Assuming the server returns a 'votes' field for each player
          return acc;
        }, {});
        setVotes(votesData);

        if (response.data.votedPlayers === 4) {
          navigate(`/games/${gameId}/end`);
        }

        console.log("currentturn", currentTurn);
      } catch (error) {
        console.error("Error fetching game state:", error);
        setError("Failed to load game state");
      }
    };

    fetchGameState();

    const intervalId = setInterval(fetchGameState, 2000); // Fetch every 2 seconds

    return () => clearInterval(intervalId);
  }, [gameId]);

  const renderPlayers = () => {
    if (!gameState) {
      return <div>Loading...</div>; // or any other loading indicator
    }

    console.log("Game State:", gameState);
    console.log("current user", currentUser);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", justifyContent: "center", alignItems: "center" }}>
        {gameState.map((player, index) => {
          return (
            <div key={index} className={`player-wrapper ${currentUser === player.id && currentTurn === player.turn ? "current-player" : ""}`} style={{ margin: "10px", backgroundColor: 'rgba(235, 200, 255, 0.7)', borderRadius: "10px", boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)", width: "350px", padding: "20px", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginLeft: "auto", marginRight: "auto" }}>
              <Avatar alt="Avatar" src={player.user.avatar} sx={{ width: 100, height: 100 }} />
              <p style={{ lineHeight: '0.8' }}>Username: {player.user.username}</p>
              <p style={{ lineHeight: '0.8' }}>Round 1 Emojis: {player.emojis.join(" ")}</p>
              <p style={{ lineHeight: '0.8' }}>Round 2 Emojis: {player.emojis2.join(" ")}</p>
              <p style={{ lineHeight: '0.8' }}>Votes: {votes[player.id] || 0}</p>
              <Button
                variant="contained"
                color="primary"
                onClick={() => toVote(player.id)}
                disabled={votingDisabled || currentUser === player.id.toString()}
                style={{
                  marginRight: "10px",
                  ...(votingDisabled || currentUser === player.id.toString() ? {} : {
                    backgroundColor: '#AFEEEE',
                    color: '#00008B'
                  })
                }}>
                {currentUser === player.id.toString() ? "You can't vote for yourself" : "Catch you now!"}
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  const toVote = async (votedPlayerId) => {
    try {
      const payload = votedPlayerId;
      const response = await api.post(`/games/${gameId}/vote?voterId=${currentUser}`, payload);
      setVoteResult(response.data.message); // Assuming the server sends back some message
      console.log("Vote successful:", response.data);
      setVotingDisabled(true);
    } catch (error) {
      console.error("Error in voting:", error);
      setError("Failed to process vote");
    }
  };

  const renderScoresAndWinners = () => {
    if (!gameState) return <div>Loading scores...</div>;

    const winners = gameState.filter(player => player.winner);
    console.log("winners:", winners);

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
      </div>
    );
  };

  const navigateToEndPage = () => {
    navigate(`/games/${gameId}/end`);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="md">
        <h1 className="page-title" style={{ fontSize: "24px", color: "white", display: "flex", justifyContent: "center" }}>Who is spy?</h1>
        {error && <p className="error-message">{error}</p>}
        {renderPlayers()}
        {/*{renderScoresAndWinners()}*/}
        <Button
          variant="contained"
          color="primary"
          onClick={navigateToEndPage}
          style={{ marginTop: "20px" }}>
          Next
        </Button>
      </Container>
    </ThemeProvider>
  );
};

export default Vote;
