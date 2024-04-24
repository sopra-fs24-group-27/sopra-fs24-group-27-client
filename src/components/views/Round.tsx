import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import EmojiPicker from 'emoji-picker-react';
import Stomper from 'helpers/Stomper';

const Round = () => {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUserId'));
  const [currentTurn, setCurrentTurn] = useState(null);
  const [playerEmojis, setPlayerEmojis] = useState({});
  const [chosenEmoji, setChosenEmoji] = useState([]);
  const [round, setRound] = useState(1);

  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        await Stomper.getInstance().connect(gameId, currentUser);
        Stomper.getInstance().subscribe(`/topic/games/${gameId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("Received WebSocket message:", data);
          switch (data.type) {
            case 'Stomper.getInstance().subscribed':
              setGameState(data.gameState);
              setCurrentTurn(data.gameState.currentTurn);
              setPlayerEmojis(data.gameState.playerEmojis);
              break;
            default:
              console.log('Received unknown message type:', data.type);
          }
        });
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    setupWebSocket();

    return () => {
      Stomper.getInstance().disconnect(); // Disconnect on cleanup
    };
  }, [gameId, currentUser]);

  const handleEmojiClick = (event, emojiObject) => {
    if (currentUser === currentTurn) {
      const updatedChosenEmojis = [...chosenEmoji, emojiObject];
      if (updatedChosenEmojis.length <= 5) {
        setChosenEmoji(updatedChosenEmojis);
        Stomper.getInstance().send(`/app/games/${gameId}`, JSON.stringify({
          action: 'sendEmojis',
          gameId,
          playerId: currentUser,
          emojis: updatedChosenEmojis.map(e => e.emoji)
        }));
      }
    } else {
      console.log('Not your turn');
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
      <h1>{`Round ${round} Description`}</h1>
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


