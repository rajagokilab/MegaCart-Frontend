// src/context/UserContext.jsx

import React, { createContext, useState, useContext } from 'react';
// 1. Import your auth functions
import { getCachedUser, logout as authLogout } from '../components/auth'; 

// 2. Create the Context (This was missing the export)
export const UserContext = createContext();

// 3. Create a custom hook to use the context easily
export const useUser = () => {
    return useContext(UserContext);
};

// 4. Create the Provider component
export const UserProvider = ({ children }) => {
    // 5. THE FIX: Initialize state from the cache, NOT null
    const [user, setUser] = useState(getCachedUser()); 

    // Function to handle login (saves user data)
    const login = (userData) => {
        // We assume the login API call already saved to localStorage
        setUser(userData);
    };

    // Function to handle logout (clears cache AND state)
    const logout = () => {
        authLogout(); // 👈 Clears localStorage
        setUser(null);  // 👈 Clears context state
    };

    // Value exposed to all consuming components
    const contextValue = {
        user,
        isLoggedIn: !!user, // Convenience boolean
        login,
        logout,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};