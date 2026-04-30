import axios from "axios";

const api = axios.create({
  baseURL: "https://pos-co0q.onrender.com/api",
});

export default api;
