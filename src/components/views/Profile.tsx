import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from 'helpers/api';
import { Avatar, Button, CssBaseline, TextField, Box, Typography, Grid, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import 'styles/views/Profile.scss';
import "styles/views/Game.scss";
import AvatarSelectionDialog from './AvatarSelectionDialog';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#7e57c2',
    },
  },
  typography: {
    fontFamily: 'Comic Sans MS',
  },
});

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(sessionStorage.getItem('userId'));
  const [editableUser, setEditableUser] = useState({
    avatar: '',
    username: '',
    name: '',
    birthDate: '',
    overallPoints: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAllowedToEdit, setIsAllowedToEdit] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  useEffect(() => {
    const currentUserId = sessionStorage.getItem('userId');
    setCurrentUserId(currentUserId);

    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        const userData = response.data;
        
        // 将用户的 score 设置为 overallPoints
        userData.overallPoints = userData.score;

        setUser(userData);
        setEditableUser(userData);
        setIsAllowedToEdit(currentUserId === userId);
      } catch (error) {
        console.error("Fetching user data failed", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleBack = () => {
    navigate('/lobby');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditableUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/users/${userId}`, JSON.stringify(editableUser));
      setUser(editableUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Updating user failed", error);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      setIsAvatarDialogOpen(true);
    }
  };

  const handleAvatarSelect = (avatar) => {
    setEditableUser((prevState) => ({ ...prevState, avatar }));
  };

  const handleAvatarConfirm = async (avatar) => {
    if (avatar) {
      try {
        const updatedUser = { ...editableUser, avatar };
        console.log('Updating user with avatar:', updatedUser);
        await api.put(`/users/${userId}`, JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditableUser(updatedUser);
        setIsAvatarDialogOpen(false);
      } catch (error) {
        console.error('Updating avatar failed', error);
      }
    }
  };

  const handleAvatarDialogClose = () => {
    setIsAvatarDialogOpen(false);
  };

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh', marginTop: '-80px' }}>
        <Grid item xs={12} sm={8} md={4}>
          <Paper elevation={6} square sx={{ backgroundColor: 'rgba(235, 200, 255, 0.7)', borderRadius: '50px 50px 50px 50px' }}>
            <Box
              sx={{
                my: 8,
                mx: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5" style={{ marginTop: '25px', marginBottom: '20px', color: 'white' }}>
                User Profile
              </Typography>
              <Avatar alt="Avatar" src={editableUser.avatar} sx={{ width: 100, height: 100, cursor: isEditing ? 'pointer' : 'default' }} onClick={handleAvatarClick} />
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="username"
                  label="Username"
                  type="text"
                  id="username"
                  value={editableUser.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="name"
                  label="Name"
                  type="text"
                  id="name"
                  value={editableUser.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="birthDate"
                  label="Birthdate"
                  type="date"
                  id="birthDate"
                  value={editableUser.birthDate}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="overallPoints"
                  label="OverallPoints"
                  type="text"
                  id="overallPoints"
                  value={editableUser.overallPoints}
                  onChange={handleChange}
                  disabled={true}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                {isEditing ? (
                  <Box sx={{ mt: 2 }}>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                      Save Changes
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditing(false)}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                    disabled={!isAllowedToEdit}
                    sx={{ mt: 3, mb: 2 }}
                    style={{ marginTop: '20px', marginRight: '10px', backgroundColor: '#AFEEEE', color: '#00008B' }}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="contained"
                  style={{ marginTop: '20px', marginRight: '10px', backgroundColor: '#DB70DB', marginBottom: '50px' }}
                  onClick={handleBack}
                  sx={{ mt: 3, mb: 2 }}
                >
                  Back
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <AvatarSelectionDialog
        open={isAvatarDialogOpen}
        onClose={handleAvatarDialogClose}
        onSelect={handleAvatarSelect}
        onConfirm={handleAvatarConfirm}
      />
    </ThemeProvider>
  );
}