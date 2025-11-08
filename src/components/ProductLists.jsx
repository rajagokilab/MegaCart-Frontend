import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductLists.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { getAuthToken, logout } from './auth'; 
import bannerImage from '../assets/banner.jpg';

const renderStars = (rating) => {
    const ratingValue = parseFloat(rating) || 0;
    const fullStars = Math.round(ratingValue);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <FontAwesomeIcon
                key={i}
                icon={faStar}
                className={i <= fullStars ? 'text-warning small me-1' : 'text-muted small me-1'}
            />
        );
    }
    return stars;
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

function ProductList({ onLoginClick }) { 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [filters, setFilters] = useState({
        selectedCategory: 'All', selectedVendor: 'All', priceRange: { min: 0, max: 0 },
    });
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;
    const API_URL = `${import.meta.env.VITE_API_URL}/products/`;
    

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAddToCart = async (productId) => {
        const authToken = getAuthToken(); 
        const guestCartId = getOrCreateGuestCartId();

        const headers = { 'Content-Type': 'application/json', 'X-Guest-Cart-Id': guestCartId };
        if (authToken) headers['Authorization'] = `JWT ${authToken}`;
        
        try {
            const response = await fetch(API_CART_ADD_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ product_id: productId, quantity: 1 }),
            });

            if (response.ok) window.dispatchEvent(new Event("cartChanged"));
            else {
                const errorData = await response.json();
                let errorDetail = errorData.detail || errorData.error || `Failed with status: ${response.status}`;
                if (response.status === 401) {
                    if (authToken) { logout(); errorDetail = 'Session expired. Log in again.'; onLoginClick(); }
                    else { errorDetail = 'Please log in to add items to your cart.'; onLoginClick(); }
                }
                alert(`Error: ${errorDetail}`);
            }
        } catch (error) {
            console.error('Cart API error:', error);
            alert('Network error: Could not add item to cart.');
        }
    };

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true); setError(null);
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                const productList = data.results || data; 
                if (Array.isArray(productList)) {
                    setProducts(productList);
                    const prices = productList.map(p => parseFloat(p.price || 0));
                    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;
                    setFilters(prev => ({ ...prev, priceRange: { min: 0, max: maxPrice } }));
                } else setError("API did not return a list of products.");
            } catch (err) { setError(`Failed to fetch products. Error: ${err.message}`); }
            finally { setLoading(false); }
        };
        fetchProducts();
    }, []);

    useEffect(() => setCurrentPage(1), [filters]);

    const allPrices = products.map(p => parseFloat(p.price || 0));
    const dynamicMaxPrice = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 0;
    const uniqueCategories = ['All', ...new Set(products.map(product => product.category_name))];
    const uniqueVendors = ['All', ...new Set(products.map(product => product.vendor_name))];

    const filteredProducts = products.filter(product => {
        const price = parseFloat(product.price || 0);
        const categoryMatch = filters.selectedCategory === 'All' || product.category_name === filters.selectedCategory;
        const vendorMatch = filters.selectedVendor === 'All' || product.vendor_name === filters.selectedVendor;
        const priceMatch = price >= filters.priceRange.min && price <= filters.priceRange.max;
        return categoryMatch && vendorMatch && priceMatch;
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const maxButtonsToShow = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
    if (endPage - startPage + 1 < maxButtonsToShow) startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    const visiblePageNumbers = [];
    for (let i = startPage; i <= endPage; i++) visiblePageNumbers.push(i);

    if (loading) return (
        <div className="container-fluid p-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading products...</p>
        </div>
    );

    if (error) return (
        <div className="container-fluid p-5 text-center alert alert-danger">
            <h4>Error!</h4><p>{error}</p>
        </div>
    );

    if (filteredProducts.length === 0) return (
        <div className="container-fluid p-5 text-center alert alert-info">
            {products.length > 0 ? 'No products matched your filters.' : 'No products found.'}
        </div>
    );

    return (
        <div className="container-fluid py-4">

            {/* --- RESPONSIVE BANNER --- */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="banner rounded shadow-sm text-center text-white d-flex flex-column justify-content-center align-items-center" 
     style={{
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '650px',
       
     }}>
    <h1 className="display-5 fw-bold">Welcome to MegaCart!</h1>
    <p className="lead">Discover amazing products and great discounts!</p>
    <a href="#product-section" className="btn btn-lg btn-warning mt-2">Shop Now</a>
</div>

                </div>
            </div>

            <div className="row" id="product-section">
                {/* FILTER SIDEBAR */}
                <div className="col-12 col-md-3 mb-4 mb-md-0">
                    <div className="filter-sidebar p-3 border rounded shadow-sm bg-light">
                        <h5 className="mb-4 fw-bold text-primary">⚙️ FILTER</h5>
                        <div className="filter-group mb-4">
                            <h6 className="fw-bold mb-2 text-dark">Category</h6>
                            <select className="form-select form-select-sm" value={filters.selectedCategory} onChange={(e) => handleFilterChange('selectedCategory', e.target.value)}>
                                {uniqueCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                            </select>
                        </div>
                        <div className="filter-group mb-4">
                            <h6 className="fw-bold mb-2 text-dark">Vendor Name</h6>
                            <select className="form-select form-select-sm" value={filters.selectedVendor} onChange={(e) => handleFilterChange('selectedVendor', e.target.value)}>
                                {uniqueVendors.map(vendor => (<option key={vendor} value={vendor}>{vendor}</option>))}
                            </select>
                        </div>
                        <div className="filter-group mb-4">
                            <h6 className="fw-bold mb-2 text-dark">Price Range</h6>
                            <div className="d-flex justify-content-between small text-muted">
                                <span>₹0.00</span>
                                <span>Max: ₹{dynamicMaxPrice.toFixed(2)}</span>
                            </div>
                            <input type="range" className="form-range" min="0" max={dynamicMaxPrice} step="1" value={filters.priceRange.max} onChange={(e) => handleFilterChange('priceRange', { min: 0, max: parseFloat(e.target.value) })}/>
                            <p className="mt-2 small text-center text-dark">
                                Filtered up to: ₹{filters.priceRange.max.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* PRODUCT GRID */}
                <div className="col-12 col-md-9">
                    <h2 className="mb-4 fw-bold">Product Results ({filteredProducts.length})</h2>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 g-4">
                        {currentProducts.map(product => (
                            <div key={product.id} className="col product-card">
                                <div className="card h-100 shadow-sm">
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/400x300/1a1a1a/ff5722?text=NO+IMAGE'}
                                        className="card-img-top"
                                        alt={product.name || 'Product'}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body d-flex flex-column">
                                        <span className="small text-muted">{product.category_name}</span>
                                        <h5 className="card-title text-truncate">{product.name || 'Untitled'}</h5>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <p className="small mb-0 text-dark">Vendor: {product.vendor_name || 'N/A'}</p>
                                            <h5 className="text-success fw-bold mb-0">₹{parseFloat(product.price || 0).toFixed(2)}</h5>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <div className="d-flex align-items-center">{renderStars(product.average_rating)}
                                                <span className="small text-secondary ms-1">{(product.average_rating || 0).toFixed(1)}</span>
                                            </div>
                                            <button className="btn btn-sm btn-outline-warning" onClick={() => handleAddToCart(product.id)} title="Add to Cart">
                                                <FontAwesomeIcon icon={faShoppingCart} />
                                            </button>
                                        </div>
                                        <Link to={`/product/${product.id}`} className="btn btn-primary mt-3">View Details</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4 flex-wrap">
                            <nav>
                                <ul className="pagination shadow-sm">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button onClick={() => paginate(currentPage - 1)} className="page-link" disabled={currentPage === 1}>Previous</button>
                                    </li>
                                    {visiblePageNumbers.map(number => (
                                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                            <button onClick={() => paginate(number)} className="page-link">{number}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button onClick={() => paginate(currentPage + 1)} className="page-link" disabled={currentPage === totalPages}>Next</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductList;
