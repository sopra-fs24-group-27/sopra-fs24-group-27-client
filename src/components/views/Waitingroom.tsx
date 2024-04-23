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
                    if (data.hostId) {
                        setHostUser({ id: data.hostId });
                    }
                });
            })
            .catch(error => {
                console.error("Failed to connect to WebSocket:", error);
                console.log("Error details:", error.message);
            });

        return () => {
            console.log("Disconnecting WebSocket...");
            websocket.disconnect();
        };
    }, [gameId]);

    const renderPlayers = () => {
        if (!roomInfo.players || roomInfo.players.length === 0) return <p>No players yet.</p>;

        return roomInfo.players.map((player, index) => (
            <div key={index} className="player-wrapper">
                <Player user={player} />
            </div>
        ));
    };

    const startGame = () => {
        const websocket = Stomper.getInstance();
        console.log("Sending start game request...");
        websocket.send(`/app/games/${gameId}/start`, {});
    };

    return (
        <BaseContainer className="room-container">
            <h1 className="room-title">Room ID: {gameId}</h1>
            <p>Host: {localStorage.getItem('username')}</p>
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
                        onClick={startGame}
                        disabled={roomInfo.players.length < 2}
                    >
                        Start Game
                    </Button>
                </div>
            )}
        </BaseContainer>
    );
};

export default Waitingroom;
