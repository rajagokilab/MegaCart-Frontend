import axios from "axios";

const TOKEN_KEY = "authToken";
const REFRESH_KEY = "refreshToken";
const CACHED_USER_KEY = "cachedUser";
const storage = sessionStorage; 

axios.interceptors.request.use(
  (config) => {
    const token = storage.getItem(TOKEN_KEY);
    // Check if token exists AND is not the string "undefined"
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setSessionData = (accessToken, user, refreshToken) => {
  // 1. SAFETY CHECK: Don't save if tokens are missing
  if (!accessToken || accessToken === "undefined") {
      console.error("ERROR: Attempted to save undefined Access Token!");
      return;
  }
  
  console.log("Saving Session Data:", { accessToken, refreshToken }); // Debug log

  storage.setItem(TOKEN_KEY, accessToken);
  // Only save refresh token if it exists
  if (refreshToken) storage.setItem(REFRESH_KEY, refreshToken);
  storage.setItem(CACHED_USER_KEY, JSON.stringify(user));

  window.dispatchEvent(new Event("authChanged"));
};

export const getAuthToken = () => {
    const token = storage.getItem(TOKEN_KEY);
    if (token === "undefined" || token === "null") return null;
    return token;
};

export const getCachedUser = () => {
  const token = getAuthToken();
  const user = storage.getItem(CACHED_USER_KEY);
  if (!token || !user || user === "undefined") return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(REFRESH_KEY);
  storage.removeItem(CACHED_USER_KEY);
  window.dispatchEvent(new Event("authChanged"));
};