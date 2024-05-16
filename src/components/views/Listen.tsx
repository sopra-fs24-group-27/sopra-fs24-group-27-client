import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BaseContainer from 'components/ui/BaseContainer';
import ReactPlayer from 'react-player';
import ReactCountdownClock from 'react-countdown-clock';
import { api, handleError } from 'helpers/api';
import { ReactComponent as AvatarSvg1 } from 'styles/views/avatars/avatar1.svg';
import { ReactComponent as AvatarSvg2 } from 'styles/views/avatars/avatar2.svg';
import { ReactComponent as AvatarSvg3 } from 'styles/views/avatars/avatar3.svg';
import { ReactComponent as AvatarSvg4 } from 'styles/views/avatars/avatar4.svg';
import { ReactComponent as AvatarSvg5 } from 'styles/views/avatars/avatar5.svg';
import { ReactComponent as AvatarSvg6 } from 'styles/views/avatars/avatar6.svg';
import { ReactComponent as AvatarSvg7 } from 'styles/views/avatars/avatar7.svg';

const avatarComponents = [AvatarSvg1, AvatarSvg2, AvatarSvg3, AvatarSvg4, AvatarSvg5, AvatarSvg6, AvatarSvg7];

const Listen = ({ mockSong, mockCurrentUser, mockCurrentUsername, isMock = false }) => {
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [song, setSong] = useState(isMock ? mockSong : null);
  const [currentUsername, setCurrentUsername] = useState(isMock ? mockCurrentUsername : sessionStorage.getItem("username"));
  const [currentUser, setCurrentUser] = useState(isMock ? mockCurrentUser : null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (isMock) return;

    const currentUserId = sessionStorage.getItem("currentUserId");
    if (currentUserId) {
      fetchCurrentUser(currentUserId);
    }
  }, [isMock]);

  const fetchCurrentUser = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      setCurrentUser(response.data);
      console.log("Current user data:", response.data);
    } catch (error) {
      console.error("Failed to fetch current user data:", handleError(error));
      setError("Failed to fetch current user data");
    }
  };

  useEffect(() => {
    if (isMock || !gameId || !playerId) {
      return;
    }

    const fetchSongInfo = async () => {
      try {
        const response = await api.get(`/games/${gameId}/listen/${playerId}`);
        setSong(response.data);
        console.log("Song data:", response.data);
      } catch (error) {
        console.error("Failed to fetch song data:", handleError(error));
        setError("Failed to fetch song data");
      }
    };

    fetchSongInfo();
  }, [gameId, playerId, isMock]);

  const onComplete = () => {
    navigate(`/games/${gameId}/round`);
  };

  const avatarIndex = currentUser?.avatar ?? mockCurrentUser?.avatar;
  const AvatarComponent = avatarComponents[avatarIndex];

  if (!AvatarComponent) {
    console.error("AvatarComponent is not defined for avatar index:", avatarIndex);
  }

  console.log("currentUser:", currentUser);
  console.log("avatarIndex:", avatarIndex);
  console.log("AvatarComponent:", AvatarComponent);

  return (
    <BaseContainer className="music-player-container">
      <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'DC99CC' }}>
        {error && <div className="error">{error}</div>}
        {song ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <AvatarComponent
                    style={{ width: '100%', height: '100%', borderRadius: '50%', border: '5px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                  />
                  <span style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '18px' }}>{currentUsername}</span>
                </div>
              </div>
              <ReactCountdownClock
                seconds={30}
                color="#8C99CC"
                alpha={0.9}
                size={100}
                onComplete={onComplete}
              />
            </div>
            <div style={{ textAlign: 'center', padding: '10px', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', marginTop: '20px' }}>
              Hey, this is the song you got: <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{song.songTitle}</span> by <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{song.songArtist}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
              <img src={song.imageUrl} alt={`Cover for ${song.songTitle}`} style={{ width: '400px', height: '400px', marginBottom: '20px', marginTop: '-20px' }} />
              <ReactPlayer url={song.playUrl} playing controls width="400px" height="50px" />
              <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '16px', textAlign: 'center' }}>
                Please listen to the <span style={{ fontSize: '18px', fontWeight: 'bold' }}>30 seconds</span> highlights of the song carefully.
                You will be asked to describe it later!
              </div>
            </div>
          </>
        ) : (
          <p>Loading song...</p>
        )}
      </div>
    </BaseContainer>
  );
};

export default Listen;
