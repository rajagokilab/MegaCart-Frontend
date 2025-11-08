// src/components/CartPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Alert, Form, Spinner } from 'react-bootstrap'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faAngleDown, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext.jsx'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './CartPage.css'; 

function CartPage() {
    const { 
        cartItems, 
        removeItemFromCart, 
        updateQuantity,
        loading // Get loading state from context
    } = useCart(); 

    // --- Calculations ---
    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product_details?.price || 0); 
        return acc + price * item.quantity;
    }, 0);
    
    const shipping = 0; 
    const orderTotal = subtotal + shipping;

    // --- Quantity Change Handler ---
    const handleQuantityChange = (productId, event) => {
        const newQuantity = parseInt(event.target.value);
        if (newQuantity >= 1) {
            updateQuantity(productId, newQuantity);
        } else {
            // Optional: If quantity is 0, remove
            removeItemFromCart(productId);
        }
    };
    
    // --- Loading State ---
    if (loading) {
         return <div className="container py-5 text-center"><Spinner animation="border" /></div>;
    }

    // --- Cart Empty State ---
    if (cartItems.length === 0) {
        return (
            <div className="container py-5 text-center">
                <Alert variant="info">
                    Your shopping cart is currently empty.
                </Alert>
                <Button as={Link} to="/" variant="primary">
                    Continue Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {/* Top Free Shipping Banner */}
            <div className="alert alert-success d-flex justify-content-between align-items-center mb-4 p-2 border-0">
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2 fs-5" />
                    <span className="fw-bold">Free shipping</span>
                </div>
                <span className="fw-bold text-success">Incredible</span>
            </div>

            <div className="row">
                
                {/* --------------------- A. LEFT COLUMN (Cart Items) --------------------- */}
                <div className="col-lg-8">
                    <div className="d-flex align-items-center mb-3">
                        <Form.Check type="checkbox" label={<span className="fw-bold">Select all ({cartItems.length})</span>} id="select-all-checkbox" defaultChecked />
                        <span className="ms-auto text-dark fw-bold"></span> 
                    </div>

                    {/* --- Itemized List --- */}
                    {cartItems.map((item, index) => {
                        // Use product_details, provide fallbacks
                        const product = item.product_details || {};
                        const itemPrice = parseFloat(product.price || 0); 
                        const productId = product.id || item.id;

                        return (
                            <div key={item.id} className="card mb-3 p-3 shadow-sm border-light">
                                <div className="d-flex align-items-center">
                                    <Form.Check type="checkbox" className="me-3" defaultChecked />
                                    
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/60x60?text=Product'}
                                        alt={product.name}
                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                        className="me-3 rounded"
                                    />

                                    <div className="flex-grow-1">
                                        <h6 className="mb-0 fw-normal">
                                            <Link to={`/product/${productId}`} className="text-dark text-decoration-none">
                                                {product.name || 'Product Name Missing'}
                                            </Link>
                                        </h6>
                                        <span className="badge bg-secondary small mb-1">Top picks</span>
                                        
                                        <div className="d-flex align-items-baseline mt-1">
                                            <span className="fw-bold fs-5 me-3">
                                                {/* Use currency symbol from your region, e.g., ₹ or kr */}
                                                ₹{itemPrice.toFixed(2)}
                                            </span>
                                            <span className="text-muted small text-decoration-line-through">
                                                RRP ₹{(itemPrice * 1.15).toFixed(2)}
                                            </span>
                                        </div>
                                        
                                        <p className="text-muted small mt-2 mb-0">
                                            Pre-order: **Delivery Nov 12-25**
                                        </p>
                                    </div>
                                    
                                    <div className="ms-4 d-flex flex-column align-itemsB-end">
                                        <Form.Select 
                                            style={{ width: '100px' }} 
                                            value={item.quantity} 
                                            // Pass the product's actual ID
                                            onChange={(e) => handleQuantityChange(product.id, e)}
                                        >
                                            {[...Array(10).keys()].map(i => (
                                                <option key={i + 1} value={i + 1}>{`Qty ${i + 1}`}</option>
                                            ))}
                                        </Form.Select>
                                        <Button variant="link" onClick={() => removeItemFromCart(product.id)} className="text-muted small p-0 mt-1">
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    <div className="mt-5 pt-3 border-top">
                         <h4 className="fw-bold">Explore MegaCart's picks</h4>
                         <p className="text-muted small">Placeholder for suggested products based on cart items.</p>
                    </div>

                </div> {/* End Left Column */}

                
                {/* --------------------- B. RIGHT COLUMN (Order Summary) --------------------- */}
                <div className="col-lg-4">
                    <div className="p-4 border rounded shadow-sm sticky-summary-box">
                        
                        <h5 className="mb-3 fw-bold">Order Summary</h5>
                        <div className="d-flex justify-content-between mb-2 small text-secondary">
                            <span>Item(s) total:</span>
                            <span className="fw-bold">₹{subtotal.toFixed(2)}</span>
                        </div>
                        
                        <hr />
                        
                        <div className="d-flex justify-content-between mb-4 fs-5">
                            <span className="fw-bold">Total</span>
                            <span className="fw-bolder">₹{orderTotal.toFixed(2)}</span>
                        </div>
                        
                        <Button 
                            variant="warning" 
                            size="lg" 
                            className="w-100 fw-bold" 
                            as={Link} 
                            to="/checkout"
                        >
                            Checkout ({cartItems.length})
                        </Button>

                        <p className="text-muted small mt-2">
                            Item availability and pricing are not guaranteed until payment is finalized.
                        </p>

                        <hr />

                        <h6 className="fw-bold mb-2">Safe Payment Options</h6>
                        <div className="d-flex flex-wrap mb-4" style={{ gap: '5px' }}>
                             <FontAwesomeIcon icon={faCreditCard} className="fs-4 text-primary me-2" />
                             {/* 🛑 FIX: Corrected typo below */}
                             <FontAwesomeIcon icon={faCreditCard} className="fs-4 text-secondary me-2" />
                             <FontAwesomeIcon icon={faCreditCard} className="fs-4 text-success me-2" />
                        </div>
                        
                        <h6 className="fw-bold mb-2">Delivery guarantee</h6>
                        <ul className="list-unstyled small text-success">
                            <li><FontAwesomeIcon icon={faCheckCircle} className="me-2" /> 50,00kr credit for delay</li>
                            <li><FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Return period 30 days</li>
                        </ul>
                        
                        <div className="text-center mt-3 border-top pt-2">
                             <span className="text-primary small">Learn more <FontAwesomeIcon icon={faAngleDown} /></span>
                        </div>

                    </div> {/* End Sticky Summary Box */}
                </div> {/* End Right Column */}
            </div>
        </div>
    );
}

export default CartPage;