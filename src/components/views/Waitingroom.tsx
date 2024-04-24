import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import Player from './Player'; 
import Stomper from 'helpers/Stomper';

const Waitingroom = () => {
    const { gameId } = useParams(); // the game id will be get from the URL
    const [roomInfo, setRoomInfo] = useState({ players: [], hostId: null });
    const [currentUser, setCurrentUser] = useState({ id: null, username: null });
    const [host, setHostUser] = useState({ id: null });

    // get game id from the URL and connect to the WebSocket

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const websocket = Stomper.getInstance();
        websocket.connect(gameId, userId)
            .then(() => {
                console.log("WebSocket Connected");
                websocket.subscribe(`/topic/games/${gameId}/waitingroom`, message => {
                    const data = JSON.parse(message.body);
                    console.log("Received message", data);
                    setRoomInfo(data);
                    updateCurrentUserAndHost(data, userId);
                });
            })
            .catch(error => console.error("Failed to connect to WebSocket:", error));
        
        return () => {
            websocket.disconnect();
        };
    }, [gameId]); 

    const updateCurrentUserAndHost = (data, userId) => {
        const hostPlayer = data.players.find(p => p.id === data.hostId);
        const currentUserDetails = data.players.find(p => p.userId === parseInt(userId, 10));
        if (hostPlayer && currentUserDetails) {
            setHostUser({ id: hostPlayer.id });
            setCurrentUser({ id: currentUserDetails.userId, username: currentUserDetails.username });
            console.log("Updated host and current user:", hostPlayer, currentUserDetails);
        }
    };

    const renderPlayers = () => {
        return roomInfo.players.map((player, index) => (
            <div key={index} className="player-wrapper">
                <Player user={{...player, scores: player.score ?? 0}} />
            </div>
        ));
    };

    const startGame = () => {
        if (parseInt(currentUser.id, 10) === host.id) {
            const websocket = Stomper.getInstance();
            websocket.send(`/app/games/${gameId}/start`, {});
            console.log("Game start requested");
        }
    };

    const numberOfPlaceholders = Math.max(0, 4 - roomInfo.players.length);  // show at least 4 placeholders

    return (
        <BaseContainer className="room-container">
            <h1 className="room-title">Room ID: {gameId}</h1>
            <p>Host: {roomInfo.players.find(p => p.id === host.id)?.username}</p>
            <div className="player-list">
                {renderPlayers()}
                {[...Array(numberOfPlaceholders)].map((_, index) => (
                    <div key={index} className="player-placeholder">
                        <p>Waiting for player {index + 1 + roomInfo.players.length}...</p>
                    </div>
                ))}
            </div>
            {parseInt(currentUser.id, 10) === host.id && (
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
