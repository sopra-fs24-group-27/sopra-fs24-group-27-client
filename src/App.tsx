import React, { useEffect } from "react";
import Header from "./components/views/Header";
import AppRouter from "./components/routing/routers/AppRouter";
import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // localStorage.removeItem('token');
      // localStorage.removeItem('userId');
      // localStorage.removeItem('username');
      // localStorage.removeItem('currentUserId');
      localStorage.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div>
      <Header height="100" />
      <AppRouter />
    </div>
  );
};

export default App;
