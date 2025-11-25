import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert, Image, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStore, faBoxOpen, faShoppingBag, faIndianRupeeSign, faClock, faLeaf, faUsers } from '@fortawesome/free-solid-svg-icons';
import { renderStars } from '../utils/renderStars.jsx';
import E5Logo from '../assets/E2.jpg'; // Default logo
import bgVideo from '../assets/Banner15.mp4'; // VIDEO Background

// --- MODERN THEME CONFIGURATION ---
const THEME_COLOR = '#7A8450'; // Primary Olive
const THEME_ACCENT = '#BFBFA9'; // Soft Beige/Grey
const BG_LIGHT = '#F8FBF6'; // Off-White, Natural Background - Now for content areas
const TEXT_DARK = '#333333';
const TRANSITION_STYLE = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

const API_BASE = import.meta.env.VITE_API_URL;
const API_URL_BASE = `${API_BASE}/vendor`;

// --- MODERN STYLING (CSS Injection) ---
const MODERN_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap');

:root {
    --theme-main: ${THEME_COLOR};
    --theme-accent: ${THEME_ACCENT};
    --text-dark: ${TEXT_DARK};
    // --bg-light: ${BG_LIGHT};
}

/* --- Main Page Container for Fixed Background --- */
.modern-storefront-page {
    font-family: 'Poppins', sans-serif;
    position: relative; 
    min-height: 100vh;
    background-color: var(--bg-light); /* Fallback for content outside wrapper */
    overflow-x: hidden;
}

/* --- Video Background Styling --- */
.video-background {
    position: fixed; /* Fixed so it covers the whole viewport */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures video covers the area without distortion */
    z-index: -2; /* Below content, below overlay */
    filter: brightness(0.6); /* Slightly dim the video */
}

.video-overlay {
    position: fixed; /* Fixed to cover the whole viewport */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.6); /* Light white overlay (60% opacity) */
    z-index: -1; /* Above video, below content */
}

/* --- Content Wrapper to ensure content is above the background --- */
.content-wrapper {
    position: relative; 
    z-index: 1; 
    min-height: 100vh; /* Ensure wrapper covers the whole page */
}

/* --- Banner Section (Header) --- */
.store-banner-wrapper {
    position: relative;
    height: 350px; 
    overflow: visible; 
    display: flex;
    align-items: center;
    justify-content: center;
}

/* --- FLOATING Store Info Card --- */
.store-info-card {
    position: absolute;
    top: 50%; 
    left: 50%;
    transform: translate(-50%, -50%); 
    z-index: 10;
    width: 90%;
    max-width: 1000px;
    background-color: rgba(255, 255, 255, 0.95); /* Semi-transparent card */
    backdrop-filter: blur(8px);
    border-radius: 20px;
    padding: 2.5rem;
    padding-top: 5rem; 
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--theme-accent);
    text-align: center; 
}

.store-logo {
    position: absolute;
    top: -50px; /* CORRECTED: Logo offset to be fully visible and centered */
    left: 50%;
    transform: translateX(-50%);
    width: 120px; 
    height: 120px;
    object-fit: cover;
    border: 6px solid var(--theme-main);
    box-shadow: 0 0 0 8px white;
    transition: ${TRANSITION_STYLE};
    z-index: 11; 
}
.store-logo:hover { transform: translateX(-50%) scale(1.05); }

.store-name-text {
    font-family: 'Playfair Display', serif;
    color: var(--text-dark);
    font-size: 2.8rem;
    font-weight: 700;
}

.store-stat-text {
    font-size: 0.95rem;
    color: #666;
    font-weight: 500;
}

/* --- Tabs Styling --- */
.custom-tabs-container {
    padding-top: 120px; 
    padding-bottom: 5rem;
}
.nav-tabs {
    border-bottom: 2px solid var(--theme-accent);
}
.nav-tabs .nav-link {
    font-weight: 600;
    color: #999;
    border: none;
    border-bottom: 3px solid transparent;
    padding: 0.75rem 1.2rem;
    transition: ${TRANSITION_STYLE};
    text-transform: uppercase;
}

.nav-tabs .nav-link.active {
    color: var(--theme-main);
    border-bottom: 3px solid var(--theme-main);
    background-color: transparent;
}

/* --- Product Cards --- */
.product-card {
    border: 1px solid #eee;
    border-radius: 12px;
    transition: ${TRANSITION_STYLE};
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    background: white;
}
.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: var(--theme-main);
}

.card-img-top-custom {
    height: 220px;
    object-fit: cover;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}
.text-primary-theme {
    color: var(--theme-main) !important;
}

/* --- Buttons and Links --- */
.btn-theme {
    background-color: var(--theme-main);
    color: white;
    border: 1px solid var(--theme-main);
    transition: ${TRANSITION_STYLE};
    font-weight: 600;
}
.btn-theme:hover {
    background-color: #5F673C;
    color: white;
    border-color: #5F673C;
}

/* --- Review List --- */
.review-list-item {
    background-color: white;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
`;


function VendorStorefrontPage() {
    const { vendorId } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                const [settingsRes, productsRes, reviewsRes] = await Promise.all([
                    fetch(SETTINGS_URL),
                    fetch(PRODUCTS_URL),
                    fetch(REVIEWS_URL)
                ]);

                if (!settingsRes.ok) throw new Error('Could not find vendor settings. (404)');
                
                const settingsData = await settingsRes.json();
                const productsData = productsRes.ok ? await productsRes.json() : [];
                const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];

                setSettings(settingsData);
                setProducts(productsData.results || productsData);
                setReviews(reviewsData.results || reviewsData);

            } catch (err) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStorefrontData();
    }, [vendorId, SETTINGS_URL, PRODUCTS_URL, REVIEWS_URL]);

    if (loading) return <Container className="p-5 text-center"><Spinner animation="border" style={{color: THEME_COLOR}} /></Container>;
    if (error) return (
        <Container className="p-5 text-center">
            <Alert variant="danger">
                <Alert.Heading>Error Loading Store</Alert.Heading>
                <p>{error}</p>
            </Alert>
        </Container>
    );
    if (!settings) return <Container className="p-5 text-center"><Alert variant="info">Vendor not found.</Alert></Container>;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    return (
        <div className="modern-storefront-page">
            <style>{MODERN_STYLE}</style>
            
            {/* Full-Page Video Background */}
            <video autoPlay loop muted className="video-background">
                <source src={bgVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* Video Overlay for Readability */}
            <div className="video-overlay"></div>

            {/* All main content wrapped to be above the video/overlay */}
            <div className="content-wrapper">
                {/* BANNER AREA (Header - contains floating card) */}
                <div className="store-banner-wrapper">
                    {/* FLOATING STORE INFO CARD - OVER THE BANNER */}
                    <div className="store-info-card">
                        {/* Logo is absolutely positioned relative to the card */}
                        <Image 
                            src={settings.store_logo || E5Logo} 
                            alt={`${settings.store_name} logo`} 
                            roundedCircle 
                            className="store-logo"
                        />
                        
                        <div className="mt-4">
                            <h1 className="store-name-text mb-2">
                                {settings.store_name}
                            </h1>
                            <p className="text-muted fs-6 mb-4 px-lg-5">{settings.store_description || 'A curated selection of quality products.'}</p>
                            
                            {/* Stats Row */}
                            <Row className="justify-content-center border-top pt-4 g-2">
                                <Col xs={4} md={3} className="store-stat-text">
                                    <FontAwesomeIcon icon={faBoxOpen} className="me-2 text-info" /> 
                                    <span className="fw-bold">{products.length}</span> Products
                                </Col>
                                <Col xs={4} md={3} className="store-stat-text">
                                    <FontAwesomeIcon icon={faShoppingBag} className="me-2" style={{color: THEME_COLOR}} /> 
                                    <span className="fw-bold">{settings.total_sales || 0}</span> Sales
                                </Col>
                                <Col xs={4} md={3} className="store-stat-text d-flex align-items-center justify-content-center">
                                    <FontAwesomeIcon icon={faStar} className="me-2 text-warning" />
                                    <span className="fw-bold">{averageRating}</span> / 5
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>

                <Container className="custom-tabs-container">
                    {/* Tabs: Products & Reviews */}
                    <Tabs defaultActiveKey="products" id="storefront-tabs" className="mb-4" fill>
                        
                        {/* Products Tab */}
                        <Tab eventKey="products" title={`Products (${products.length})`}>
                            <Row xs={1} md={2} lg={3} xl={4} className="g-4 mt-3">
                                {products.length > 0 ? products.map((product) => (
                                    <Col key={product.id}>
                                        <Card
                                            className="h-100 product-card"
                                        >
                                            <Card.Img
                                                variant="top"
                                                src={product.image_url || 'https://placehold.co/300x220?text=Product+Image'}
                                                className="card-img-top-custom"
                                            />
                                            <Card.Body className="d-flex flex-column">
                                                <small className="text-muted text-uppercase mb-1">{product.category_name}</small>
                                                <Card.Title className="fs-6 fw-bold text-truncate mb-2">{product.name}</Card.Title>
                                                
                                                <div className="d-flex justify-content-between align-items-center mt-auto mb-3">
                                                    <Card.Text className="fw-bold text-primary-theme fs-4 mb-0">
                                                        <FontAwesomeIcon icon={faIndianRupeeSign} size="xs" />
                                                        {parseFloat(product.price || 0).toFixed(2)}
                                                    </Card.Text>
                                                    <small className="text-muted d-flex align-items-center">
                                                        {product.average_rating ? renderStars(product.average_rating) : <span className="text-muted opacity-75">No Reviews</span>}
                                                    </small>
                                                </div>
                                                
                                                <Link 
                                                    to={`/product/${product.id}`}
                                                    className="btn btn-theme w-100 fw-bold"
                                                >
                                                    View Details
                                                </Link>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                )) : (
                                    <Col xs={12}>
                                        <Alert variant="info" className="mt-3 text-center border-0">
                                            <FontAwesomeIcon icon={faLeaf} className="me-2" />
                                            This vendor has not listed any products yet.
                                        </Alert>
                                    </Col>
                                )}
                            </Row>
                        </Tab>
                        
                        {/* Reviews Tab */}
                        <Tab eventKey="reviews" title={`Reviews (${reviews.length})`}>
                            <ListGroup variant="flush" className="mt-3">
                                {reviews.length > 0 ? reviews.map((review) => (
                                    <ListGroup.Item key={review.id} className="p-4 mb-3 review-list-item">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 className="mb-1 fw-bold"><FontAwesomeIcon icon={faUsers} className="me-2 text-muted opacity-50" /> {review.user_username || 'Anonymous User'}</h6>
                                                <div className="mb-2 text-warning">{renderStars(review.rating)}</div>
                                            </div>
                                            <small className="text-muted text-end">{new Date(review.created_at).toLocaleDateString()}</small>
                                        </div>
                                        
                                        <p className="text-dark mb-3 p-3 rounded" style={{backgroundColor: '#F7F7F7'}}>{review.comment}</p>
                                        
                                        <small className="text-muted border-top pt-2 d-block">
                                            <Link to={`/product/${review.product_id}`} className="text-decoration-none text-primary-theme">
                                                Product: {review.product_name || 'Item Details'}
                                            </Link>
                                        </small>
                                    </ListGroup.Item>
                                )) : (
                                    <Alert variant="info" className="mt-3 text-center border-0">
                                        <FontAwesomeIcon icon={faClock} className="me-2" />
                                        No customer reviews available yet.
                                    </Alert>
                                )}
                            </ListGroup>
                        </Tab>
                    </Tabs>
                </Container>
            </div> {/* End content-wrapper */}
        </div>
    );
}

export default VendorStorefrontPage;