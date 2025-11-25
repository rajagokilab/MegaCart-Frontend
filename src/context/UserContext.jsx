import React, { createContext, useState, useContext, useEffect } from 'react';
// Ensure this path points to your actual auth.js file
import { getCachedUser, setSessionData, logout as authLogout } from '../components/auth'; 

export const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    // 1. LAZY INITIALIZATION (The Fix for Refresh Issue)
    // React runs getCachedUser() immediately before the first render.
    const [user, setUser] = useState(() => getCachedUser());

    // 2. LOGIN FUNCTION
    // We accept the token here to ensure Storage and State stay in sync
    const login = (userData, token, refreshToken) => {
        // Save to sessionStorage (via auth.js)
        setSessionData(token, userData, refreshToken); 
        // Update React State
        setUser(userData);
    };

    // 3. LOGOUT FUNCTION
    const logout = () => {
        authLogout(); // Clears sessionStorage
        setUser(null);  // Clears context state
    };

    // 4. SYNC WITH AUTH.JS (The Fix for 401 Auto-Logout)
    // If the Axios Interceptor in auth.js triggers a logout, 
    // this listener picks it up and updates the UI automatically.
    useEffect(() => {
        const handleAuthChange = () => {
            setUser(getCachedUser());
        };

        window.addEventListener('authChanged', handleAuthChange);
        return () => window.removeEventListener('authChanged', handleAuthChange);
    }, []);

    const contextValue = {
        user,
        isLoggedIn: !!user,
        login,
        logout,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;