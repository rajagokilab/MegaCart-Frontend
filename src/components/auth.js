// auth.js
import axios from "axios";

const TOKEN_KEY = "authToken";
const REFRESH_KEY = "refreshToken";
const CACHED_USER_KEY = "cachedUser";

export const setSessionData = (accessToken, user, refreshToken) => {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_KEY, refreshToken);
  sessionStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));

  axios.defaults.headers.common["Authorization"] = `JWT ${accessToken}`;

  window.dispatchEvent(new Event("authChanged"));
};

export const getAuthToken = () => sessionStorage.getItem(TOKEN_KEY);

export const getCachedUser = () => {
  const token = getAuthToken();
  const user = sessionStorage.getItem(CACHED_USER_KEY);

  if (!token || !user) return null;
  return JSON.parse(user);
};

export const logout = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(CACHED_USER_KEY);

  delete axios.defaults.headers.common["Authorization"];

  window.dispatchEvent(new Event("authChanged"));
};
