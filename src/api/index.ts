import axios from "axios";

const api = axios.create({
  baseURL: "https://api.bloop.cool/api",
  withCredentials: true,
});

export default api;
