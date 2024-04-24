import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { Spinner } from "components/ui/Spinner";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const MusicPlayerPage = () => {
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const defaultAudioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
  const audioSrc = track && track.audioSrc ? track.audioSrc : defaultAudioSrc;
  
  useEffect(() => {
    const fetchTrack = async () => {
      try {
        // 模拟 API 请求
        const response = await fetch("/music/");
        const data = await response.json();
        setTrack(data);
      } catch (error) {
        console.error("Error fetching track:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrack();
  }, []);



  return (
    <BaseContainer className="music-player-container" >
      {isLoading && <Spinner />} 

      <ReactPlayer
        url={audioSrc} 
        playing={false} 
        controls={true} 
        width="100%" 
        height="50px" 
      />

      {!track && !isLoading && (
        <p>No music available. Playing default music.</p> // 无音乐时的消息
      )}
      <Button
        variant="outlined"
        style={{ marginTop: "20px",backgroundColor: "#dc3545", color: "#ffffff" }}
        onClick={() => navigate("/")}
      >
        Back
      </Button>

      <Button
        variant="outlined"
        style={{ marginTop: "20px", backgroundColor: "#dc3545", color: "#ffffff" }}
        onClick={() => navigate("/round")}
      >
        Go next
      </Button>
    </BaseContainer>
  );
};

export default MusicPlayerPage;