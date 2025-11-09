/* src/components/CheckoutPage.jsx */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Button, Modal, Row, Col, ListGroup, Form, Card } from 'react-bootstrap'; 
import LoginFormModal from './LoginFormModal.jsx'; 
import { getCachedUser, getAuthToken, logout } from './auth'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCreditCard, faTruck, faUserCheck, faWallet, faMapMarkerAlt, faEdit, faSave } from '@fortawesome/free-solid-svg-icons'; 

// --- Constants ---
const API = import.meta.env.VITE_API_URL;
const GUEST_CART_ID_KEY = 'guestCartId';

const RAZORPAY_KEY_ID = 'rzp_test_Rc49M6OPR7fOLP'; 
const CART_DETAIL_URL = `${API}/cart/detail/`;
const ORDER_CREATE_URL = `${API}/orders/create/`;
const VERIFY_PAYMENT_URL = `${API}/orders/verify/`;
const USER_ADDRESS_SAVE_URL = `${API}/users/save_address/`;


// ------------------------------------------------------------------
// --- PaymentModal Component (No changes) ---
// ------------------------------------------------------------------
function PaymentModal({ show, handleClose, grandTotal, cartItems, setShowLogin, shippingAddress }) {
    // ... (This entire component is unchanged)
    const navigate = useNavigate(); 
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        if (show) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
            
            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
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
                id: item.product_details.id, 
                quantity: item.quantity
            }));

            const payload = { 
                grand_total: grandTotal,
                shipping_details: shippingAddress,
                items: itemsPayload 
            };
            
            if (payload.items.length === 0 || payload.grand_total <= 0) {
                 throw new Error('Internal cart error: No items found for payment.');
            }

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
                    throw new Error('Your session has expired. Please log in again to complete the payment.');
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
                name: 'MegaCart E-commerce',
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
                            throw new Error('Payment verification failed on server.');
                        }
                        
                        alert('Payment Successful! Your order has been placed.');
                        localStorage.removeItem(GUEST_CART_ID_KEY); 
                        window.dispatchEvent(new Event("authChanged")); 

                        handleClose();
                        navigate('/my-orders'); 

                    } catch (verifyError) {
                        alert(`Payment verification failed: ${verifyError.message}. Please contact support.`);
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: shippingAddress.name, 
                    email: user?.email || '',
                    contact: shippingAddress.phone || '', 
                },
                theme: {
                    color: '#EE82EE'
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
            if (error.message !== 'Your session has expired. Please log in again to complete the payment.') {
                 alert(error.message || 'Failed to initiate payment. Please try again.');
            }
            setIsProcessing(false); 
        } 
    };

    const displayAmount = grandTotal.toFixed(2);
    
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold"><FontAwesomeIcon icon={faCreditCard} className="me-2" /> Finalize Payment</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                
                <div className="text-center mb-4 p-3 rounded" style={{ 
                    background: 'linear-gradient(to right, #FFDAB9, #FFC0CB)',
                    color: '#4B0082' 
                }}>
                    <h5 className="mb-0">Total Amount:</h5>
                    <h1 className="fw-bolder" style={{ fontSize: '2.5rem' }}>
                        ₹{displayAmount}
                    </h1>
                </div>

                <p className="text-center text-muted small">
                    Click 'Pay Now' to open the secure Razorpay checkout interface.
                </p>

                <div className="d-grid gap-2">
                    <Button 
                        onClick={handleInitiatePayment} 
                        className="btn-lg mt-4" 
                        style={{ backgroundColor: '#EE82EE', borderColor: '#EE82EE', fontWeight: 'bold' }}
                        disabled={isProcessing} 
                    >
                        {isProcessing ? <Spinner as="span" size="sm" animation="border" className="me-2" /> : `Pay ₹${displayAmount} Now`}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

// ------------------------------------------------------------------
// --- CheckoutPage Component (Main Export) ---
// ------------------------------------------------------------------

function CheckoutPage() {
    const navigate = useNavigate();

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
        country: 'India',
        phone: ''
    });
    const [isEditingAddress, setIsEditingAddress] = useState(true); 
    
    // 💰 --- START: VALIDATION STATE CHANGES ---
    // Changed addressError to an object for field-specific errors
    const [addressErrors, setAddressErrors] = useState({}); 
    // Added a separate state for success messages
    const [addressSuccess, setAddressSuccess] = useState(null); 
    const [isSavingAddress, setIsSavingAddress] = useState(false); 
    // 💰 --- END: VALIDATION STATE CHANGES ---


    const getCartHeaders = () => {
        // ... (this function is unchanged)
        const headers = { 'Content-Type': 'application/json' };
        const authToken = getAuthToken();
        if (authToken) {
            headers['Authorization'] = `JWT ${authToken}`;
        }
        const guestCartId = localStorage.getItem(GUEST_CART_ID_KEY);
        if (guestCartId) headers['X-Guest-Cart-Id'] = guestCartId;
        return headers;
    };

    const fetchCart = async () => {
        // ... (this function is unchanged)
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
            
            // 💰 Load saved address from user data (from 'data', not 'user')
            if (user && data.shipping_address) {
                 setShippingAddress(data.shipping_address);
                 setIsEditingAddress(false);
                 // Clear errors if we just loaded a valid address
                 setAddressErrors({}); 
            }
        } catch (err) {
            console.error('Checkout fetch error:', err);
            setError('Network error fetching cart.');
            setCart({ items: [], grand_total: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // ... (this function is mostly unchanged)
        const handleAuthChange = () => {
            const freshUser = getCachedUser();
            setUser(freshUser);
            if (freshUser) {
                 setShippingAddress(prev => ({ ...prev, name: freshUser.username || freshUser.email }));
            }
            fetchCart();
        };

        fetchCart();
        window.addEventListener("authChanged", handleAuthChange);
        return () => window.removeEventListener("authChanged", handleAuthChange);
    }, []); 

    
    // 💰 --- START: UPDATED VALIDATION LOGIC ---
    
    // This function now checks fields individually and sets specific errors
    const validateAddress = () => {
        const errors = {};
        if (!shippingAddress.name.trim()) {
            errors.name = "Recipient name is required.";
        }
        if (!shippingAddress.street.trim()) {
            errors.street = "Street address is required.";
        }
        if (!shippingAddress.city.trim()) {
            errors.city = "City / Zip Code is required.";
        }
        
        // Phone validation (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!shippingAddress.phone.trim()) {
            errors.phone = "Phone number is required.";
        } else if (!phoneRegex.test(shippingAddress.phone.trim())) {
            errors.phone = "Please enter a valid 10-digit phone number.";
        }
        
        setAddressErrors(errors);
        // Return true if the errors object is empty
        return Object.keys(errors).length === 0; 
    };

    // HANDLER FOR SAVING ADDRESS
    const handleSaveAddress = async () => {
        // Clear old messages
        setAddressSuccess(null);
        setAddressErrors({});

        if (!validateAddress() || !user) {
            if (!user) setAddressErrors({ form: "You must be logged in to save an address." });
            return;
        }
        
        setIsSavingAddress(true);
        
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error("You must be logged in to save an address.");
            }

            const response = await fetch(USER_ADDRESS_SAVE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${authToken}`,
                },
                body: JSON.stringify(shippingAddress),
            });

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || errorData.error || 'Failed to save address on server.');
                } catch (e) {
                    throw new Error("API configuration error. Check Django URL and View permission.");
                }
            }

            // Success
            setIsEditingAddress(false);
            setAddressSuccess("Address successfully saved!"); // Use the new success state
            setAddressErrors({}); // Clear any previous errors
        } catch (error) {
            console.error("Address save error:", error);
            // Set a general form error
            setAddressErrors({ form: error.message }); 
        } finally {
            setIsSavingAddress(false);
        }
    };
    
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({
            ...prev,
            [name]: value
        }));

        // 💰 Clear the error for this specific field when user starts typing
        if (addressErrors[name]) {
            setAddressErrors(prev => ({ ...prev, [name]: null }));
        }
        // 💰 Clear global success/form errors
        setAddressSuccess(null);
        if (addressErrors.form) {
            setAddressErrors(prev => ({ ...prev, form: null }));
        }
    };
    // 💰 --- END: UPDATED VALIDATION LOGIC ---


    const handlePlaceOrder = () => {
        // 💰 Updated logic to use new validation
        if (!user) {
            alert("Please log in to proceed.");
            setShowLogin(true); 
        } else if (isEditingAddress) {
             alert("Please save your shipping address before proceeding to payment.");
             // Set focus or highlight the save button
        } else if (!validateAddress()) {
             alert("Your saved address is incomplete. Please edit and re-save.");
             setIsEditingAddress(true); // Open editor
        } else {
            setShowPayment(true); 
        }
    };

    const handleLoginSuccess = (loggedInUser) => {
        // ... (this function is unchanged)
        setUser(loggedInUser);
        setShowLogin(false);
        setIsEditingAddress(true); 
    };

    if (loading) return <Container className="p-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return (
        <Container className="p-5 text-center">
            <Alert variant="danger">{error}</Alert>
            <Button onClick={() => navigate('/')}>Go Back</Button>
        </Container>
    );

    const cartItems = cart?.items || [];
    const grandTotal = cart?.grand_total || 0;

    if (!cartItems.length) return (
        <Container className="p-5 text-center">
            <Alert variant="info">Your cart is empty!</Alert>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </Container>
    );

    const isCheckoutDisabled = !user || isEditingAddress || !shippingAddress.street.trim();

    return (
        <Container className="py-5">
            <h1 className="mb-5 text-center fw-bold">
                <FontAwesomeIcon icon={faTruck} className="me-3 text-secondary" /> Secure Checkout
            </h1>
            
            <Row>
                {/* --- LEFT COLUMN: DETAILS & AUTH CHECK --- */}
                <Col lg={7} className="mb-4">
                    
                    {/* --- STEP 1: AUTHENTICATION STATUS --- */}
                    <h4 className="fw-bold mb-3">1. Authentication</h4>
                    <div className="p-4 border rounded shadow-sm bg-light mb-4">
                        {!user ? (
                            <Alert variant="warning" className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faLock} className="me-3 fs-4" />
                                <div>
                                    You are checking out as a **Guest**. Please log in to save your details.
                                    <Button variant="outline-warning" size="sm" className="ms-3 fw-bold" onClick={() => setShowLogin(true)}>
                                        Log In / Register
                                    </Button>
                                </div>
                            </Alert>
                        ) : (
                            <Alert variant="success" className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faUserCheck} className="me-3 fs-4" />
                                Logged in as: **{user.username || user.email}**
                            </Alert>
                        )}
                    </div>
                    
                    {/* --- STEP 2: SHIPPING ADDRESS --- */}
                    <h4 className="fw-bold mb-3">2. Shipping Address</h4>
                    <div className="p-4 border rounded shadow-sm bg-white">
                        
                        {/* 💰 --- START: UPDATED ERROR/SUCCESS RENDERING --- */}
                        {addressSuccess && <Alert variant="success">{addressSuccess}</Alert>}
                        {addressErrors.form && <Alert variant="danger">{addressErrors.form}</Alert>}
                        {/* 💰 --- END: UPDATED ERROR/SUCCESS RENDERING --- */}

                        
                        {isEditingAddress || !shippingAddress.street ? (
                            // Address Edit Form 
                            <Form noValidate> {/* 💰 Added noValidate to disable browser validation */}
                                <Row className="mb-3">
                                    <Form.Group as={Col} controlId="formName">
                                        <Form.Label>Recipient Name</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="name" 
                                            value={shippingAddress.name} 
                                            onChange={handleAddressChange} 
                                            required 
                                            isInvalid={!!addressErrors.name} 
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {addressErrors.name}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formPhone">
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="phone" 
                                            value={shippingAddress.phone} 
                                            onChange={handleAddressChange} 
                                            required 
                                            isInvalid={!!addressErrors.phone}
                                            placeholder="10-digit number"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {addressErrors.phone}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
                                <Form.Group className="mb-3" controlId="formStreet">
                                    <Form.Label>Street Address</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="street" 
                                        value={shippingAddress.street} 
                                        onChange={handleAddressChange} 
                                        required 
                                        isInvalid={!!addressErrors.street}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {addressErrors.street}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formCity">
                                    <Form.Label>City / Zip Code</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="city" 
                                        value={shippingAddress.city} 
                                        onChange={handleAddressChange} 
                                        required 
                                        isInvalid={!!addressErrors.city}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {addressErrors.city}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formCountry">
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="country" 
                                        value={shippingAddress.country} 
                                        onChange={handleAddressChange} 
                                        required 
                                    />
                                </Form.Group>
                                
                                <Button 
                                    variant="success" 
                                    onClick={handleSaveAddress} 
                                    className="mt-3" 
                                    disabled={!user || isSavingAddress}
                                >
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    {isSavingAddress ? <Spinner as="span" size="sm" animation="border" /> : (user ? 'Save Address' : 'Log in to Save')}
                                </Button>
                            </Form>
                        ) : (
                            // Address Display
                            <div>
                                <p className="text-primary fw-bold fs-5 mb-1">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> Current Delivery Address
                                </p>
                                <ListGroup variant="flush" className="mb-3 border rounded">
                                    <ListGroup.Item>{shippingAddress.name} ({shippingAddress.phone})</ListGroup.Item>
                                    <ListGroup.Item>{shippingAddress.street}</ListGroup.Item>
                                    <ListGroup.Item>{shippingAddress.city}, {shippingAddress.country}</ListGroup.Item>
                                </ListGroup>
                                <Button 
                                    variant="outline-secondary" 
                                    size="sm" 
                                    onClick={() => setIsEditingAddress(true)}
                                >
                                    <FontAwesomeIcon icon={faEdit} className="me-1" /> Change Address
                                </Button>
                            </div>
                        )}
                        
                    </div>
                </Col>

                {/* --- RIGHT COLUMN: ORDER SUMMARY & PAYMENT CTA (No changes) --- */}
                <Col lg={5}>
                    <div className="p-4 border rounded shadow-lg sticky-top" style={{ top: '20px' }}>
                        <h4 className="fw-bold mb-4">Order Summary</h4>
                        
                        <ListGroup variant="flush">
                            {cartItems.map(item => (
                                <ListGroup.Item key={item.id} className="d-flex align-items-center px-0 py-3">
                                    
                                    <img 
                                        src={item.product_details?.image_url || 'https://placehold.co/60x60?text=Item'} 
                                        alt={item.product_details?.name} 
                                        style={{ 
                                            width: '60px', 
                                            height: '60px', 
                                            objectFit: 'cover', 
                                            borderRadius: '8px', 
                                            marginRight: '15px' 
                                        }}
                                    />
                                    
                                    <div className="small me-auto">
                                        <div className="fw-bold">{item.product_details?.name}</div>
                                        <div className="text-muted">Quantity: {item.quantity}</div>
                                    </div>

                                    <span className="fw-bold small">
                                        ₹{(item.total_price || item.quantity * item.product_details.price).toFixed(2)}
                                    </span>

                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        
                        <hr />
                        
                        <div className="d-flex justify-content-between mb-3 fw-bold">
                            <span>Subtotal:</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-4 text-muted small">
                            <span>Shipping & Handling:</span>
                            <span>Free</span>
                        </div>

                        <div className="d-flex justify-content-between fw-bolder fs-4 mb-4 text-success">
                            <span>Total Due:</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>

                        <Button 
                            className="w-100 btn-success btn-lg" 
                            onClick={handlePlaceOrder}
                            disabled={isCheckoutDisabled} 
                        >
                            <FontAwesomeIcon icon={faWallet} className="me-2" /> 
                            Proceed to Payment
                        </Button>
                        
                        {isCheckoutDisabled && (
                             <p className="text-center text-danger small mt-2 fw-bold">
                                 Please Log in AND Save your address.
                             </p>
                        )}

                        <p className="text-center text-muted small mt-2">
                             <FontAwesomeIcon icon={faLock} className="me-1" /> Secure payment powered by Razorpay.
                        </p>
                    </div>
                </Col>
            </Row>

            {/* Login Modal */}
            {showLogin && (
                <LoginFormModal
                    show={showLogin}
                    handleClose={() => setShowLogin(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
            
            {/* Payment Modal (Passing all necessary props) */}
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
        </Container>
    );
}

export default CheckoutPage;