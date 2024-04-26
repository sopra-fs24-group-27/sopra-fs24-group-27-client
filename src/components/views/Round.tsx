import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import EmojiPicker from 'emoji-picker-react';
import { useWebSocket } from 'context/WebSocketContext';

const Round = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const stomper = useWebSocket(); // Using WebSocket context for consistency
  const [gameState, setGameState] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUserId'));
  const [currentTurn, setCurrentTurn] = useState(null);
  const [playerEmojis, setPlayerEmojis] = useState({});
  const [chosenEmoji, setChosenEmoji] = useState([]);
  const [error, setError] = useState(null);
  const [round, setRound] = useState(1);

  useEffect(() => {
    if (!gameId || !stomper) return;

    const setupWebSocket = async () => {
      try {
        await stomper.connect(gameId, currentUser);
        const roundSubscription = stomper.subscribe(`/topic/games/${gameId}`, message => {
          const data = JSON.parse(message.body);
          console.log("Round data received:", data);
          // if (data.gameState) {
            setGameState(data.players);
            setCurrentTurn(data.currentTurn);
            setPlayerEmojis(data.playerEmojis);
          // }
        });

        const errorSubscription = stomper.subscribe(`/topic/games/${gameId}/errors`, message => {
          try {
            const error = JSON.parse(message.body);
            setError(error.error || "Unknown error occurred");
          } catch (e) {
            setError(message.body || "Error occurred");
            console.error("Error received:", message.body);
          }
        });

        return () => {
          roundSubscription.unsubscribe();
          errorSubscription.unsubscribe();
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setError("WebSocket connection failed");
      }
    };

    setupWebSocket();

    return () => {
      stomper.disconnect(); // Properly handle WebSocket disconnect
    };
  }, [stomper, gameId, currentUser, navigate]);

  // const handleEmojiClick = (event, emojiObject) => {
  //   if (currentUser === currentTurn) {
  //     const updatedChosenEmojis = [...chosenEmoji, emojiObject];
  //     if (updatedChosenEmojis.length <= 5) {
  //       setChosenEmoji(updatedChosenEmojis);
  //       stomper.send(`/app/games/${gameId}/sendEmojis`, JSON.stringify({
  //         playerId: currentUser,
  //         emojis: updatedChosenEmojis.map(e => e.emoji)
  //       }));
  //     }
  //   } else {
  //     console.log('Not your turn');
  //   }
  // };

  // Render the round description based on the current round state
  const renderRoundDescription = () => {
    switch (round) {
      case 1:
        return 'Round 1 Description';
      case 2:
        return 'Round 2 Description';
      case 3:
        return 'Round 3 Description';
      default:
        return 'Voting';
    }
  };

  const renderPlayers = () => {
    if (!gameState) {
      return <div>Loading...</div>; // or any other loading indicator
    }

    console.log("Game State:", gameState);
    console.log("current user", currentUser);
    console.log("Game State user id:", gameState[0].id);

    const playerCardStyle = {
      margin: '10px',
      backgroundColor: '#7c83fd',
      borderRadius: '10px',
      boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
      width: '300px',
      padding: '20px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative', // Positioning for emoji picker
    };

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
        {gameState.map((player, index) => (
          <div key={index} className={`player-wrapper ${currentUser === player.id ? 'current-player' : ''}`} style={{ margin: '10px', backgroundColor: '#7c83fd', borderRadius: '10px', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', width: '300px', padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <p>Order of sending emojis: {player.turn}</p>
            <p>Username: {player.username}</p>
            <p>emojis: {player.emojis || 0}</p>
            {/*{currentUser === player.id && (*/}
            {/*  <EmojiPicker onEmojiClick={handleEmojiClick} />*/}
            {/*)}*/}
            {player.turn === 4 && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="text" placeholder="Enter emojis" value={player.inputValue || ''} onChange={(e) => handleInputChange(e, player.id)} />
                <EmojiPicker onEmojiClick={(e, emojiObject) => handleEmojiClick(emojiObject, player.id)} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleInputChange = (event, playerId) => {
    const inputValue = event.target.value;
    setGameState(prevState => prevState.map(player => {
      if (player.id === playerId) {
        return { ...player, inputValue };
      }
      return player;
    }));
  };

  const handleEmojiClick = (emojiObject, playerId) => {
    const emoji = emojiObject.emoji;
    setGameState(prevState => prevState.map(player => {
      if (player.id === playerId) {
        const inputValue = (player.inputValue || '') + emoji;
        return { ...player, inputValue };
      }
      return player;
    }));
  };



  function handleNavigate() {
    stomper.send(`/app/games/${gameId}/sortTurnOrder`, {});
  }

  function toVote() {
    navigate(`/games/${gameId}/vote`);
  }

  return (
    <BaseContainer className="round-container">
      <h1>{renderRoundDescription()}</h1>
      {error && <p className="error-message">{error}</p>}
      {renderPlayers()}
      <div className="button-container">
        <Button variant="contained" color="primary" onClick={handleNavigate}>
          Start Round
        </Button>
      </div>

      <div className="button-container">
        <Button variant="contained" color="primary" onClick={toVote}>
          Vote
        </Button>
      </div>

      <div className="emoji-display">
        {chosenEmoji.map((emoji, index) => (
          <span key={index}>{emoji.emoji}</span>
        ))}
      </div>
    </BaseContainer>
  );
};

export default Round;
