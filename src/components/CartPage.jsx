// src/components/CartPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTrashAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext.jsx';

// Define Theme Colors for consistency
const THEME_COLOR = '#7A8450';
const THEME_HOVER = '#697240';

function CartPage() {
  const { cartItems, removeItemFromCart, updateQuantity, loading } = useCart();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  // Initialize all selected by default
  useEffect(() => {
    setSelectedItems(cartItems.map(item => item.id));
  }, [cartItems]);

  // Compute total price
  const totalPrice = useMemo(() => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((acc, item) => {
        const product = item.product_details || {};
        const itemPrice = parseFloat(product.price || 0);
        return acc + itemPrice * (item.quantity || 1);
      }, 0);
  }, [cartItems, selectedItems]);

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

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

  const handleCheckout = () => {
    if (selectedItems.length === 0) return alert('Please select at least one item.');
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    itemsToCheckout.forEach(item => removeItemFromCart(item.product_details.id));
    navigate('/checkout', { state: { checkoutItems: itemsToCheckout } });
  };

  // --- Loading State ---
  if (loading)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: THEME_COLOR }}></div>
        <p className="mt-4 text-gray-500 font-medium">Loading your cart...</p>
      </div>
    );

  // --- Empty Cart State ---
  if (cartItems.length === 0)
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center px-4 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link 
          to="/" 
          className="px-8 py-3 rounded-lg text-white font-semibold shadow-md transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: THEME_COLOR }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = THEME_HOVER}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
        >
          Continue Shopping
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header / Breadcrumb */}
        <div className="mb-6">
            <Link to="/" className="text-gray-500 hover:text-[#7A8450] text-sm flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {/* Free Shipping Alert */}
        <div className="rounded-lg border p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-2 shadow-sm"
             style={{ backgroundColor: '#F7F8F2', borderColor: THEME_COLOR }}>
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="text-xl" style={{ color: THEME_COLOR }} />
            <span className="font-medium text-gray-800">Free shipping on all orders included!</span>
          </div>
          <span className="font-bold text-sm px-3 py-1 rounded-full bg-white border" style={{ color: THEME_COLOR, borderColor: THEME_COLOR }}>
            Incredible Deal
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Cart Items */}
          <div className="flex-1">
            
            {/* Select All Header */}
            <div className="bg-white p-4 rounded-t-xl border-b border-gray-200 flex items-center shadow-sm">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedItems.length === cartItems.length}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-gray-300 focus:ring-0 cursor-pointer"
                style={{ accentColor: THEME_COLOR }}
              />
              <label htmlFor="select-all" className="ml-3 text-gray-700 font-semibold cursor-pointer select-none">
                Select all ({cartItems.length} items)
              </label>
            </div>

            {/* Items List */}
            <div className="space-y-4 mt-4">
              {cartItems.map((item) => {
                const product = item.product_details || {};
                const itemPrice = parseFloat(product.price || 0);
                const productId = product.id || item.id;

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white p-4 rounded-xl shadow-sm border transition-all duration-200 flex flex-col sm:flex-row gap-4
                      ${selectedItems.includes(item.id) ? 'border-gray-300' : 'border-transparent opacity-90'}`}
                  >
                    {/* Mobile: Checkbox row */}
                    <div className="flex items-start sm:items-center">
                        <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-5 h-5 mt-1 sm:mt-0 rounded border-gray-300 focus:ring-0 cursor-pointer"
                        style={{ accentColor: THEME_COLOR }}
                        />
                    </div>

                    {/* Image */}
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/150?text=No+Image'}
                        alt={product.name}
                        className="w-28 h-28 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-100"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight hover:underline">
                                <Link to={`/product/${productId}`} style={{ color: 'inherit' }}>
                                    {product.name || 'Product Name'}
                                </Link>
                            </h3>
                        </div>
                        <span className="inline-block mt-1 text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: '#A4AC86' }}>
                            Top Pick
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                            Est. Delivery: <span className="text-gray-700 font-medium">Nov 12 - Nov 25</span>
                        </p>
                      </div>
                      
                      {/* Price (Mobile: shown below info, Desktop: part of flow) */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-bold" style={{ color: THEME_COLOR }}>₹{itemPrice.toFixed(2)}</span>
                        <span className="text-sm text-gray-400 line-through">₹{(itemPrice * 1.15).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions (Quantity & Remove) */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start border-t sm:border-0 pt-4 sm:pt-0 gap-4">
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(product.id, e)}
                        className="form-select block w-24 rounded-lg border-gray-300 text-gray-700 text-sm focus:ring-1 focus:ring-offset-0 py-1.5"
                        style={{ borderColor: '#d1d5db', outline: 'none' }}
                      >
                        {[...Array(10).keys()].map(i => (
                          <option key={i + 1} value={i + 1}>Qty: {i + 1}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => removeItemFromCart(product.id)}
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggested / Cross-sell Placeholder */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-2">You might also like</h4>
              <div className="h-24 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                Recommended products appear here
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary (Sticky) */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Selected Items</span>
                  <span className="font-medium text-gray-900">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold" style={{ color: THEME_COLOR }}>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className={`w-full py-3.5 rounded-lg text-white font-bold text-lg shadow-lg transition-all duration-200 transform active:scale-95
                  ${selectedItems.length === 0 
                    ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                    : 'hover:shadow-xl hover:-translate-y-0.5'}`}
                style={selectedItems.length > 0 ? { backgroundColor: THEME_COLOR } : {}}
                onMouseOver={(e) => selectedItems.length > 0 && (e.currentTarget.style.backgroundColor = THEME_HOVER)}
                onMouseOut={(e) => selectedItems.length > 0 && (e.currentTarget.style.backgroundColor = THEME_COLOR)}
              >
                Checkout {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  Secure Checkout • Money-back guarantee
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartPage;