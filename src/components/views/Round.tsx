import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import EmojiPicker from "emoji-picker-react";
import { api, handleError } from 'helpers/api';
import TextField from "@mui/material/TextField";
import { Avatar } from "@mui/material";
// import { ReactComponent as AvatarSvg1 } from 'styles/views/avatars/avatar1.svg';
// import { ReactComponent as AvatarSvg2 } from 'styles/views/avatars/avatar2.svg';
// import { ReactComponent as AvatarSvg3 } from 'styles/views/avatars/avatar3.svg';
// import { ReactComponent as AvatarSvg4 } from 'styles/views/avatars/avatar4.svg';
// import { ReactComponent as AvatarSvg5 } from 'styles/views/avatars/avatar5.svg';
// import { ReactComponent as AvatarSvg6 } from 'styles/views/avatars/avatar6.svg';
// import { ReactComponent as AvatarSvg7 } from 'styles/views/avatars/avatar7.svg';

// const avatarComponents = [AvatarSvg1, AvatarSvg2, AvatarSvg3, AvatarSvg4, AvatarSvg5, AvatarSvg6, AvatarSvg7];

const Round = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  // const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUserId"));
  const [currentUser, setCurrentUser] = useState(sessionStorage.getItem("userId"));
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
        console.log("currentturn", currentTurn)
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

  useEffect(() => {
    if (round === 3) {
      navigate(`/games/${gameId}/vote`);
    }
  }, [round, navigate, gameId]);

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


  const renderPlayers = () => {
    if (!gameState) {
      return <div>Loading...</div>; // or any other loading indicator
    }

    console.log("Game State:", gameState);
    console.log("current user", currentUser);
    console.log("Game State user id:", gameState[0].id);

    return (
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
        {gameState.map((player, index) => {
          // const AvatarComponent = avatarComponents[player.user.avatar];
          return (
            <div
              key={index}
              className={`player-wrapper ${currentUser === player.id && currentTurn === player.turn ? "current-player" : ""}`}
              style={{
                margin: "10px",
                backgroundColor: currentTurn === player.turn ? "rgba(144, 238, 200, 0.8)" : "rgba(200, 131, 253, 0.8)",
                borderRadius: "10px",
                boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                width: "300px",
                padding: "20px",
                color: "black",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
              }}>
              {/*<p>Order of sending emojis: {player.turn}</p>*/}
              <Avatar src={player.user.avatar} style={{ width: 60, height: 60, marginTop: '15px', cursor: 'pointer' }} />
              {/* <AvatarComponent
                style={{ width: 60, height: 60, marginTop: '15px', cursor: 'pointer' }}
              /> */}
              <p>Username: {player.user.username}</p>
              {/*<p>Emojis: {player.emojis.join(" ")}</p>*/}
              <p>Round 1 Emojis: {player.emojis.join(" ")}</p>
              <p>Round 2 Emojis: {player.emojis2.join(" ")}</p>
              {player.id.toString() === currentUser && player.turn === currentTurn && (
                <>
                  <p>→ YOUR TURN ←</p>
                  <TextField
                    onFocus={handleEmojiInputFocus}
                    onBlur={handleEmojiInputBlur}
                    value={chosenEmojis.join(' ')}
                    placeholder="Up to 5 emojis"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  {renderChosenEmojis()}
                  {renderEmojiPicker()}
                  <Button variant="contained" color="primary" onClick={handleSubmitEmojis} disabled={chosenEmojis.length === 0}
                    style={{ marginTop: '20px', backgroundColor: '#DB70DB', color: '#00008B' }}>
                    Submit Emojis
                  </Button>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleEmojiInputBlur = () => {
    // setShowEmojiPicker(false);
  };

  const removeEmoji = (index) => {
    setChosenEmojis(prevEmojis => prevEmojis.filter((_, i) => i !== index));
  };

  const renderChosenEmojis = () => {
    return (
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
        {chosenEmojis.map((emoji, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <span>{emoji}</span>
            <Button
              onClick={() => removeEmoji(index)}
              variant="contained"
              color="secondary"
              style={{ marginLeft: '5px', minWidth: '30px', padding: '5px', backgroundColor: '#DB70DB', color: '#00008B' }}
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

      await api.post(`/games/${gameId}/emojis?playerId=${currentUser}&round=${round}`, requestBody);

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
            skip sending emojis for testing
          </Button>
          {/*<Button variant="contained" color="secondary" onClick={toNextRound}>*/}
          {/*  Next Round*/}
          {/*</Button>*/}
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
  }

  return (
    <BaseContainer className="round-container">
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>{renderRoundDescription()}</h1>
        {/*{gameState && <p style={{ marginLeft: "10px" }}>Current turn: {gameState[currentTurn - 1].user.username}</p>}*/}
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

