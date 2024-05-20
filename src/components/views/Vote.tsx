import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import Button from "@mui/material/Button";
import { api, handleError } from "helpers/api";
import { Avatar } from "@mui/material";

const Vote = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState(
    sessionStorage.getItem("userId")
  );
  const [currentPlayerId, setCurrentPlayerId] = useState(
    sessionStorage.getItem("playerId")
  );
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [voteResult, setVoteResult] = useState<string | null>(null);
  const [votingDisabled, setVotingDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        setGameState(response.data.players);
        setRoomInfo(response.data);
        setCurrentTurn(response.data.currentTurn);

        const votesData = response.data.players.reduce((acc: Record<string, number>, player: any) => {
          acc[player.user.id] = player.votes || 0;
          return acc;
        }, {});
        setVotes(votesData);

        if (response.data.votedPlayers === 4) {
          navigate(`/games/${gameId}/end`);
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
        setError("Failed to load game state");
      }
    };

    fetchGameState();

    const intervalId = setInterval(fetchGameState, 2000);

    return () => clearInterval(intervalId);
  }, [gameId, navigate]);

  const renderPlayers = () => {
    if (!gameState) {
      return <div>Loading...</div>;
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {gameState.map((player: any, index: number) => (
          <div
            key={index}
            className={`player-wrapper ${
              currentUser === player.user.id && currentTurn === player.turn
                ? "current-player"
                : ""
            }`}
            style={{
              margin: "10px",
              backgroundColor: "rgba(235, 200, 255, 0.7)",
              borderRadius: "10px",
              boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
              width: "350px",
              padding: "20px",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <Avatar
              src={player.user.avatar}
              style={{
                width: 60,
                height: 60,
                marginTop: "15px",
                cursor: "pointer",
              }}
            />
            <p style={{ lineHeight: "0.8" }}>
              Username: {player.user.username}
            </p>
            <p style={{ lineHeight: "0.8" }}>
              Round 1 Emojis: {player.emojis.join(" ")}
            </p>
            <p style={{ lineHeight: "0.8" }}>
              Round 2 Emojis: {player.emojis2.join(" ")}
            </p>
            <p style={{ lineHeight: "0.8" }}>
              Votes: {votes[player.user.id] || 0}
            </p>
            <Button
              variant="contained"
              color="primary"
              onClick={() => toVote(player.id)}
              disabled={
                votingDisabled || currentUser === player.user.id.toString()
              }
              style={{
                marginRight: "10px",
                ...(votingDisabled ||
                currentUser === player.user.id.toString()
                  ? {}
                  : {
                      backgroundColor: "#AFEEEE",
                      color: "#00008B",
                    }),
              }}
            >
              {currentUser === player.user.id.toString()
                ? "You can't vote for yourself"
                : "Catch you now!"}
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const toVote = async (votedPlayerId: string) => {
    try {
      await api.post(
        `/games/${gameId}/vote?voterId=${currentPlayerId}`,
        { votedPlayerId }
      );
      setVoteResult("Vote successful");
      setVotingDisabled(true);
    } catch (error) {
      console.error("Error in voting:", error);
      setError("Failed to process vote");
    }
  };

  const renderScoresAndWinners = () => {
    if (!gameState) return <div>Loading scores...</div>;

    const winners = gameState.filter((player: any) => player.winner);

    return (
      <div>
        <h3>Final Scores:</h3>
        <ul>
          {gameState.map((player: any, index: number) => (
            <li key={index}>
              {player.user.username}: {player.score}{" "}
              {player.winner ? "(Winner)" : ""}
            </li>
          ))}
        </ul>
        {winners.length > 0 && (
          <div>
            <h3>Winners:</h3>
            <ul>
              {winners.map((winner: any, index: number) => (
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
      <h1
        className="page-title"
        style={{
          fontSize: "24px",
          color: "white",
          display: "flex",
          justifyContent: "center",
        }}
      >
        Who is spy?
      </h1>
      {error && <p className="error-message">{error}</p>}
      {renderPlayers()}
      <Button
        variant="contained"
        color="primary"
        onClick={navigateToEndPage}
        style={{ marginTop: "20px" }}
      >
        Next
      </Button>
    </BaseContainer>
  );
};

export default Vote;
