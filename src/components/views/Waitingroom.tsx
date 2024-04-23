import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import Player from './Player'; 
import Stomper from 'helpers/Stomper';

const Waitingroom = () => {
    const { gameId } = useParams();
    const [roomInfo, setRoomInfo] = useState({ players: [] });
    const [currentUser, setCurrentUser] = useState({ id: null, username: null });
    const [host, setHostUser] = useState({ id: null });

    useEffect(() => {
        const websocket = Stomper.getInstance();
        websocket.connect(gameId)
            .then(() => {
                console.log("WebSocket Connected");
                websocket.subscribe(`/topic/games/${gameId}`, message => {
                    const data = JSON.parse(message.body);
                    console.log("Received message", data);
                    setRoomInfo(data);  // Update room state based on WebSocket message
                    setHostUser({ id: data.hostId }); // Assuming 'hostId' is part of the message
                });
            })
            .catch(error => {
                console.error("Failed to connect to WebSocket:", error);
            });

        return () => websocket.disconnect();
    }, [gameId]);

    const renderPlayers = () => {
        if (!roomInfo.players) return <p>No players yet.</p>;

        return roomInfo.players.map((player, index) => (
            <div key={index} className="player-wrapper">
                <Player user={player} />
            </div>
        ));
    };

    return (
        <BaseContainer className="room-container">
            <h1 className="room-title">Room ID: {gameId}</h1>
            <p>Host Player: {host?.id ? host.id : 'Loading host...'}</p>
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
                    >Start Game</Button>
                </div>
            )}
        </BaseContainer>
    );
};

export default Waitingroom;
