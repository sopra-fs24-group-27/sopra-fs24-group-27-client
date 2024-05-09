import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import EmojiPicker from "emoji-picker-react";
import { api, handleError } from 'helpers/api';
import TextField from "@mui/material/TextField";

const Vote = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUserId"));
  const [currentTurn, setCurrentTurn] = useState(1);
  const [playerEmojis, setPlayerEmojis] = useState({});
  const [chosenEmojis, setChosenEmojis] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState(null);
  const [voteResult, setVoteResult] = useState(null);
  const [votingDisabled, setVotingDisabled] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    // Function to fetch game state
    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setGameState(response.data.players);
        setRoomInfo(response.data);
        setCurrentTurn(response.data.currentTurn);
        console.log("currentturn",currentTurn)
      } catch (error) {
        console.error("Error fetching game state:", error);
        setError("Failed to load game state");
      }
    };

    fetchGameState();

    // Set up polling
    const intervalId = setInterval(fetchGameState, 2000); // Fetch every 2 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [gameId]);

  const renderPlayers = () => {
    if (!gameState) {
      return <div>Loading...</div>; // or any other loading indicator
    }

    console.log("Game State:", gameState);
    console.log("current user", currentUser);
    console.log("Game State user id:", gameState[0].id);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", justifyContent: "center", alignItems: "center" }}>
        {gameState.map((player, index) => (
          <div key={index} className={`player-wrapper ${currentUser === player.id && currentTurn === player.turn ? "current-player" : ""}`} style={{ margin: "10px", backgroundColor: "#7c83fd", borderRadius: "10px", boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)", width: "300px", padding: "20px", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <p>Username: {player.user.username}</p>
            <p>Emojis: {player.emojis.join(" ")}</p>
            <Button
              variant="contained"
              color="primary"
              onClick={() => toVote(player.id)}
              disabled={votingDisabled || currentUser === player.id.toString()}
              style={{ marginRight: "10px" }}>
              {currentUser === player.id.toString() ? "You can't vote for yourself" : "Catch you now!"}
            </Button>
          </div>
        ))}
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

  const renderScores = () => {
    if (!gameState) return <div>Loading scores...</div>;

    return (
      <div>
        <h3>Final Scores:</h3>
        <ul>
          {gameState.map((player, index) => (
            <li key={index}>{player.user.username}: {player.score}</li>
          ))}
        </ul>
      </div>
    );
  };
  const navigateToEndPage = () => {
    navigate(`/games/${gameId}/end`);
  };
  const renderScoresAndWinners = () => {
    if (!gameState) return <div>Loading scores...</div>;

    const winners = gameState.filter(player => player.winner);
    console.log("winners:",winners)

  
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

  return (
    <BaseContainer className="round-container">
      <h1 className="page-title"
          style={{ fontSize: "24px", color: "white", display: "flex", justifyContent: "center"}}>Who is spy?
      </h1>
      {error && <p className="error-message">{error}</p>}
      {renderPlayers()}
      {renderScoresAndWinners()}
      <Button
        variant="contained"
        color="primary"
        onClick={navigateToEndPage}
        style={{ marginTop: "20px" }}>
        Next
      </Button>
    </BaseContainer>
  );
};

export default Vote;

