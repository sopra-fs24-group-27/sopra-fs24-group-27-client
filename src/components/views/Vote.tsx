import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import { api, handleError } from 'helpers/api';
import { Avatar } from "@mui/material";
// import { ReactComponent as AvatarSvg1 } from 'styles/views/avatars/avatar1.svg';
// import { ReactComponent as AvatarSvg2 } from 'styles/views/avatars/avatar2.svg';
// import { ReactComponent as AvatarSvg3 } from 'styles/views/avatars/avatar3.svg';
// import { ReactComponent as AvatarSvg4 } from 'styles/views/avatars/avatar4.svg';
// import { ReactComponent as AvatarSvg5 } from 'styles/views/avatars/avatar5.svg';
// import { ReactComponent as AvatarSvg6 } from 'styles/views/avatars/avatar6.svg';
// import { ReactComponent as AvatarSvg7 } from 'styles/views/avatars/avatar7.svg';

// const avatarComponents = [AvatarSvg1, AvatarSvg2, AvatarSvg3, AvatarSvg4, AvatarSvg5, AvatarSvg6, AvatarSvg7];

const Vote = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  // const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUserId"));
  const [currentUser, setCurrentUser] = useState(sessionStorage.getItem("userId"));
  const [currentPlayerId, setCurrentPlayerId] = useState(sessionStorage.getItem("playerId"));
  const [currentTurn, setCurrentTurn] = useState(1);
  const [votes, setVotes] = useState({});
  const [error, setError] = useState(null);
  const [voteResult, setVoteResult] = useState(null);
  const [votingDisabled, setVotingDisabled] = useState(false);
  const [votedUsers, setVotedUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setGameState(response.data.players);
        setRoomInfo(response.data);
        setCurrentTurn(response.data.currentTurn);

        console.log("roominfo:", roomInfo);
        const votesData = response.data.players.reduce((acc, player) => {
          acc[player.user.id] = player.votes || 0; // Assuming the server returns a 'votes' field for each player
          return acc;
        }, {});
        setVotes(votesData);

        // Determine voted and pending users
        const voted = response.data.players.filter(player => player.hasVoted).map(player => ({
          userid: player.user.id,
          username: player.user.username,
          avatar: player.user.avatar,
          player
        }));
        const pending = response.data.players.filter(player => !player.hasVoted).map(player => ({
          userid: player.user.id,
          username: player.user.username,
          avatar: player.user.avatar,
          player
        }));

        setVotedUsers(voted);
        setPendingUsers(pending);

        console.log("Voted Users:", voted);
        console.log("Pending Users:", pending);

        if (response.data.votedPlayers === 4) {
          navigate(`/games/${gameId}/end`);
        }

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

  // const renderVotingStatus = () => {
  //   return (
  //     <div>
  //       <h3>Voting Status</h3>
  //       <p><strong>Users who have voted:</strong> {votedUsers.join(", ")}</p>
  //       <p><strong>Waiting for votes from:</strong> {pendingUsers.join(", ")}</p>
  //     </div>
  //   );
  // };

  const renderVotingStatus = () => {
    return (
      <div>
        {/*<h3 style={{ fontSize: "18px", color: "white" }}>Voting Status</h3>*/}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "5px"}}>
          <div>
            <h4 style={{ fontSize: "16px", color: "white", marginBottom: "5px"}}>Users who have voted</h4>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {votedUsers.map((user, index) => (
                <div key={index} style={{ margin: "5px", padding: "3px", backgroundColor: 'rgba(175, 238, 238, 0.7)', borderRadius: "5px", display: "flex", flexDirection: "row", alignItems: "center", height: "40px"}}>
                  <Avatar src={user.avatar} style={{ width: 30, height: 30, marginBottom: '5px' }} />
                  <p style={{ fontSize: '12px', color: 'white', fontFamily: "Comic Sans MS" }}>{user.username}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: "16px", color: "white", marginBottom: "5px" }}>Waiting for votes from</h4>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {pendingUsers.map((user, index) => (
                <div key={index} style={{ margin: "5px", padding: "3px", backgroundColor: 'rgba(175, 238, 238, 0.7)', borderRadius: "5px", display: "flex", flexDirection: "row", alignItems: "center", height: "40px" }}>
                  <Avatar src={user.avatar} style={{ width: 30, height: 30, marginBottom: '5px' }} />
                  <p style={{ fontSize: '12px', color: 'white', fontFamily: "Comic Sans MS" }}>{user.username}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayers = () => {
    if (!gameState) {
      return <div>Loading...</div>; // or any other loading indicator
    }

    console.log("Game State:", gameState);
    console.log("current user", currentUser);

    const currentUserHasVoted = gameState.some(player => player.user.id === parseInt(currentUser) && player.hasVoted);


    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", justifyContent: "center", alignItems: "center" }}>
        {gameState.map((player, index) => {
          // const AvatarComponent = avatarComponents[player.user.avatar];
          return (
            <div key={index} className={`player-wrapper ${currentUser === player.user.id && currentTurn === player.turn ? "current-player" : ""}`} style={{ margin: "10px", backgroundColor: 'rgba(235, 200, 255, 0.7)', borderRadius: "10px", boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)", width: "350px", padding: "20px", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginLeft: "auto", marginRight: "auto" }}>
              <Avatar src={player.user.avatar} style={{ width: 60, height: 60, marginTop: '15px', cursor: 'pointer' }} />
              {/* <AvatarComponent style={{ width: 60, height: 60, marginTop: '15px', cursor: 'pointer' }} /> */}
              <p style={{ lineHeight: '0.8' }}>Username: {player.user.username}</p>
              <p style={{ lineHeight: '0.8' }}>Round 1 Emojis: {player.emojis.join(" ")}</p>
              <p style={{ lineHeight: '0.8' }}>Round 2 Emojis: {player.emojis2.join(" ")}</p>
              <p style={{ lineHeight: '0.8' }}>Votes: {votes[player.user.id] || 0}</p>
              <Button
                variant="contained"
                color="primary"
                onClick={() => toVote(player.id)}
                disabled={votingDisabled || currentUserHasVoted || currentUser === player.user.id.toString()}
                style={{
                  marginRight: "10px",
                  ...(votingDisabled || currentUserHasVoted || currentUser === player.user.id.toString() ? {} : {
                    backgroundColor: '#AFEEEE',
                    color: '#00008B'
                  })
                }}>
                {currentUser === player.user.id.toString() ? "You can't vote for yourself" : "Catch you now!"}
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
      const response = await api.post(`/games/${gameId}/vote?voterId=${currentPlayerId}`, payload);
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
      <h1 className="page-title" style={{ fontSize: "24px", color: "white", display: "flex", justifyContent: "center", margin: "1px", marginBottom:"-5px" }}>Who is spy?</h1>
      {error && <p className="error-message">{error}</p>}
      {renderVotingStatus()}
      {renderPlayers()}
      {/*{renderScoresAndWinners()}*/}
      {/*<Button*/}
      {/*  variant="contained"*/}
      {/*  color="primary"*/}
      {/*  onClick={navigateToEndPage}*/}
      {/*  style={{ marginTop: "20px" }}>*/}
      {/*  Next*/}
      {/*</Button>*/}
    </BaseContainer>
  );
};

export default Vote;