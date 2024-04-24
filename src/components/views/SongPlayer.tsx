import React from 'react';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';

const SongPlayer = ({ song }) => {
  if (!song) return <p>Loading song...</p>;

  return (
    <div className="song-container">
      <img src={song.imageUrl} alt={`Cover for ${song.songTitle}`} style={{ width: '100%', height: 'auto' }} />
      <div className="song-details">
        <h3>{song.songTitle}</h3>
        <p>Artist: {song.songArtist}</p>
        <ReactPlayer url={song.playUrl} playing controls />
      </div>
    </div>
  );
};

SongPlayer.propTypes = {
  song: PropTypes.shape({
    imageUrl: PropTypes.string.isRequired,
    songTitle: PropTypes.string.isRequired,
    songArtist: PropTypes.string.isRequired,
    playUrl: PropTypes.string.isRequired,
  })
};

export default SongPlayer;
