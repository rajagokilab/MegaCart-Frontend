// PaymentModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAuthToken, getCachedUser } from './auth'; 
import { useNavigate } from 'react-router-dom';

const RAZORPAY_KEY_ID = 'rzp_test_RjZJ90FopiN2Lo'; 
const API = import.meta.env.VITE_API_URL;
const ORDER_CREATE_URL = `${API}/orders/create/`;
const VERIFY_PAYMENT_URL = `${API}/orders/verify/`;

function PaymentModal({ show, handleClose, grandTotal }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    // Load Razorpay script
    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement('script');
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => console.log("Razorpay SDK loaded");
            script.onerror = () => alert("Failed to load Razorpay SDK. Please check your internet connection.");
            document.body.appendChild(script);
        }
    }, []);

    const handleInitiatePayment = async () => {
        setIsProcessing(true);

        if (!window.Razorpay) {
            alert('Razorpay SDK not loaded. Please try again.');
            setIsProcessing(false);
            return;
        }

        try {
            const authToken = getAuthToken();
            const response = await fetch(ORDER_CREATE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { Authorization: `JWT ${authToken}` } : {}),
                },
                body: JSON.stringify({ amount: grandTotal })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Your session has expired. Please log in again.');
                    setIsProcessing(false);
                    return;
                }
                throw new Error('Failed to create order.');
            }

            const orderData = await response.json();
            const { razorpay_order_id, amount, currency } = orderData;
            const user = getCachedUser();

            const options = {
                key: RAZORPAY_KEY_ID,
                amount,
                currency,
                name: 'VetriCart E-commerce',
                description: 'Order Payment',
                order_id: razorpay_order_id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await fetch(VERIFY_PAYMENT_URL, {
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

                        if (!verifyResponse.ok) throw new Error('Payment verification failed.');

                        alert('Payment Successful! Your order has been placed.');
                        handleClose();
                        navigate('/my-orders');
                    } catch (err) {
                        alert(`Payment verification failed: ${err.message}`);
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: user?.username || 'Customer',
                    email: user?.email || ''
                },
                theme: {
                    color: '#82a4ee'
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
            alert(error.message || 'Failed to initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    const displayAmount = grandTotal.toFixed(2);

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">Payment Page</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="text-center mb-4 p-4 rounded" style={{ 
                    background: 'linear-gradient(to right, #FFDAB9, #FFC0CB)',
                    color: '#4B0082'
                }}>
                    <h5 className="mb-0">Total Amount:</h5>
                    <h1 className="fw-bolder text-3xl">₹{displayAmount}</h1>
                </div>

                <p className="text-center text-muted small">
                    Click 'Pay Now' to open the secure Razorpay checkout interface.
                </p>

                <div className="d-grid gap-2">
                    <Button 
                        onClick={handleInitiatePayment} 
                        className="btn-lg mt-4 fw-bold" 
                        style={{ backgroundColor: '#9ac2de', borderColor: '#EE82EE' }}
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
