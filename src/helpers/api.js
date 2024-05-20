import axios from "axios";
import { getDomain } from "./getDomain";

// Create Axios instance configured with base URL
function newAxiosClient() {
  const client = axios.create({
    baseURL: getDomain(),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    }
  });

  // Add a request interceptor
  client.interceptors.request.use((config) => {
    // Do something before request is sent
    // const token = localStorage.getItem("token") || "";
    const token = sessionStorage.getItem("token") || "";
    console.log(`request with token: ${token}`);
    config.headers.Authorization = token;
    return config;
  }, (error) => {
    // Do something with request error
    return Promise.reject(error);
  });

  client.interceptors.request.use(request => {
    console.log('request with headers', request.headers); // Log headers
    return request;
  });

  return client;
}

export const api = newAxiosClient();

export const deprecated_api = axios.create({
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
  console.error("Detailed error:", error);
  
  return message;
};
