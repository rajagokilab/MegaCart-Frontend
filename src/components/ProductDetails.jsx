/* src/components/ProductDetails.jsx */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faShoppingBag, faBolt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCart } from '../context/CartContext.jsx';
import { getAuthToken } from './auth';
import { renderStars } from '../utils/renderStars.jsx';

const GUEST_CART_ID_KEY = 'guestCartId';

// This function just *gets* the ID. The backend will create it.
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

  const API_URL = `${import.meta.env.VITE_API_URL}/products/`;
  const PRODUCT_DETAIL_URL = `${API_URL_BASE}/${id}/`;
  const SUGGESTIONS_URL = `${API_URL_BASE}/${id}/suggestions/`;
  const API_CART_ADD_URL = `${import.meta.env.VITE_API_URL}/cart/add_item/`;
  const REVIEW_POST_URL = `${API_URL_BASE}/${id}/reviews/`;

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

  const handleReviewChange = (e) => {
    setReviewData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRatingChange = (newRating) => {
    setReviewData(prev => ({ ...prev, rating: newRating }));
  };

  const handleQuantityChange = (e) => {
    setQuantity(Math.max(1, parseInt(e.target.value) || 1));
  };

  // 💰 --- KEY CHANGE #1: Replaced `getOrCreateGuestCartId` ---
  // We only *get* the ID. We let the backend *create* it and send it back.
  // This is now handled by the `getGuestCartId` function at the top of the file.

  // 💰 --- KEY CHANGE #2: Fixed `submitCartItem` function ---
  /* In src/components/ProductDetails.jsx */

  // 💰 FIXED FUNCTION
  const submitCartItem = async () => {
  setCartSubmitError(null);

  try {
    const token = getAuthToken();
    let guestId = getGuestCartId();

    // ✅ If guest and no ID, create a temporary guest ID immediately
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

    // Save guest_id returned from backend if different
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
      navigate('/cart'); // Navigate to /cart on success
    }
  };

  const handleBuyNow = async () => {
    const success = await submitCartItem();
    if (success) {
      navigate('/checkout'); // Navigate to /checkout on success
    }
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
          ...(token ? { Authorization: `Bearer ${token}` } : {})
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

  if (loading) return <div className="container p-5 text-center"><Spinner animation="border" /></div>;
  if (error) return <div className="container p-5 text-center alert alert-danger">{error}</div>;
  if (!product) return <div className="container p-5 text-center alert alert-info">Product data is missing.</div>;

  const avgRating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : 'N/A';
  const reviewCount = product.reviews ? product.reviews.length : 0;
  const unitPrice = parseFloat(product.price || 0);
  const totalPrice = (unitPrice * quantity).toFixed(2);
  const vendorId = product?.vendor;

  return (
    <div className="container-fluid py-5">
      <Row>
        <Col xs={12} lg={6} className="mb-4 mb-lg-0">
          <img
            src={product.image_url || 'https://placehold.co/800x600?text=No+Image'}
            alt={product.name || 'Product'}
            className="img-fluid rounded shadow-lg w-100"
          />
        </Col>

        <Col xs={12} lg={6}>
          <div className="sticky-buy-box p-4 rounded shadow-lg">
            <h1 className="display-6 mb-2 fw-bold">{product.name || 'Untitled Product'}</h1>
            <div className="d-flex align-items-center mb-3">
              {renderStars(avgRating)}
              <span className="ms-2 fw-bold">{avgRating}</span>
              <span className="ms-2 text-muted small">({reviewCount} reviews)</span>
            </div>

            <h2 className="text-success my-4">₹{unitPrice.toFixed(2)}</h2>

            <Form.Group controlId="quantitySelect" className="mb-3">
              <Form.Label className="fw-bold">Quantity</Form.Label>
              <Form.Control type="number" min="1" value={quantity} onChange={handleQuantityChange} />
            </Form.Group>

            <h4>Total: <span className="text-primary">₹{totalPrice}</span></h4>

            {cartSubmitError && <Alert variant="danger" className="my-3">{cartSubmitError}</Alert>}

            <div className="d-grid gap-3 mt-3">
              <Button variant="success" onClick={handleBuyNow} >
                <FontAwesomeIcon icon={faBolt} className="me-2" /> Buy Now
              </Button>
              <Button
                variant={isAddedToCart ? 'success' : 'warning'}
                onClick={handleAddToCart}
                disabled={isAddedToCart}
              >
                <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                {isAddedToCart ? 'Item in Cart' : `Add ${quantity} to Cart`}
              </Button>
            </div>

            <hr />

            <h5 className="fw-bold mt-3">Specifications</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Category: {product.category_name || 'N/A'}</li>
              <li className="list-group-item">
                Vendor: <Link to={`/vendor/${vendorId}`} className="fw-bold ms-2">{product.vendor_name || 'N/A'}</Link>
              </li>
              <li className="list-group-item">Description: {product.description || 'No description provided.'}</li>
            </ul>
          </div>
        </Col>
      </Row>

      <hr className="my-5" />

      {/* Reviews Section */}
      <Row>
        <Col xs={12}>
          <h3 className="fw-bold mb-4">Customer Reviews ({reviewCount})</h3>
        </Col>

        <Col xs={12} md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Write a Review</Card.Header>
            <Card.Body>
              {!isUserLoggedIn ? (
                <Alert variant="info">Please <Link to="/login">log in</Link> to submit a review.</Alert>
              ) : (
                <Form onSubmit={handleSubmitReview}>
                  {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                  {reviewSuccess && <Alert variant="success">{reviewSuccess}</Alert>}

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Your Rating:</Form.Label>
                    <div className="fs-5">{renderStars(null, handleRatingChange, reviewData.rating)}</div>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="reviewComment">
                    <Form.Label>Comment:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="comment"
      value={reviewData.comment}
                      onChange={handleReviewChange}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" disabled={isSubmittingReview || reviewSuccess}>
                    {isSubmittingReview ? <Spinner size="sm" animation="border" /> : 'Submit Review'}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          {product.reviews && product.reviews.length > 0 ? (
            <ul className="list-unstyled">
              {product.reviews.map((review) => (
                <li key={review.id} className="p-3 mb-3 border rounded shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-1 fw-bold">{review.user_username || 'Anonymous User'}</h6>
                    <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                  <div className="mb-2">{renderStars(review.rating)}</div>
                  <p className="text-dark">{review.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No reviews yet.</p>
          )}
        </Col>
      </Row>

      <hr className="my-5" />

      {/* Suggested Products */}
      {suggestions.length > 0 && (
        <Row xs={1} md={2} lg={4} className="g-4">
          {suggestions.map((sugg) => (
            <Col key={sugg.id}>
              <Card
                className="h-100 shadow-sm transition-hover"
                onClick={() => navigate(`/product/${sugg.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Img
                  variant="top"
                  src={sugg.image_url || 'https://placehold.co/300x200?text=Related'}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title className="fs-6 text-truncate">{sugg.name}</Card.Title>
                  <Card.Text className="fw-bold text-primary">₹{parseFloat(sugg.price || 0).toFixed(2)}</Card.Text>
                  <small className="text-muted">{sugg.average_rating ? renderStars(sugg.average_rating) : 'New'}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default ProductDetails;