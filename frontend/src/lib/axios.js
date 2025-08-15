import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:  import.meta.env.MODE === "development" ? "http://localhost:5432/api" : "http://localhost:5432/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});