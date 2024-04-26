import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GameGuard } from "../routeProtectors/GameGuard";
import GameRouter from "./GameRouter";
import { LoginGuard } from "../routeProtectors/LoginGuard";
import Login from "../../views/Login";
import Register from "../../views/Register";
import Profile from "../../views/Profile";
import Waitingroom from "../../views/Waitingroom";
import Round from "../../views/Round";
import Music from "../../views/Music"
import Listen from "../../views/Listen";
import Vote from "../../views/Vote";
import { WebSocketProvider } from "context/WebSocketContext";


/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reactrouter.com/en/main/start/tutorial
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/lobby/*" element={<GameGuard />}>
          <Route path="/lobby/*" element={
            <WebSocketProvider>
              <GameRouter base="/lobby" />
            </WebSocketProvider>
          } />
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/login" element={<LoginGuard />}>
          <Route path="/login" element={<Login />} />
        </Route>


        <Route path="/games/:gameId/waitingroom" element={
          <WebSocketProvider>
            <Waitingroom />
          </WebSocketProvider>
        } />
        <Route path="/games/:gameId/listen" element={<Listen />} />
        <Route path="/games/:gameId/round" element={<Round />} />
        <Route path="/games/:gameId/music" element={<Music />} />
        <Route path="/games/:gameId/vote" element={<Vote />} />


        <Route path="/" element={
          <Navigate to="/login" replace />
        } />

      </Routes>
    </BrowserRouter >
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;