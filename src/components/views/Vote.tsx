import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useWebSocket } from 'context/WebSocketContext';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import '../../styles/views/VotePage.scss';
import { api, handleError } from "helpers/api";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

const VotePage = () => {

  /*TESTING
  const fakeUsers = [
    { id: 1, username: "User1" },
    { id: 2, username: "User2" },
    { id: 3, username: "User3" },
    { id: 4, username: "User4" }
  ];
  */
 
  const { gameId } = useParams();
  const [players, setPlayers] = useState([]);
  //const [players, setPlayers] = useState(fakeUsers); // For testing
  const [votedPlayer, setVotedPlayer] = useState(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [timer, setTimer] = useState(10); 

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      navigate(`/games/${gameId}/end`);
    }
  }, [timer, votedPlayer]);

  const navigate = useNavigate();


  const handleVote = (playerId:any) => {
    if (playerId.toString() === localStorage.getItem("userId") || hasVoted) return;  // Cannot vote for self or if already voted
    setVotedPlayer(playerId);
    setOpenConfirmation(true);
    };

  
  const confirmVote = async () => {
    try {
      const response = await api.post(`/games/${gameId}/vote`, { playerId: votedPlayer });
      if (response.ok) {
      alert(`Vote for ${players.find(player => player.id === votedPlayer).username} successful!`);
      setOpenConfirmation(false);
      setHasVoted(true); // Mark that current player has voted
    } else {
    console.error("Failed to send vote:", response.statusText);
      }
    } catch (error) {
    console.error("Error sending vote:", error);
      }
    };
  

  /*TESTING
  const confirmVote = () => {
    // for testing
    alert(`Vote for ${players.find(player => player.id === votedPlayer).username} successful!`);
    setOpenConfirmation(false);
    setHasVoted(true); // Mark that current player has voted
    };
  */


  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
    setVotedPlayer(null);
  };

  return (
    <div className="vote-page">
     <h1 className="page-title" style={{ fontSize: "24px", color: "white", display: "flex", justifyContent: "center"}}>Who do you think the spy is?</h1>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <AccessAlarmIcon style={{ fontSize: 48 }} />
        <span style={{ fontSize: 24, marginLeft: 10 }}>{timer}</span>
      </div>
      <div className="player-list">
        {players.map(player => (
          <div key={player.id} className="player">
            <Button
              variant="contained"
              style={{ backgroundColor: '#AFEEEE', 
              color: '#00008B', 
              textAlign: "center", 
              display: "block", 
              margin: "0 auto" }} 
              disabled={player.id.toString() === localStorage.getItem("userId") || hasVoted}
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
          <Button onClick={handleCloseConfirmation} style={{ color: 'grey' }}>
            Cancel
          </Button>
          <Button onClick={confirmVote} style={{ color: '#DB70DB' }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VotePage;
