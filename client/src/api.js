import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export const getFeed = () => api.get("/feed").then((res) => res.data.profiles);

export const getMatches = () =>
  api.get("/matches").then((res) => res.data.matches);

export const sendSwipe = (profileId, action) =>
  api.post("/swipe", { profileId, action }).then((res) => res.data);
