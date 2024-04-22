import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, handleError } from 'helpers/api';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import User from "models/User";
import Player from './Player'; 


const Waitingroom = () => {
  const { gameId } = useParams(); 
  const [roomInfo, setRoomInfo] = useState({ players: [] });
  const [currentUser, setCurrentUser] = useState({ id: null, username: null});
  const [host, setHostUser] = useState({ id: null }); // Ensure host is an object
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'roomInfo') {
        setRoomInfo(message.data);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    setSocket(ws);

    return () => ws && ws.close();
  }, []);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await api.get(`/games/${gameId}/waitingroom`);
        const { hostId } = response.data;
        setRoomInfo(response.data);
        setHostUser({ id: hostId });
      } catch (error) {
        console.error('Error fetching room info:', handleError(error));
      }
    };
    
    const currentUserId = localStorage.getItem('userId');
    const currentUserName = localStorage.getItem('username');
    setCurrentUser({ id: currentUserId, username: currentUserName });

    fetchRoomInfo();

    if (socket) {
      socket.send(JSON.stringify({ action: 'subscribe', gameId }));
    }

    return () => {
      if (socket) {
        socket.send(JSON.stringify({ action: 'unsubscribe', gameId }));
      }
    };
  }, [gameId, socket]);

  const renderPlayers = () => {
    if (!roomInfo.players) return null;
  
    return roomInfo.players.map((player, index) => (
      <div key={index} className="player-wrapper">
        <Player user={player} />
      </div>
    ));
  };

  return (
    <BaseContainer className="room-container">
      <h1 className="room-title">Room ID: {gameId}</h1>
      <p>Host Player: {host.id || 'Loading host...'}</p>
      <div className="player-list">
        {renderPlayers()}
        {[...Array(3 - roomInfo.players.length)].map((_, index) => (
          <div key={index} className="player-placeholder">
            <p>Waiting for player {index + 1 + roomInfo.players.length}...</p>
          </div>
        ))}
      </div>
      
      {currentUser.id === host.id && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained" 
            color="primary"
            disabled={roomInfo.players.length !== 4}
            >Start Game
          </Button>
        </div>
      )}
    </BaseContainer>
  );
};

export default Waitingroom;
