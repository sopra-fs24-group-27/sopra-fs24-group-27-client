import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { api, handleError } from 'helpers/api';


// TODO: configure default theme in an independent file and import it here
const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#7e57c2',
    },
    secondary: {
      main: '#ba68c8',
    },
  },
  typography: {
    fontFamily: 'Comic Sans MS',
  },
});

// TODO: define Copyright in an independent file and import it here
const Copyright = (props: any) => {
  return (
    <Typography variant="body2" color="#fff" align="center" {...props} >
      {'Copyright © LyricLies '}
      {new Date().getFullYear()}
    </Typography>
  );
};


export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(sessionStorage.getItem('userId'));
  const [editableUser, setEditableUser] = useState({
    username: '',
    name: '',
    birthDate: '',
    avatar: '',
  });
  const [isEditable, setIsEditable] = useState(false);
  const [isAllowedToEdit, setIsAllowedToEdit] = useState(false);


  useEffect(() => {
    const currentUserId = sessionStorage.getItem('userId');
    setCurrentUserId(currentUserId);

    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
        setEditableUser(response.data);
        setIsAllowedToEdit(currentUserId === userId);
      } catch (error) {
        console.error(`Failed to fetch user data :(\n\nError message: ${handleError(error)}`);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log(editableUser);
      await api.put(`/users/${userId}`, JSON.stringify(editableUser));
      setUser(editableUser);
      setIsEditable(false);
    } catch (error) {
      console.error(`Failed to update user profile :(\n\nError message: ${handleError(error)}`);
    }
  };

  if (!user) {
    return <Typography component="h1" variant="h5">Loading user profile ...</Typography>;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} square sx={{ mt: 8, bgcolor: '#ebc8ffb3', borderRadius: '10px 10px 10px 10px' }}>
          <Box padding={4} display="flex" flexDirection="column" alignItems="center">
            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              Profile
            </Typography>
            <Avatar alt="Avatar" src={editableUser.avatar} sx={{ width: 100, height: 100 }} />
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
                disabled={!isEditable}
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
                disabled={!isEditable}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="birthDate"
                label="Birthday"
                type="date"
                id="birthDate"
                value={editableUser.birthDate}
                onChange={handleChange}
                disabled={!isEditable}
                InputLabelProps={
                  {
                    shrink: true,
                  }
                }
              />
              {isEditable ? (
                <Box sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Save
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setIsEditable(false)}
                    color="secondary"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setIsEditable(true)}
                  disabled={!isAllowedToEdit}
                  color="secondary"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Edit
                </Button>

              )}
              <Button
                fullWidth
                variant="contained"
                onClick={handleBack}
                sx={{ mt: 3, mb: 2 }}
              >
                Back
              </Button>
            </Box>
          </Box>
        </Paper>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
