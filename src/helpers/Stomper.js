import { handleError } from "helpers/api";

import SockJS from "sockjs-client";
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

    subscribe(endpoint, callback) {
        if (this.openChannels.indexOf(endpoint) === -1) {
            this.openChannels.push(endpoint);
            this.stompClient.subscribe(endpoint, callback, { id: endpoint }); // add the endpoint also as ID
            // generate a unique ID for the callback function

            sessionStorage.setItem("subscribedEndpoints", JSON.stringify(this.openChannels));

            // store the callback function in a mapping object

            console.log("Subscribed to " + endpoint);

        }
    }

    send(destination, message) {
        console.log("Sent message " + JSON.stringify(message) + " to " + destination);
        this.stompClient.send(destination, {}, JSON.stringify(message));
    }

    unsubscribe(endpoint) {
        let index = this.openChannels.indexOf(endpoint);
        if (index !== -1) {
            this.stompClient.unsubscribe(endpoint);
            sessionStorage.setItem('subscribedEndpoints', JSON.stringify(this.openChannels.filter(item => item !== endpoint))); // remove the endpoint from the list stored in session storage
            this.openChannels.splice(index, 1);
            // console.log("Unsubscribed from " + endpoint);
        }
    }

    unsubscribeAll() {
        this.openChannels.forEach((endpoint) => {
            this.stompClient.unsubscribe(endpoint);
            // console.log("Unsubscribed from " + endpoint);
        });
        this.openChannels = [];
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.socket.close();
            } catch (e) { }

            this.socket = new SockJS(getWS());
            this.stompClient = Stomp.over(this.socket);
            this.stompClient.debug = null;

            this.stompClient.connect(
                {},
                (frame) => {
                    console.log("Connected: " + frame);
                    resolve();
                },
                (error) => {
                    reject(error);
                }
            );

            this.socket.onclose = () => {
                this._handleDisconnect("Socket closed.");
            };
            this.socket.onerror = (e) => this._handleError(e);
        });
    }

    disconnect = (reason) => {
        try {
            this.stompClient.disconnect(() => {
                this._handleDisconnect(reason);
            }, {});
        } catch { }
    };

    emptyChannelsList = () => {
        this.openChannels = [];
    }

    _handleDisconnect = (reason) => {
        console.log(reason);
    };

    _handleError = (error) => {
        console.log(handleError(error));
    };

}

export default Stomper;