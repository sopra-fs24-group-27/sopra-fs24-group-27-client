import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import Stomper from "helpers/Stomper";
import { Spinner } from "components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Game.scss";
import User from "models/User";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import { useWebSocket } from "context/WebSocketContext"; // Ensure the path is correct

// import { ReactComponent as AvatarSvg1 } from 'styles/views/avatars/avatar1.svg';
// import { ReactComponent as AvatarSvg2 } from 'styles/views/avatars/avatar2.svg';
// import { ReactComponent as AvatarSvg3 } from 'styles/views/avatars/avatar3.svg';
// import { ReactComponent as AvatarSvg4 } from 'styles/views/avatars/avatar4.svg';
// import { ReactComponent as AvatarSvg5 } from 'styles/views/avatars/avatar5.svg';
// import { ReactComponent as AvatarSvg6 } from 'styles/views/avatars/avatar6.svg';
// import { ReactComponent as AvatarSvg7 } from 'styles/views/avatars/avatar7.svg';

// const avatarComponents = [AvatarSvg1, AvatarSvg2, AvatarSvg3, AvatarSvg4, AvatarSvg5, AvatarSvg6, AvatarSvg7];

const Player = ({ user }: { user: User }) => {
  // Convert user's birthday string to date object
  const birthdayDate = new Date(user.birthday);

  const formattedBirthday = birthdayDate.toLocaleDateString();

  const navigate = useNavigate();
  const navigateToProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  // const AvatarComponent = avatarComponents[Number(user.avatar)];

  return (
    <div
      className="player container"
      style={{ width: "350px", height: "250px" }}
    >
      <p>
        {/* <AvatarComponent
          style={{ width: 60, height: 60, marginTop: '15px', cursor: 'pointer' }}
          onClick={navigateToProfile}
        /> */}
        <div style={{ position: "relative", display: "flex" }}>
        <Avatar
          alt="Avatar"
          src={user.avatar}
          sx={{
            width: 80,
            height: 80,
            cursor: "pointer",
            marginBottom: 2,
            marginTop: -2,
            marginLeft: "10px",
          }}
          onClick={navigateToProfile}
        />
        <Button
        variant="text"
        style={{ marginTop: "-10px", left: "40%", color: "white" }}
        onClick={navigateToProfile}
      >
        → Profile ←
        </Button>
        </div>
        <div style={{ position: "relative", display: "flex", left: "5%" , maxWidth: "300px", maxHeight: "100px", wordBreak: "break-word"}}>
        ID: {user.id}
        <br />
        Username: {user.username}
        <br />
        Scores: {user.score}
        <br />
        Birthday: {user.birthDate} <br />
        </div>
      </p>
      
      
    </div>
  );
};

Player.propTypes = {
  user: PropTypes.object,
};

const Game = () => {
  // use react-router-dom's hook to access navigation, more info: https://reactrouter.com/en/main/hooks/use-navigate
  const [anchorEl, setAnchorEl] = useState(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roomAnchorEl, setRoomAnchorEl] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [joinRoomAnchorEl, setJoinRoomAnchorEl] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [tempRoomId, setTempRoomId] = useState("");
  // const userId = localStorage.getItem("userId");
  // const token = localStorage.getItem("token") || "";
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token") || "";
  const message = JSON.stringify({ userId: userId });
  const stomper = useWebSocket();
  const [artistList, setArtistList] = useState([]);

  const [roomInfo, setRoomInfo] = useState({ players: [], hostId: null });
  const [currentUser, setCurrentUser] = useState(
    sessionStorage.getItem("userId")
  );
  const [host, setHostUser] = useState({ id: null });
  const navigate = useNavigate();

  const logout = (): void => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const handleOpenRules = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseRules = () => {
    setSelectedGenre("");
    setSelectedMarket("");
    setSelectedArtist("");
    setAnchorEl(null);
  };

  const handleGenreChange = (event) => {
    const genre = event.target.value;
    setSelectedGenre(genre);

    // Define artists by genre
    const genreArtists = {
      Pop: [
        "Maroon 5",
        "Rihanna",
        "Taylor Swift",
        "Justin Bieber",
        "Ed Sheeran",
      ],
      Rap: ["Drake", "Nicki Minaj", "Eminem", "Doja Cat", "Kanye West"],
      Rock: [
        "Linkin Park",
        "Fall Out Boy",
        "Imagine Dragons",
        "Guns N' Roses",
        "Coldplay",
      ],
      Country: [
        "Jason Aldean",
        "Taylor Swift",
        "Hunter Hayes",
        "Morgan Wallen",
        "Brett Young",
      ],
    };

    // Set artists for the selected genre
    setArtistList(genreArtists[genre] || []);
  };

  // the effect hook can be used to react to change in your component.
  // in this case, the effect hook is only run once, the first time the component is mounted
  // this can be achieved by leaving the second argument an empty array.
  // for more information on the effect hook, please see https://react.dev/reference/react/useEffect
  useEffect(() => {
    // effect callbacks are synchronous to prevent race conditions. So we put the async function inside:
    async function fetchData() {
      try {
        const response = await api.get("/users");

        // delays continuous execution of an async operation for 1 second.
        // This is just a fake async call, so that the spinner can be displayed
        // feel free to remove it :)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the returned users and update the state.
        setUsers(response.data);

        // This is just some data for you to see what is available.
        // Feel free to remove it.
        console.log("request to:", response.request.responseURL);
        console.log("status code:", response.status);
        console.log("status text:", response.statusText);
        console.log("requested data:", response.data);

        // See here to get more data.
        console.log(response);
      } catch (error) {
        console.error(
          `Something went wrong while fetching the users: \n${handleError(
            error
          )}`
        );
        console.error("Details:", error);
        alert(
          "Something went wrong while fetching the users! See the console for details."
        );
      }
    }

    const intervalId = setInterval(fetchData, 12000); // Poll every 12 seconds
    fetchData();

    return () => {
      clearInterval(intervalId);
    };

    // fetchData();
  }, []);

  let content = <Spinner />;

  if (users) {
    const sortedUsers = users.slice().sort((a, b) => b.id - a.id);
    const usersPerColumn = Math.ceil(sortedUsers.length / 2);
    const usersColumn1 = sortedUsers.slice(0, usersPerColumn);
    const usersColumn2 = sortedUsers.slice(usersPerColumn);

    content = (
      <div
        className="game"
        style={{ maxHeight: "50vh", overflowY: "auto", display: "flex" }}
      >
        <ul className="game user-list" style={{ marginRight: "10px" }}>
          {usersColumn1.map((user: User) => (
            <li key={user.id}>
              <Player user={user} />
            </li>
          ))}
        </ul>
        <ul className="game user-list" style={{ marginRight: "10px" }}>
          {usersColumn2.map((user: User) => (
            <li key={user.id}>
              <Player user={user} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const handleClickCreateRoom = (event) => {
    setRoomAnchorEl(event.currentTarget);
  };

  const handleClickJoinRoom = (event) => {
    setJoinRoomAnchorEl(event.currentTarget);
  };

  const handleCloseRoom = () => {
    setRoomAnchorEl(null);
  };

  // Function to handle room creation
  const handleConfirmRoom = async () => {
    handleCloseRoom(); // Ensure the room creation popover is closed after confirming
  
    // Check if all required fields are selected
    if (!selectedMarket || !selectedArtist || !selectedGenre) {
      alert("Please select a market, artist, and genre before creating the room.");
      return; // Exit the function if any field is not selected
    }
  
    try {
      const settings = {
        market: selectedMarket,
        artist: selectedArtist,
        genre: selectedGenre,
      };
      const roomData = {
        hostId: userId, // Assuming userId is stored and retrieved correctly
        settings,
        currentRound: 0, // Assuming you start at round 0
        players: [], // Initially, there are no players until they join
      };
      const response = await api.post("/games", roomData);
      console.log("Room created successfully", response.data);
      const gameId = response.data.gameId;
      const players = response.data.players;
      // localStorage.setItem('gameId', gameId);
      sessionStorage.setItem("gameId", gameId);
      console.log("players", players);
      players.forEach((player) => {
        if (player.user.id.toString() === currentUser) {
          sessionStorage.setItem("playerId", player.id);
          console.log("playerid", player.id);
        }
      });
  
      // Navigate to the game's lobby or waiting room
      navigate(`/games/${gameId}/waitingroom`);
    } catch (error) {
      console.error(
        `Something went wrong while creating the room: ${handleError(error)}`
      );
      alert(
        `Something went wrong while creating the room: ${handleError(error)}`
      );
    }
  };
  

  const JoinRoomPopover = () => {
    const [tempRoomId, setTempRoomId] = useState(""); // To hold the room ID input by the user
    const navigate = useNavigate();

    const handleJoinRoom = async () => {
      if (!tempRoomId) {
        alert("Please enter a room ID.");

        return;
      }

      try {
        const response = await api.post(
          `/games/${tempRoomId}/join?userId=${userId}`
        );
        console.log("Joined room successfully", response.data);
        // localStorage.setItem('gameId', tempRoomId);
        sessionStorage.setItem("gameId", tempRoomId);

        const response2 = await api.get(`/games/${tempRoomId}`);
        const players = response2.data.players;
        console.log("players", players);
        players.forEach((player) => {
          if (player.user.id.toString() === currentUser) {
            sessionStorage.setItem("playerId", player.id);
            console.log("playerid", player.id);
          }
        });

        // Navigate to the game's waiting room
        navigate(`/games/${tempRoomId}/waitingroom`);
      } catch (error) {
        console.error(`Failed to join room: ${handleError(error)}`);
        alert("Failed to join the room.");
      } finally {
        handleCloseJoinRoom(); // Close the join room popover regardless of outcome
      }
    };

    const handleRoomIdChange = (event) => {
      setTempRoomId(event.target.value);
    };

    const handleCloseJoinRoom = () => {
      setJoinRoomAnchorEl(null);
      setRoomIdInput("");
      setTempRoomId("");
    };

    return (
      <Popover
        open={Boolean(joinRoomAnchorEl)}
        anchorEl={joinRoomAnchorEl}
        onClose={handleCloseJoinRoom}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div style={{ padding: "20px" }}>
          <h2>Join a Room</h2>
          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="room-id-input">Room ID</InputLabel>
            <Input
              id="room-id-input"
              value={tempRoomId}
              onChange={(e) => setTempRoomId(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={handleJoinRoom} edge="end">
                    <ArrowForwardIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Button
            variant="outlined"
            color="primary"
            style={{ marginTop: "10px" }}
            fullWidth
            onClick={() => setJoinRoomAnchorEl(null)}
          >
            Cancel
          </Button>
        </div>
      </Popover>
    );
  };

  return (
    <BaseContainer className="game container">
      <Button
        aria-describedby={anchorEl ? "game-rules-popover" : undefined}
        variant="text"
        onClick={handleOpenRules}
        style={{
          position: "absolute",
          top: "110px",
          right: "20%",
          color: "#AFEEEE",
        }}
      >
        → Game Rules ←
      </Button>
      <div
        className="popover-container"
        style={{ maxHeight: "50vh", overflowY: "auto", scrollbarWidth: "thin" }}
      >
        <Popover
          id="game-rules-popover"
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleCloseRules}
          sx={{
            width: "80%",
            height: "80%",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          slotProps={{
            paper: {
              style: {
                backgroundColor: "#D8BFD8",
              },
            },
          }}
        >
          <div style={{ padding: "20px" }}>
            <h2>
              <strong>Game Rules</strong>
            </h2>
            <h3>
              <strong>Overview of LyricLies</strong>
            </h3>
            <p>Number of players: 4 Players</p>
            <p>
              Material: Songs(by Spotify API)
            </p>
            <p>Audience: Ages 10+</p>
            <p>
            At the start of the game, roles are randomly assigned: 
            three players become detectives and one becomes the spy. 
            The spy listens to a different song than the detectives. 
            During the game, each player must describe their song using a limited 
            number of emojis. After two rounds of emoji descriptions, 
            players vote on who they think the spy is. 
            Detectives need to use the emoji clues to identify the spy, 
            while the spy must disguise their true identity. Each player&apos;s role 
            is revealed only after the voting ends. 
            If the spy gets 2 or 3 votes, the detectives win! If not, the spy wins!
            </p>
            <h3>
              <strong>How to play LyricLies</strong>
            </h3>
            <h4>
              <strong>Game Set Up</strong>
            </h4>
            <p>
              After registering and logging in, players can create or join a
              game room. When creating a new game room, players can customize game
               preferences, including music genre, artist, and country. 
               After creating the room, the Game ID can be shared with other players to join. 
              Once the room has four players, the room owner can
              hits the start button, and the fun begins! Just make sure to 
              keep your screens and device audio a secret—no peeking or eavesdropping allowed!
            </p>
            <h4>
              <strong>Identity Assignment</strong>
            </h4>
            <p>
              To kick off the game, the system uses the Spotify API to randomly select songs. 
              Three players will hear the same song, while the fourth player, the spy, 
              gets a different tune. 
              All players listen to their assigned songs simultaneously for 30 seconds.
            </p>
            <h4>
              <strong>Emoji Description</strong>
            </h4>
            <p>
              After listening, each player chooses up to 5
              emojis to describe the song they heard, for two rounds. These emojis can reflect the emotions, 
              style, lyrics, or overall vibe.Since no one knows if they are the spy, 
              you can choose to be as vague or detailed as you like. 
            </p>
            <h4>
              <strong>Guessing and Voting</strong>
            </h4>
            <p>
              Players guess who the spy is based on the emoji descriptions. 
              If the spy gets 2 or 3 votes, the detectives win! If not, the spy wins!
            </p>
            <h4>
              <strong>End of Game</strong>
            </h4>
            <p>
              The game comes to an end when the true identity is revealed!
              (reveal the song of all detective players and show the different
              song the spy listened to.)
            </p>
            <p>
              If the spy receives two or more votes, the detective players win;
              otherwise, the spy wins.
            </p>
            <p>
              After the game ends, the system updates the scoreboard based
              on the results.
            </p>
            <p>
              As the spy, your mission is to blend in and hide your true identity. 
              Can you keep your cover and outsmart the others to claim victory?
            </p>
            <h3>
              <strong>Emoji Limitation</strong>
            </h3>
            <p>
              Due to system limitations, some flag emojis may not display 
              correctly on Windows systems.
            </p>
          </div>
        </Popover>
      </div>

      <h2 style={{ fontFamily: "Comic Sans MS" }}>Welcome to LyricLies!</h2>
      <Button
        variant="contained"
        style={{
          marginTop: "20px",
          backgroundColor: "#DB70DB",
          color: "#00008B",
        }}
        onClick={handleClickCreateRoom} // Call handleClickCreateRoom when button is clicked
      >
        Create a new Room
      </Button>
      <Button
        variant="contained"
        style={{
          marginTop: "20px",
          backgroundColor: "#AFEEEE",
          color: "#00008B",
        }}
        onClick={handleClickJoinRoom}
      >
        Join a Room
      </Button>
      <JoinRoomPopover />
      <div className="room-setting container">
        {/* Room creation dialog */}
        <Popover
          open={Boolean(roomAnchorEl)}
          anchorEl={roomAnchorEl}
          onClose={handleConfirmRoom}
          anchorOrigin={{
            vertical: "center",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "center",
          }}
        >
          <div style={{ padding: "50px", width: "500px" }}>
            <h2 style={{ textAlign: "center" }}>Customize your game</h2>

            {/* Dropdowns for song genre, market, and artist */}
            <FormControl fullWidth sx={{ marginTop: "10px" }}>
              <InputLabel id="genre-label">Genre</InputLabel>
              <Select
                labelId="genre-label"
                id="genre-select"
                value={selectedGenre}
                label="Genre"
                onChange={handleGenreChange}
              >
                <MenuItem value="Pop">Pop</MenuItem>
                <MenuItem value="Rap">Rap</MenuItem>
                <MenuItem value="Rock">Rock</MenuItem>
                <MenuItem value="Country">Country</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ marginTop: "10px" }}>
              <InputLabel id="market-label">Country</InputLabel>
              <Select
                labelId="market-label"
                id="market-select"
                value={selectedMarket}
                label="Market"
                onChange={(e) => setSelectedMarket(e.target.value)}
              >
                <MenuItem value="US">United States</MenuItem>
                <MenuItem value="CA">Canada</MenuItem>
                <MenuItem value="GB">United Kingdom</MenuItem>
                <MenuItem value="AU">Australia</MenuItem>
                <MenuItem value="DE">Germany</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ marginTop: "10px" }}>
              <InputLabel id="artist-label">Artist</InputLabel>
              <Select
                labelId="artist-label"
                id="artist-select"
                value={selectedArtist}
                label="Artist"
                onChange={(e) => setSelectedArtist(e.target.value)}
              >
                {artistList.map((artist) => (
                  <MenuItem key={artist} value={artist}>
                    {artist}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Buttons for confirmation and cancel */}
            <Button
              variant="contained"
              style={{
                marginTop: "20px",
                marginRight: "10px",
                backgroundColor: "#DB70DB",
              }}
              onClick={handleConfirmRoom}
            >
              Confirm
            </Button>
            <Button
              variant="outlined"
              style={{ marginTop: "20px", color: "#DB70DB" }}
              onClick={handleCloseRoom} //close dialog
            >
              Cancel
            </Button>
          </div>
        </Popover>
      </div>

      <p className="game paragraph">All Players:</p>
      {content}
      <Button
        style={{ width: "100%", color: "white", marginTop: "20px" }}
        onClick={() => logout()}
      >
        Logout
      </Button>
    </BaseContainer>
  );
};

export default Game;
