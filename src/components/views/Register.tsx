import * as React from 'react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { api, handleError } from "helpers/api";
import User from "models/User";



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

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //TODO: handle errors
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log(username, password);
      const requestBody = JSON.stringify({ username, password });
      const response = await api.post("/register", requestBody);
      const user = new User(response.data);
      sessionStorage.setItem("token", user.token);
      sessionStorage.setItem('userId', user.id);
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem("currentUserId", user.id);
      navigate("/lobby");
    } catch (error) {
      alert(`Username already exists. Try another one :D\n\nError message: ${handleError(error)}`);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} square sx={{ mt: 8, bgcolor: '#ebc8ffb3', borderRadius: '10px 10px 10px 10px' }}>
          <Box p={4} display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ m: 1, bgcolor: '#ba68c8' }}>
              <MusicNoteIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link href="/login" variant="body2">
                    {"Already have an account? Sign in"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
