import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStar, 
    faShoppingCart, 
    faArrowRight,
    faChevronLeft,
    faChevronRight,
    faChevronDown,
    faSort,
    faBan,
    faCheckCircle,
    faPencilAlt 
} from '@fortawesome/free-solid-svg-icons';

import { getAuthToken } from '../components/auth';

// ✅ ASSET IMPORTS
import banner2 from '../assets/banner2.jpg';
// Video/GIF imports
import Banner15 from '../assets/Banner15.mp4';
import Banner10 from '../assets/Banner10.mp4';
import banner4 from '../assets/banner4.gif';
import Banner21 from '../assets/Banner21.mp4';
import Banner9 from '../assets/Banner9.mp4'; 

const THEME_COLOR = '#7A8450'; 
const API_BASE = import.meta.env.VITE_API_URL;
const API_PRODUCTS_URL = `${API_BASE}/products/`;
const CATEGORY_API_URL = `${API_BASE}/categories/`;
const API_CART_ADD_URL = `${API_BASE}/cart/add_item/`;

const PAGE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap');

:root {
    --theme-main: #7A8450;
    --theme-hover: #5F673C;
}

.shop-page-wrapper {
    font-family: 'Poppins', sans-serif;
    background-color: #ffffff;
    color: #333;
    overflow-x: hidden;
}

.shop-page-wrapper h1, 
.shop-page-wrapper h2, 
.shop-page-wrapper h3, 
.shop-page-wrapper h4 {
    font-family: 'Playfair Display', serif;
    color: #222;
}

/* =========================================
   HERO SECTION RESPONSIVE
   ========================================= */
.hero-section { 
    position: relative; 
    height: 500px; 
    overflow: hidden; 
    display: flex; 
    align-items: center; 
}
.hero-video-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.4); z-index: 1; }
.hero-content-container { position: relative; z-index: 2; width: 100%; }
.hero-title { font-size: 3.5rem; line-height: 1.1; font-weight: 700; margin-bottom: 1.5rem; color: #222; text-shadow: 0 2px 10px rgba(255,255,255,0.8); }
.hero-subtitle { font-family: 'Poppins', sans-serif; font-size: 1.1rem; color: #444; margin-bottom: 2rem; max-width: 500px; font-weight: 500; text-shadow: 0 1px 5px rgba(255,255,255,0.8); }

/* Mobile Hero Adjustments */
@media (max-width: 768px) {
    .hero-section { height: 400px; }
    .hero-title { font-size: 2.2rem; }
    .hero-subtitle { font-size: 0.95rem; margin-bottom: 1.5rem; }
    .hero-content-container { text-align: center; } 
    .col-md-6 { padding-left: 15px !important; padding-right: 15px !important; }
}

.btn-primary-custom { 
    background-color: var(--theme-main); 
    color: white; 
    border: none; 
    padding: 14px 35px; 
    font-size: 0.9rem; 
    font-weight: 600; 
    border-radius: 4px; 
    transition: all 0.3s ease; 
    text-transform: uppercase; 
    letter-spacing: 1px; 
    box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
}
.btn-primary-custom:hover { background-color: var(--theme-hover); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(122, 132, 80, 0.4); }

/* =========================================
   CATEGORY SLIDER RESPONSIVE
   ========================================= */
.section-title { text-align: center; font-size: 1.8rem; font-weight: 600; margin-bottom: 2.5rem; }
.category-slider-wrapper { position: relative; display: flex; align-items: center; justify-content: center; }
.category-scroll-container { display: flex; gap: 30px; overflow-x: auto; padding: 20px 10px; scroll-behavior: smooth; width: 100%; -ms-overflow-style: none; scrollbar-width: none; }
.category-scroll-container::-webkit-scrollbar { display: none; }
.cat-item-wrapper { min-width: 100px; text-align: center; cursor: pointer; transition: transform 0.3s ease; flex: 0 0 auto; }
.cat-item-wrapper:hover { transform: translateY(-5px); }
.cat-img-box { width: 80px; height: 80px; margin: 0 auto 10px; border-radius: 16px; overflow: hidden; background-color: #f4f4f4; display: flex; align-items: center; justify-content: center; transition: border 0.3s ease; }
.cat-img-box img { width: 100%; height: 100%; object-fit: cover; }
.cat-label { font-size: 0.85rem; font-weight: 500; color: #555; text-transform: capitalize; }
.cat-active .cat-label { color: var(--theme-main); font-weight: 700; }
.cat-active .cat-img-box { border: 2px solid var(--theme-main); }
.slider-btn { background-color: #fff; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; position: absolute; z-index: 10; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.slider-btn:hover { background-color: var(--theme-main); color: white; border-color: var(--theme-main); }
.slider-btn.left { left: -20px; }
.slider-btn.right { right: -20px; }

@media (max-width: 768px) { 
    .slider-btn { display: none; } /* Hide arrows on mobile, allow touch scroll */
    .cat-item-wrapper { min-width: 80px; }
    .cat-img-box { width: 70px; height: 70px; }
}

/* =========================================
   FILTER BAR RESPONSIVE
   ========================================= */
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
    margin-bottom: 3rem;
    justify-content: space-between;
}
.filter-controls { display: flex; gap: 15px; flex-wrap: wrap; }
.custom-select-wrapper { position: relative; display: inline-block; }
.custom-select-btn { appearance: none; -webkit-appearance: none; background-color: #f9f9f9; border: 1px solid #e0e0e0; padding: 10px 40px 10px 20px; border-radius: 30px; font-size: 0.85rem; font-weight: 600; color: #444; cursor: pointer; transition: all 0.3s ease; min-width: 180px; text-transform: uppercase; letter-spacing: 0.5px; }
.custom-select-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #aaa; font-size: 0.8rem; pointer-events: none; transition: color 0.3s; }

/* Mobile Filters: Stack vertical and full width */
@media (max-width: 768px) {
    .filter-bar-container { flex-direction: column; align-items: stretch; gap: 15px; }
    .filter-controls { flex-direction: column; width: 100%; gap: 10px; }
    .custom-select-wrapper { width: 100%; }
    .custom-select-btn { width: 100%; min-width: unset; }
    .text-muted.small.fw-bold { text-align: center; margin-top: 5px; }
}

/* =========================================
   POPULAR SCROLL RESPONSIVE
   ========================================= */
.popular-scroll-wrapper {
    display: flex;
    gap: 24px;
    overflow-x: auto;
    padding: 20px 5px;
    scroll-behavior: smooth;
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.popular-scroll-wrapper::-webkit-scrollbar { display: none; }
.popular-card-item {
    min-width: 280px;
    flex: 0 0 auto;
    transition: transform 0.3s ease;
}
@media (max-width: 576px) {
    .popular-card-item { min-width: 240px; } /* Smaller cards on small phones */
    .section-title { text-align: center; }
}

/* =========================================
   PRODUCT CARD & GRID
   ========================================= */
.shop-card {
    background: white;
    border: none;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    height: 100%;
    display: flex;
    flex-direction: column;
}
.shop-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); }
.shop-card-img-wrapper { height: 220px; overflow: hidden; position: relative; background-color: #f8f9fa; }
.shop-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.shop-card:hover .shop-card-img { transform: scale(1.1); }
.shop-card-body { padding: 1rem; display: flex; flex-direction: column; flex-grow: 1; }
.shop-card-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid #f0f0f0; }
.shop-card-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Grid adjustments handled by Bootstrap classes, but tweaks here */
@media (max-width: 576px) {
    .shop-card-img-wrapper { height: 180px; } /* Shorter images on mobile */
    .shop-card-body { padding: 0.75rem; }
}

/* =========================================
   SUSTAINABILITY SECTION
   ========================================= */
.sustainability-section { background-color: #F3F1ED; border-radius: 20px; margin: 4rem 0; overflow: hidden; }
.sust-content { padding: 3rem; display: flex; flex-direction: column; justify-content: center; }
.sust-img { width: 100%; height: 100%; min-height: 350px; object-fit: cover; }

@media (max-width: 768px) {
    .sustainability-section { margin: 2rem 0; }
    .sust-img { height: 250px; min-height: unset; }
    .sust-content { padding: 2rem; text-align: center; }
}

/* =========================================
   EDITORIAL GRID
   ========================================= */
.editorial-grid { margin: 5rem 0; }
.editorial-card { position: relative; border-radius: 16px; overflow: hidden; height: 350px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.editorial-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.editorial-card:hover .editorial-img { transform: scale(1.05); }
.editorial-overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 2rem; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); color: white; text-align: left; }
.editorial-heading { font-size: 1.5rem; margin: 0; color: white; }

@media (max-width: 768px) {
    .editorial-grid { margin: 3rem 0; }
    .editorial-card { height: 280px; margin-bottom: 15px; } /* Stack nicely */
    .editorial-overlay { padding: 1.5rem; }
    .editorial-heading { font-size: 1.2rem; }
}

/* Footer CTA */
.footer-cta { text-align: center; padding: 4rem 0; background-color: #fff; border-top: 1px solid #eee; }
`;

function ShopPage({ onLoginClick }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('All'); 
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [filters, setFilters] = useState({
        selectedVendor: 'All',
        selectedCategory: 'All', 
        sortOrder: 'newest'
    });
    
    const scrollRef = useRef(null);
    const popularScrollRef = useRef(null); 

    // FETCH DATA
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    fetch(API_PRODUCTS_URL),
                    fetch(CATEGORY_API_URL)
                ]);
                const prodData = await prodRes.json();
                const catData = await catRes.json();
                setProducts(prodData.results || prodData);
                setCategories(catData.results || catData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ✅ ADD TO CART LOGIC
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
                
                setToastMessage("Item added to cart!");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                alert(`Failed to add: ${data.detail || "Unknown error"}`);
            }
        } catch (error) { 
            console.error(error);
        }
    };

    const scrollLeft = () => { if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' }); };
    const scrollRight = () => { if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' }); };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'selectedCategory') {
            if (value === 'All') setSelectedCategoryId('All');
            else {
                const cat = categories.find(c => c.name === value);
                if (cat) setSelectedCategoryId(cat.id);
            }
        }
    };

    useEffect(() => {
        if (selectedCategoryId === 'All') {
            setFilters(prev => ({ ...prev, selectedCategory: 'All' }));
        } else {
            const cat = categories.find(c => c.id === selectedCategoryId);
            if (cat) setFilters(prev => ({ ...prev, selectedCategory: cat.name }));
        }
    }, [selectedCategoryId, categories]);


    const uniqueVendors = ['All', ...new Set(products.map((p) => p.vendor_name))];

    const processedProducts = useMemo(() => {
        let result = [...products];
        if (filters.selectedCategory !== 'All') result = result.filter(p => p.category_name === filters.selectedCategory);
        if (filters.selectedVendor !== 'All') result = result.filter(p => p.vendor_name === filters.selectedVendor);
        if (filters.sortOrder === 'newest') result.sort((a, b) => b.id - a.id);
        else result.sort((a, b) => a.id - b.id);
        return result;
    }, [products, filters]);

    const isAllSelected = selectedCategoryId === 'All' && filters.selectedVendor === 'All';

    // ✅ POPULARITY LOGIC (Sorted by Sales, Top 10)
    const popularProducts = useMemo(() => {
        return [...products]
            .sort((a, b) => {
                const salesA = parseInt(a.sales_count) || 0;
                const salesB = parseInt(b.sales_count) || 0;
                if (salesA !== salesB) return salesB - salesA;
                return (b.average_rating || 0) - (a.average_rating || 0);
            })
            .slice(0, 10); 
    }, [products]);

    // ✅ BEST DEALS LOGIC (Only items with discount > 0)
    // ✅ BEST DEALS LOGIC (Fixed)
    const bestDeals = useMemo(() => {
        // 1. Filter items that actually have a discount percentage > 0
        // Use a safer check for string/number types
        const discountedItems = products.filter(p => {
            const val = parseFloat(p.discount_percentage);
            return !isNaN(val) && val > 0;
        });

        // 2. Try to exclude items already shown in "Popular" to keep the page varied
        const popularIds = new Set(popularProducts.map(p => p.id));
        const distinctDeals = discountedItems.filter(p => !popularIds.has(p.id));

        // 3. LOGIC FIX: If we have distinct deals, use them. 
        // If not (e.g., all discounted items are also popular), show the discounted items anyway.
        const finalPool = distinctDeals.length > 0 ? distinctDeals : discountedItems;

        // 4. Shuffle and pick top 4
        return finalPool.sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [products, popularProducts]);

    // Handlers for Popular Section Horizontal Scroll
    const scrollPopularLeft = () => { 
        if (popularScrollRef.current) popularScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' }); 
    };
    const scrollPopularRight = () => { 
        if (popularScrollRef.current) popularScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' }); 
    };

    if (loading) return <div className="text-center py-5">Loading Beautify Store...</div>;

    return (
        <div className="shop-page-wrapper">
            {/* FORCE LOAD CSS */}
            <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

            {/* HERO SECTION */}
            <div className="hero-section">
                <video className="hero-video-bg" autoPlay loop muted playsInline src={Banner9}></video>
                <div className="hero-overlay"></div>
                <div className="hero-content-container container">
                    <div className="row align-items-center">
                        <div className="col-12 col-md-6 text-center text-md-start ps-md-5">
                            <span className="text-dark small text-uppercase letter-spacing-2 mb-2 d-block fw-bold">Fall 15% Discount</span>
                            <h1 className="hero-title">Proven To Tackle <br/> Wrinkles & Acne</h1>
                            <p className="hero-subtitle">What makes us different? We treat you personally.</p>
                            <p className="mb-4"><strong>From ₹499</strong></p>
                            <button 
                                className="btn-primary-custom" 
                                onClick={() => navigate('/')} 
                            >
                                Learn More
                            </button>                        
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORY SLIDER */}
            <div className="container my-5 position-relative">
                <h3 className="section-title">Shop By Categories</h3>
                <div className="category-slider-wrapper">
                    <button className="slider-btn left" onClick={scrollLeft}><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <div className="category-scroll-container" ref={scrollRef}>
                        <div 
                            className={`cat-item-wrapper ${selectedCategoryId === 'All' ? 'cat-active' : ''}`}
                            onClick={() => setSelectedCategoryId('All')}
                        >
                            <div className="cat-img-box"><span style={{fontSize:'1.5rem', color:'#ccc'}}>All</span></div>
                            <div className="cat-label">All</div>
                        </div>
                        {categories.map(cat => (
                            <div 
                                key={cat.id} 
                                className={`cat-item-wrapper ${selectedCategoryId === cat.id ? 'cat-active' : ''}`}
                                onClick={() => setSelectedCategoryId(cat.id)}
                            >
                                <div className="cat-img-box"><img src={cat.image_url || 'https://via.placeholder.com/80'} alt={cat.name} /></div>
                                <div className="cat-label">{cat.name}</div>
                            </div>
                        ))}
                    </div>
                    <button className="slider-btn right" onClick={scrollRight}><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
            </div>

            {/* --- CONDITIONAL VIEW --- */}
            {isAllSelected ? (
                <>
                    {/* SUSTAINABILITY SECTION */}
                    <div className="container">
                        <div className="sustainability-section">
                            <div className="row g-0 align-items-center">
                                <div className="col-12 col-md-6">
                                    <img src={banner2} alt="Sustainability" className="sust-img" />
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="sust-content">
                                        <span className="small text-muted text-uppercase mb-2">Welcome to Beautify Store!</span>
                                        <h2>Our Commitment <br/> To Sustainability</h2>
                                        <p className="text-muted my-3">We want to leave the planet better without jeopardizing future generations' ability to meet their needs.</p>
                                        <div><button className="btn-primary-custom" style={{padding:'10px 25px', fontSize:'0.8rem'}}>More About Us</button></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ✅ POPULAR PRODUCTS SECTION (HORIZONTAL SCROLL) */}
                    <div className="container my-5 position-relative">
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <h3 className="section-title mb-0 text-start w-100 text-center text-md-start">Popular & Most Bought.</h3>
                            
                            {/* Navigation Buttons (Hidden on mobile) */}
                            <div className="d-none d-md-flex gap-2">
                                <button className="btn btn-outline-dark rounded-circle" onClick={scrollPopularLeft} style={{width: '40px', height:'40px'}}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <button className="btn btn-outline-dark rounded-circle" onClick={scrollPopularRight} style={{width: '40px', height:'40px'}}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </div>

                        {/* Scroll Container */}
                        <div className="popular-scroll-wrapper" ref={popularScrollRef}>
                            {popularProducts.length > 0 ? popularProducts.map(product => (
                                <div key={product.id} className="popular-card-item">
                                    <ProductCard product={product} onAdd={handleAddToCart} />
                                </div>
                            )) : (
                                <div className="w-100 text-center text-muted py-5">Loading popular items...</div>
                            )}
                        </div>
                    </div>

                    {/* ✅ FULL WIDTH EDITORIAL GRID (Responsive) */}
                    <div className="container-fluid editorial-grid px-0">
                        <div className="row g-3">
                            <div className="col-12 col-md-6 col-lg-3">
                                <EditorialCard img={Banner15} tag="Beauty" title="Chosen By Influencers" />
                            </div>
                            <div className="col-12 col-md-6 col-lg-3">
                                <EditorialCard img={Banner10} tag="Carefully Crafted" title="Created After Years Of Research" />
                            </div>
                            <div className="col-12 col-md-6 col-lg-3">
                                <EditorialCard img={banner4} tag="15% Off" title="Prevent Dry, Flaky Skin" />
                            </div>
                            <div className="col-12 col-md-6 col-lg-3">
                                <EditorialCard img={Banner21} tag="New Arrival" title="Experience The Glow" />
                            </div>
                        </div>
                    </div>

                    {/* ✅ BEST DEALS SECTION (Responsive Grid) */}
                    <div className="container my-5">
                        <h3 className="section-title">Best Deals On The Beautify Store.</h3>
                        <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-4">
                            {bestDeals.length > 0 ? bestDeals.map(product => (
                                <div key={product.id} className="col"><ProductCard product={product} onAdd={handleAddToCart} isSale={true} /></div>
                            )) : (
                                <div className="col-12 text-center text-muted py-5">
                                    <h4>No discounted items available right now.</h4>
                                    <p>Check back later for great deals!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="container my-5">
                    {/* --- FILTER TOOLBAR --- */}
                    <div className="filter-bar-container">
                        <div className="filter-controls">
                            <div className="custom-select-wrapper">
                                <select className="custom-select-btn" value={filters.selectedCategory} onChange={(e) => handleFilterChange('selectedCategory', e.target.value)}>
                                    <option value="All">All Categories</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
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
                            {processedProducts.length} Results Found
                        </div>
                    </div>

                    {/* --- PRODUCT GRID (Responsive) --- */}
                    {processedProducts.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded">
                            <h4 className="text-muted">No products found.</h4>
                            <button className="btn btn-link" onClick={() => setSelectedCategoryId('All')}>Clear Filters</button>
                        </div>
                    ) : (
                        <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-5">
                            {processedProducts.map(product => (
                                <div key={product.id} className="col">
                                    <ProductCard product={product} onAdd={handleAddToCart} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* FOOTER CTA */}
            <div className="footer-cta">
                <div className="container">
                    <h2 className="mb-3">Get Your Customised Skincare Treatment</h2>
                    <p className="text-muted mb-4" style={{maxWidth: '600px', margin: '0 auto'}}>
                        We have a specialized team to help you with any abstract and advice you need.
                    </p>
                    <Link to="/shop" className="text-decoration-none fw-bold" style={{color: THEME_COLOR}}>Shop Skincare <FontAwesomeIcon icon={faArrowRight} /></Link>
                </div>
            </div>

            {/* SUCCESS TOAST */}
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
        </div>
    );
}

// ... [KEEP YOUR HELPER COMPONENTS (ProductCard, EditorialCard) EXACTLY AS THEY WERE] ...
const renderStars = (rating) => {
    const ratingValue = parseFloat(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
        <FontAwesomeIcon key={i} icon={faStar} className={`me-1 ${i < Math.round(ratingValue) ? 'text-warning' : 'text-muted opacity-25'}`} />
    ));
};

const ProductCard = ({ product, onAdd, isSale }) => {
    const stock = parseInt(product.stock, 10) || 0;
    const isOutOfStock = stock <= 0;
    const price = parseFloat(product.price);
    
    // ✅ UPDATED: Use the actual discount from the product, defaulting to 0 if missing
    const discountPercent = parseFloat(product.discount_percentage) || 0;
    
    // Determine if we should show the Sale Badge
    const showSaleBadge = (isSale || discountPercent > 0) && !isOutOfStock;

    return (
        <div className="shop-card h-100">
            <Link to={`/product/${product.id}`} className="text-decoration-none">
                <div className="shop-card-img-wrapper">
                    {/* ✅ UPDATED BADGE LOGIC */}
                    {showSaleBadge && (
                        <span className="badge bg-danger position-absolute top-0 start-0 m-2 shadow-sm" style={{zIndex: 5}}>
                            {discountPercent > 0 ? `-${discountPercent}%` : 'SALE'}
                        </span>
                    )}
                    
                    {isOutOfStock && (
                        <span className="badge bg-secondary position-absolute top-0 start-0 m-2 shadow-sm" style={{zIndex: 5}}>
                            Out of Stock
                        </span>
                    )}
                    <img 
                        src={product.image_url || 'https://via.placeholder.com/300x300'} 
                        alt={product.name} 
                        className="shop-card-img"
                        style={{filter: isOutOfStock ? 'grayscale(100%)' : 'none'}}
                    />
                </div>
            </Link>

            <div className="shop-card-body">
                <div className="shop-card-category">{product.category_name}</div>
                
                <Link to={`/product/${product.id}`} className="text-decoration-none">
                    <h6 className="shop-card-title">{product.name}</h6>
                </Link>

                <div className="shop-card-rating text-warning">
                    {renderStars(product.average_rating)}
                </div>

                <div className="shop-card-footer">
                    <div className="shop-card-price">
                        {/* Option: Show original price crossed out if discounted */}
                        {discountPercent > 0 ? (
                            <div>
                                <span className="text-muted text-decoration-line-through me-2" style={{fontSize: '0.8rem'}}>
                                    ₹{price.toFixed(0)}
                                </span>
                                <span className="text-danger">
                                    ₹{(price - (price * (discountPercent / 100))).toFixed(0)}
                                </span>
                            </div>
                        ) : (
                            <span>₹{price.toFixed(0)}</span>
                        )}
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                        <button 
                            className="btn-shop-cart shadow-sm" 
                            onClick={(e) => {
                                e.preventDefault(); 
                                onAdd(product.id);
                            }}
                            disabled={isOutOfStock}
                            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        >
                            <FontAwesomeIcon icon={isOutOfStock ? faBan : faShoppingCart} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditorialCard = ({ img, tag, title }) => {
    const isVideo = typeof img === 'string' && img.toLowerCase().endsWith('.mp4');

    return (
        <div className="editorial-card">
            {isVideo ? (
                <video 
                    src={img} 
                    className="editorial-img" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                />
            ) : (
                <img src={img} className="editorial-img" alt="Editorial" />
            )}
            
            <div className="editorial-overlay">
                <span className="editorial-tag">{tag}</span>
                <h4 className="editorial-heading">{title}</h4>
            </div>
        </div>
    );
};

export default ShopPage;