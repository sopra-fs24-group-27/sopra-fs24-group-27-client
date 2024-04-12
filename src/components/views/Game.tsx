import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate} from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Game.scss";
import User from "models/User";
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';


const Player = ({ user }: { user: User }) => {
  // Convert user's birthday string to date object
  const birthdayDate = new Date(user.birthday);

  const formattedBirthday = birthdayDate.toLocaleDateString();

  const navigate = useNavigate(); 
  const navigateToProfile = () => {

    navigate(`/profile/${user.id}`);
  };

  return (
    <div className="player container" style={{ width: '300px', height: '250px' }}>
      <p>
        ID: {user.id}<br />
        Username: {user.username}<br />
        Scores: {user.scores}<br />
        Birthday: {formattedBirthday} <br />
      </p>
      <Button
        variant="contained"
        style={{ marginTop: '20px' , backgroundColor: '#9370DB'}} 
        onClick={navigateToProfile}
      >
        View Profile
      </Button>
    </div>
  );

};

Player.propTypes = {
  user: PropTypes.object,
};

const Game = () => {
  // use react-router-dom's hook to access navigation, more info: https://reactrouter.com/en/main/hooks/use-navigate 
  const navigate = useNavigate();

  // define a state variable (using the state hook).
  // if this variable changes, the component will re-render, but the variable will
  // keep its value throughout render cycles.
  // a component can have as many state variables as you like.
  // more information can be found under https://react.dev/learn/state-a-components-memory and https://react.dev/reference/react/useState 
  const [users, setUsers] = useState<User[]>(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const logout = (): void => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleOpenRules = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseRules = () => {
    setAnchorEl(null);
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
    content = (
      <div className="game">
        <ul className="game user-list">
          {users.map((user: User) => (
            <li key={user.id}>
              <Player user={user} />
            </li>
          ))}
        <Button
          style={{ width: '100%' , color: 'white'}}
          onClick={() => logout()}
        >
          Logout
        </Button>
        </ul>
      </div>
    );
  }

  return (
    <BaseContainer className="game container">
    <Button
      aria-describedby={anchorEl ? 'game-rules-popover' : undefined}
      variant="contained"
      onClick={handleOpenRules}
      style={{ position: 'absolute', top: '100px', right: '10%' , backgroundColor: '#9370DB'}}
    >
      Game Rules
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
        <p>If the spy receives the most votes, the non-spy players win; if the spy does not receive the most votes, the spy wins.</p>
        <p>After the game ends, the system updates players&apos scores based on the results.</p>
        <p>For the spy player, he/she must take on hidden identities, they must ensure nobody else finds out. If you are a spy, are you able to fake it until you make it?</p>
        <h4><strong>Identity Assignment</strong></h4>
        <h3><strong>Special Regulations</strong></h3>
        <p>Using Spotify API: Ensure all players can access the Spotify API to retrieve songs.</p>
        <p>Emoji Limitation: Encourage players to creatively use emojis for descriptions, but limit to a maximum of 5 emojis.</p>
        <p>Game Interface: Design a user-friendly interface showcasing the song player, emoji selector, and voting system.</p>
        <p>Game Feedback: Provide interactive feedback and score updates among players.</p>
        </div>
      </Popover>
    </div>

      <h2>Welcome to LyricLies!</h2>
      <p className="game paragraph">
        All Players:
      </p>
      {content}
    </BaseContainer>
  );
};

export default Game;