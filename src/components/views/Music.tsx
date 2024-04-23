import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import BaseContainer from "components/ui/BaseContainer";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Button from '@mui/material/Button';
import AudioPlayer from "components/ui/AudioPlayer";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const MusicPage = () => {
  const navigate = useNavigate();

  // 用于管理音频源和曲目信息的状态变量
  const [track, setTrack] = useState(null);
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [artist, setArtist] = useState('');

  useEffect(() => {
    // 获取初始数据
    const fetchTrack = async () => {
      try {
        const response = await api.get("/music/track-of-the-day");
        setTrack(response.data); // 例如：设置今日曲目
      } catch (error) {
        console.error(`获取曲目时出错：\n${handleError(error)}`);
      }
    };

    fetchTrack();
  }, []);

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleArtistChange = (event) => {
    setArtist(event.target.value);
  };

  return (
    <BaseContainer className="music-page container">
      <h2>player</h2>
      <div className="player-container" style={{ textAlign: "center" }}>
        {track ? (
          <AudioPlayer src={track.audioSrc} title={track.title} artist={track.artist} />
        ) : (
          <Spinner />
        )}
      </div>

      <div className="music-filters">
        <FormControl fullWidth sx={{ marginTop: "20px" }}>
          <InputLabel id="genre-label">genre</InputLabel>
          <Select
            labelId="genre-label"
            id="genre-select"
            value={genre}
            onChange={handleGenreChange}
          >
            <MenuItem value="pop">pop</MenuItem>
            <MenuItem value="rock">rock</MenuItem>
            <MenuItem value="jazz">jazz</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: "20px" }}>
          <InputLabel id="language-label">language</InputLabel>
          <Select
            labelId="language-label"
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
          >
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="spanish">Spanish</MenuItem>
            <MenuItem value="french">French</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: "20px" }}>
          <InputLabel id="artist-label">Artist</InputLabel>
          <Select
            labelId="artist-label"
            id="artist-select"
            value={artist}
            onChange={handleArtistChange}
          >
            <MenuItem value="maroon5">Maroon 5</MenuItem>
            <MenuItem value="taylorSwift">Taylor Swift</MenuItem>
            <MenuItem value="edSheeran">Ed Sheeran</MenuItem>
          </Select>
        </FormControl>
      </div>

      <Button
        variant="outlined"
        style={{ marginTop: "20px" }}
        onClick={() => navigate("/")}
      >
        Back
      </Button>
    </BaseContainer>
  );
};

export default MusicPage;
