/* src/components/ProductDetails.jsx */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faShoppingBag, 
  faBolt, 
  faSpinner,
  faLock,     
  faRocket,   
  faUndo      
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
  text: '#1F2937'   // Dark text
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

  // --- State for the active media (Image + Transform) ---
  const [activeMedia, setActiveMedia] = useState({ url: '', transform: '', label: '' });

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
  
  // --- PREPARE GALLERY ITEMS WITH TRANSFORMS ---
  const galleryItems = useMemo(() => {
    if (!product) return [];
    const mainImg = product.image_url || 'https://placehold.co/800x600?text=No+Image';
    
    // If the API provides real multiple images, use them
    if (product.images && product.images.length > 0) {
       return [
         { url: mainImg, transform: '', label: 'Main View' },
         ...product.images.map((img, i) => ({ url: img.url, transform: '', label: `View ${i+1}` }))
       ];
    }

    // --- TRANSFORMATION LOGIC ---
    return [
      { 
        url: mainImg, 
        transform: '', 
        label: 'Front View' 
      },
      { 
        url: mainImg, 
        transform: 'rotate-90 scale-75', // Rotate 90deg (Side View)
        label: 'Side View' 
      },
      { 
        url: mainImg, 
        transform: 'scale-x-[-1]', // Mirror/Flip Horizontally (Back View)
        label: 'Back View' 
      },
      { 
        url: mainImg, 
        transform: 'scale-150', // Zoom In (Detail View)
        label: 'Detail View' 
      }
    ];
  }, [product]);

  // --- Effect to set the initial selected image on load ---
  useEffect(() => {
    if (galleryItems.length > 0) {
        setActiveMedia(galleryItems[0]);
    }
  }, [galleryItems]); 

  
  const handleReviewChange = (e) => setReviewData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleRatingChange = (newRating) => setReviewData(prev => ({ ...prev, rating: newRating }));
  const handleQuantityChange = (e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1));
  
  const submitCartItem = async () => {
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

  const handleAddToCart = async () => {
    const success = await submitCartItem();
    if (success) {
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout', { 
      state: { checkoutItems: [{ product_details: product, quantity }] } 
    });
  };

  const handleSubmitReview = async (e) => {
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

  // --- LOADING CHECK ---
  if (loading || !product) return (
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
  
  const avgRating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : '';
  const reviewCount = product.reviews ? product.reviews.length : 0;
  
  // --- ROBUST PRICE CALCULATION ---
  const originalPrice = parseFloat(product.price || 0);
  let sellingPrice = parseFloat(product.final_price || product.discounted_price || 0);
  let discountPercent = parseFloat(product.discount_percentage || 0);

  // Fallback: If API didn't give discounted price, but gave a %, calculate manually
  if (sellingPrice === 0 && discountPercent > 0) {
    sellingPrice = originalPrice - (originalPrice * (discountPercent / 100));
  }

  // Fallback: If still 0, it means no discount
  if (sellingPrice === 0) sellingPrice = originalPrice;

  // Calculate percent if missing but prices differ
  if (discountPercent === 0 && originalPrice > sellingPrice) {
      discountPercent = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
  }

  const hasDiscount = originalPrice > sellingPrice;
  const totalPrice = (sellingPrice * quantity).toFixed(2);
  const vendorId = product?.vendor;


  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- Main Product Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* --- LEFT COLUMN: Images --- */}
        <div className="flex flex-col items-center">
          
          {/* Main Image Area with Dynamic Transforms */}
          <div className="w-full max-w-lg aspect-[4/3] bg-gray-50 rounded-xl shadow-lg mb-4 overflow-hidden flex items-center justify-center relative">
            <img
              src={activeMedia.url || 'https://placehold.co/800x600?text=No+Image'} 
              alt={product.name || 'Product'}
              className={`
                w-full h-full object-contain transition-all duration-500 ease-in-out
                ${activeMedia.transform} 
              `}
            />
            {/* View Label */}
            <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {activeMedia.label}
            </span>
          </div>
          
          {/* --- THUMBNAIL GALLERY --- */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-lg">
            {galleryItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMedia(item)}
                className={`
                  relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200
                  focus:outline-none bg-gray-100
                  ${activeMedia.label === item.label ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100 hover:border-gray-300'}
                `}
                style={{
                  borderColor: activeMedia.label === item.label ? OLIVE_THEME.main : 'transparent',
                  '--tw-ring-color': OLIVE_THEME.main
                }}
              >
                {/* Thumbnails show preview of transform */}
                <img
                  src={item.url}
                  alt={item.label}
                  className={`w-full h-full object-cover transition-transform ${item.transform}`}
                />
                
                {/* Active Overlay */}
                {activeMedia.label === item.label && (
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                )}
              </button>
            ))}
          </div>
        </div>


        {/* --- RIGHT COLUMN: Details --- */}
        <div className="lg:sticky top-24 h-fit bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 font-serif">{product.name || 'Untitled Product'}</h1>
          
          <div className="flex items-center mb-4">
            <div className="text-yellow-400 text-lg">{renderStars(avgRating)}</div>
            <span className="ml-2 font-bold text-gray-800">{avgRating}</span>
            <span className="ml-2 text-sm text-gray-500">({reviewCount} reviews)</span>
          </div>

          {/* --- PRICE SECTION --- */}
          <div className="my-6">
            <div className="flex flex-wrap items-baseline gap-3">
                {/* Final Selling Price */}
                <h2 className="text-4xl font-bold" style={{ color: OLIVE_THEME.main }}>
                    ₹{sellingPrice.toFixed(2)}
                </h2>
                
                {/* Original Price & Discount Badge (Only if discounted) */}
                {hasDiscount && (
                    <>
                        <span className="text-xl text-gray-400 line-through decoration-gray-400">
                            ₹{originalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full border border-red-200">
                            {discountPercent}% OFF
                        </span>
                    </>
                )}
            </div>
            <p className="text-green-600 text-sm font-medium mt-1">In Stock • Ready to Ship</p>
          </div>

          <div className="mb-6">
            <label htmlFor="quantitySelect" className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-l-md border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold"
              >-</button>
              <input
                type="number"
                id="quantitySelect"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 h-10 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-0"
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-r-md border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold"
              >+</button>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-6">
            <span className="text-gray-600 font-medium">Total Price:</span>
            <span className="text-2xl font-bold text-gray-900">₹{totalPrice}</span>
          </div>

          {cartSubmitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-3" role="alert">
              {cartSubmitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-2"> 
            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center w-full px-6 py-3.5 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-gray-900 hover:bg-black focus:outline-none transition-transform active:scale-95"
            >
              <FontAwesomeIcon icon={faBolt} className="mr-2" /> Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAddedToCart}
              className="flex items-center justify-center w-full px-6 py-3.5 border border-transparent rounded-lg shadow-sm text-base font-bold text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95"
              style={{ 
                backgroundColor: isAddedToCart ? '#16a34a' : OLIVE_THEME.main,
              }}
              onMouseOver={e => !isAddedToCart && (e.currentTarget.style.backgroundColor = OLIVE_THEME.dark)}
              onMouseOut={e => !isAddedToCart && (e.currentTarget.style.backgroundColor = OLIVE_THEME.main)}
            >
              <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
              {isAddedToCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Specifications */}
          <div>
            <h5 className="text-lg font-bold text-gray-900 mb-3">Product Details</h5>
            <div className="text-sm space-y-3">
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-900">{product.category_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500">Vendor</span>
                <Link 
                  to={`/vendor/${vendorId}`} 
                  className="font-medium underline decoration-1 underline-offset-2 transition-colors"
                  style={{ color: OLIVE_THEME.main }}
                >
                  {product.vendor_name || 'Official Store'}
                </Link>
              </div>
              <div className="pt-2">
                <span className="block text-gray-500 mb-1">Description</span>
                <p className="text-gray-700 leading-relaxed">{product.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- CUSTOMER REASSURANCE SECTION (NEW) --- */}
      <div className="mt-12 bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          {/* Item 1: Security */}
          <div className="flex flex-col items-center justify-center px-4 pt-4 md:pt-0">
            <div className="mb-3 text-3xl" style={{ color: OLIVE_THEME.main }}>
              <FontAwesomeIcon icon={faLock} />
            </div>
            <p className="text-sm text-gray-600 leading-snug max-w-xs">
              Security Policy Edit with Customer Reassurance Module.
            </p>
          </div>

          {/* Item 2: Delivery */}
          <div className="flex flex-col items-center justify-center px-4 pt-8 md:pt-0">
            <div className="mb-3 text-3xl" style={{ color: OLIVE_THEME.main }}>
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <p className="text-sm text-gray-600 leading-snug max-w-xs">
              Delivery Policy Edit with Customer Reassurance Module.
            </p>
          </div>

          {/* Item 3: Return */}
          <div className="flex flex-col items-center justify-center px-4 pt-8 md:pt-0">
            <div className="mb-3 text-3xl" style={{ color: OLIVE_THEME.main }}>
              <FontAwesomeIcon icon={faUndo} />
            </div>
            <p className="text-sm text-gray-600 leading-snug max-w-xs">
              Return Policy Edit with Customer Reassurance Module.
            </p>
          </div>

        </div>
      </div>
      {/* --- END REASSURANCE SECTION --- */}


      <hr className="my-12 border-gray-200" />

      {/* --- Reviews Section --- */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-8 font-serif">Customer Reviews ({reviewCount})</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Write Review Column */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 sticky top-24">
              <div className="p-5 bg-gray-50 border-b border-gray-200">
                <h5 className="text-lg font-bold text-gray-900">Write a Review</h5>
                <p className="text-sm text-gray-500 mt-1">Share your thoughts with other customers</p>
              </div>
              <div className="p-6">
                {!isUserLoggedIn ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-3">Please log in to write a review.</p>
                    <Link to="/login" className="inline-block px-6 py-2 rounded-full text-white font-medium transition-colors" style={{ backgroundColor: OLIVE_THEME.main }}>Log In</Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview}>
                    {reviewError && <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{reviewError}</div>}
                    {reviewSuccess && <div className="text-green-600 text-sm mb-3 bg-green-50 p-2 rounded">{reviewSuccess}</div>}

                    <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-1 text-2xl text-gray-300 cursor-pointer">
                        {renderStars(null, handleRatingChange, reviewData.rating)}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="reviewComment" className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                      <textarea
                        id="reviewComment"
                        rows={4}
                        name="comment"
                        value={reviewData.comment}
                        onChange={handleReviewChange}
                        required
                        placeholder="What did you like or dislike?"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:border-transparent sm:text-sm p-3"
                        style={{ '--tw-ring-color': OLIVE_THEME.main }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview || reviewSuccess}
                      className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white disabled:bg-gray-300 transition-colors"
                      style={{ backgroundColor: OLIVE_THEME.main }}
                    >
                      {isSubmittingReview && <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />}
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Review List Column */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mr-3">
                          {(review.user_username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="font-bold text-gray-900">{review.user_username || 'Anonymous'}</h6>
                          <div className="flex text-yellow-400 text-xs mt-0.5">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 pl-13 ml-13">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <div className="text-gray-400 text-5xl mb-3">★</div>
                  <h4 className="text-lg font-medium text-gray-900">No reviews yet</h4>
                  <p className="text-gray-500">Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <hr className="my-12 border-gray-200" />

      {/* --- Suggested Products --- */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">You Might Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {suggestions.map((sugg) => (
              <div
                key={sugg.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
                onClick={() => navigate(`/product/${sugg.id}`)}
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={sugg.image_url || 'https://placehold.co/300x200?text=Related'}
                    alt={sugg.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h6 className="font-bold text-gray-800 truncate mb-1 group-hover:text-[color:var(--hover-color)]" style={{ '--hover-color': OLIVE_THEME.main }}>{sugg.name}</h6>
                  
                  {/* --- UPDATED: Suggested Product Price Display --- */}
                  <div className="flex flex-col items-start">
                      {sugg.discount_percentage > 0 ? (
                          <>
                            <span className="font-bold text-lg" style={{ color: OLIVE_THEME.main }}>
                                ₹{(parseFloat(sugg.price) - (parseFloat(sugg.price) * (sugg.discount_percentage / 100))).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                                ₹{parseFloat(sugg.price).toFixed(2)}
                            </span>
                          </>
                      ) : (
                          <span className="font-bold text-lg" style={{ color: OLIVE_THEME.main }}>
                              ₹{parseFloat(sugg.price || 0).toFixed(2)}
                          </span>
                      )}
                  </div>

                  <div className="mt-2 flex items-center">
                    <div className="text-xs text-yellow-400 flex">
                      {sugg.average_rating ? renderStars(sugg.average_rating) : <span>New Arrival</span>}
                    </div>
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