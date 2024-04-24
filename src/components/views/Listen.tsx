import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from 'context/WebSocketContext';
import '../../styles/views/Listen.scss';
import SongPlayer from './SongPlayer';

const Listen = () => {
  const { gameId } = useParams();
  const stomper = useWebSocket();
  const [song, setSong] = useState(null);

  useEffect(() => {
    if (!gameId || !stomper) return;

    const subscribeToSongInfo = () => {
      const subscription = stomper.subscribe(`/user/queue/listen`, message => {
        const songInfo = JSON.parse(message.body);
        console.log("Received song info:", songInfo);
        setSong(songInfo);
      });

      return () => subscription.unsubscribe();
    };

    subscribeToSongInfo();
    return () => stomper.disconnect();
  }, [stomper, gameId]);

  return (
    <div className="listen">
      <SongPlayer song={song} />
    </div>
  );
};

export default Listen;
