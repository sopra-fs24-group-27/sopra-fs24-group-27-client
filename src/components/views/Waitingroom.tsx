import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import Player from './Player';
import { useWebSocket } from 'context/WebSocketContext';
import '../../styles/views/Playerlist.scss';
import IconButton from '@mui/material/IconButton';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';

const saveMessages = (messages) => {
    localStorage.setItem('waitingroomMessages', JSON.stringify(messages));
};

const loadMessages = () => {
    const savedMessages = localStorage.getItem('waitingroomMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
};

const dropMessages = () => {
    localStorage.removeItem('waitingroomMessages');
}

const Waitingroom = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const stomper = useWebSocket();
    const [roomInfo, setRoomInfo] = useState({ players: [], hostId: null });
    const [currentUser, setCurrentUser] = useState({ id: null, username: null });
    const [host, setHostUser] = useState({ id: null });
    const [error, setError] = useState(null);

    const [messages, setMessages] = useState(loadMessages());

    useEffect(() => {
        if (!gameId || !stomper) return;

        const connectAndSubscribe = async () => {
            try {
                await stomper.connect(gameId, localStorage.getItem("userId"));
                const waitingRoomSubscription = stomper.subscribe(`/topic/games/${gameId}/waitingroom`, message => {
                    console.log("Waiting room 1:", message.body);

                    const newMessage = JSON.parse(message.body);
                    setMessages(prevMessages => {
                        const updatedMessages = [...prevMessages, newMessage];
                        saveMessages(updatedMessages);
                        return updatedMessages;
                    });
                    console.log("Waiting room updated:", newMessage);
                    setRoomInfo(newMessage);
                    updateCurrentUserAndHost(newMessage, localStorage.getItem("userId"));
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
                    dropMessages();
                    startSubscription.unsubscribe();
                    errorSubscription.unsubscribe();
                };
            } catch (error) {
                console.error("Failed to connect to WebSocket:", error);
            }
        };

        connectAndSubscribe();

        setRoomInfo(messages[messages.length - 1]);
        updateCurrentUserAndHost(messages[messages.length - 1], localStorage.getItem("userId"));

        return () => {
            stomper.disconnect(); // Properly handle WebSocket disconnect
        };
    }, [stomper, gameId, navigate, messages]);

    const updateCurrentUserAndHost = (data, userId) => {
        const hostPlayer = data?.players && data?.players?.find(p => p.id === data.hostId);
        const currentUserDetails = data?.players?.find(p => p.userId === parseInt(userId, 10));
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
        navigate(`/games/${gameId}/listen`);
    };

    const renderPlayers = () => roomInfo.players.map((player, index) => (
        <div key={index} className="player-wrapper">
            <Player user={{ ...player, scores: player.score ?? 0 }} />
        </div>
    ));

    const numberOfPlaceholders = Math.max(0, 4 - (roomInfo?.players ? roomInfo?.players?.length : 0));  // show at least 4 placeholders

    const handleCopyId = () => {
        const textarea = document.createElement('textarea');
        textarea.value = gameId;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      };
      

    return (
        <BaseContainer className="room-container">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 className="room-title">Room ID: {gameId}</h1>
                <IconButton onClick={handleCopyId}>
                    <FileCopyOutlinedIcon />
                </IconButton>
            </div>
            <p>Host: {(roomInfo?.players) && roomInfo.players.find(p => p.id === host.id)?.username}</p>
            {error && <p className="error-message">{error}</p>}
            <div className="player-list">
                {roomInfo?.players && roomInfo.players.map((player, index) => (
                    <div key={index} className="player-wrapper">
                        <Player user={{ ...player, scores: player.score ?? 0 }} />
                    </div>
                ))}
                {[...Array(numberOfPlaceholders)].map((_, index) => (
                    <div key={index} className="player-placeholder">
                        <p>Waiting for player {index + 1 + (roomInfo?.players?.length ? roomInfo.players.length : 0)}...</p>
                    </div>
                ))}
            </div>
            {parseInt(currentUser.id, 10) === host.id && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={startGame}
                        disabled={roomInfo?.players ? roomInfo.players.length < 4 : true}
                    >
                        Start Game
                    </Button>
                </div>
            )}
        </BaseContainer>
    );
};

export default Waitingroom;
