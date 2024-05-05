import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import ReactPlayer from 'react-player';
import { Button } from '@mui/material';
import { api, handleError } from 'helpers/api';

const Listen = () => {
  const { gameId, playerId } = useParams(); // Retrieve both gameId and playerId from URL
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [song, setSong] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // Timer set for 30 seconds

  useEffect(() => {
    if (!gameId || !playerId) {
      setError("Missing game ID or Player ID");
      return;
    }

    const fetchSongInfo = async () => {
      try {
        const response = await api.get(`/games/${gameId}/listen/${playerId}`);
        setSong(response.data);
      } catch (error) {
        console.error("Failed to fetch song data:", handleError(error));
        setError("Failed to fetch song data");
      }
    };

    fetchSongInfo();
  }, [gameId, playerId]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined = undefined;
    if (timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      navigate(`/games/${gameId}/round`);
    }

    return () => clearInterval(timerId);
  }, [timeLeft, navigate, gameId]);

  const handleNavigate = () => {
    navigate(`/games/${gameId}/round`);
  };

  return (
    <BaseContainer className="music-player-container">
      <div>
        {error && <div className="error">{error}</div>}
        {song ? (
          <>
            <img src={song.imageUrl} alt={`Cover for ${song.songTitle}`} style={{ width: '400px', height: '400px', marginBottom: '20px' }} />
            <ReactPlayer url={song.playUrl} playing controls width="100%" height="80px" />
            <h3>{song.songTitle}</h3>
            <p>Artist: {song.songArtist}</p>
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
