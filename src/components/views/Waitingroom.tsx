import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import Button from '@mui/material/Button';
import Player from './Player';
import '../../styles/views/Playerlist.scss';
import IconButton from '@mui/material/IconButton';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import { api, handleError } from 'helpers/api';

const Waitingroom = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [roomInfo, setRoomInfo] = useState({ players: [], hostId: null });
    const [currentUser, setCurrentUser] = useState({ id: null });
    const [hostUsername, setHostUsername] = useState('');
    const [hostId, setHostId] = useState(null);
    const [error, setError] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);  // State to track if the game has started

    useEffect(() => {
        // const userId = localStorage.getItem("userId");
        const userId = sessionStorage.getItem("userId");

        const fetchGameRoomDetails = async () => {
            try {
                const response = await api.get(`/games/${gameId}`);
                setRoomInfo(response.data);
                const hostPlayer = response.data.players.find(p => p.user.id === response.data.hostId);
                if (hostPlayer) {
                    setHostUsername(hostPlayer.user.username);
                    setHostId(hostPlayer.user.id);
                }
                const currentUserDetails = response.data.players.find(p => p.user.id === parseInt(userId, 10));
                if (currentUserDetails) {
                    setCurrentUser(currentUserDetails.user);  // Update to use user object
                }
                // Check if game has started based on some condition or flag in the response
                if (response.data.currentRound > 0) {  // Assuming 'currentRound' changes when the game starts
                    setGameStarted(true);
                }
            } catch (error) {
                console.error(`Failed to fetch game details: ${handleError(error)}`);
                setError(`Failed to fetch game details: ${handleError(error)}`);
            }
        };

        const intervalId = setInterval(fetchGameRoomDetails, 2000); // Poll every 2 seconds
        fetchGameRoomDetails();
        return () => {
            clearInterval(intervalId);
        };
    }, [gameId, navigate]);

    useEffect(() => {
        if (gameStarted) {
            navigate(`/games/${gameId}/listen/${currentUser.id}`);  // Navigate all players when game starts
        }
    }, [gameStarted, gameId, currentUser.id, navigate]);

    const startGame = async () => {
        if (currentUser.id === hostId && roomInfo.players.length >= 4) {
            try {
                await api.put(`/games/${gameId}`);
                await api.post(`/games/${gameId}/sortTurnOrder`)
                setGameStarted(true);  // Update game started state
            } catch (error) {
                setError(`Failed to start the game: ${handleError(error)}`);
            }
        }
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(gameId).then(() => {
            alert('Game ID copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy Game ID');
        });
    };

    return (
        <BaseContainer className="room-container">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 className="room-title">Room ID: {gameId}</h1>
                <IconButton onClick={handleCopyId}>
                    <FileCopyOutlinedIcon />
                </IconButton>
            </div>
            <p>Host: {hostUsername}</p>
            {error && <p className="error-message">{error}</p>}
            <div className="player-list" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: '80%', margin: '0 auto' }}>
                {roomInfo?.players && roomInfo.players.map((player, index) => (
                    <div key={index} className="player-wrapper" style={{ width: '40%', boxSizing: 'border-box', padding: '10px', margin: '0 40px 10px 0' }}>
                        <Player user={{ ...player.user, scores: player.score ?? 0 }} />
                    </div>
                ))}
            </div>
            {parseInt(currentUser.id, 10) === roomInfo.hostId && roomInfo.players.length === 4 && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={startGame}
                        style={{ marginTop: '20px', backgroundColor: '#AFEEEE', color: '#00008B' }}
                        disabled={gameStarted}  // Disable if game has already started
                    >
                        Start Game
                    </Button>
                </div>
            )}
        </BaseContainer>
    );
};

export default Waitingroom;
