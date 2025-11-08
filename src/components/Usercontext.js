import { createContext } from "react";

const UserContext = createContext({
  isLoggedIn: false,
  authToken: null,
  setIsLoggedIn: () => {},
  setAuthToken: () => {},
});

export default UserContext;
