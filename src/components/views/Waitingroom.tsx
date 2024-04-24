import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import Player from './Player';
import { useWebSocket } from 'context/WebSocketContext';
import '../../styles/views/Playerlist.scss';

const Waitingroom = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const stomper = useWebSocket();
    const [roomInfo, setRoomInfo] = useState({ players: [], hostId: null });
    const [currentUser, setCurrentUser] = useState({ id: null, username: null });
    const [host, setHostUser] = useState({ id: null });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!gameId || !stomper) return;

        const connectAndSubscribe = async () => {
            try {
                await stomper.connect(gameId, localStorage.getItem("userId"));
                const waitingRoomSubscription = stomper.subscribe(`/topic/games/${gameId}/waitingroom`, message => {
                    const data = JSON.parse(message.body);
                    console.log("Waiting room updated:", data);
                    setRoomInfo(data);
                    updateCurrentUserAndHost(data, localStorage.getItem("userId"));
                });

                const startSubscription = stomper.subscribe(`/topic/games/${gameId}/start`, message => {
                    const data = JSON.parse(message.body);
                    console.log("Game start confirmed:", data);
                    console.log("Game start confirmed:", data);
                    navigate(`/games/${gameId}/listen`);
                });

                const errorSubscription = stomper.subscribe(`/topic/games/${gameId}/errors`, message => {
                    try {
                        const error = JSON.parse(message.body);
                        setError(error.error || "Unknown error occurred");
                    } catch (e) {
                        // If JSON parsing fails, handle plain text error
                        setError(message.body || "Error occurred");
                    }
                    console.error("Error received:", message.body);
                });

                return () => {
                    waitingRoomSubscription.unsubscribe();
                    startSubscription.unsubscribe();
                    errorSubscription.unsubscribe();
                };
            } catch (error) {
                console.error("Failed to connect to WebSocket:", error);
            }
        };

        connectAndSubscribe();

        return () => {
            stomper.disconnect(); // Properly handle WebSocket disconnect
        };
    }, [stomper, gameId, navigate]);

    const updateCurrentUserAndHost = (data, userId) => {
        const hostPlayer = data.players.find(p => p.id === data.hostId);
        const currentUserDetails = data.players.find(p => p.userId === parseInt(userId, 10));
        if (hostPlayer && currentUserDetails) {
            setHostUser({ id: hostPlayer.id });
            setCurrentUser({ id: currentUserDetails.userId, username: currentUserDetails.username });
        }
    };


    const startGame = () => {
        if (parseInt(currentUser.id, 10) === host.id && roomInfo.players.length >= 4) {
            stomper.send(`/app/games/${gameId}/start`, {});
            console.log("Game start request sent by the host");
        }
    };

    const renderPlayers = () => roomInfo.players.map((player, index) => (
        <div key={index} className="player-wrapper">
            <Player user={{...player, scores: player.score ?? 0}} />
        </div>
    ));

    const numberOfPlaceholders = Math.max(0, 4 - roomInfo.players.length);  // show at least 4 placeholders

    return (
        <BaseContainer className="room-container">
            <h1 className="room-title">Room ID: {gameId}</h1>
            <p>Host: {roomInfo.players.find(p => p.id === host.id)?.username}</p>
            {error && <p className="error-message">{error}</p>}
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
                        disabled={roomInfo.players.length < 4}
                    >
                        Start Game
                    </Button>
                </div>
            )}
        </BaseContainer>
    );
};

export default Waitingroom;
