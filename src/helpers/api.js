import axios from 'axios';
import { getDomain } from './getDomain';

// Create Axios instance configured with base URL
export const api = axios.create({
  baseURL: getDomain(),
  headers: { "Content-Type": "application/json" }
});

// Error handling utility
export const handleError = error => {
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
};
