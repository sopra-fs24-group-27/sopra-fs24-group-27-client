import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { Spinner } from "components/ui/Spinner";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "styles/ui/MusicPlayer.scss";

const MusicPlayerPage = () => {
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(null); 
  const navigate = useNavigate();
  const defaultAudioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const defaultImageSrc = "https://upload.wikimedia.org/wikipedia/commons/c/cf/Pendulum_clock_by_Jacob_Kock%2C_antique_furniture_photography%2C_IMG_0931_edit.jpg";
  const audioSrc = track && track.audioSrc ? track.audioSrc : defaultAudioSrc;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch music data
        const musicResponse = await fetch("/music/");
        const musicData = await musicResponse.json();
        setTrack(musicData);

        // fetch image data
        const imageResponse = await fetch("/music/image"); 
        const imageData = await imageResponse.json();
        setImageSrc(imageData.url); 
      } catch (error) {
        console.error("Error fetching data:", error);
        setImageSrc(defaultImageSrc);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); 
  }, []); 

  return (
    <BaseContainer className="music-player-container">
      {isLoading && <Spinner />} 

      {imageSrc && (
        <img
          src={imageSrc}
          alt="Track Art" 
          style={{ width: "400px", height: "400px", marginBottom: "20px" }} 
        />
      )} 

      <ReactPlayer
        url={audioSrc}
        playing={false}
        controls={true}
        width="100%"
        height="50px"
      />

      {!track && !isLoading && (
        <p>No music available. Playing default music.</p> 
      )}

      <div className="button-container"> 
        <Button
          variant="contained"
          onClick={() => navigate("/")}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/round")}
        >
          Go Next
        </Button>
      </div>
    </BaseContainer>
  );
};

export default MusicPlayerPage;
