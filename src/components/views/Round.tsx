import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import EmojiPicker from 'emoji-picker-react';


const Round = () => {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('userId'));
  const [currentTurn, setCurrentTurn] = useState(null);
  const [playerEmojis, setPlayerEmojis] = useState({});
  const [chosenEmoji, setChosenEmoji] = useState([]);
  const ws = useRef(null);
  const [round, setRound] = useState(1);

  // Setup WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080/games/' + gameId);

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
      ws.current.send(JSON.stringify({ action: 'joinRound', gameId }));
    };

    ws.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      switch (data.type) {
        case 'updateRound':
          setGameState(data.gameState);
          setCurrentTurn(data.gameState.currentTurn);
          setPlayerEmojis(data.gameState.playerEmojis);
          break;
        default:
          console.log('Received unknown message type:', data.type);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => ws && ws.current.close();
  }, [gameId]);

  const handleEmojiClick = (event, emojiObject) => {
    if (currentUser === currentTurn) {
      const updatedChosenEmojis = [...chosenEmoji, emojiObject];
      if (updatedChosenEmojis.length <= 5) {
        setChosenEmoji(updatedChosenEmojis);
        ws.current.send(JSON.stringify({
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

  // Handle incoming message for starting a new round
  const handleNewRound = (gameState) => {
    setRound(gameState.currentRound);
    setPlayerEmojis({}); // Reset emojis
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
    return gameState.players.map((player, index) => (
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
