// PaymentModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAuthToken, getCachedUser, logout } from './auth'; 
import { useNavigate } from 'react-router-dom'; // 🛑 1. Import useNavigate

const RAZORPAY_KEY_ID = 'rzp_test_Rc49M6OPR7fOLP'; 
const ORDER_CREATE_URL = 'http://127.0.0.1:8000/api/orders/create/';
const VERIFY_PAYMENT_URL = 'http://127.0.0.1:8000/api/orders/verify/'; // 🛑 2. Add Verification URL

function PaymentModal({ show, handleClose, grandTotal, setShowLogin }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate(); // 🛑 3. Initialize navigate
    
    // ... (useEffect for loading script remains the same)

    const handleInitiatePayment = async () => {
        setIsProcessing(true);
        
        if (!window.Razorpay) {
            alert('Razorpay SDK not loaded. Please try again.');
            setIsProcessing(false);
            return;
        }
        
        try {
            // ... (Code to create order remains the same)

            const authToken = getAuthToken();
            // ... (fetch orderResponse)
            
            if (!orderResponse.ok) {
                 // ... (401 error handling remains the same)
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
                
                // 🛑 4. UPDATE THE HANDLER FUNCTION 🛑
                handler: async function (response) {
                    setIsProcessing(true); // Keep processing spinner on
                    
                    // Send verification data to your backend
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
                        
                        // Payment successful and verified!
                        alert('Payment Successful! Your order has been placed.');
                        handleClose();
                        navigate('/my-orders'); // Redirect to order tracking page

                    } catch (verifyError) {
                        alert(`Payment verification failed: ${verifyError.message}. Please contact support.`);
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: user?.username || 'Customer', 
                    email: user?.email || '',
                },
                theme: {
                    color: '#82a4eeff'
                },
                modal: {
                    ondismiss: function() {
                        // This function is called when user closes the modal
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
            // We set isProcessing to false here ONLY if rzp.open() fails
            // It's handled by modal.ondismiss or handler now.

        } catch (error) {
            console.error('Error initiating payment:', error);
            if (error.message !== 'Your session has expired. Please log in again to complete the payment.') {
                 alert(error.message || 'Failed to initiate payment. Please try again.');
            }
            setIsProcessing(false); // Make sure to stop processing on error
        } 
        // DO NOT set isProcessing(false) in a finally block here
        // The modal is now open, so handler/ondismiss will control the state.
    };

    const displayAmount = grandTotal.toFixed(2);
    
    return (
        // ... (Your Modal JSX remains the same)
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">Payment Page</Modal.Title>
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
                        style={{ backgroundColor: '#9ac2deff', borderColor: '#EE82EE', fontWeight: 'bold' }}
                        disabled={isProcessing} 
                    >
                        {isProcessing ? 'Processing Order...' : `Pay ₹${displayAmount} Now`}
                    </Button>
                </div>

            </Modal.Body>
        </Modal>
    );
}

export default PaymentModal;