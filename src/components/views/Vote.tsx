import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import { api, handleError } from 'helpers/api';
import { ReactComponent as AvatarSvg1 } from 'styles/views/avatars/avatar1.svg';
import { ReactComponent as AvatarSvg2 } from 'styles/views/avatars/avatar2.svg';
import { ReactComponent as AvatarSvg3 } from 'styles/views/avatars/avatar3.svg';
import { ReactComponent as AvatarSvg4 } from 'styles/views/avatars/avatar4.svg';
import { ReactComponent as AvatarSvg5 } from 'styles/views/avatars/avatar5.svg';
import { ReactComponent as AvatarSvg6 } from 'styles/views/avatars/avatar6.svg';
import { ReactComponent as AvatarSvg7 } from 'styles/views/avatars/avatar7.svg';

const avatarComponents = [AvatarSvg1, AvatarSvg2, AvatarSvg3, AvatarSvg4, AvatarSvg5, AvatarSvg6, AvatarSvg7];

const Vote = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  // const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUserId"));
  const [currentUser, setCurrentUser] = useState(sessionStorage.getItem("currentUserId"));
  const [currentTurn, setCurrentTurn] = useState(1);
  const [votes, setVotes] = useState({});
  const [error, setError] = useState(null);
  const [voteResult, setVoteResult] = useState(null);
  const [votingDisabled, setVotingDisabled] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setGameState(response.data.players);
        setRoomInfo(response.data);
        setCurrentTurn(response.data.currentTurn);

        const votesData = response.data.players.reduce((acc, player) => {
          acc[player.id] = player.votes || 0; // Assuming the server returns a 'votes' field for each player
          return acc;
        }, {});
        setVotes(votesData);

        console.log("currentturn", currentTurn);
      } catch (error) {
        console.error("Error fetching game state:", error);
        setError("Failed to load game state");
      }
    };

    fetchGameState();

    const intervalId = setInterval(fetchGameState, 2000); // Fetch every 2 seconds

    return () => clearInterval(intervalId);
  }, [gameId]);

  const renderPlayers = () => {
    if (!gameState) {
      return <div>Loading...</div>; // or any other loading indicator
    }

    console.log("Game State:", gameState);
    console.log("current user", currentUser);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", justifyContent: "center", alignItems: "center" }}>
        {gameState.map((player, index) => {
          const AvatarComponent = avatarComponents[player.user.avatar];
          return (
            <div key={index} className={`player-wrapper ${currentUser === player.id && currentTurn === player.turn ? "current-player" : ""}`} style={{ margin: "10px", backgroundColor: "#7c83fd", borderRadius: "10px", boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)", width: "300px", padding: "20px", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <AvatarComponent style={{ width: 60, height: 60, marginTop: '15px', cursor: 'pointer' }} />
              <p>Username: {player.user.username}</p>
              <p>Round 1 Emojis: {player.emojis.join(" ")}</p>
              <p>Round 2 Emojis: {player.emojis2.join(" ")}</p>
              <p>Votes: {votes[player.id] || 0}</p>
              <Button
                variant="contained"
                color="primary"
                onClick={() => toVote(player.id)}
                disabled={votingDisabled || currentUser === player.id.toString()}
                style={{ marginRight: "10px" }}>
                {currentUser === player.id.toString() ? "You can't vote for yourself" : "Catch you now!"}
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  const toVote = async (votedPlayerId) => {
    try {
      const payload = votedPlayerId;
      const response = await api.post(`/games/${gameId}/vote?voterId=${currentUser}`, payload);
      setVoteResult(response.data.message); // Assuming the server sends back some message
      console.log("Vote successful:", response.data);
      setVotingDisabled(true);
    } catch (error) {
      console.error("Error in voting:", error);
      setError("Failed to process vote");
    }
  };

  const renderScoresAndWinners = () => {
    if (!gameState) return <div>Loading scores...</div>;

    const winners = gameState.filter(player => player.winner);
    console.log("winners:", winners);

    return (
      <div>
        <h3>Final Scores:</h3>
        <ul>
          {gameState.map((player, index) => (
            <li key={index}>{player.user.username}: {player.score} {player.winner ? '(Winner)' : ''}</li>
          ))}
        </ul>
        {winners.length > 0 && (
          <div>
            <h3>Winners:</h3>
            <ul>
              {winners.map((winner, index) => (
                <li key={index}>{winner.user.username}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const navigateToEndPage = () => {
    navigate(`/games/${gameId}/end`);
  };

  return (
    <BaseContainer className="round-container">
      <h1 className="page-title" style={{ fontSize: "24px", color: "white", display: "flex", justifyContent: "center" }}>Who is spy?</h1>
      {error && <p className="error-message">{error}</p>}
      {renderPlayers()}
      {/*{renderScoresAndWinners()}*/}
      <Button
        variant="contained"
        color="primary"
        onClick={navigateToEndPage}
        style={{ marginTop: "20px" }}>
        Next
      </Button>
    </BaseContainer>
  );
};

export default Vote;
