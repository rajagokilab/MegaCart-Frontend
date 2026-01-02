/* src/components/CheckoutPage.jsx */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LoginFormModal from './LoginFormModal.jsx'; 
import { getCachedUser, getAuthToken, logout } from './auth'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, faCreditCard, faTruck, faUserCheck, faWallet, 
  faMapMarkerAlt, faEdit, faSave, faTimes, faSpinner, faChevronLeft, faRupeeSign
} from '@fortawesome/free-solid-svg-icons'; 

// --- THEME COLOR CONSTANTS ---
const OLIVE_THEME = {
  main: '#7A8450',
  dark: '#5F673C',
  light: '#F0F2E9',
  text: '#333333',
};

// --- Helper Functions ---
const getPriceForCalculation = (item) => {
    // 1. Check if price was pre-calculated (e.g. from Buy Now)
    let price = parseFloat(item.price || 0); 
    
    // 2. Check product details if structure differs
    const product = item.product_details || item;
    
    // 3. Prioritize explicit discount fields from API if available
    const discountedPrice = parseFloat(product.final_price || product.discounted_price || 0);
    const originalPrice = parseFloat(product.price || 0);

    if (discountedPrice > 0 && discountedPrice < originalPrice) {
        return discountedPrice;
    }
    
    // Fallback: If item.price exists and is lower than product.price, assume it's already discounted
    if (price > 0 && price < originalPrice) {
        return price;
    }

    return price > 0 ? price : originalPrice;
};

const calculateGrandTotal = (items) => {
    return items.reduce((sum, item) => {
        const price = getPriceForCalculation(item);
        const quantity = item.quantity || 1;
        return sum + price * quantity;
    }, 0);
};

// --- Constants ---
const API = import.meta.env.VITE_API_URL;
const GUEST_CART_ID_KEY = 'guestCartId';
const RAZORPAY_KEY_ID = 'rzp_test_RjZJ90FopiN2Lo'; 
const CART_DETAIL_URL = `${API}/cart/detail/`;
const ORDER_CREATE_URL = `${API}/orders/create/`;
const VERIFY_PAYMENT_URL = `${API}/orders/verify/`;
const USER_ADDRESS_SAVE_URL = `${API}/users/save_address/`;

// ------------------------------------------------------------------
// --- PaymentModal Component ---
// ------------------------------------------------------------------
function PaymentModal({ show, handleClose, grandTotal, cartItems, setShowLogin, shippingAddress }) {
    const navigate = useNavigate(); 
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        if (show) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
            return () => {
                if (document.body.contains(script)) document.body.removeChild(script);
            };
        }
    }, [show]);

    const handleInitiatePayment = async () => {
        setIsProcessing(true);
        
        if (!window.Razorpay) {
            alert('Razorpay SDK not loaded. Please try again.');
            setIsProcessing(false);
            return;
        }
        
        try {
            const authToken = getAuthToken();
            const headers = { 'Content-Type': 'application/json' };
            if (authToken) headers['Authorization'] = `JWT ${authToken}`;

            const itemsPayload = cartItems.map(item => ({
                id: item.product_details?.id || item.id, // Handle potential structure diff
                quantity: item.quantity
            }));

            const payload = { 
                grand_total: grandTotal,
                shipping_address: shippingAddress,
                items: itemsPayload 
            };
            
            if (payload.items.length === 0 || payload.grand_total <= 0) {
                 throw new Error('Internal cart error: No items found for payment.');
            }

            // 1. CREATE ORDER ON BACKEND
            const orderResponse = await fetch(ORDER_CREATE_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload) 
            });

            if (!orderResponse.ok) {
                if (orderResponse.status === 401) {
                    logout();
                    handleClose();
                    if (setShowLogin) setShowLogin(true); 
                    throw new Error('Your session has expired. Please log in again.');
                }
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to create order on the server.');
            }

            const orderData = await orderResponse.json();
            const { razorpay_order_id, amount, currency } = orderData;
            const user = getCachedUser();

            const options = {
                key: RAZORPAY_KEY_ID, 
                amount: amount, 
                currency: currency, 
                name: 'VetriCart',
                description: 'Order Payment',
                order_id: razorpay_order_id, 
                handler: async function (response) {
                    setIsProcessing(true); 
                    try {
                        const verificationResponse = await fetch(VERIFY_PAYMENT_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `JWT ${getAuthToken()}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        if (!verificationResponse.ok) {
                            const errorData = await verificationResponse.json();
                            throw new Error(errorData.error || 'Payment verification failed.');
                        }
                        
                        alert('Payment Successful! Your order has been placed.');
                        localStorage.removeItem(GUEST_CART_ID_KEY); 
                        window.dispatchEvent(new Event("authChanged")); 
                        handleClose();
                        navigate('/my-orders'); 

                    } catch (verifyError) {
                        alert(`Payment verification failed: ${verifyError.message}.`);
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: shippingAddress.name, 
                    email: user?.email || '',
                    contact: shippingAddress.phone || '', 
                },
                theme: {
                    color: OLIVE_THEME.main 
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(`Payment failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Error initiating payment:', error);
            if (error.message !== 'Your session has expired. Please log in again.') {
                 alert(error.message || 'Failed to initiate payment. Please try again.');
            }
            setIsProcessing(false); 
        } 
    };

    const displayAmount = grandTotal.toFixed(2);
    
    if (!show) return null; 
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: OLIVE_THEME.light }}>
                    <h5 className="text-xl font-bold text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faCreditCard} className="mr-3" style={{ color: OLIVE_THEME.main }} />
                        Finalize Payment
                    </h5>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className="text-center mb-6 p-5 rounded-lg border border-dashed" 
                          style={{ backgroundColor: OLIVE_THEME.light, borderColor: OLIVE_THEME.dark }}>
                        <h5 className="mb-2 font-semibold uppercase tracking-wider text-xs" style={{ color: OLIVE_THEME.dark }}>Total Amount Payable</h5>
                        <h1 className="font-bold text-4xl sm:text-5xl" style={{ color: OLIVE_THEME.main }}>
                            ₹{displayAmount}
                        </h1>
                    </div>

                    <p className="text-center text-gray-500 text-sm mb-6">
                        You will be redirected to the secure Razorpay payment gateway.
                    </p>

                    <button
                        onClick={handleInitiatePayment} 
                        className="w-full text-lg font-bold text-white py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center transform hover:-translate-y-0.5"
                        style={{ backgroundColor: OLIVE_THEME.main }}
                        disabled={isProcessing} 
                    >
                        {isProcessing ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                        ) : (
                            <>
                                Pay Now <FontAwesomeIcon icon={faLock} className="ml-2 text-sm opacity-70" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// --- CheckoutPage Component (Main) ---
// ------------------------------------------------------------------

function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [user, setUser] = useState(getCachedUser()); 
    
    // --- STATE FOR ADDRESS ---
    const [shippingAddress, setShippingAddress] = useState({
        name: user?.username || '',
        street: '', 
        city: '',
        zip: '', 
        country: 'India', 
        phone: ''
    });
    const [isEditingAddress, setIsEditingAddress] = useState(true); 
    const [addressErrors, setAddressErrors] = useState({}); 
    const [addressSuccess, setAddressSuccess] = useState(null); 
    const [isSavingAddress, setIsSavingAddress] = useState(false); 

    const getCartHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        const authToken = getAuthToken();
        if (authToken) headers['Authorization'] = `JWT ${authToken}`;
        const guestCartId = localStorage.getItem(GUEST_CART_ID_KEY);
        if (guestCartId) headers['X-Guest-Cart-Id'] = guestCartId;
        return headers;
    };

    const fetchCart = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(CART_DETAIL_URL, { headers: getCartHeaders() });
            if (!response.ok) {
                if (response.status === 401) {
                    setCart({ items: [], grand_total: 0 });
                } else {
                    setError(`Failed to fetch cart: ${response.status}`);
                    setCart(null);
                }
                return;
            }
            const data = await response.json();
            setCart(data);
        } catch (err) {
            console.error('Checkout fetch error:', err);
            setError('Network error fetching cart.');
            setCart({ items: [], grand_total: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleAuthChange = () => {
            const freshUser = getCachedUser();
            setUser(freshUser);
            if (freshUser) {
                setShippingAddress(prev => ({ ...prev, name: freshUser.username || freshUser.email }));
            }
            fetchCart();
        };

        if (location.state?.checkoutItems) {
            setCart({ 
                items: location.state.checkoutItems, 
                grand_total: calculateGrandTotal(location.state.checkoutItems) 
            });
            setLoading(false);
        } else {
            fetchCart();
        }

        window.addEventListener("authChanged", handleAuthChange);
        return () => window.removeEventListener("authChanged", handleAuthChange);
    }, []);

    // --- UPDATED VALIDATION LOGIC ---
    const validateAddress = () => {
        const errors = {};
        
        if (!shippingAddress.name.trim()) {
            errors.name = "Recipient name is required.";
        } else if (shippingAddress.name.length < 3) {
            errors.name = "Name must be at least 3 characters.";
        }

        if (!shippingAddress.street.trim()) {
            errors.street = "Street address is required.";
        }

        if (!shippingAddress.city.trim()) {
            errors.city = "City is required.";
        }

        // ✅ Indian PIN Code Validation
        const pinCodeRegex = /^[1-9][0-9]{5}$/; // 6 digits, cannot start with 0
        if (!shippingAddress.zip.trim()) {
             errors.zip = "PIN Code is required.";
        } else if (!pinCodeRegex.test(shippingAddress.zip.trim())) {
             errors.zip = "Invalid PIN Code (6 digits required).";
        }
        
        // ✅ Strict Indian Phone Validation
        const indianPhoneRegex = /^[6-9]\d{9}$/; // Starts with 6-9, followed by 9 digits
        if (!shippingAddress.phone.trim()) {
            errors.phone = "Phone number is required.";
        } else if (!indianPhoneRegex.test(shippingAddress.phone.trim())) {
            errors.phone = "Invalid Indian number. Must start with 6-9 and be 10 digits.";
        }
        
        if (shippingAddress.country.trim().toLowerCase() !== 'india') {
             errors.country = "We only ship to India.";
        }
        
        setAddressErrors(errors);
        return Object.keys(errors).length === 0; 
    };

    const handleSaveAddress = async () => {
        setAddressSuccess(null);
        setAddressErrors({});

        if (!validateAddress() || !user) {
            if (!user) setAddressErrors({ form: "You must be logged in to save an address." });
            return;
        }
        
        setIsSavingAddress(true);
        try {
            const authToken = getAuthToken();
            if (!authToken) throw new Error("You must be logged in to save an address.");

            const addressPayload = { 
                name: shippingAddress.name,
                phone: shippingAddress.phone,
                address: shippingAddress.street,
                city: shippingAddress.city,
                zip: shippingAddress.zip, 
                country: 'India' 
            };

            const response = await fetch(USER_ADDRESS_SAVE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${authToken}`,
                },
                body: JSON.stringify(addressPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || 'Failed to save address.');
            }

            setIsEditingAddress(false);
            setAddressSuccess("Address successfully saved!"); 
            setAddressErrors({}); 
        } catch (error) {
            console.error("Address save error:", error);
            setAddressErrors({ form: error.message }); 
        } finally {
            setIsSavingAddress(false);
        }
    };
    
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        
        // ✅ RESTRICT PHONE INPUT TO NUMBERS ONLY & MAX 10 DIGITS
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setShippingAddress(prev => ({ ...prev, [name]: numericValue }));
        } 
        // ✅ RESTRICT PIN CODE TO NUMBERS ONLY & MAX 6 DIGITS
        else if (name === 'zip') {
            const numericValue = value.replace(/\D/g, '').slice(0, 6);
            setShippingAddress(prev => ({ ...prev, [name]: numericValue }));
        }
        else {
            setShippingAddress(prev => ({ ...prev, [name]: value }));
        }

        if (addressErrors[name]) setAddressErrors(prev => ({ ...prev, [name]: null }));
        setAddressSuccess(null);
        if (addressErrors.form) setAddressErrors(prev => ({ ...prev, form: null }));
    };

    const handlePlaceOrder = () => {
        if (!user) {
            alert("Please log in to proceed.");
            setShowLogin(true); 
        } else if (isEditingAddress) {
             alert("Please save your shipping address before proceeding.");
        } else if (!validateAddress()) {
             alert("Your saved address is incomplete. Please edit and re-save.");
             setIsEditingAddress(true);
        } else {
            setShowPayment(true); 
        }
    };

    const handleLoginSuccess = (loggedInUser) => {
        setUser(loggedInUser);
        setShowLogin(false);
        setIsEditingAddress(true); 
    };

    // --- RENDER STATES ---
    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" style={{ color: OLIVE_THEME.main }} />
        </div>
    );

    if (error) return (
        <div className="container mx-auto max-w-lg p-6 text-center mt-10">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm" role="alert">
                <p className="font-bold mb-2">Oops!</p>
                {error}
            </div>
            <button onClick={() => navigate('/')} className="mt-6 px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all">
                Go Back Home
            </button>
        </div>
    );

    const cartItems = cart?.items || [];
    const grandTotal = cart?.grand_total || 0;

    if (!cartItems.length) return (
        <div className="container mx-auto max-w-lg p-6 text-center mt-12">
            <div className="bg-[#F0F2E9] border border-[#7A8450] text-[#5F673C] px-6 py-8 rounded-xl shadow-sm" role="alert">
                <FontAwesomeIcon icon={faWallet} className="text-4xl mb-3 opacity-50"/>
                <p className="text-lg font-semibold">Your cart is currently empty.</p>
            </div>
            <button onClick={() => navigate('/')} 
                className="mt-6 px-8 py-3 text-white font-medium rounded-lg shadow hover:shadow-md transition-all"
                style={{ backgroundColor: OLIVE_THEME.main }}
            >
                Continue Shopping
            </button>
        </div>
    );

    const isCheckoutDisabled = !user || isEditingAddress || !shippingAddress.street.trim();

    // --- HELPER: Input Class Generator for consistency ---
    const inputClass = (errorState) => `
        mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border 
        ${errorState ? 'border-red-500 bg-red-50' : 'border-gray-300'} 
        focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all
    `;

    return (
        <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                
                {/* Header / Breadcrumbish */}
                <div className="mb-8 flex items-center justify-center relative">
                    <button onClick={() => navigate(-1)} className="absolute left-0 text-gray-500 hover:text-gray-800 lg:hidden">
                        <FontAwesomeIcon icon={faChevronLeft} className="mr-1" /> Back
                    </button>
                    <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faTruck} className="mr-3" style={{ color: OLIVE_THEME.main }} /> 
                        Secure Checkout
                    </h1>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* --- LEFT COLUMN: DETAILS & AUTH CHECK --- */}
                    <div className="lg:col-span-7 space-y-6 lg:space-y-8">
                        
                        {/* --- STEP 1: AUTHENTICATION STATUS --- */}
                        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                <span className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
                                Authentication
                            </h4>
                            {!user ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl">
                                    <div className="flex items-center mb-3 sm:mb-0">
                                        <FontAwesomeIcon icon={faLock} className="mr-3 text-xl opacity-70" />
                                        <span>Checking out as <strong>Guest</strong>.</span>
                                    </div>
                                    <button onClick={() => setShowLogin(true)} className="text-sm font-bold underline hover:text-yellow-900">
                                        Log in now
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center bg-[#F0F2E9] border border-[#7A8450] text-[#5F673C] p-4 rounded-xl">
                                    <FontAwesomeIcon icon={faUserCheck} className="mr-3 text-xl" />
                                    <span>Logged in as: <strong className="ml-1 text-gray-900">{user.username || user.email}</strong></span>
                                </div>
                            )}
                        </div>
                        
                        {/* --- STEP 2: SHIPPING ADDRESS --- */}
                        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                <span className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
                                Shipping Address
                            </h4>
                            
                            {addressSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-5 text-sm">{addressSuccess}</div>}
                            {addressErrors.form && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">{addressErrors.form}</div>}

                            {isEditingAddress || !shippingAddress.street ? (
                                // Address Edit Form 
                                <form noValidate className="space-y-5 animate-fade-in"> 
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                                            <input 
                                                type="text" id="formName" name="name" required placeholder="John Doe"
                                                value={shippingAddress.name} onChange={handleAddressChange} 
                                                className={inputClass(addressErrors.name)}
                                                style={{ borderColor: addressErrors.name ? undefined : '#e5e7eb', outlineColor: OLIVE_THEME.main }}
                                                onFocus={(e) => e.target.style.borderColor = OLIVE_THEME.main}
                                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                            />
                                            {addressErrors.name && <p className="mt-1 text-xs text-red-500 font-medium">{addressErrors.name}</p>}
                                        </div>
                                        <div>
<label htmlFor="formPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (India)</label>                                     <div className="relative">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium sm:text-sm border-r border-gray-300 pr-2 h-5 flex items-center">
                +91
            </span>
        </div>                                         <input 
            type="tel" id="formPhone" name="phone" required placeholder="9876543210"
            value={shippingAddress.phone} onChange={handleAddressChange} 
            className={`${inputClass(addressErrors.phone)} !pl-14`} 
            style={{ borderColor: addressErrors.phone ? undefined : '#e5e7eb', outlineColor: OLIVE_THEME.main }}
            onFocus={(e) => e.target.style.borderColor = OLIVE_THEME.main}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            maxLength="10" 
        />
                                            </div>
                                            {addressErrors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{addressErrors.phone}</p>}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="formStreet" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <input 
                                            type="text" id="formStreet" name="street" required placeholder="Flat No, Building, Street Area"
                                            value={shippingAddress.street} onChange={handleAddressChange} 
                                            className={inputClass(addressErrors.street)}
                                            style={{ borderColor: addressErrors.street ? undefined : '#e5e7eb', outlineColor: OLIVE_THEME.main }}
                                            onFocus={(e) => e.target.style.borderColor = OLIVE_THEME.main}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        />
                                        {addressErrors.street && <p className="mt-1 text-xs text-red-500 font-medium">{addressErrors.street}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* --- CITY --- */}
                                        <div>
                                            <label htmlFor="formCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input 
                                                type="text" id="formCity" name="city" required placeholder="e.g. Chennai"
                                                value={shippingAddress.city} onChange={handleAddressChange} 
                                                className={inputClass(addressErrors.city)}
                                                style={{ borderColor: addressErrors.city ? undefined : '#e5e7eb', outlineColor: OLIVE_THEME.main }}
                                                onFocus={(e) => e.target.style.borderColor = OLIVE_THEME.main}
                                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                            />
                                            {addressErrors.city && <p className="mt-1 text-xs text-red-500 font-medium">{addressErrors.city}</p>}
                                        </div>

                                        {/* --- PIN CODE (New) --- */}
                                        <div>
                                            <label htmlFor="formZip" className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                                            <input 
                                                type="text" id="formZip" name="zip" required placeholder="110001"
                                                value={shippingAddress.zip} onChange={handleAddressChange} 
                                                className={inputClass(addressErrors.zip)}
                                                style={{ borderColor: addressErrors.zip ? undefined : '#e5e7eb', outlineColor: OLIVE_THEME.main }}
                                                onFocus={(e) => e.target.style.borderColor = OLIVE_THEME.main}
                                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                                maxLength="6"
                                            />
                                            {addressErrors.zip && <p className="mt-1 text-xs text-red-500 font-medium">{addressErrors.zip}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="formCountry" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <input 
                                            type="text" id="formCountry" name="country" 
                                            value="India" // ✅ HARDCODED
                                            readOnly // ✅ READ ONLY
                                            className="mt-1 block w-full rounded-lg bg-gray-100 text-gray-500 shadow-sm sm:text-sm py-2.5 px-3 border border-gray-300 cursor-not-allowed"
                                        />
                                        {addressErrors.country && <p className="mt-1 text-xs text-red-500 font-medium">{addressErrors.country}</p>}
                                    </div>
                                    
                                    <button 
                                        type="button"
                                        onClick={handleSaveAddress} 
                                        className="mt-4 w-full md:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-md text-sm font-bold text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                                        style={{ backgroundColor: OLIVE_THEME.main }}
                                        disabled={!user || isSavingAddress}
                                    >
                                        <FontAwesomeIcon icon={isSavingAddress ? faSpinner : faSave} className={`mr-2 ${isSavingAddress && 'animate-spin'}`} />
                                        {isSavingAddress ? 'Saving...' : (user ? 'Save Address' : 'Log in to Save')}
                                    </button>
                                </form>
                            ) : (
                                // Address Display Mode
                                <div className="animate-fade-in">
                                    <div className="flex items-center mb-3">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-lg" style={{ color: OLIVE_THEME.main }} /> 
                                        <span className="font-bold text-gray-800">Delivery Location</span>
                                    </div>
                                    <div className="border rounded-xl p-4 md:p-5 bg-gray-50 text-gray-700 text-sm leading-relaxed relative">
                                        <div className="font-bold text-gray-900 text-base mb-1">{shippingAddress.name}</div>
                                        <div className="mb-2">+91 {shippingAddress.phone}</div>
                                        <div className="text-gray-600">
                                            {shippingAddress.street}<br/>
                                            {shippingAddress.city} - {shippingAddress.zip}<br/>
                                            {shippingAddress.country}
                                        </div>
                                        
                                        <button 
                                            onClick={() => setIsEditingAddress(true)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors"
                                            title="Edit Address"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setIsEditingAddress(true)}
                                        className="mt-4 text-sm font-medium underline decoration-dotted hover:text-gray-900"
                                        style={{ color: OLIVE_THEME.dark }}
                                    >
                                        Change Address
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-24 bg-white p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100">
                            <h4 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Order Summary</h4>
                            
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                                {cartItems.map(item => {
                                    // Robust Price Calculation for Summary
                                    const product = item.product_details || item;
                                    const finalPrice = getPriceForCalculation(item);
                                    const originalPrice = parseFloat(product.price || 0);
                                    const hasDiscount = originalPrice > finalPrice;
                                    
                                    return (
                                        <div key={item.id} className="flex items-center">
                                            <div className="flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden w-16 h-16">
                                                <img 
                                                    src={item.product_details?.image_url || 'https://placehold.co/60x60?text=Item'} 
                                                    alt={item.product_details?.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="ml-4 flex-grow">
                                                <div className="text-sm font-semibold text-gray-800 line-clamp-1">{item.product_details?.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</div>
                                                
                                                {/* Discounted Price Display in Summary */}
                                                {hasDiscount && (
                                                    <div className="text-xs mt-1">
                                                        <span className="line-through text-gray-400 mr-2">₹{originalPrice.toFixed(2)}</span>
                                                        <span className="text-green-600 font-bold">₹{finalPrice.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {!hasDiscount && (
                                                    <div className="text-xs font-bold text-gray-700 mt-1">₹{finalPrice.toFixed(2)}</div>
                                                )}
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">
                                                ₹{(finalPrice * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Subtotal</span>
                                    <span>₹{grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-300 my-5"></div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-gray-800 font-bold">Total Amount</span>
                                <span className="text-3xl font-bold" style={{ color: OLIVE_THEME.main }}>₹{grandTotal.toFixed(2)}</span>
                            </div>

                            <button 
                                className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95"
                                onClick={handlePlaceOrder}
                                disabled={isCheckoutDisabled}
                                style={{ backgroundColor: isCheckoutDisabled ? '#9CA3AF' : OLIVE_THEME.main }}
                            >
                                <FontAwesomeIcon icon={faWallet} className="mr-2" /> 
                                Proceed to Payment
                            </button>
                            
                            {isCheckoutDisabled && (
                                <div className="mt-3 text-center text-xs bg-red-50 text-red-600 py-2 px-3 rounded-lg">
                                    {!user ? "Login required." : "Please save delivery address."}
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-center text-gray-400 text-xs">
                                <FontAwesomeIcon icon={faLock} className="mr-1.5" /> 
                                Secure SSL Encryption
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Modal */}
                {showLogin && (
                    <LoginFormModal
                        show={showLogin}
                        handleClose={() => setShowLogin(false)}
                        onLoginSuccess={handleLoginSuccess}
                    />
                )}
                
                {/* Payment Modal */}
                {showPayment && (
                    <PaymentModal
                        show={showPayment}
                        handleClose={() => setShowPayment(false)}
                        grandTotal={grandTotal}
                        cartItems={cartItems}
                        setShowLogin={setShowLogin} 
                        shippingAddress={shippingAddress} 
                    />
                )}
            </div>
        </div>
    );
}

export default CheckoutPage;