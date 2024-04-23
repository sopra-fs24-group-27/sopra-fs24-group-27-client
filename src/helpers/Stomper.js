import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getDomain } from './getDomain';

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

    async connect(gameId) {
        const wsUrl = this.getWSUrl(gameId);
        this.disconnect();  // Ensure clean disconnect before reconnecting
        const socket = new SockJS(wsUrl);
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null;  // Turn off debugging to clean up console output

        return new Promise((resolve, reject) => {
            this.stompClient.connect({}, frame => {
                console.log("Connected: " + frame);
                resolve(frame);
            }, error => {
                console.error("Connection Error: ", error);
                reject(error);
                this.scheduleReconnect(gameId);
            });
        });
    }

    scheduleReconnect(gameId) {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer); // Clear any existing reconnection timer
        }
        this.reconnectTimer = setTimeout(() => {
            console.log("Attempting to reconnect WebSocket...");
            this.connect(gameId).catch(err => console.error("Reconnection failed", err));
        }, this.reconnectInterval);
    }

    subscribe(endpoint, callback) {
        if (this.stompClient && this.stompClient.connected) {
            var subscription = this.stompClient.subscribe(endpoint, callback);
            console.log("Subscribed to " + endpoint);
            return subscription;
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

    getWSUrl() {
        const httpUrl = getDomain(); // Ensure this returns "http://localhost:8080"
        return `${httpUrl}/ws`; // No gameId in the connection URL
    }
    
    
}

export default Stomper;
