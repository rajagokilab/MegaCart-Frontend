import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Carousel } from 'bootstrap'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStar, 
    faShoppingCart, 
    faBan, 
    faFire, 
    faClock, 
    faArrowRight,
    faLeaf,
    faCheckCircle,
    faChevronDown, 
    faSort,
    faStore,
    faIndianRupeeSign
} from '@fortawesome/free-solid-svg-icons';

import { getAuthToken } from './auth';

// VIDEO IMPORTS
import Banner16 from '../assets/Banner16.mp4';
import Banner18 from '../assets/Banner18.mp4';
import Banner22 from '../assets/Banner22.mp4';
import Banner23 from '../assets/Banner23.mp4';

// IMAGE IMPORTS
import banner1 from '../assets/banner.jpg';
import banner2 from '../assets/banner2.jpg';
import banner3 from '../assets/banner3.jpg';
import phoneImg from '../assets/phone.png'; 

// --- THEME CONFIGURATION ---
const THEME_COLOR = '#7A8450'; 
const THEME_COLOR_HOVER = '#5F673C';
const THEME_COLOR_LIGHT = '#F2F4ED'; 
const THEME_COLOR_SVG = '%237A8450'; // URL encoded version of #7A8450 for SVGs

const API_BASE = import.meta.env.VITE_API_URL;
const API_PRODUCTS_URL = `${API_BASE}/products/`;
const API_CART_ADD_URL = `${API_BASE}/cart/add_item/`;

// --- MODERN STYLING ---
const STYLE_OVERRIDES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap');

:root {
    --theme-main: ${THEME_COLOR};
    --theme-hover: ${THEME_COLOR_HOVER};
    --theme-light: ${THEME_COLOR_LIGHT};
}

body {
    font-family: 'Poppins', sans-serif;
    background-color: #f9fbf7;
    color: #333;
    overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6, .promo-title, .best-seller-header, .eco-landing-title {
    font-family: 'Playfair Display', serif;
}

/* --- SECTION TITLE STYLE --- */
.section-title { 
    text-align: center; 
    font-size: 2rem; 
    font-weight: 700; 
    margin-bottom: 2rem; 
    color: #222;
    letter-spacing: 1px;
    text-transform: uppercase;
}

/* --- RESPONSIVE CONTAINER --- */
.wide-container {
    max-width: 1450px; 
    margin: 0 auto;
    padding-left: 1rem;
    padding-right: 1rem;
}
@media (min-width: 768px) { .wide-container { padding-left: 2rem; padding-right: 2rem; } }
@media (min-width: 1200px) { .wide-container { padding-left: 5rem; padding-right: 5rem; } }

/* --- VIDEO CAROUSEL STYLING --- */
.carousel-container { 
    width: 100%; 
    overflow: hidden; 
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.2);
}

.carousel-video {
    width: 100%;
    height: 350px; 
    object-fit: cover;
    display: block;
}

@media (min-width: 768px) { 
    .carousel-video { height: 600px; } 
}

.banner-caption-bg { 
    background: rgba(0, 0, 0, 0.3); 
    backdrop-filter: blur(4px); 
    padding: 1.5rem; 
    border-radius: 12px; 
    width: 80%; 
    margin: 0 auto 3rem auto; 
    border: 1px solid rgba(255,255,255,0.2);
}

/* --- FILTER BAR --- */
.filter-bar-container {
    background-color: #fff;
    border-radius: 12px;
    padding: 15px 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
    margin-bottom: 2rem;
    justify-content: flex-start;
}
@media (min-width: 768px) { .filter-bar-container { justify-content: space-between; } }

.filter-controls { display: flex; gap: 15px; flex-wrap: wrap; }
.custom-select-wrapper { position: relative; display: inline-block; }
.custom-select-btn { appearance: none; -webkit-appearance: none; background-color: #f9f9f9; border: 1px solid #e0e0e0; padding: 10px 40px 10px 20px; border-radius: 30px; font-size: 0.85rem; font-weight: 600; color: #444; cursor: pointer; transition: all 0.3s ease; min-width: 180px; text-transform: uppercase; letter-spacing: 0.5px; }
.custom-select-btn:hover, .custom-select-btn:focus { border-color: var(--theme-main); background-color: #fff; box-shadow: 0 4px 12px rgba(122, 132, 80, 0.15); outline: none; color: var(--theme-main); }
.custom-select-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #aaa; font-size: 0.8rem; pointer-events: none; transition: color 0.3s; }
.custom-select-btn:hover + .custom-select-icon { color: var(--theme-main); }


/* --- PRODUCT CARDS --- */
.product-card-main { background: white; border: none; border-radius: 16px; overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
.product-card-main:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); }
.card-img-wrapper-main { height: 150px; overflow: hidden; position: relative; }
@media(min-width: 992px) { .card-img-wrapper-main { height: 220px; } }
@media(min-width: 1200px) { .card-img-wrapper-main { height: 180px; } } /* Adjusted height for 5-column density */

.card-img-top-main { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.product-card-main:hover .card-img-top-main { transform: scale(1.1); }
.card-title-responsive { font-size: 0.85rem; margin-bottom: 0.2rem; }
@media(min-width: 768px) { .card-title-responsive { font-size: 1rem; } }
@media(min-width: 1200px) { .card-title-responsive { font-size: 0.9rem; } } /* Adjusted size for 5-column density */


/* --- CUSTOM 5-COLUMN GRID FIX (20% WIDTH) for X-Large Screens --- */
@media (min-width: 1200px) { 
    .col-xl-2-4 {
        flex: 0 0 auto;
        width: 20%;
    }
}
@media (min-width: 1400px) { 
     .col-xxl-2-4 {
        flex: 0 0 auto;
        width: 20%;
    }
}
/* ---------------------------------------------------------------- */


/* --- PROMO BANNER --- */
.promo-section-wrapper { width: 100%; margin-top: 3rem; padding-bottom: 3rem; }
.promo-banner-card { background-color: #3A4128; color: white; border-radius: 0; position: relative; min-height: auto; display: flex; align-items: center; padding: 2rem 0; }
.promo-title { font-size: 2rem; line-height: 1.1; font-style: italic; margin-bottom: 1rem;}
@media(min-width: 992px) { .promo-title { font-size: 3.5rem; } }
.promo-img { max-height: 90%; max-width: 100%; transform: rotate(-5deg); filter: drop-shadow(20px 20px 30px rgba(0,0,0,0.4)); }
.btn-shop-now { background-color: white; color: #3A4128; font-weight: 700; padding: 10px 25px; border-radius: 50px; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; border: none; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }

/* --- COUNTDOWN TIMER --- */
.timer-wrapper { display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; margin-top: 1rem; }
.timer-box { text-align: center; min-width: 45px; padding: 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; backdrop-filter: blur(10px); }
.timer-num { font-size: 1.1rem; font-weight: 700; color: #fff; }

/* --- BEST SELLER --- */
.best-seller-header { font-size: 1.8rem; position: relative; display: inline-block; padding-bottom: 15px; margin-bottom: 2rem; color: var(--theme-main); }
.best-seller-header::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 4px; background-color: #FFD700; border-radius: 2px; }
.bs-card { border: none; background: transparent; padding: 5px; position: relative; }
.bs-img-wrapper { border-radius: 16px; overflow: hidden; height: 140px; width: 100%; background-color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.06); position: relative; }
@media(min-width: 992px) { .bs-img-wrapper { height: 170px; border-radius: 20px; } }
.bs-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.bs-card:hover .bs-img { transform: scale(1.12); }
.hot-icon-wrapper { position: absolute; top: 8px; left: 8px; z-index: 20; width: 28px; height: 28px; background: #FFD700; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; font-size: 0.8rem; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5); animation: pulse-glow 2s infinite; }
.bs-action-row { display: flex; gap: 5px; margin-top: 8px; }
.bs-view-btn { font-size: 0.7rem; padding: 4px 0; background-color: white; color: var(--theme-main); border: 1px solid var(--theme-main); border-radius: 50px; font-weight: 600; width: 100%; text-transform: uppercase; transition: all 0.2s; }
.bs-cart-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background-color: var(--theme-main); color: white; border: none; border-radius: 50%; transition: all 0.2s; font-size: 0.8rem; }

/* --- ECO LANDING BANNER --- */
.eco-landing-section { 
    background: linear-gradient(135deg, #E9F0E5 0%, #F2F6F0 100%);
    border-radius: 24px; 
    overflow: hidden; 
    padding: 3rem 1rem;
    position: relative;
    box-shadow: 0 20px 50px -15px rgba(58, 65, 40, 0.15);
}
.eco-bg-circle {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 300px;
    height: 300px;
    background: rgba(122, 132, 80, 0.05);
    border-radius: 50%;
    z-index: 0;
}
@media(min-width: 992px) { 
    .eco-landing-section { padding: 4rem 3rem; border-radius: 32px; } 
    .eco-bg-circle { width: 500px; height: 500px; top: -100px; right: -100px; }
}
.eco-landing-content { position: relative; z-index: 2; text-align: center; margin-bottom: 2rem; }
@media(min-width: 992px) { .eco-landing-content { text-align: left; margin-bottom: 0; padding-right: 2rem; } }
.eco-landing-title { font-size: 2rem; margin-bottom: 1rem; color: #2C3022; font-weight: 700; }
@media(min-width: 992px) { .eco-landing-title { font-size: 3rem; } }
.eco-landing-desc { color: #555; margin-bottom: 2rem; line-height: 1.8; font-size: 0.95rem; }
@media(min-width: 992px) { .eco-landing-desc { font-size: 1.1rem; } }
.eco-list-item { display: flex; align-items: center; margin-bottom: 0.8rem; font-size: 0.9rem; color: #444; justify-content: center; }
@media(min-width: 992px) { .eco-list-item { justify-content: flex-start; font-size: 1rem; } }
.check-icon { color: var(--theme-main); margin-right: 10px; }
.app-buttons-wrapper { display: flex; gap: 15px; justify-content: center; margin-top: 2rem; }
@media(min-width: 992px) { .app-buttons-wrapper { justify-content: flex-start; } }
.app-badge { height: 42px; width: auto; cursor: pointer; transition: transform 0.3s ease, opacity 0.2s; opacity: 0.9; }
.app-badge:hover { transform: translateY(-3px); opacity: 1; }
.phone-mockup-container { display: flex; justify-content: center; position: relative; z-index: 2; }
.phone-frame { border: 10px solid #222; border-radius: 36px; overflow: hidden; width: 240px; height: 480px; background: white; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.3); position: relative; animation: float-phone 6s ease-in-out infinite; }
@media(min-width: 992px) { .phone-frame { width: 280px; height: 580px; border: 12px solid #222; border-radius: 46px; } }
@keyframes float-phone { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
.phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 24px; background: #222; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; z-index: 5; }
.phone-screen { width: 100%; height: 100%; object-fit: cover; }
`;

// --- COUNTDOWN COMPONENT ---
const CountdownTimer = ({ durationInHours = 24 }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const endOfDay = new Date();
            // Set countdown end to midnight of the current day
            endOfDay.setHours(23, 59, 59, 999); 
            const timeToMidnight = endOfDay - now;

            if (timeToMidnight > 0) {
                const hours = Math.floor((timeToMidnight / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((timeToMidnight / 1000 / 60) % 60);
                const seconds = Math.floor((timeToMidnight / 1000) % 60);
                setTimeLeft({ hours, minutes, seconds });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [durationInHours]);

    return (
        <div className="timer-wrapper">
            <div className="timer-label"><FontAwesomeIcon icon={faClock} /> Ends In:</div>
            <div className="timer-box"><div className="timer-num">{timeLeft.hours}</div></div> : 
            <div className="timer-box"><div className="timer-num">{timeLeft.minutes}</div></div> : 
            <div className="timer-box"><div className="timer-num" style={{color: '#FFD700'}}>{timeLeft.seconds}</div></div>
        </div>
    );
};

const bannerData = [
    { id: 1, video: Banner16, title: "Nature's Harmony", description: "Discover the pure essence of organic living." },
    { id: 2, video: Banner18, title: "Sustainable Future", description: "Eco-friendly choices for a better planet." },
    { id: 3, video: Banner22, title: "Fresh & Vital", description: "Revitalize your life with natural products." },
    { id: 4, video: Banner23, title: "Pure Beauty", description: "Radiate confidence with organic care." }
];

const discountBanners = [
    { id: 1, badge: "Mega Saving", title: "Eco-Friendly Beauty Brand", description: "Experience the purity of nature with our new organic skincare line. 100% Vegan & Cruelty-Free.", discount: "Flat 30% OFF", image: banner1, bgColor: "#3A4128" },
    { id: 2, badge: "Limited Time", title: "Organic Superfoods", description: "Boost your immunity with our premium range of seeds and nuts. Sourced directly from farms.", discount: "Buy 1 Get 1 Free", image: banner2, bgColor: "#4F583D" },
    { id: 3, badge: "Clearance", title: "Sustainable Home", description: "Bamboo toothbrushes, glass jars, and reusable bags. Make the switch today.", discount: "Up to 50% OFF", image: banner3, bgColor: "#26291B" }
];

const renderStars = (rating) => {
    const ratingValue = parseFloat(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
        <FontAwesomeIcon key={i} icon={faStar} className={`me-1 transition-colors duration-300 ${i < Math.round(ratingValue) ? 'text-warning' : 'text-muted opacity-25'}`} />
    ));
};

function ProductList({ onLoginClick }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    
    const [filters, setFilters] = useState({ 
        selectedCategory: 'All', 
        selectedVendor: 'All', 
        sortOrder: 'newest' 
    });

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAddToCart = async (productId) => {
        const authToken = getAuthToken();
        const guestId = localStorage.getItem('guestCartId');

        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `JWT ${authToken}`;
        else if (guestId) headers['X-Guest-Cart-Id'] = guestId;

        try {
            const response = await fetch(API_CART_ADD_URL, {
                method: 'POST', 
                headers: headers, 
                body: JSON.stringify({ product_id: productId, quantity: 1 }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.guest_id && !authToken) localStorage.setItem('guestCartId', data.guest_id);
                window.dispatchEvent(new Event('cartChanged'));
                setToastMessage("Item added to cart successfully!");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                alert(`Failed to add: ${data.detail || "Unknown error"}`);
            }
        } catch (error) { 
            console.error("Cart Error:", error);
            alert("Could not add item to cart. Please check connection.");
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_PRODUCTS_URL);
                const data = await response.json();
                const productList = data.results || data;
                setProducts(productList);
                setLoading(false);
            } catch (err) { console.error(err); setLoading(false); }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const bannerElement = document.getElementById('bannerCarousel');
            if (bannerElement) new Carousel(bannerElement, { interval: 6000, ride: 'carousel', pause: false });
            const promoElement = document.getElementById('promoDiscountCarousel');
            if (promoElement) new Carousel(promoElement, { interval: 5000, ride: 'carousel', pause: false });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const uniqueCategories = useMemo(() => ['All', ...new Set(products.map((p) => p.category_name).filter(Boolean))], [products]);
    const uniqueVendors = useMemo(() => ['All', ...new Set(products.map((p) => p.vendor_name).filter(Boolean))], [products]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (filters.selectedCategory !== 'All') {
            result = result.filter(p => p.category_name === filters.selectedCategory);
        }
        if (filters.selectedVendor !== 'All') {
            result = result.filter(p => p.vendor_name === filters.selectedVendor);
        }

        if (filters.sortOrder === 'newest') {
            result.sort((a, b) => b.id - a.id);
        } else if (filters.sortOrder === 'oldest') {
            result.sort((a, b) => a.id - b.id);
        }
        
        return result;
    }, [products, filters]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const visiblePageNumbers = [];
    for (let i = 1; i <= totalPages; i++) visiblePageNumbers.push(i);

    const bestSellers = useMemo(() => {
        return [...products]
            .filter(p => (parseInt(p.stock, 10) || 0) > 0)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
    }, [products]);

    return (
        <>
            {/* INJECT CUSTOM STYLES */}
            <style>{STYLE_OVERRIDES}</style>

            {/* 1. HERO VIDEO CAROUSEL */}
            <div className="w-100 mb-4">
                <div id="bannerCarousel" className="carousel slide carousel-fade carousel-container" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        {bannerData.map((banner, index) => (
                            <div key={banner.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                <div className="position-relative">
                                    <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.25)', zIndex:1}}></div>
                                    <video src={banner.video} className="carousel-video" autoPlay loop muted playsInline></video>
                                    <div className="carousel-caption d-none d-md-block banner-caption-bg" style={{zIndex:2}}>
                                        <h2 className="fw-bold text-white mb-2 display-5">{banner.title}</h2>
                                        <p className="text-white fs-5 mb-0 opacity-90">{banner.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>

            <div className="wide-container pb-5 pt-0">
                
                {/* 2. FILTER BAR (HORIZONTAL TOOLBAR) */}
                <div className="filter-bar-container">
                    <div className="filter-controls">
                        <div className="custom-select-wrapper">
                            <select className="custom-select-btn" value={filters.selectedCategory} onChange={(e) => handleFilterChange('selectedCategory', e.target.value)}>
                                <option value="All">All Categories</option>
                                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <FontAwesomeIcon icon={faChevronDown} className="custom-select-icon" />
                        </div>

                        <div className="custom-select-wrapper">
                            <select className="custom-select-btn" value={filters.selectedVendor} onChange={(e) => handleFilterChange('selectedVendor', e.target.value)}>
                                <option value="All">All Stores</option>
                                {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <FontAwesomeIcon icon={faChevronDown} className="custom-select-icon" />
                        </div>

                        <div className="custom-select-wrapper">
                            <select className="custom-select-btn" value={filters.sortOrder} onChange={(e) => handleFilterChange('sortOrder', e.target.value)}>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                            <FontAwesomeIcon icon={faSort} className="custom-select-icon" />
                        </div>
                    </div>
                    <div className="text-muted small fw-bold">
                        {filteredProducts.length} Results Found
                    </div>
                </div>

                {/* 3. PRODUCT GRID (Full Width) */}
                <div id="product-section">
                    
                    <h3 className="section-title">ALL PRODUCTS</h3>

                    {loading && <div className="text-center py-5">Loading...</div>}
                    
                    {!loading && !error && products.length > 0 && filteredProducts.length === 0 ? (
                        <div className="text-center py-5 bg-white rounded-4 shadow-sm"> 
                            <h4>No matches found</h4> 
                        </div>
                    ) : (
                        // **UPDATED:** g-4 for gap, and the class list below for 5-per-row on XL
                        <div className="row g-2 g-md-3 g-lg-4">
                            {currentProducts.map((product) => {
                                const stock = parseInt(product.stock, 10) || 0;
                                const isOutOfStock = stock <= 0;
                                
                                // ✅ CORRECTED LOGIC: Backend 'price' is original, 'discounted_price' is selling
                                const discountPercent = product.discount_percentage || 0;
                                const hasDiscount = discountPercent > 0;
                                const sellingPrice = parseFloat(product.discounted_price || product.price);
                                const originalPrice = parseFloat(product.price);

                                return (
                                    // **APPLYING 5-COLUMN LOGIC:** // 2 on small (col-6), 3 on medium (col-md-4), 4 on large (col-lg-3), 
                                    // and 5 on extra-large (col-xl-2-4 custom class)
                                    <div key={product.id} className="col-6 col-md-4 col-lg-3 col-xl-2-4 col-xxl-2-4">
                                        <div className={`card h-100 product-card-main ${isOutOfStock ? 'opacity-75' : ''}`}>
                                            <div className="card-img-wrapper-main">
                                                <div className="position-absolute top-0 start-0 m-1 d-flex flex-column gap-1 z-10">
                                                    {hasDiscount && !isOutOfStock && (
                                                        <span className="badge bg-danger shadow-sm" style={{fontSize:'0.6rem'}}>{discountPercent}% OFF</span>
                                                    )}
                                                </div>
                                                <img src={product.image_url || 'https://via.placeholder.com/400x300'} alt={product.name} className="card-img-top-main" />
                                            </div>
                                            
                                            <div className="card-body d-flex flex-column p-2">
                                                <h6 className="fw-bold text-dark mb-1 text-truncate card-title-responsive">{product.name}</h6>
                                                
                                                <div className="small text-muted mb-1" style={{fontSize: '0.7rem'}}>
                                                    {product.category_name}
                                                </div>

                                                <div className="small text-muted mb-2 d-flex align-items-center" style={{fontSize: '0.7rem', color: THEME_COLOR,}}>
                                                    <FontAwesomeIcon icon={faStore} className="me-1" style={{opacity: 0.7}} /> 
                                                    <span className="text-truncate">{product.vendor_name || 'Official Store'}</span>
                                                </div>
                                                
                                                <div className="d-flex align-items-center justify-content-between mt-auto mb-2">
                                                    <div className="d-flex flex-column">
                                                        {/* --- UPDATED: Conditionally render Strikethrough Price --- */}
                                                        {hasDiscount && (
                                                            <small className="text-decoration-line-through text-muted" style={{ fontSize: '0.75rem' }}>
                                                                <FontAwesomeIcon icon={faIndianRupeeSign} size="xs" />{originalPrice.toFixed(0)}
                                                            </small>
                                                        )}
                                                        <span className="fw-bold" style={{color: '#333', fontSize: '0.9rem'}}>
                                                            <FontAwesomeIcon icon={faIndianRupeeSign} size="xs" />{sellingPrice.toFixed(0)}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                                                        style={{ width: '32px', height: '32px', backgroundColor: isOutOfStock ? '#eee' : THEME_COLOR_LIGHT, color: isOutOfStock ? '#999' : THEME_COLOR }}
                                                        disabled={isOutOfStock}
                                                        onClick={() => handleAddToCart(product.id)} 
                                                    >
                                                        <FontAwesomeIcon icon={isOutOfStock ? faBan : faShoppingCart} size="sm" />
                                                    </button>
                                                </div>

                                                <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                                                    <div className="text-warning" style={{ fontSize: '0.7rem' }}>
                                                        {renderStars(product.average_rating)}
                                                    </div>
                                                    <Link 
                                                        to={`/product/${product.id}`} 
                                                        className="text-decoration-none fw-bold d-flex align-items-center transition-colors"
                                                        style={{ color: THEME_COLOR, fontSize: '0.75rem' }}
                                                    >
                                                        Details <FontAwesomeIcon icon={faArrowRight} className="ms-1" size="xs" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* PAGINATION */}
                    {totalPages > 1 && filteredProducts.length > 0 && <div className="d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button onClick={() => paginate(currentPage - 1)} className="page-link border-0"><FontAwesomeIcon icon={faArrowRight} rotation={180} /></button></li>
                                {visiblePageNumbers.map(num => <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}><button onClick={() => paginate(num)} className="page-link">{num}</button></li>)}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><button onClick={() => paginate(currentPage + 1)} className="page-link border-0"><FontAwesomeIcon icon={faArrowRight} /></button></li>
                            </ul>
                        </nav>
                    </div>}
                </div>
            </div>

            {/* PROMO BANNER */}
            <div className="promo-section-wrapper">
                <div id="promoDiscountCarousel" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        {discountBanners.map((item, index) => (
                            <div key={item.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                <div className="promo-banner-card" style={{ backgroundColor: item.bgColor }}>
                                    <div className="promo-inner-container">
                                        <div className="row g-0 align-items-center h-100">
                                            <div className="col-md-7">
                                                <div className="promo-content text-center text-md-start ps-md-5">
                                                    <div><span className="promo-badge">{item.badge}</span></div>
                                                    <h2 className="promo-title mb-3">{item.title}</h2>
                                                    <p className="lead mb-4 text-white-50 d-none d-md-block" style={{ fontSize: '1.1rem', maxWidth: '600px', fontWeight: 300 }}>{item.description}</p>
                                                    <div className="d-flex justify-content-center justify-content-md-start mb-3"><CountdownTimer durationInHours={24} /></div>
                                                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-4"><button className="btn-shop-now shadow">SHOP NOW</button></div>
                                                </div>
                                            </div>
                                            <div className="col-md-5 d-none d-md-block">
                                                <div className="promo-img-container"><img src={item.image} alt={item.title} className="promo-img" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BEST SELLERS */}
            <div className="wide-container pb-5 mb-5">
                <div className="text-center"><h2 className="best-seller-header">Best Selling Products</h2></div>
                <div className="row g-3 mt-2 justify-content-center">
                    {bestSellers.map((product) => {
                        const stock = parseInt(product.stock, 10) || 0;
                        const isOutOfStock = stock <= 0;
                        
                        // ✅ CORRECTED LOGIC ALSO FOR BEST SELLERS
                        const discountPercent = product.discount_percentage || 0;
                        const hasDiscount = discountPercent > 0;
                        const sellingPrice = parseFloat(product.discounted_price || product.price);
                        const originalPrice = parseFloat(product.price);

                        return (
                            <div key={product.id} className="col-6 col-sm-6 col-md-3 col-lg-2">
                                <div className="bs-card h-100 d-flex flex-column">
                                    <div className="bs-img-wrapper position-relative">
                                        <div className="hot-icon-wrapper" title="Best Seller"><FontAwesomeIcon icon={faFire} /></div>
                                        <img src={product.image_url} alt={product.name} className="bs-img" />
                                    </div>
                                    <div className="text-center d-flex flex-column flex-grow-1 pt-3 px-1">
                                        <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.85rem' }}>{product.name}</h6>
                                        
                                        <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
                                            {hasDiscount && (
                                                <small className="text-decoration-line-through text-muted" style={{ fontSize: '0.75rem' }}>
                                                    <FontAwesomeIcon icon={faIndianRupeeSign} size="xs" />{originalPrice.toFixed(0)}
                                                </small>
                                            )}
                                            <div className="fw-bold" style={{ color: '#333', fontSize: '0.95rem' }}>
                                                <FontAwesomeIcon icon={faIndianRupeeSign} size="xs" />{sellingPrice.toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="mt-auto bs-action-row">
                                            <Link to={`/product/${product.id}`} className="btn bs-view-btn">View</Link>
                                            <button className="btn bs-cart-btn" onClick={() => handleAddToCart(product.id)} disabled={isOutOfStock}><FontAwesomeIcon icon={isOutOfStock ? faBan : faShoppingCart} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ECO LANDING BANNER */}
            <div className="wide-container pb-5 mb-5">
                <div className="eco-landing-section">
                    <div className="eco-bg-circle"></div>
                    <div className="row g-0 align-items-center justify-content-between">
                        <div className="col-lg-6 order-1">
                            <div className="eco-landing-content">
                                <span className="text-uppercase fw-bold" style={{color: THEME_COLOR, fontSize: '0.8rem', letterSpacing: '2px'}}>
                                    <FontAwesomeIcon icon={faLeaf} className="me-2" /> 100% Trusted Buying. 100% Easy Selling.
                                </span>
                                <h2 className="eco-landing-title mt-2">“Your Trusted Marketplace—Directly to Your Doorstep.”</h2>
                                <p className="eco-landing-desc">
                                    We are delighted to serve Customers throughout Delhi NCR and counting more. Be a part of our family and connect with all exciting offers.
                                </p>
                                <ul className="list-unstyled mb-4 d-inline-block text-start">
                                    <li className="eco-list-item"><FontAwesomeIcon icon={faCheckCircle} className="check-icon" /> Download the App</li>
                                    <li className="eco-list-item"><FontAwesomeIcon icon={faCheckCircle} className="check-icon" /> Order or Schedule Cart</li>
                                    <li className="eco-list-item"><FontAwesomeIcon icon={faCheckCircle} className="check-icon" /> Get Exclusive Offers</li>
                                </ul>
                                <h5 className="h6 text-muted fw-bold mb-3">Download App Now</h5>
                                <div className="app-buttons-wrapper">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="app-badge" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" alt="App Store" className="app-badge" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5 order-2">
                            <div className="phone-mockup-container">
                                <div className="phone-frame"><div className="phone-notch"></div><img src={phoneImg} alt="App Screenshot" className="phone-screen" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUCCESS TOAST (Bottom Right) */}
            <div className={`position-fixed bottom-0 end-0 p-3`} style={{ zIndex: 1100 }}>
                <div className={`toast align-items-center text-white bg-success border-0 ${showToast ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="d-flex">
                        <div className="toast-body">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-2"/>
                            {toastMessage}
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)} aria-label="Close"></button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductList;