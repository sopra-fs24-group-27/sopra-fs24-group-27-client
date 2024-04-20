import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, handleError } from 'helpers/api';
import { Avatar, Button, CssBaseline, TextField, Box, Typography, Grid, Paper } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import 'styles/views/Profile.scss';

const defaultTheme = createTheme();

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('currentUserId'));
  const [editableUser, setEditableUser] = useState({
    username: '',
    name: '',
    birthDate: '',
    overallPoints: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAllowedToEdit, setIsAllowedToEdit] = useState(false);


  useEffect(() => {
    const currentUserId = localStorage.getItem('currentUserId');
    setCurrentUserId(currentUserId);
    
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
        setEditableUser(response.data);
        setIsAllowedToEdit(currentUserId === userId);
      } catch (error) {
        console.error('Fetching user data failed', error);
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
      console.error('Updating user failed', error);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      const token = localStorage.getItem('token'); 
      if (!token) {
        console.error('No token found');
        alert('No token found. You might not be logged in.');
        return;
      }
      const response = await api.post('/logout', { token }); 
      console.log('Logout response', response);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      alert('Logout failed. Check console for details.'); 
    }
  };
  
  

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh', justifyContent: 'center' }} > 
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <PersonOutlineIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              User Profile
            </Typography>
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
                InputLabelProps={
                  {
                    shrink: true,
                  }
                }
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
                InputLabelProps={
                  {
                    shrink: true,
                  }
                }
              />
              {isEditing ? (
                <Box sx={{ mt: 2 }}>
                  <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    Save Changes
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
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
                >
                  Edit Profile
                </Button>
                
              )}

              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={handleBack}
                sx={{ mt: 3, mb: 2 }}
              >
                Back
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={logout}
                sx={{ mt: 3, mb: 2 }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
