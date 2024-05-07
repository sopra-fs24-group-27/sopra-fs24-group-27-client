import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import EmojiPicker from "emoji-picker-react";
import { api, handleError } from "helpers/api";
import TextField from "@mui/material/TextField";

const Round = () => {
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
  const [round, setRound] = useState(1);

  useEffect(() => {
    if (!gameId) return;

    // Function to fetch game state
    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setGameState(response.data.players);
        setRoomInfo(response.data);
        setCurrentTurn(response.data.currentTurn);
        setRound(response.data.currentRound);
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

  // Render the round description based on the current round state
  const renderRoundDescription = () => {
    switch (round) {
    case 1:
      return "Round 1 Description";
    case 2:
      return "Round 2 Description";
    default:
      return "Please click on vote";
    }
  };

  // const isCurrentUserTurn = () => {
  //   // Ensure gameState is an array and currentUser is defined
  //   if (!Array.isArray(gameState) || !currentUser) return false;
  //
  //   // Find the player object that matches the currentUser id
  //   const currentPlayer = gameState.find(player => player.id.toString() === currentUser);
  //
  //   // Check if the currentPlayer exists and it is their turn
  //   return currentPlayer ? currentPlayer.turn === currentTurn : false;
  // };


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
            <p>Order of sending emojis: {player.turn}</p>
            <p>Username: {player.user.username}</p>
            <p>Emojis: {player.emojis.join(" ")}</p>
            {player.id.toString() === currentUser && player.turn === currentTurn &&(
              <>
                <TextField
                  onFocus={handleEmojiInputFocus}
                  onBlur={handleEmojiInputBlur}
                  value={chosenEmojis.join(" ")}
                  placeholder="Click to add emojis"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
                {renderEmojiPicker()}
                <Button variant="contained" color="primary" onClick={handleSubmitEmojis} disabled={chosenEmojis.length === 0}>
                  Submit Emojis
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleEmojiInputBlur = () => {
    // setShowEmojiPicker(false);
  };

  const handleSubmitEmojis = async () => {
    try {
      const requestBody = chosenEmojis;

      await api.post(`/games/${gameId}/emojis?playerId=${currentUser}`, requestBody);

      setChosenEmojis([]);

      // setCurrentTurn(prevTurn => prevTurn + 1);

      const response = await api.get(`/games/${gameId}/`);
      setGameState(response.data.players);
      // setRound(response.data.currentRound);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error saving emojis:", error);
      setError("Failed to save emojis");
    }
  };


  const handleEmojiInputFocus = () => {
    setShowEmojiPicker(true);
  };

  const renderEmojiPicker = () => {
    if (showEmojiPicker) {
      return (
        <EmojiPicker onEmojiClick={onEmojiClick} />
      );
    }
  };

  const onEmojiClick = (event, emojiObject) => {
    console.log(emojiObject);
    setChosenEmojis(prevEmojis => {
      const newEmojis = [...prevEmojis, emojiObject.emoji];
      console.log("Updated Chosen Emojis:", newEmojis);
      
      return newEmojis;
    });
  };

  const renderButtons = () => {
    if (round === 1 || round === 2) {
      return (
        <>
          <Button variant="contained" color="primary" onClick={toVote} style={{ marginRight: "10px" }}>
            Vote
          </Button>
          <Button variant="contained" color="secondary" onClick={toNextRound}>
            Next Round
          </Button>
        </>
      );
    } else if (round === 3) {
      return (
        <Button variant="contained" color="primary" onClick={toVote}>
          Vote
        </Button>
      );
    }
  };

  function toVote() {
    navigate(`/games/${gameId}/vote`);
  }

  const toNextRound = async () =>{
    try {
      const response = await api.get(`/games/${gameId}/`);
      setRound(response.data.currentRound);
    } catch (error) {
      console.error("Error Nest Round:", error);
      setError("Failed to nest round");
    }
  }

  return (
    <BaseContainer className="round-container">
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>{renderRoundDescription()}</h1>
        {gameState && <p style={{ marginLeft: "10px" }}>Current turn: {gameState[currentTurn - 1].user.username}</p>}
      </div>
      {error && <p className="error-message">{error}</p>}
      {renderPlayers()}

      <div className="button-container">
        {renderButtons()}
      </div>
    </BaseContainer>
  );
};

export default Round;

