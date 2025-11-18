import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { getAuthToken, logout } from '../components/auth.js';
import banner1 from '../assets/banner1.jpg';
import banner2 from '../assets/banner.jpg';
import banner3 from '../assets/banner3.jpg';
import banner4 from '../assets/banner4.gif';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const THEME_COLOR = '#7A8450';
const THEME_COLOR_HOVER = '#697240';
const THEME_COLOR_FOCUS_RING = 'rgba(122, 132, 80, 0.25)';
const THEME_COLOR_SVG = '%237A8450';

const STYLE_OVERRIDES = `
.form-select {
    color: ${THEME_COLOR} !important; 
    border-color: ${THEME_COLOR} !important; 
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='${THEME_COLOR_SVG}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
}
.form-select:focus {
    border-color: ${THEME_COLOR} !important;
    box-shadow: 0 0 0 0.25rem ${THEME_COLOR_FOCUS_RING} !important;
    color: ${THEME_COLOR} !important;
}
.form-range::-webkit-slider-thumb {
    background-color: ${THEME_COLOR};
}
.form-range::-moz-range-thumb {
    background-color: ${THEME_COLOR};
}
.page-link:focus {
    box-shadow: 0 0 0 0.25rem ${THEME_COLOR_FOCUS_RING} !important;
}
.page-link {
    color: ${THEME_COLOR} !important;
}
.page-item.active .page-link {
    background-color: ${THEME_COLOR} !important;
    border-color: ${THEME_COLOR} !important;
    color: white !important;
}
.carousel-img {
    object-fit: cover;
    width: 100%;
    height: 200px;
}
@media (min-width: 768px) {
    .carousel-img {
        height: 300px;
    }
}
@media (min-width: 992px) {
    .carousel-img {
        height: 350px;
    }
}
.sticky-sidebar {
    position: sticky;
    top: 60px; /* height of navbar */
}
`;

const renderStars = (rating) => {
    const ratingValue = parseFloat(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
        <FontAwesomeIcon
            key={i}
            icon={faStar}
            className={`me-1 ${i < Math.round(ratingValue) ? 'text-yellow-400' : 'text-gray-300'}`}
        />
    ));
};

const GUEST_CART_ID_KEY = 'guestCartId';
const API_CART_ADD_URL = `${import.meta.env.VITE_API_URL}/cart/add_item/`;

const getOrCreateGuestCartId = () => {
    let guestId = localStorage.getItem(GUEST_CART_ID_KEY);
    if (!guestId) {
        guestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
        localStorage.setItem(GUEST_CART_ID_KEY, guestId);
    }
    return guestId;
};

export default function CategoryPage({ onLoginClick }) {
    const { categoryName } = useParams(); // from route /category/:categoryName
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        selectedCategory: categoryName || 'All',
        selectedVendor: 'All',
        priceRange: { min: 0, max: 0 },
    });

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    const API_URL = `${import.meta.env.VITE_API_URL}/products/`;

    const handleFilterChange = (key, value) =>
        setFilters((prev) => ({ ...prev, [key]: value }));

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAddToCart = async (productId) => {
        const authToken = getAuthToken();
        const guestCartId = getOrCreateGuestCartId();

        const headers = {
            'Content-Type': 'application/json',
            'X-Guest-Cart-Id': guestCartId,
        };

        if (authToken) headers['Authorization'] = `JWT ${authToken}`;

        try {
            const response = await fetch(API_CART_ADD_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify({ product_id: productId, quantity: 1 }),
            });

            if (response.ok) {
                window.dispatchEvent(new Event('cartChanged'));
            } else {
                const errorData = await response.json();
                let errorDetail =
                    errorData.detail || errorData.error || `Failed with status: ${response.status}`;

                if (response.status === 401) {
                    if (authToken) {
                        logout();
                        errorDetail = 'Session expired. Log in again.';
                        onLoginClick();
                    } else {
                        errorDetail = 'Please log in to add items to your cart.';
                        onLoginClick();
                    }
                }
                alert(`Error: ${errorDetail}`);
            }
        } catch (error) {
            console.error('Cart API error:', error);
            alert('Network error: Could not add item to cart.');
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                let url = API_URL;
                if (filters.selectedCategory && filters.selectedCategory !== 'All') {
                    url += `?category=${encodeURIComponent(filters.selectedCategory)}`;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                const productList = data.results || data;

                if (Array.isArray(productList)) {
                    setProducts(productList);
                    const prices = productList.map((p) => parseFloat(p.price || 0));
                    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;

                    setFilters((prev) => ({
                        ...prev,
                        priceRange: { min: 0, max: maxPrice },
                    }));
                } else {
                    setError('API did not return a list of products.');
                }
            } catch (err) {
                setError(`Failed to fetch products. Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [filters.selectedCategory]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const allPrices = products.map((p) => parseFloat(p.price || 0));
    const dynamicMaxPrice = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 0;

    const uniqueVendors = ['All', ...new Set(products.map((p) => p.vendor_name))];

    const filteredProducts = products.filter((product) => {
        const price = parseFloat(product.price || 0);
        const vendorMatch =
            filters.selectedVendor === 'All' || product.vendor_name === filters.selectedVendor;
        const priceMatch = price >= filters.priceRange.min && price <= filters.priceRange.max;
        return vendorMatch && priceMatch;
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const maxButtonsToShow = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
        startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    const visiblePageNumbers = [];
    for (let i = startPage; i <= endPage; i++) visiblePageNumbers.push(i);

    if (loading)
        return (
            <div className="container text-center py-5">
                <div className="spinner-border" style={{ color: THEME_COLOR }}></div>
                <p className="mt-2">Loading products...</p>
            </div>
        );

    if (error)
        return (
            <div className="container text-center py-5 bg-red-100 border border-red-400 text-red-700 rounded">
                <h4>Error!</h4>
                <p>{error}</p>
            </div>
        );

    if (products.length > 0 && filteredProducts.length === 0)
        return (
            <div className="container text-center py-5 bg-green-50 border border-green-200" style={{ color: THEME_COLOR }}>
                <h4>No products matched your filters.</h4>
            </div>
        );

    if (products.length === 0)
        return (
            <div className="container text-center py-5 bg-green-50 border border-green-200" style={{ color: THEME_COLOR }}>
                <h4>No products found.</h4>
            </div>
        );

    return (
        <div className="container py-4 px-2 px-md-4 px-lg-5">
            <style>{STYLE_OVERRIDES}</style>

            {/* Carousel */}
            <div className="row mb-4">
                <div className="col-12">
                    <div id="bannerCarousel" className="carousel slide carousel-fade rounded-lg shadow-lg overflow-hidden" data-bs-ride="carousel" data-bs-interval="10000">
                        <div className="carousel-inner">
                            {[banner1, banner2, banner3, banner4].map((img, index) => (
                                <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                    <img src={img} alt={`Banner ${index + 1}`} className="carousel-img" />
                                </div>
                            ))}
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon bg-dark rounded-circle"></span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
                            <span className="carousel-control-next-icon bg-dark rounded-circle"></span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters + Products */}
            <div className="row" id="product-section">

                {/* Sidebar */}
                <div className="col-12 col-md-3 mb-4">
                    <div className="p-3 border rounded shadow-sm bg-light d-md-block sticky-sidebar">
                        <h5 className="fw-bold mb-3" style={{ color: THEME_COLOR_HOVER }}>⚙️ FILTER</h5>
                        <div className="mb-3">
                            <h6 style={{ color: THEME_COLOR }}>Store Name</h6>
                            <select className="form-select" value={filters.selectedVendor} onChange={(e)=>handleFilterChange('selectedVendor', e.target.value)}>
                                {uniqueVendors.map((vendor)=> <option key={vendor} value={vendor}>{vendor}</option>)}
                            </select>
                        </div>
                        <div>
                            <h6 style={{ color: THEME_COLOR }}>Price Range</h6>
                            <div className="d-flex justify-content-between small fw-medium">
                                <span style={{ color: THEME_COLOR }}>₹0</span>
                                <span style={{ color: THEME_COLOR }}>Max: ₹{dynamicMaxPrice}</span>
                            </div>
                            <input type="range" className="form-range w-100" min="0" max={dynamicMaxPrice} value={filters.priceRange.max} onChange={(e)=>handleFilterChange('priceRange', {min:0, max:parseFloat(e.target.value)})} style={{ accentColor: THEME_COLOR }}/>
                            <p className="text-center small fw-medium" style={{ color: THEME_COLOR }}>Filtered up to: ₹{filters.priceRange.max}</p>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="col-12 col-md-9">
                    <h2 className="mb-4 fw-bold">Products ({filteredProducts.length})</h2>
                    <div className="row g-4">
                        {currentProducts.map((product)=>{
                            let discountPercent = 0;
                            if(product.original_price && parseFloat(product.original_price) > parseFloat(product.price)){
                                discountPercent = Math.round(((parseFloat(product.original_price)-parseFloat(product.price))/parseFloat(product.original_price))*100);
                            }
                            return (
                                <div key={product.id} className="col-6 col-sm-6 col-md-4 col-lg-3">
                                    <div className="card h-100 bg-transparent rounded-lg overflow-hidden position-relative border-0">
                                        {discountPercent>0 && <div className="position-absolute top-0 start-0 m-2 text-white small fw-bold px-2 py-1 rounded-pill" style={{ backgroundColor: THEME_COLOR }}>{discountPercent}% OFF</div>}
                                        <img src={product.image_url || 'https://via.placeholder.com/400x300?text=NO+IMAGE'} alt={product.name} className="card-img-top object-cover" style={{height:'160px'}}/>
                                        <div className="card-body d-flex flex-column p-3 align-items-center">
                                            <h5 className="card-title fw-semibold text-black my-0 text-truncate">{product.name}</h5>
                                            <div className="d-flex align-items-center justify-content-center gap-2 mt-2 mb-1">
                                                <h5 className="fw-bold text-black mb-0">₹{parseFloat(product.price).toFixed(2)}</h5>
                                                {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && <span className="small text-gray-500 text-decoration-line-through">₹{parseFloat(product.original_price).toFixed(2)}</span>}
                                            </div>
                                            <div className="d-flex align-items-center justify-content-center mb-2">
                                                {renderStars(product.average_rating)}
                                                <span className="small text-gray-500 ms-1">{(product.average_rating||0).toFixed(1)}</span>
                                            </div>
                                            <span className="small text-gray-500">{product.category_name}</span>
                                            <p className="small text-gray-600 mb-3">Store: {product.vendor_name}</p>
                                            <div className="d-flex justify-content-center align-items-center mt-auto gap-2">
                                                <Link to={`/product/${product.id}`} className="btn btn-sm" style={{backgroundColor:'transparent',color:THEME_COLOR,borderColor:THEME_COLOR}}>View Details</Link>
                                                <button className="btn btn-sm" style={{backgroundColor:THEME_COLOR,color:'white',borderColor:THEME_COLOR}} onClick={()=>handleAddToCart(product.id)} title="Add to Cart"><FontAwesomeIcon icon={faShoppingCart}/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages>1 && <div className="d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination shadow-sm">
                                <li className={`page-item ${currentPage===1?'disabled':''}`}><button onClick={()=>paginate(currentPage-1)} className="page-link">Previous</button></li>
                                {visiblePageNumbers.map(num=><li key={num} className={`page-item ${currentPage===num?'active':''}`}><button onClick={()=>paginate(num)} className="page-link">{num}</button></li>)}
                                <li className={`page-item ${currentPage===totalPages?'disabled':''}`}><button onClick={()=>paginate(currentPage+1)} className="page-link">Next</button></li>
                            </ul>
                        </nav>
                    </div>}
                </div>

            </div>
        </div>
    );
}
