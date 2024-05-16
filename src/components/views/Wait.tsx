import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import { Grid, Card, Chip, CardContent } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { api, handleError } from 'helpers/api';


// TODO: configure default theme in an independent file and import it here
const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#7e57c2',
        },
        secondary: {
            main: '#ba68c8',
        },
    },
    typography: {
        fontFamily: 'Comic Sans MS',
    },
});



const PlayerCard = ({ user }) => {
    if (!user) return null;
    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar alt="Avatar" src={user.avatar} sx={{ width: 100, height: 100 }} />
            <Typography variant="h6" component="div">
                @{user.username}
            </Typography>
        </Box>
    );
};

// Define the expected prop types
PlayerCard.propTypes = {
    user: PropTypes.shape({
        avatar: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
    })
};

export default function Wait() {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const [roomInfo, setRoomInfo] = useState({ hostId: null, settings: { artist: null, genre: '', market: '' }, players: [] });
    const [currentUser, setCurrentUser] = useState({ id: null, username: null });
    const [hostUser, setHostUser] = useState({ id: null, username: null });
    const [gameStarted, setGameStarted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const currentUserId = sessionStorage.getItem("userId");

        const fetchGameData = async () => {
            try {
                const response = await api.get(`/games/${gameId}`);
                setRoomInfo(response.data);
                console.log("Room info:", response.data);
                const hostPlayer = response.data.players.find(p => p.user.id === response.data.hostId);
                if (hostPlayer) {
                    setHostUser(hostPlayer.user);
                }
                const currentPlayer = response.data.players.find(p => p.user.id === parseInt(currentUserId, 10));
                if (currentPlayer) {
                    setCurrentUser(currentPlayer.user);  // Update to use user object
                }
                // Check if game has started based on some condition or flag in the response
                if (response.data.currentRound > 0) {  // Assuming 'currentRound' changes when the game starts
                    setGameStarted(true);
                }
            } catch (error) {
                console.error(`Failed to fetch game data: ${handleError(error)}`);
            }
        };

        const intervalId = setInterval(fetchGameData, 2000); // Poll every 2 seconds
        fetchGameData();

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
        console.log('Game started?', gameStarted, currentUser.id === hostUser.id, roomInfo.players.length === 4);
        if (currentUser.id === hostUser.id && roomInfo.players.length === 4) {
            try {
                await api.put(`/games/${gameId}`);
                await api.post(`/games/${gameId}/sortTurnOrder`)
                setGameStarted(true);  // Update game started state
                console.log('Game started?', gameStarted);
            } catch (error) {
                console.error(`Failed to start the game: ${handleError(error)}`);
            }
        }
    };

    const handleGameIdCopy = () => {
        navigator.clipboard.writeText(gameId).then(() => {
            alert('Game ID copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy Game ID');
        });
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <Container component="main" maxWidth="md">
                <Box padding={4} display="flex" flexDirection="column" alignItems="center">
                    <Grid item>
                        <Typography variant="h4" component="h1">Room ID: {gameId}
                            <IconButton onClick={handleGameIdCopy}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Typography>
                        <Typography variant="h6" component="h2">Waiting for players to join...</Typography>
                    </Grid>
                    <Typography variant="subtitle1" component="h3">Artist {roomInfo.settings.artist}</Typography>
                    <p>Host: {hostUser.username}</p>
                    {error && <p className="error-message">{error}</p>}
                    <Grid item>
                        {roomInfo?.players && roomInfo.players.map((player, index) => (
                            <div key={index} className="player-wrapper" style={{ width: '40%', boxSizing: 'border-box', padding: '10px', margin: '0 40px 10px 0' }}>
                                <PlayerCard user={{ ...player.user, scores: player.score ?? 0 }} />
                            </div>
                        ))}
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={startGame}
                            disabled={currentUser.id !== hostUser.id || roomInfo.players.length !== 4}
                        >
                            Start
                        </Button>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider >
    );
};
