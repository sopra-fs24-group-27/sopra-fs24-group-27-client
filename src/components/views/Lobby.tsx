import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import Stomper from "helpers/Stomper";
import { Spinner } from "components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Game.scss";
import User from "models/User";
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import { useWebSocket } from 'context/WebSocketContext';  // Ensure the path is correct

import { ReactComponent as AvatarSvg1 } from 'styles/views/avatars/avatar1.svg';
import { ReactComponent as AvatarSvg2 } from 'styles/views/avatars/avatar2.svg';
import { ReactComponent as AvatarSvg3 } from 'styles/views/avatars/avatar3.svg';
import { ReactComponent as AvatarSvg4 } from 'styles/views/avatars/avatar4.svg';
import { ReactComponent as AvatarSvg5 } from 'styles/views/avatars/avatar5.svg';
import { ReactComponent as AvatarSvg6 } from 'styles/views/avatars/avatar6.svg';
import { ReactComponent as AvatarSvg7 } from 'styles/views/avatars/avatar7.svg';

const avatarComponents = [AvatarSvg1, AvatarSvg2, AvatarSvg3, AvatarSvg4, AvatarSvg5, AvatarSvg6, AvatarSvg7];

const Player = ({ user }: { user: User }) => {
  // Convert user's birthday string to date object
  const birthdayDate = new Date(user.birthday);

  const formattedBirthday = birthdayDate.toLocaleDateString();

  const navigate = useNavigate();
  const navigateToProfile = () => {

    navigate(`/profile/${user.id}`);
  };

  const AvatarComponent = avatarComponents[Number(user.avatar)];

  return (
    <div className="player container" style={{ width: '350px', height: '250px' }}>

      <p>
        <AvatarComponent
          style={{ width: 60, height: 60, marginTop: '15px', cursor: 'pointer' }}
          onClick={navigateToProfile}
        />
        ID: {user.id}<br />
        Username: {user.username}<br />
        Scores: {user.scores}<br />
        Birthday: {user.birthDate} <br />
      </p>
      <Button
        variant="text"
        style={{ marginTop: '20px', left: '15%', color: 'white' }}
        onClick={navigateToProfile}
      >
        → Profile ←
      </Button>
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
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [joinRoomAnchorEl, setJoinRoomAnchorEl] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [tempRoomId, setTempRoomId] = useState('');
  // const userId = localStorage.getItem("userId");
  // const token = localStorage.getItem("token") || "";
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token") || "";
  const message = JSON.stringify({ userId: userId });
  const stomper = useWebSocket();
  const [artistList, setArtistList] = useState([]);

  const [roomInfo, setRoomInfo] = useState({ players: [], hostId: null });
  const [currentUser, setCurrentUser] = useState({ id: null, username: null });
  const [host, setHostUser] = useState({ id: null });
  const navigate = useNavigate();


  const logout = (): void => {
    localStorage.clear();
    navigate("/login");
  };

  const handleOpenRules = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseRules = () => {
    setSelectedGenre('');
    setSelectedMarket('');
    setSelectedArtist('');
    setAnchorEl(null);
  };

  const handleGenreChange = (event) => {
    const genre = event.target.value;
    setSelectedGenre(genre);

    // Define artists by genre
    const genreArtists = {
      "Pop": ["Maroon 5", "Rihanna", "Taylor Swift", "Justin Bieber", "Ed Sheeran"],
      "Rap": ["Drake", "Nicki Minaj", "Eminem", "Doja Cat", "Kanye West"],
      "Rock": ["Linkin Park", "Fall Out Boy", "Imagine Dragons", "Guns N' Roses", "Coldplay"],
      "Country": ["Jason Aldean", "Taylor Swift", "Hunter Hayes", "Morgan Wallen", "Brett Young"]
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

    fetchData();
  }, []);

  let content = <Spinner />;

  if (users) {
    const sortedUsers = users.slice().sort((a, b) => b.id - a.id);
    const usersPerColumn = Math.ceil(sortedUsers.length / 2);
    const usersColumn1 = sortedUsers.slice(0, usersPerColumn);
    const usersColumn2 = sortedUsers.slice(usersPerColumn);

    content = (
      <div className="game" style={{ maxHeight: '50vh', overflowY: 'auto', display: 'flex' }}>
        <ul className="game user-list" style={{ marginRight: '10px' }}>
          {usersColumn1.map((user: User) => (
            <li key={user.id}>
              <Player user={user} />
            </li>
          ))}
        </ul>
        <ul className="game user-list" style={{ marginRight: '10px' }}>
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
    handleCloseRoom();  // Ensure the room creation popover is closed after confirming

    try {
      const settings = {
        market: selectedMarket,
        artist: selectedArtist,
        genre: selectedGenre,
      };
      const roomData = {
        hostId: userId,  // Assuming userId is stored and retrieved correctly
        settings,
        currentRound: 0,  // Assuming you start at round 0
        players: []  // Initially, there are no players until they join
      };
      const response = await api.post('/games', roomData);
      console.log("Room created successfully", response.data);
      const gameId = response.data.gameId;
      localStorage.setItem('gameId', gameId);
      sessionStorage.setItem('gameId', gameId);

      // Navigate to the game's lobby or waiting room
      navigate(`/games/${gameId}/waitingroom`);
    } catch (error) {
      console.error(`Something went wrong while creating the room: ${handleError(error)}`);
      alert(`Something went wrong while creating the room: ${handleError(error)}`);
    }
  };



  const JoinRoomPopover = () => {
    const [tempRoomId, setTempRoomId] = useState('');  // To hold the room ID input by the user
    const navigate = useNavigate();

    const handleJoinRoom = async () => {
      if (!tempRoomId) {
        alert("Please enter a room ID.");
        return;
      }

      try {
        const response = await api.post(`/games/${tempRoomId}/join?userId=${userId}`);
        console.log("Joined room successfully", response.data);
        localStorage.setItem('gameId', tempRoomId);
        sessionStorage.setItem('gameId', tempRoomId);
        // Navigate to the game's waiting room
        navigate(`/games/${tempRoomId}/waitingroom`);
      } catch (error) {
        console.error(`Failed to join room: ${handleError(error)}`);
        alert("Failed to join the room.");
      } finally {
        handleCloseJoinRoom();  // Close the join room popover regardless of outcome
      }
    }

    const handleRoomIdChange = (event) => {
      setTempRoomId(event.target.value);
    };

    const handleCloseJoinRoom = () => {
      setJoinRoomAnchorEl(null);
      setRoomIdInput('');
      setTempRoomId('');
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
              onChange={e => setTempRoomId(e.target.value)}
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
        aria-describedby={anchorEl ? 'game-rules-popover' : undefined}
        variant="text"
        onClick={handleOpenRules}
        style={{ position: 'absolute', top: '110px', right: '20%', color: '#AFEEEE' }}
      >
        → Game Rules ←
      </Button>
      <div className="popover-container" style={{ maxHeight: '50vh', overflowY: 'auto', scrollbarWidth: 'thin' }}>
        <Popover
          id="game-rules-popover"
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleCloseRules}
          sx={{
            width: '80%',
            height: '80%',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          slotProps={{
            paper: {
              style: {
                backgroundColor: '#D8BFD8',
              },
            },
          }}
        >

          <div style={{ padding: '20px' }}>
            <h2><strong>Game Rules</strong></h2>
            <h3><strong>Overview of LyricLies</strong></h3>
            <p>Objective of LyricLies: The objective of LyricLies is to find out the spy who is listening to a different song by using emojis to describe the song they are listening to.</p>
            <p>Number of players: 4 Players</p>
            <p>Material: Songs(by Spotify API) to assign identity for each players</p>
            <p>Audience: Ages 10+</p>
            <p>At the beginning of the game, each player will be assigned a song and only one player’s song is different from others. As the game progresses, each player must describe the song they are listening to with limited emojis. After two rounds of describing, every player must vote on a spy they guessed. If the spy receives the most votes, then non-spies players win! On the other hand, if they fail to find the spy, then the spy player wins!</p>
            <h3><strong>How to play LyricLies</strong></h3>
            <h4><strong>Game Set Up</strong></h4>
            <p>After registering and logging in, players can create or join a game room. Once the room has four players, the room owner can start the game. Players should ensure that nobody else can see their screen or hear the voices of each other devices.</p>
            <h4><strong>Identity Assignment</strong></h4>
            <p>To begin gameplay, the system randomly selects a song through the Spotify API and plays the same song for three players while playing a different song for the fourth player (the spy). Then all players listen to the song simultaneously with a playback duration limited to 30 seconds.</p>
            <h4><strong>Emoji Description</strong></h4>
            <p>After listening, each player has 60 seconds to choose up to 5 emojis to describe the song they heard in turns. Descriptions can be based on the song&aposs emotions, style, lyrics, or overall vibe. You cannot know whether you are the spy, so vague description or not, it is your choice. Each player&aposs emoji descriptions are displayed to all players. The description takes two rounds.</p>
            <h4><strong>Guessing and Voting</strong></h4>
            <p>Players discuss and guess who the spy is based on everyone&aposs emoji descriptions. Discussion is limited to 2 minutes, and then each player must vote on who they suspect is the spy in 10s.</p>
            <h4><strong>End of Game</strong></h4>
            <p>The game comes to an end when the true identity is revealed! (reveal the correct song to all players and show the different songs the undercover listened to.)</p>
            <p>If the spy receives two or more votes, the detective players win; otherwise, the spy wins.</p>
            <p>After the game ends, the system updates players&apos scores based on the results.</p>
            <p>For the spy player, he/she must take on hidden identities, they must ensure nobody else finds out. If you are a spy, are you able to fake it until you make it?</p>
            <h3><strong>Special Regulations</strong></h3>
            <p>Using Spotify API: Ensure all players can access the Spotify API to retrieve songs.</p>
            <p>Emoji Limitation: Encourage players to creatively use emojis for descriptions, but limit to a maximum of 5 emojis.</p>
            <p>Game Interface: Design a user-friendly interface showcasing the song player, emoji selector, and voting system.</p>
            <p>Game Feedback: Provide interactive feedback and score updates among players.</p>
          </div>
        </Popover>
      </div>

      <h2 style={{ fontFamily: 'Comic Sans MS' }}>Welcome to LyricLies!</h2>
      <Button
        variant="contained"
        style={{ marginTop: '20px', backgroundColor: '#DB70DB', color: '#00008B' }}
        onClick={handleClickCreateRoom} // Call handleClickCreateRoom when button is clicked
      >
        Create a new Room
      </Button>
      <Button
        variant="contained"
        style={{ marginTop: '20px', backgroundColor: '#AFEEEE', color: '#00008B' }}
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
            vertical: 'center',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
        >
          <div style={{ padding: '50px', width: '500px' }}>
            <h2 style={{ textAlign: 'center' }}>Customize your game</h2>

            {/* Dropdowns for song genre, market, and artist */}
            <FormControl fullWidth sx={{ marginTop: '10px' }}>
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

            <FormControl fullWidth sx={{ marginTop: '10px' }}>
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

            <FormControl fullWidth sx={{ marginTop: '10px' }}>
              <InputLabel id="artist-label">Artist</InputLabel>
              <Select
                labelId="artist-label"
                id="artist-select"
                value={selectedArtist}
                label="Artist"
                onChange={(e) => setSelectedArtist(e.target.value)}
              >
                {artistList.map(artist => (
                  <MenuItem key={artist} value={artist}>{artist}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Buttons for confirmation and cancel */}
            <Button
              variant="contained"
              style={{ marginTop: '20px', marginRight: '10px', backgroundColor: '#DB70DB' }}
              onClick={handleConfirmRoom}
            >
              Confirm
            </Button>
            <Button
              variant="outlined"
              style={{ marginTop: '20px', color: '#DB70DB' }}
              onClick={handleCloseRoom} //close dialog
            >
              Cancel
            </Button>
          </div>
        </Popover>
      </div>

      <p className="game paragraph">
        All Players:
      </p>
      {content}
      <Button
        style={{ width: '100%', color: 'white', marginTop: '20px' }}
        onClick={() => logout()}
      >
        Logout
      </Button>
    </BaseContainer>
  );


};

export default Game;


