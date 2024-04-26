import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { getWS } from "./getDomain";  // Make sure to import getWS

class Stomper {
  static instance = null;
  reconnectInterval = 5000;  // Interval in milliseconds to attempt reconnection

  static getInstance() {
    if (!Stomper.instance) {
      Stomper.instance = new Stomper();
    }
    
    return Stomper.instance;
  }

  constructor() {
    this.stompClient = null;
    this.reconnectTimer = null;
  }

  async connect(gameId, userId) {
    const wsUrl = getWS(gameId); // Use the function from getDomain.js that builds the WS URL including gameId
    this.disconnect();  // Ensure clean disconnect before reconnecting
    const socket = new SockJS(wsUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null;  // Turn off debugging to clean up console output

    return new Promise((resolve, reject) => {
      this.stompClient.connect({ userId: userId }, frame => { // Pass userId as header, align to server implementation
        console.log("Connected: " + frame);
        resolve(frame);
      }, error => {
        console.error("Connection Error: ", error);
        reject(error);
        this.scheduleReconnect(gameId, userId);
      });
    });
  }

  scheduleReconnect(gameId, userId) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer); // Clear any existing reconnection timer
    }
    this.reconnectTimer = setTimeout(() => {
      console.log("Attempting to reconnect WebSocket...");
      this.connect(gameId, userId).catch(err => console.error("Reconnection failed", err));
    }, this.reconnectInterval);
  }

  subscribe(endpoint, callback) {
    if (this.stompClient && this.stompClient.connected) {
      var subscription = this.stompClient.subscribe(endpoint, callback);
      console.log("Subscribed to " + endpoint);
      
      return subscription;
    }
  }

  subscribeToUserQueue(gameId, callback) {
    if (this.stompClient && this.stompClient.connected && callback) {
      return this.stompClient.subscribe(`/user/topic/games/${gameId}/listen`, (message) => {
        console.log("Received message from user queue: ", message.body);
        callback(JSON.parse(message.body));
      });
    }
  }
    

  send(destination, message) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(destination, {}, JSON.stringify(message));
      console.log("Sending message to " + destination);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log("Disconnected from WebSocket");
      });
      this.stompClient = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // add getStompClient method
  getStompClient() {
    return this.stompClient;
  }
}

export default Stomper;
