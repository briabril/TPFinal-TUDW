import axios from "axios";

const api = axios.create({
  baseURL: "https://www.api.bloop.cool/api",
  withCredentials: true,
});

export default api;
