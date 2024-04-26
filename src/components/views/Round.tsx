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
        const roundSubscription = stomper.subscribe(`/topic/games/${gameId}/round`, message => {
          const data = JSON.parse(message.body);
          console.log("Round data received:", data);
          if (data.gameState) {
            setGameState(data.gameState);
            setCurrentTurn(data.gameState.currentTurn);
            setPlayerEmojis(data.gameState.playerEmojis);
          }
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

  const handleEmojiClick = (event, emojiObject) => {
    if (currentUser === currentTurn) {
      const updatedChosenEmojis = [...chosenEmoji, emojiObject];
      if (updatedChosenEmojis.length <= 5) {
        setChosenEmoji(updatedChosenEmojis);
        stomper.send(`/app/games/${gameId}/sendEmojis`, JSON.stringify({
          playerId: currentUser,
          emojis: updatedChosenEmojis.map(e => e.emoji)
        }));
      }
    } else {
      console.log('Not your turn');
    }
  };

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
    console.log("Game State:", gameState);
    return gameState && gameState.players.map((player, index) => (
      <div key={index} className={`player-wrapper ${currentUser === player.id ? 'current-player' : ''}`}>
        {player.username}
        {player.emojis.map((emoji, emojiIndex) => (
          <span key={emojiIndex}>{emoji}</span>
        ))}
      </div>
    ));
  };

  return (
    <BaseContainer className="round-container">
      <h1>{renderRoundDescription()}</h1>
      {error && <p className="error-message">{error}</p>}
      {renderPlayers()}
      {currentUser === currentTurn && (
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      )}
      <div className="emoji-display">
        {chosenEmoji.map((emoji, index) => (
          <span key={index}>{emoji.emoji}</span>
        ))}
      </div>
    </BaseContainer>
  );
};

export default Round;
