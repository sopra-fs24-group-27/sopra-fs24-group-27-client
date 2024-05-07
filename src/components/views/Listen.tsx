import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import ReactPlayer from "react-player";
import { api, handleError } from "helpers/api";

const Listen = () => {
  const { gameId, playerId } = useParams(); // Retrieve both gameId and playerId from URL
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [song, setSong] = useState(null);

  useEffect(() => {
    if (!gameId || !playerId) {
      setError("Missing game ID or Player ID");
      
      return;
    }

    const fetchSongInfo = async () => {
      try {
        const response = await api.get(`/games/${gameId}/listen/${playerId}`);
        setSong(response.data);
        console.log("Song data:", response.data);
      } catch (error) {
        console.error("Failed to fetch song data:", handleError(error));
        setError("Failed to fetch song data");
      }
    };

    fetchSongInfo();
  }, [gameId, playerId]);

  useEffect(() => {
    if (song) {
      setTimeout(() => {
        navigate(`/games/${gameId}/round`);
      }, 30000); // Redirect after 30 seconds
    }
  }, [song, navigate, gameId]);

  return (
    <BaseContainer className="music-player-container">
      <div>
        {error && <div className="error">{error}</div>}
        {song ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "10px"}}>
              <div style={{width: "100%", textAlign: "center", padding: "10px", fontSize: "18px", fontWeight: "bold", marginBottom: "10px"}}>
                Hey, this is the song you got, please enjoy: <span style={{ fontWeight: "bold", fontSize: "20px" }}>{song.songTitle}</span> by <span style={{ fontWeight: "bold", fontSize: "20px" }}>{song.songArtist}</span>
              </div>
              <img src={song.imageUrl} alt={`Cover for ${song.songTitle}`} style={{ width: "400px", height: "400px", marginBottom: "20px", marginTop: "-20px" }} />
              <ReactPlayer url={song.playUrl} playing controls width="400px" height="50px" />
              <div style={{ marginTop: "10px", fontWeight: "bold", fontSize: "16px" }}>
              Please listen to the <span style={{ fontSize: "18px", fontWeight: "bold" }}>30 seconds</span> highlights of the song carefully.
              You will be asked to describe it later!
              </div>
            </div>
          </>
        ) : (
          <p>Loading song...</p>
        )}
      </div>
    </BaseContainer>
  );
};

export default Listen;
