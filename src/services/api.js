import axios from "axios";
import config from "../config/mockapi.json";

const api = axios.create({
  baseURL: config.baseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
