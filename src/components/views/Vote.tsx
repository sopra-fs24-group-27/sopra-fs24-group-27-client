import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useWebSocket } from 'context/WebSocketContext';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import '../../styles/views/VotePage.scss';

const VotePage = () => {
  const { gameId } = useParams();
  const stomper = useWebSocket();
  const [players, setPlayers] = useState([]);
  const [votedPlayer, setVotedPlayer] = useState(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  useEffect(() => {
    if (!gameId || !stomper) return;

    const connectAndSubscribe = async () => {
      try {
        await stomper.connect(gameId, localStorage.getItem("userId"));
        const subscription = stomper.subscribe(`/topic/games/${gameId}/players`, message => {
          const data = JSON.parse(message.body);
          console.log("Received updated player list:", data);
          setPlayers(data);
        });
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
      }
    };

    connectAndSubscribe();

    return () => {
      stomper.disconnect(); // Properly handle WebSocket disconnect
    };
  }, [stomper, gameId]);

  const handleVote = (playerId) => {
    if (playerId === localStorage.getItem("userId")) return; // Cannot vote for self
    setVotedPlayer(playerId);
    setOpenConfirmation(true);
  };

  const confirmVote = () => {
    // Send the vote to the server
    stomper.send(`/app/games/${gameId}/vote`, { playerId: votedPlayer });
    setOpenConfirmation(false);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
    setVotedPlayer(null);
  };

  return (
    <div className="vote-page">
      <h1 className="page-title">Vote for a Player</h1>
      <div className="player-list">
        {players.map(player => (
          <div key={player.id} className="player">
            <Button
              variant="contained"
              color="primary"
              disabled={player.id === localStorage.getItem("userId")}
              onClick={() => handleVote(player.id)}
            >
              {player.username}
            </Button>
          </div>
        ))}
      </div>
      <Dialog
        open={openConfirmation}
        onClose={handleCloseConfirmation}
      >
        <DialogTitle>Confirm Vote</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to vote for {players.find(p => p.id === votedPlayer)?.username}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmVote} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VotePage;
