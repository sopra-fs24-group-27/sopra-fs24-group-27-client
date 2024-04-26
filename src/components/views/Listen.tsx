import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import SongPlayer from './SongPlayer';
import { useWebSocket } from 'context/WebSocketContext';
import '../../styles/views/Listen.scss';
import '../../styles/ui/MusicPlayer.scss';
import ReactPlayer from 'react-player';
import { Button } from '@mui/material';

// Functions to manage messages in localStorage
const saveMessages = (messages) => {
  localStorage.setItem('listenMessages', JSON.stringify(messages));
}

const loadMessages = () => {
  const savedMessages = localStorage.getItem('listenMessages');
  return savedMessages ? JSON.parse(savedMessages) : [];
}

const dropMessages = () => {
  localStorage.removeItem('listenMessages');
}

const Listen = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const stomper = useWebSocket();
  const [error, setError] = useState(null);
  const [song, setSong] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // Timer set for 30 seconds

  useEffect(() => {
    if (!gameId || !stomper) {
      setError("Missing game ID or WebSocket connection");
      return;
    }

    let listenSubscription, errorSubscription;

    const connectAndSubscribe = async () => {
      try {
        await stomper.connect(gameId, localStorage.getItem("userId"));
        
        listenSubscription = stomper.subscribe(`/user/topic/games/${gameId}/listen`, message => {
          console.log("Received message:", message.body);
          const newMessage = JSON.parse(message.body);
          const messages = loadMessages();
          messages.push(newMessage);
          saveMessages(messages);
          setSong(newMessage);
        });

        errorSubscription = stomper.subscribe(`/topic/games/${gameId}/errors`, message => {
          const errorData = JSON.parse(message.body);
          console.error("Error received:", errorData);
          setError(errorData.error || "Unknown error occurred");
        });

        return () => {
          listenSubscription.unsubscribe();
          errorSubscription.unsubscribe();
          dropMessages();
          stomper.disconnect();
        };
      } catch (e) {
        console.error("Error connecting to WebSocket:", e);
        setError("Error connecting to WebSocket");
      }
    };

    connectAndSubscribe();

    return () => {
      if (listenSubscription) listenSubscription.unsubscribe();
      if (errorSubscription) errorSubscription.unsubscribe();
      stomper.disconnect();
    };
  }, [gameId, stomper]);

  useEffect(() => {
    if (!song) {
      setSong({
        title: "Animals",
        artist: "Maroon 5",
        imageUrl: "https://i.scdn.co/image/ab67616d0000b2737a2a4b225ad828477e358206",
        playUrl: "https://api.spotify.com/v1/tracks/4H52xXIWHfi68h8VqBcS4V"
      });
    }
  }, [song]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else {
      navigate(`/games/${gameId}/round`);
    }

    return () => clearInterval(timer);
  }, [timeLeft, navigate, gameId]);

  const handleNavigate = () => {
    if (timeLeft > 0) {
      const confirmMove = window.confirm("The timer has not expired, are you sure you want to start?");
      if (confirmMove) {
        navigate(`/games/${gameId}/round`);
      }
    } else {
      navigate(`/games/${gameId}/round`);
    }
  };

  return (
    <BaseContainer className="music-player-container">
      <div>
        {error && <div className="error">{error}</div>}
        {song ? (
          <>
            <img src={song.imageUrl} alt={`Cover for ${song.title}`} style={{ width: '400px', height: '400px', marginBottom: '20px' }} />
            <ReactPlayer url={song.playUrl} playing controls width="100%" height="50px" />
            <h3>{song.title}</h3>
            <p>Artist: {song.artist}</p>
          </>
        ) : (
          <p>Loading song...</p>
        )}
      </div>
      <div className="button-container">
        <Button variant="contained" color="primary" onClick={handleNavigate}>
          Start Round
        </Button>
        <p>Time remaining: {timeLeft} seconds</p>
      </div>
    </BaseContainer>
  );
};

export default Listen;