import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken } from '../components/auth.js'; // Adjust path if needed

// --- Constants ---
const GUEST_CART_ID_KEY = 'guestCartId';
const API_BASE = `${import.meta.env.VITE_API_URL}/cart`;

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

// Helper to get headers
const getApiHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const authToken = getAuthToken();
    if (authToken) {
        headers['Authorization'] = `JWT ${authToken}`; 
    }
    const guestId = localStorage.getItem(GUEST_CART_ID_KEY);
    if (guestId) {
        headers['X-Guest-Cart-Id'] = guestId;
    }
    return headers;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. FETCH CART FROM BACKEND ON LOAD
    const fetchCart = async () => {
        setLoading(true);

        // --- THIS IS THE FIX ---
        // Check if user is logged in OR is an existing guest
        const authToken = getAuthToken();
        const guestId = localStorage.getItem(GUEST_CART_ID_KEY);

        // If user is not logged in AND has no guest cart ID,
        // there is nothing to fetch.
        if (!authToken && !guestId) {
            setCartItems([]); // Set an empty cart
            setLoading(false);
            return; // Stop the function here
        }
        // --- END OF FIX ---

        try {
            // If we are here, the user is logged in OR has a guest ID
            const response = await fetch(`${API_BASE}/detail/`, {
                method: 'GET',
                headers: getApiHeaders() 
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(data.items || []); 
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Run fetchCart on mount and when auth/cart status changes
    useEffect(() => {
        fetchCart();
        
        window.addEventListener("authChanged", fetchCart);
        window.addEventListener("cartChanged", fetchCart); 
        
        return () => {
             window.removeEventListener("authChanged", fetchCart);
             window.removeEventListener("cartChanged", fetchCart);
        };
    }, []);

    // 2. REMOVE ITEM FROM CART
    const removeItemFromCart = async (productId) => {
        try {
            const response = await fetch(`${API_BASE}/remove_item/${productId}/`, {
                method: 'DELETE',
                headers: getApiHeaders(),
            });

            if (response.status === 204) {
                setCartItems(prevItems => 
                    prevItems.filter(item => item.product_details.id !== productId)
                );
            } else {
                console.error("Failed to remove item. Status:", response.status);
                alert("Failed to remove item.");
            }
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    // 3. UPDATE ITEM QUANTITY
    const updateQuantity = async (productId, quantity) => {
        
        const item = cartItems.find(item => item.product_details.id === productId);
        if (!item) {
            console.error("Cannot update quantity: item not found in cart state.");
            return;
        }
        const itemId = item.id; 

        try {
            const response = await fetch(`${API_BASE}/update_item/`, {
                method: 'POST', 
                headers: getApiHeaders(),
                body: JSON.stringify({ 
                    item_id: itemId, 
                    quantity: quantity 
                })
            });

            if (response.ok) {
                fetchCart(); 
            } else {
                alert("Failed to update quantity.");
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    // Value to be passed to consumers
    const value = {
        cartItems,
        loading,
        fetchCart,
        removeItemFromCart,
        updateQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};