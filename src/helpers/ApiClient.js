import axios from 'axios';

import { getDomain } from './getDomain';


class ApiClient {

    token = localStorage.getItem("token");

    constructor() {
        this.client = axios.create({
            baseURL: getDomain(),
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.token
            }
        });
    }

    // Handle request errors
    handleRequestError(error) {
        let message = "An error occurred.";
        if (error.response) {
            // Server responded with a status code outside the 2xx range
            console.log("The request was made and the server responded with a status code that falls out of the range of 2xx", error.response);
            message = `Error: ${error.response.status}, ${error.response.statusText}`;
        } else if (error.request) {
            // The request was made but no response was received
            console.log("The request was made but no response was received", error.request);
            message = "No response from server";
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
        }
        console.error('Detailed error:', error);
        return message;
    }


    // Create a game or room
    async createRoom(requestBody) {
        try {
            const response = await this.client.post(`/games`, requestBody);
            return response.data;
        } catch (error) {
            console.error(`Error when creating room:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Get game status
    async getGameStauts(gameId) {
        try {
            const response = await this.client.get(`/games/${gameId}`);
            return response.data;
        } catch (error) {
            console.error(`Error when getting game status:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Modify the settings of the game or room
    async updateRoom(gameId) {
        try {
            const response = await this.client.put(`/games/${gameId}`);
            return response.data;
        } catch (error) {
            console.error(`Error when modifying settings:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Delete the game or room
    async deleteRoom(gameId) {
        try {
            const response = await this.client.delete(`/games/${gameId}`);
            return response.data;
        } catch (error) {
            console.error(`Error when deleting room:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Join the game or room
    async join(gameId, playerId) {
        try {
            const response = await this.client.post(`/games/${gameId}/join?playerId=${playerId}`);
            return response.data;
        } catch (error) {
            console.error(`Error when joining room:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Quit the game or leave the room
    async quit(gameId, playerId) {
        try {
            const response = await this.client.post(`/games/${gameId}/quit?playerId=${playerId}`);
            return response.data;
        } catch (error) {
            console.error(`Error when leaving room:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Start listening
    async listen(gameId, playerId) {
        try {
            const response = await this.client.post(`/games/${gameId}/listen?playerId=${playerId}`);
            return response.data;
        } catch (error) {
            console.error(`Error when listening:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Start a new emoji description round
    async newEmojiRound(gameId) {
        try {
            const response = await this.client.post(`/games/${gameId}/newEmojiRound`);
            return response.data;
        } catch (error) {
            console.error(`Error when starting new emoji description round:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Send emojis
    async emoji(gameId, playerId, requestBody) {
        try {
            const response = await this.client.post(`/games/${gameId}/emoji?playerId=${playerId}`, requestBody);
            return response.data;
        } catch (error) {
            console.error(`Error when sending emojis:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Start voting
    async vote(gameId, playerId, requestBody) {
        try {
            const response = await this.client.post(`/games/${gameId}/vote?playerId=${playerId}`, requestBody);
            return response.data;
        } catch (error) {
            console.error(`Error when voting:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    // Start a new round
    async newRound(gameId) {
        try {
            const response = await this.client.post(`/games/${gameId}/newRound`);
            return response.data;
        } catch (error) {
            console.error(`Error when starting new round:\n ${this.handleRequestError(error)}`);
            throw error;
        }
    }

    getClient() {
        return this.client;
    }
}

export default ApiClient;