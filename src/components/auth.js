// auth.js
import axios from "axios";

const TOKEN_KEY = "authToken";
const REFRESH_KEY = "refreshToken";
const CACHED_USER_KEY = "cachedUser";

export const setSessionData = (accessToken, user, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));

  axios.defaults.headers.common["Authorization"] = `JWT ${accessToken}`;

  window.dispatchEvent(new Event("authChanged"));
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const getCachedUser = () => {
  const token = getAuthToken();
  const user = localStorage.getItem(CACHED_USER_KEY);
  // Ensure both token and user object exist
  if (!token || !user) return null; 
  return JSON.parse(user);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(CACHED_USER_KEY);

  delete axios.defaults.headers.common["Authorization"];

  window.dispatchEvent(new Event("authChanged"));
};