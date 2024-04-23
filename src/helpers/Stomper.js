import { handleError } from "helpers/api";
import Stomp from "stompjs";
import { getWS } from "./getDomain";

class Stomper {
    static instance = null;

    static getInstance() {
        if (!Stomper.instance) {
            Stomper.instance = new Stomper();
        }
        return Stomper.instance;
    }

    socket;
    stompClient;
    openChannels = [];

    constructor() {
        this.listeners = [];
    }

    async connect(gameId) {
        try {
            if (this.socket) {
                this.socket.close();
            }
        } catch (e) {
            console.error("Socket close error:", e);
        }

        const wsUrl = getWS(gameId); 
        this.socket = new WebSocket(wsUrl);
        const token = localStorage.getItem('token');
        console.log("token:", token);
        this.stompClient = Stomp.over(this.socket); 
        this.stompClient.debug = null;

        return new Promise((resolve, reject) => {
            console.log("Attempting to connect to WebSocket at URL:", wsUrl);
            this.stompClient.connect({
                'Authorization': `Bearer ${token}` // Include the token in the STOMP connect headers for authentication
            }, frame => {
                console.log("Connected: " + frame);
                resolve(frame);
            }, error => {
                console.error("Connection Error: ", error);
                reject(error);
            });
        });
    }


    subscribe(endpoint, callback) {
        if (!this.openChannels.includes(endpoint)) {
            this.openChannels.push(endpoint);
            this.stompClient.subscribe(endpoint, callback, { id: endpoint });
            console.log("Subscribed to " + endpoint);
        }
    }

    send(destination, message) {
        console.log("Sending message " + JSON.stringify(message) + " to " + destination);
        this.stompClient.send(destination, {}, JSON.stringify(message));
    }

    unsubscribe(endpoint) {
        let index = this.openChannels.indexOf(endpoint);
        if (index !== -1) {
            this.stompClient.unsubscribe(endpoint);
            this.openChannels.splice(index, 1);
            console.log("Unsubscribed from " + endpoint);
        }
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                console.log("Disconnected from WebSocket");
            });
        }
        this.openChannels = [];
    }
}

export default Stomper;
