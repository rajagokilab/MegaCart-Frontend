// src/components/CartPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Alert, Form, Spinner } from 'react-bootstrap'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faAngleDown, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext.jsx'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './CartPage.css'; 

function CartPage() {
    const { cartItems, removeItemFromCart, updateQuantity, loading } = useCart();
    const navigate = useNavigate();

    const [selectedItems, setSelectedItems] = useState([]);

    // Initialize all selected by default
    useEffect(() => {
        setSelectedItems(cartItems.map(item => item.id));
    }, [cartItems]);

    // Toggle single item selection
    const handleSelectItem = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    // Toggle select all
    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.id));
        }
    };

    const handleQuantityChange = (productId, event) => {
        const newQuantity = parseInt(event.target.value);
        if (newQuantity >= 1) {
            updateQuantity(productId, newQuantity);
        } else {
            removeItemFromCart(productId);
        }
    };

    // Checkout only selected items
    const handleCheckout = () => {
        if (selectedItems.length === 0) return alert('Please select at least one item to checkout.');

        const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));

        // Remove selected items from cart
        itemsToCheckout.forEach(item => removeItemFromCart(item.product_details.id));

        // Navigate to checkout page with selected items
        navigate('/checkout', { state: { checkoutItems: itemsToCheckout } });
    };

    if (loading) return <div className="container py-5 text-center"><Spinner animation="border" /></div>;

    if (cartItems.length === 0) return (
        <div className="container py-5 text-center">
            <Alert variant="info">Your shopping cart is currently empty.</Alert>
            <Button as={Link} to="/" variant="primary">Continue Shopping</Button>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="alert alert-success d-flex justify-content-between align-items-center mb-4 p-2 border-0">
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2 fs-5" />
                    <span className="fw-bold">Free shipping</span>
                </div>
                <span className="fw-bold text-success">Incredible</span>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="d-flex align-items-center mb-3">
                        <Form.Check 
                            type="checkbox" 
                            label={<span className="fw-bold">Select all ({cartItems.length})</span>} 
                            id="select-all-checkbox" 
                            checked={selectedItems.length === cartItems.length} 
                            onChange={handleSelectAll} 
                        />
                    </div>

                    {cartItems.map(item => {
                        const product = item.product_details || {};
                        const itemPrice = parseFloat(product.price || 0);
                        const productId = product.id || item.id;

                        return (
                            <div key={item.id} className="card mb-3 p-3 shadow-sm border-light">
                                <div className="d-flex align-items-center">
                                    <Form.Check 
                                        type="checkbox" 
                                        className="me-3"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                    />

                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/80x80?text=Product'}
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
                                            <span className="fw-bold fs-5 me-3">₹{itemPrice.toFixed(2)}</span>
                                            <span className="text-muted small text-decoration-line-through">
                                                RRP ₹{(itemPrice * 1.15).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-muted small mt-2 mb-0">
                                            Pre-order: **Delivery Nov 12-25**
                                        </p>
                                    </div>

                                    <div className="ms-4 d-flex flex-column align-items-end">
                                        <Form.Select 
                                            style={{ width: '100px' }} 
                                            value={item.quantity} 
                                            onChange={(e) => handleQuantityChange(product.id, e)}
                                        >
                                            {[...Array(10).keys()].map(i => (
                                                <option key={i+1} value={i+1}>{`Qty ${i+1}`}</option>
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
                </div>

                <div className="col-lg-4">
                    <div className="p-4 border rounded shadow-sm sticky-summary-box">
                        <h5 className="mb-3 fw-bold">Order Summary</h5>
                        <div className="d-flex justify-content-between mb-2 small text-secondary">
                            <span>Item(s) selected:</span>
                            <span className="fw-bold">{selectedItems.length}</span>
                        </div>
                        <Button 
                            variant="warning" 
                            size="lg" 
                            className="w-100 fw-bold" 
                            onClick={handleCheckout}
                            disabled={selectedItems.length === 0}
                        >
                            Checkout ({selectedItems.length})
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
