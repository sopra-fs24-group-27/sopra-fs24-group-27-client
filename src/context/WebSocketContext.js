import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Stomper from "../helpers/Stomper"; // Adjust the import path as necessary

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [stomper, setStomper] = useState(null);

  useEffect(() => {
    // Create and set the singleton instance of Stomper
    const stompInstance = Stomper.getInstance();
    setStomper(stompInstance);

    // Cleanup function to disconnect when the context provider is unmounted
    return () => {
      stompInstance.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={stomper}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Define prop types for WebSocketProvider
WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired, // Specifies that children should be any renderable elements
};

// Custom hook to use the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

export default WebSocketContext;
