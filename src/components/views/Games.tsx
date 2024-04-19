import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, handleError } from 'helpers/api';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import User from "models/User";


const Player = ({ user }: { user: User }) => {
    return (
      <div className="player container" style={{ width: '350px', height: '250px' }}>
        <p>
          ID: {user.id}<br />
          Username: {user.username}<br />
          Scores: {user.scores}<br />
        </p>
      </div>
    );
  };

const Room = () => {
  const { gameId } = useParams(); 
  const [roomInfo, setRoomInfo] = useState({ players: [] });
  const [currentUser, setCurrentUser] = useState({ id: null, username: null, hostId: null });


  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setRoomInfo(response.data);
      } catch (error) {
        console.error('Error fetching room info:', error);
      }
    };
    
    const currentUserId = localStorage.getItem('userId');
    const currentUserName = localStorage.getItem('username');
    const currentHostId = localStorage.getItem('hostId');
    setCurrentUser({ id: currentUserId, username: currentUserName, hostId: currentHostId});

    // Fetch room info every 2 seconds
    const intervalId = setInterval(fetchRoomInfo, 1000);

    return () => clearInterval(intervalId);
  }, [gameId]);

  const renderPlayers = () => {
    if (!roomInfo || !roomInfo.players) return null;

    return roomInfo.players.map((player, index) => (
      <div key={index} className="player-wrapper">
        <Player user={player} />
      </div>
    ));
  };

  return (
    <BaseContainer className="room-container">
      <h1 className="room-title">Room ID: {gameId}</h1>
      {currentUser && <p>Host Player: {currentUser.username} (userId {currentUser.id})</p>}
      <div className="player-list">
        {renderPlayers()}
        {[...Array(3 - roomInfo.players.length)].map((_, index) => (
          <div key={index} className="player-placeholder">
            <p>Waiting for player {index + 1 + (roomInfo?.players?.length || 1)} ...</p>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained" 
          color="primary"
          disabled={roomInfo?.players?.length !== 4}
           >Start Game
        </Button>
      </div>

    </BaseContainer>
  );
};

export default Room;
