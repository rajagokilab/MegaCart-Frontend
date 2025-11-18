/* src/components/ProductDetails.jsx */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faShoppingBag, 
  faBolt, 
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext.jsx';
import { getAuthToken } from './auth';
import { renderStars } from '../utils/renderStars.jsx';

const GUEST_CART_ID_KEY = 'guestCartId';

// --- THEME COLOR ---
const OLIVE_THEME = {
  main: '#7A8450', // Main olive green
  dark: '#5F673C',  // Darker for hover
  light: '#F0F2E9', // Light for alert backgrounds
  text: '#1F2937'  // Dark text
};

const getGuestCartId = () => {
  return localStorage.getItem(GUEST_CART_ID_KEY);
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [cartSubmitError, setCartSubmitError] = useState(null);
  const { cartItems, fetchCart } = useCart();

  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!getAuthToken());

  // We still use selectedImage to hold the main image URL
  const [selectedImage, setSelectedImage] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL;

  // Product endpoints
  const PRODUCT_URL_BASE = `${API_BASE}/products`;
  const PRODUCT_DETAIL_URL = `${PRODUCT_URL_BASE}/${id}/`;
  const SUGGESTIONS_URL = `${PRODUCT_URL_BASE}/${id}/suggestions/`;
  const REVIEW_POST_URL = `${PRODUCT_URL_BASE}/${id}/reviews/`;
  const CART_ADD_URL = `${API_BASE}/cart/add_item/`;

  // Fetch product
  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PRODUCT_DETAIL_URL);
      if (!res.ok) throw new Error('Failed to fetch product data.');
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions
  const fetchSuggestions = async () => {
    try {
      const res = await fetch(SUGGESTIONS_URL);
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.log('Failed to fetch suggestions', err);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchSuggestions();
  }, [id]);
  
  // --- Effect to set the selected image on load ---
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image_url || 'https://placehold.co/800x600?text=No+Image');
    }
  }, [product]); 

  
  // (All handler functions remain the same...)
  const handleReviewChange = (e) => setReviewData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleRatingChange = (newRating) => setReviewData(prev => ({ ...prev, rating: newRating }));
  const handleQuantityChange = (e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1));
  const submitCartItem = async () => { /* ...no changes... */ 
    setCartSubmitError(null);
    try {
      const token = getAuthToken();
      let guestId = getGuestCartId();

      if (!token && !guestId) {
        guestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
        localStorage.setItem(GUEST_CART_ID_KEY, guestId);
      }

      const payload = { product_id: id, quantity };
      const headers = { 'Content-Type': 'application/json' };

      if (token) {
        headers['Authorization'] = `JWT ${token}`;
      } else if (guestId) {
        headers['X-Guest-Cart-Id'] = guestId;
      }

      const res = await fetch(CART_ADD_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const cartData = await res.json();
      if (!res.ok) throw new Error(cartData.error || 'Failed to add to cart.');

      if (!token && cartData.guest_id && cartData.guest_id !== guestId) {
        localStorage.setItem(GUEST_CART_ID_KEY, cartData.guest_id);
      }

      if (fetchCart) fetchCart();
      setIsAddedToCart(true);
      return true;
    } catch (err) {
      setCartSubmitError(err.message);
      return false;
    }
  };
  const handleAddToCart = async () => { /* ...no changes... */ 
    const success = await submitCartItem();
    if (success) {
      navigate('/cart');
    }
  };
  const handleBuyNow = () => { /* ...no changes... */ 
    navigate('/checkout', { 
      state: { checkoutItems: [{ product_details: product, quantity }] } 
    });
  };
  const handleSubmitReview = async (e) => { /* ...no changes... */ 
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      const token = getAuthToken();
      const res = await fetch(REVIEW_POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `JWT ${token}` } : {})
        },
        body: JSON.stringify(reviewData)
      });
      if (!res.ok) throw new Error('Failed to submit review.');
      setReviewSuccess('Review submitted successfully!');
      setReviewData({ rating: 5, comment: '' });
      fetchProduct();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // --- UPDATED LOADING CHECK ---
  if (loading || !product || !selectedImage) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" style={{ color: OLIVE_THEME.main }} />
    </div>
  );

  if (error) return (
    <div className="container mx-auto max-w-3xl p-5">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        {error}
      </div>
    </div>
  );
  
  // (product data variables remain the same...)
  const avgRating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : '';
  const reviewCount = product.reviews ? product.reviews.length : 0;
  const unitPrice = parseFloat(product.price || 0);
  const totalPrice = (unitPrice * quantity).toFixed(2);
  const vendorId = product?.vendor;

  // --- No gallery array needed ---


  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- Main Product Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* --- MODIFIED Image Column --- */}
        <div className="flex flex-col justify-center items-center">
          {/* Main Image */}
          <img
            src={selectedImage} // Use state for the src
            alt={product.name || 'Product'}
            className="w-full max-w-lg h-auto object-cover rounded-xl shadow-lg mb-4"
          />
          
          {/* --- Thumbnail Gallery (Single Image) --- */}
          <div className="flex space-x-2 justify-center">
            <button
              className="w-20 h-20 rounded-lg overflow-hidden border-2 ring-2" // Always active
              style={{
                borderColor: OLIVE_THEME.main,
                '--tw-ring-color': OLIVE_THEME.main
              }}
              // No onClick needed as it's the only image
            >
              <img
                src={selectedImage} // Show the same main image
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
          {/* --- END MODIFICATION --- */}
        </div>


        {/* Details Column (Buy Box) */}
        <div className="lg:sticky top-24 h-fit bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          {/* (All content inside the buy box remains the same) */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.name || 'Untitled Product'}</h1>
          
          <div className="flex items-center mb-4">
            <div className="text-yellow-400">{renderStars(avgRating)}</div>
            <span className="ml-2 font-bold text-gray-800">{avgRating}</span>
            <span className="ml-2 text-sm text-gray-500">({reviewCount} reviews)</span>
          </div>

          <h2 className="text-4xl font-bold my-5" style={{ color: OLIVE_THEME.main }}>₹{unitPrice.toFixed(2)}</h2>

          <div className="mb-4">
            <label htmlFor="quantitySelect" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              id="quantitySelect"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm"
              style={{ '--tw-ring-color': OLIVE_THEME.main, '--tw-border-color': OLIVE_THEME.main }}
            />
          </div>

          <div className="text-2xl font-bold text-gray-900 mb-4">
            Total: <span style={{ color: OLIVE_THEME.main }}>₹{totalPrice}</span>
          </div>

          {cartSubmitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-3" role="alert">
              {cartSubmitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6"> 
            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center w-full px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
            >
              <FontAwesomeIcon icon={faBolt} className="mr-2" /> Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAddedToCart}
              className="flex items-center justify-center w-full px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              style={{ 
                backgroundColor: isAddedToCart ? '#28a745' : OLIVE_THEME.main,
                '--hover-bg': OLIVE_THEME.dark
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = isAddedToCart ? '#28a745' : OLIVE_THEME.dark}
              onMouseOut={e => e.currentTarget.style.backgroundColor = isAddedToCart ? '#28a745' : OLIVE_THEME.main}
            >
              <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
              {isAddedToCart ? 'Item in Cart' : 'Add to Cart'}
            </button>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Specifications */}
          <div className="mt-6">
            <h5 className="text-lg font-bold text-gray-900 mb-3">Specifications</h5>
            <div className="divide-y divide-gray-200">
              <div className="py-3 flex justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm font-medium text-gray-900">{product.category_name || 'N/A'}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-sm text-gray-600">Vendor:</span>
                <Link 
                  to={`/vendor/${vendorId}`} 
                  className="text-sm font-medium" 
                  style={{ color: OLIVE_THEME.main, '--hover-color': OLIVE_THEME.dark }}
                  onMouseOver={e => e.currentTarget.style.color = OLIVE_THEME.dark}
                  onMouseOut={e => e.currentTarget.style.color = OLIVE_THEME.main}
                >
                  {product.vendor_name || 'N/A'}
                </Link>
              </div>
            </div>
            <div className="mt-4">
                <h6 className="text-sm font-medium text-gray-600">Description:</h6>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{product.description || 'No description provided.'}</p>
            </div>
          </div>

        </div>
      </div>

      <hr className="my-10 lg:my-16 border-gray-200" />

      {/* --- Reviews Section --- */}
      {/* (No changes to this section) */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews ({reviewCount})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Write Review */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h5 className="text-lg font-semibold text-gray-900">Write a Review</h5>
            </div>
            <div className="p-5">
              {!isUserLoggedIn ? (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
                  Please <Link to="/login" className="font-bold underline" style={{ color: OLIVE_THEME.main }}>log in</Link> to submit a review.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  {reviewError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                     <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                      {reviewSuccess}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating:</label>
                    <div className="text-2xl text-yellow-400 cursor-pointer">
                      {renderStars(null, handleRatingChange, reviewData.rating)}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-1">Comment:</label>
                    <textarea
                      id="reviewComment"
                      rows={4}
                      name="comment"
                      value={reviewData.comment}
                      onChange={handleReviewChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      style={{ '--tw-ring-color': OLIVE_THEME.main, '--tw-border-color': OLIVE_THEME.main }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview || reviewSuccess}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:bg-gray-400 transition-colors"
                    style={{ backgroundColor: OLIVE_THEME.main, '--hover-bg': OLIVE_THEME.dark }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = OLIVE_THEME.dark}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = OLIVE_THEME.main}
                  >
                    {isSubmittingReview && <FontAwesomeIcon icon={faSpinner} className="animate-spin -ml-1 mr-2 h-5 w-5" />}
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <h6 className="font-semibold text-gray-800">{review.user_username || 'Anonymous User'}</h6>
                    <small className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                  <div className="mb-2 text-yellow-400">{renderStars(review.rating)}</div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No reviews yet.</p>
            )}
          </div>

        </div>
      </div>

      <hr className="my-10 lg:my-16 border-gray-200" />

      {/* --- Suggested Products --- */}
      {/* (No changes to this section) */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {suggestions.map((sugg) => (
              <div
                key={sugg.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden h-full transition-all duration-300 hover:shadow-xl cursor-pointer group"
                onClick={() => navigate(`/product/${sugg.id}`)}
              >
                <img
                  src={sugg.image_url || 'https://placehold.co/300x200?text=Related'}
                  alt={sugg.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h6 className="font-semibold text-gray-800 truncate mb-1 group-hover:underline" style={{ '--hover-color': OLIVE_THEME.main }}>{sugg.name}</h6>
                  <p className="font-bold mb-2" style={{ color: OLIVE_THEME.main }}>₹{parseFloat(sugg.price || 0).toFixed(2)}</p>
                  <div className="text-sm text-yellow-400">
                    {sugg.average_rating ? renderStars(sugg.average_rating) : <span className="text-xs text-gray-400 italic">New</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;