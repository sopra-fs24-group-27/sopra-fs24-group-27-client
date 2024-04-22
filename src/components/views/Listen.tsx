// This page is for users to listen to the songs they are assigned to during the game
import React, { useState, useEffect } from 'react';
import './Listen.scss';

import SongInfo from 'models/SongInfo';
import User from 'models/User';
import Player from 'components/ui/Player';

interface ListenProps {
  fetchSong: () => Promise<SongInfo>;
  currentUser: User;
}

const Listen: React.FC<ListenProps> = ({ fetchSong, currentUser }) => {
  const [song, setSong] = useState<SongInfo>(new SongInfo());
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    // Fetch the song details when the component mounts
    fetchSong().then(setSong);

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [fetchSong]);

  // Handle timer expiration
  useEffect(() => {
    if (timer === 0) {
      // Handle what happens when the timer runs out
      console.log('Time is up!');
    }
  }, [timer]);

  return (
    <div className="listen">
      <div className="listen-header">
        <div className="user-info">
          <img src={currentUser.imageUrl} alt={`${currentUser.username}`} />
          <span>{currentUser.username}</span>
        </div>
        <div className="timer">{timer} SEC</div>
      </div>
      <div className="song-info">
        <img src={song.imageUrl} alt={`Cover for ${song.title} by ${song.artist}`} />
        <div className="song-details">
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
          {/* Use the Player component to play the song */}
            <Player src={song.previewUrl} />
        </div>
      </div>
    </div>
  );
};

export default Listen;
