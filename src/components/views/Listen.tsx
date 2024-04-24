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

    const subscriptions = [];

    // Function to fetch current song info if needed
    const fetchSongInfo = () => {
      stomper.send(`/app/games/${gameId}/currentSong`, {});
    };

    // Subscription to live song updates
    const setupSubscriptions = () => {
      const songUpdateSub = stomper.subscribe(`/user/queue/listen`, message => {
        const songInfo = JSON.parse(message.body);
        console.log("Live song info received:", songInfo);
        setSong(songInfo);
      });
      subscriptions.push(songUpdateSub);

      const currentSongSub = stomper.subscribe(`/user/queue/currentSong`, message => {
        const songInfo = JSON.parse(message.body);
        console.log("Current song info received on request:", songInfo);
        setSong(songInfo);
      });
      subscriptions.push(currentSongSub);
    };

    setupSubscriptions();
    fetchSongInfo();

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      console.log('Unsubscribed from song updates');
    };
  }, [stomper, gameId]);

  if (!song) {
    return <div className="listen">Loading song...</div>;
  }

  return (
    <div className="listen">
      <SongPlayer song={song} />
    </div>
  );
};

export default Listen;
