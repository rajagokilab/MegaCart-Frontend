// src/utils/cartAPI.js
export const getCartHeaders = () => {
  const authToken = localStorage.getItem("authToken");
  const headers = { "Content-Type": "application/json" };

  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`;
  } else {
    let guestId = localStorage.getItem("guestCartId");
    if (!guestId) {
      guestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("guestCartId", guestId);
    }
    headers["X-Guest-Cart-Id"] = guestId;
  }

  return headers;
};

export const apiFetch = async (url, options = {}) => {
  const headers = getCartHeaders();
  return fetch(url, { ...options, headers });
};
