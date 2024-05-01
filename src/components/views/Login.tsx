import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LibraryMusicOutlinedIcon from '@mui/icons-material/LibraryMusicOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { useState } from 'react';
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";



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

export default function SignInSide() {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>(null);
  const [username, setUsername] = useState<string>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const requestBody = JSON.stringify({ username, password });
      const response = await api.post("/login", requestBody);
      const user = new User(response.data);
      localStorage.setItem("token", user.token);
      localStorage.setItem("currentUserId", user.id);
      navigate("/lobby");
    } catch (error) {
      alert(`Invalid username or password : (`);
    }
  };
  
  

  return (
    <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh', marginTop: '-80px'  }}>
        <Grid item xs={12} sm={8} md={4}>
          <Paper elevation={6} square sx={{ backgroundColor: 'rgba(235, 200, 255, 0.7)', borderRadius: '10px 50px 10px 50px' }}>
            <Box p={4} display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ m: 1, bgcolor: '#ba68c8' }}>
              <LibraryMusicOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
                InputLabelProps={{
                  style: {
                    fontFamily: 'Comic Sans MS',

                  },
                }}
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
                InputLabelProps={{
                  style: {
                    fontFamily: 'Comic Sans MS',
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, fontFamily: 'Comic Sans MS',  }}
                
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
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
