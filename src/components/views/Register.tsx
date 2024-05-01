import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import NightlifeOutlinedIcon from '@mui/icons-material/NightlifeOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PropTypes from "prop-types";
import { useState } from 'react';
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";

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

export default function Register() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");


  const handleRegister = async () => {
    try {
      const requestBody = JSON.stringify({ username, password });
      const response = await api.post("/register", requestBody);
      const userData = response.data;

      // Check if registration was successful
      if (userData && userData.id) {
        const user = new User(userData);

        // Store the token into the local storage.
        localStorage.setItem("token", user.token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('username', user.username);
        localStorage.setItem('currentUserId', user.id);

        // Navigate to user overview page with necessary information
        navigate("/lobby", { state: { user } });
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      alert(`The user name already exists. Try another one :D`);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh', marginTop: '-80px'  }}>
        <Grid item xs={12} sm={8} md={4}>
          <Paper elevation={6} square sx={{ backgroundColor: 'rgba(235, 200, 255, 0.7)', borderRadius: '50px 10px 50px 10px' }}>
            <Box p={4} display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ m: 1, bgcolor: '#ba68c8' }}>
              <NightlifeOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Register
            </Typography>
            <Box component="form" noValidate onSubmit={handleRegister} sx={{ mt: 1 }}>
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
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleRegister}
              >
                Register
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/login" variant="body2">
                    {"Return to Login"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
