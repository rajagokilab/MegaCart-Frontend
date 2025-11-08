/* src/components/VendorStorefrontPage.jsx */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert, Button, ListGroup, Image, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStore, faBoxOpen, faUserCheck } from '@fortawesome/free-solid-svg-icons';

// ⚠️ Make sure this import path is correct for your project
import { renderStars } from '../utils/renderStars.jsx'; 

// ------------------------------------------------------------------
// --- API URL Constants ---
// ------------------------------------------------------------------
// These URLs MUST match the paths you define in your Django urls.py
const API_BASE = import.meta.env.VITE_API_URL;
const API_URL_BASE = `${API_BASE}/vendor`; // Base path for all vendor storefront calls

function VendorStorefrontPage() {
    const { vendorId } = useParams();   // Get vendor ID from URL
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [settings, setSettings] = useState(null); // Changed from vendorData
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Define API URLs based on vendorId
    const SETTINGS_URL = `${API_URL_BASE}/${vendorId}/settings/`;
    const PRODUCTS_URL = `${API_URL_BASE}/${vendorId}/products/`;
    const REVIEWS_URL = `${API_URL_BASE}/${vendorId}/reviews/`;

    useEffect(() => {
        const fetchStorefrontData = async () => {
            if (!vendorId) {
                setError("Vendor ID not provided.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch all 3 endpoints at the same time
                const [settingsRes, productsRes, reviewsRes] = await Promise.all([
                    fetch(SETTINGS_URL),
                    fetch(PRODUCTS_URL),
                    fetch(REVIEWS_URL)
                ]);

                // Check each response individually
                if (!settingsRes.ok) throw new Error('Could not find vendor settings. (404)');
                if (!productsRes.ok) throw new Error('Could not load vendor products. (404)');
                if (!reviewsRes.ok) throw new Error('Could not load vendor reviews. (404)');

                const settingsData = await settingsRes.json();
                const productsData = await productsRes.json();
                const reviewsData = await reviewsRes.json();

                setSettings(settingsData);
                setProducts(productsData);
                setReviews(reviewsData);

            } catch (err) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStorefrontData();
        // Re-fetch if vendorId changes (e.g., navigating from one store to another)
    }, [vendorId, SETTINGS_URL, PRODUCTS_URL, REVIEWS_URL]);

    if (loading) return <Container className="p-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return (
        <Container className="p-5 text-center">
            <Alert variant="danger">
                <Alert.Heading>Error Loading Store</Alert.Heading>
                <p>{error}</p>
                <hr />
                <p className="mb-0">
                    This is often due to a mismatch between the React API URL and the Django `urls.py` file.
                </p>
            </Alert>
        </Container>
    );
    if (!settings) return <Container className="p-5 text-center"><Alert variant="info">Vendor not found.</Alert></Container>;

    return (
        <div>
            {/* --- 1. Banner Image --- */}
            {settings.store_banner && (
                <Image 
                    src={settings.store_banner} 
                    alt={`${settings.store_name} banner`} 
                    fluid 
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} 
                />
            )}

            <Container className="py-5">
                {/* --- 2. Store Info --- */}
                <Row className="mb-5 align-items-center">
                    <Col xs={12} md={3} lg={2} className="text-center text-md-start mb-3 mb-md-0">
                        <Image 
                            src={settings.store_logo || 'https://placehold.co/150x150?text=Logo'} 
                            alt={`${settings.store_name} logo`} 
                            roundedCircle 
                            style={{ 
                                width: '150px', 
                                height: '150px', 
                                objectFit: 'cover', 
                                border: '4px solid #eee' 
                            }} 
                        />
                    </Col>
                    <Col xs={12} md={9} lg={10}>
                        <h1 className="fw-bold display-5">
                            <FontAwesomeIcon icon={faStore} className="me-3" />
                            {settings.store_name}
                        </h1>
                        <p className="text-muted fs-5">{settings.store_description || 'No description available.'}</p>
                        <div>
                            <span className="me-4">
                                <FontAwesomeIcon icon={faBoxOpen} className="me-2" /> 
                                <strong>{products.length}</strong> Products
                            </span>
                            <span>
                                <FontAwesomeIcon icon={faUserCheck} className="me-2" /> 
                                {/* This 'total_sales' field comes from your VendorStorefrontSettingsView */}
                                <strong>{settings.total_sales || 0}</strong> Total Sales
                            </span>
                        </div>
                    </Col>
                </Row>

                {/* --- 3. Products and Reviews Tabs --- */}
                <Tabs defaultActiveKey="products" id="storefront-tabs" className="mb-3 fs-5" fill>
                    
                    {/* Products Tab */}
                    <Tab eventKey="products" title={`Products (${products.length})`}>
                        <Row xs={1} md={2} lg={4} className="g-4 mt-3">
                            {products.length > 0 ? products.map((product) => (
                                <Col key={product.id}>
                                    <Card
                                        className="h-100 shadow-sm transition-hover"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Card.Img
                                            variant="top"
                                            src={product.image_url || 'https://placehold.co/300x200?text=Item'}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <Card.Body>
                                            <Card.Title className="fs-6 text-truncate">{product.name}</Card.Title>
                                            <Card.Text className="fw-bold text-primary">₹{parseFloat(product.price || 0).toFixed(2)}</Card.Text>
                                            <small className="text-muted">
                                                {product.average_rating ? renderStars(product.average_rating) : 'New'}
                                            </small>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )) : (
                                <Col>
                                    <Alert variant="info" className="mt-3">This vendor has not listed any products yet.</Alert>
                                </Col>
                            )}
                        </Row>
                    </Tab>
                    
                    {/* Reviews Tab */}
                    <Tab eventKey="reviews" title={`Reviews (${reviews.length})`}>
                        <ListGroup variant="flush" className="mt-3">
                            {reviews.length > 0 ? reviews.map((review) => (
                                <ListGroup.Item key={review.id} className="p-3 mb-3 border rounded shadow-sm">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-1 fw-bold">{review.user_username || 'Anonymous User'}</h6>
                                        <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                                    </div>
                                    <div className="mb-2">{renderStars(review.rating)}</div>
                                    <p className="text-dark mb-2">{review.comment}</p>
                                    {/* This relies on the 'product_name' field from serializers.py */}
                                    <small className="text-muted">
                                        <em>Review for: {review.product_name || 'Product'}</em>
                                    </small>
                                </ListGroup.Item>
                            )) : (
                                <Alert variant="info" className="mt-3">This vendor has no reviews yet.</Alert>
                            )}
                        </ListGroup>
                    </Tab>
                </Tabs>
            </Container>
        </div>
    );
}

export default VendorStorefrontPage;