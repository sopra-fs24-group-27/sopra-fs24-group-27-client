import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import EmojiPicker from "emoji-picker-react";
import { api, handleError } from "helpers/api";
import TextField from "@mui/material/TextField";
import { Avatar } from "@mui/material";

const Round = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState(
    sessionStorage.getItem("userId")
  );
  const [currentPlayerId, setCurrentPlayerId] = useState(
    sessionStorage.getItem("playerId")
  );
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [playerEmojis, setPlayerEmojis] = useState<Record<string, any>>({});
  const [chosenEmojis, setChosenEmojis] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState<number>(1);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setGameState(response.data.players);
        setRoomInfo(response.data);
        setCurrentTurn(response.data.currentTurn);
        setRound(response.data.currentRound);
        console.log("currentturn", currentTurn);
      } catch (error) {
        console.error("Error fetching game state:", error);
        setError("Failed to load game state");
      }
    };

    fetchGameState();

    const intervalId = setInterval(fetchGameState, 2000);

    return () => clearInterval(intervalId);
  }, [gameId, currentTurn]);

  useEffect(() => {
    if (round === 3) {
      navigate(`/games/${gameId}/vote`);
    }
  }, [round, navigate, gameId]);

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

  const renderPlayers = () => {
    if (!gameState) {
      return <div>Loading...</div>;
    }

    console.log("Game State:", gameState);
    console.log("current user", currentUser);
    console.log("Game State user id:", gameState[0].id);

    return (
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {gameState.map((player, index) => (
          <div
            key={index}
            className={`player-wrapper ${
              currentUser === player.user.id && currentTurn === player.turn
                ? "current-player"
                : ""
            }`}
            style={{
              margin: "10px",
              backgroundColor:
                currentTurn === player.turn
                  ? "rgba(144, 238, 200, 0.8)"
                  : "rgba(200, 131, 253, 0.8)",
              borderRadius: "10px",
              boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
              width: "300px",
              padding: "20px",
              color: "black",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Avatar
              src={player.user.avatar}
              style={{
                width: 60,
                height: 60,
                marginTop: "15px",
                cursor: "pointer",
              }}
            />
            <p>Username: {player.user.username}</p>
            <p>Round 1 Emojis: {player.emojis.join(" ")}</p>
            <p>Round 2 Emojis: {player.emojis2.join(" ")}</p>
            {player.user.id.toString() === currentUser &&
              player.turn === currentTurn && (
                <>
                  <p>→ YOUR TURN ←</p>
                  <TextField
                    onFocus={handleEmojiInputFocus}
                    onBlur={handleEmojiInputBlur}
                    value={chosenEmojis.join(" ")}
                    placeholder="Up to 5 emojis"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  {renderChosenEmojis()}
                  {renderEmojiPicker()}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitEmojis}
                    disabled={chosenEmojis.length === 0}
                    style={{
                      marginTop: "20px",
                      backgroundColor: "#DB70DB",
                      color: "#00008B",
                    }}
                  >
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
    setShowEmojiPicker(false);
  };

  const removeEmoji = (index: number) => {
    setChosenEmojis((prevEmojis) => prevEmojis.filter((_, i) => i !== index));
  };

  const renderChosenEmojis = () => {
    return (
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "10px",
        }}
      >
        {chosenEmojis.map((emoji, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center" }}>
            <span>{emoji}</span>
            <Button
              onClick={() => removeEmoji(index)}
              variant="contained"
              color="secondary"
              style={{
                marginLeft: "5px",
                minWidth: "30px",
                padding: "5px",
                backgroundColor: "#DB70DB",
                color: "#00008B",
              }}
            >
              X
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const handleSubmitEmojis = async () => {
    try {
      const requestBody = chosenEmojis;

      await api.post(
        `/games/${gameId}/emojis?playerId=${currentPlayerId}&round=${round}`,
        requestBody
      );

      setChosenEmojis([]);
      const response = await api.get(`/games/${gameId}/`);
      setGameState(response.data.players);
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
      return <EmojiPicker onEmojiClick={onEmojiClick} />;
    }
  };

  const onEmojiClick = (event: any, emojiObject: any) => {
    console.log(emojiObject);
    setChosenEmojis((prevEmojis) => {
      const newEmojis = [...prevEmojis, emojiObject.emoji];
      console.log("Updated Chosen Emojis:", newEmojis);
      return newEmojis;
    });
  };

  const renderButtons = () => {
    if (round === 1 || round === 2) {
      return (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={toVote}
            style={{ marginRight: "10px" }}
          >
            skip sending emojis for testing
          </Button>
        </>
      );
    } else if (round === 3) {
      return (
        <Button variant="contained" color="primary" onClick={toVote}>
          skip sending emojis for testing
        </Button>
      );
    }
  };

  function toVote() {
    navigate(`/games/${gameId}/vote`);
  }

  const toNextRound = async () => {
    try {
      const response = await api.get(`/games/${gameId}/`);
      setRound(response.data.currentRound);
    } catch (error) {
      console.error("Error Nest Round:", error);
      setError("Failed to nest round");
    }
  };

  return (
    <BaseContainer className="round-container">
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>{renderRoundDescription()}</h1>
      </div>
      {error && <p className="error-message">{error}</p>}
      {renderPlayers()}

      <div className="button-container">{renderButtons()}</div>
    </BaseContainer>
  );
};

export default Round;
