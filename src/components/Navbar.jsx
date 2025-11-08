import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import LoginDropdown from './LoginDropdown.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faLocationDot, 
    faShoppingCart,
    faSearch,
    faBars 
} from '@fortawesome/free-solid-svg-icons';
import { getCachedUser } from './auth';
import { useCart } from '../context/CartContext.jsx';

// 💰 --- 1. IMPORT YOUR LOGO ---
import appLogo from '../assets/logo.jpg'; // Make sure this path is correct

function Navbar({ onLoginClick }) {
    const [user, setUser] = useState(null);
    const { cartItems } = useCart();
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setUser(getCachedUser());
    }, []);

    useEffect(() => {
        const handleAuthChange = () => {
            setUser(getCachedUser());
        };
        window.addEventListener("authChanged", handleAuthChange);
        return () => window.removeEventListener("authChanged", handleAuthChange);
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSuggestions([]);
            return;
        }
        const timerId = setTimeout(async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/products/?search=${searchTerm.trim()}&limit=5`);
                const data = await response.json();
                setSuggestions(data.results || data);
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
                setSuggestions([]);
            }
        }, 300);
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setSuggestions([]);
            setSearchTerm(''); 
        }
    };
    
    const handleSuggestionClick = (suggestionTerm) => {
        navigate(`/search?q=${encodeURIComponent(suggestionTerm)}`);
        setSuggestions([]);
        setSearchTerm('');
    };

    const handleBlur = () => {
        setTimeout(() => {
            setSuggestions([]);
        }, 200);
    };

    return (
        <nav className="border-bottom">
            <div className="container-fluid py-3 d-flex align-items-center">
                
                <div className="d-flex align-items-center me-4">
                    <Link to="/" className="text-decoration-none d-flex align-items-center">
                        
                        {/* 💰 --- 2. USE THE IMPORTED LOGO --- */}
                        <img 
                            src={appLogo} 
                            alt="MegaCart Logo"
                            style={{ 
                                height: '50px', 
                                width: 'auto', 
                                marginRight: '2px', 
                                borderRadius: '2px',
                                backgroundColor:'white' 
                            }}
                        />
                        {/* --- END LOGO IMAGE --- */}

                       <h2 className="mb-0 fw-bold">
    <span style={{ color: '#0055A0' }}>Mega</span>
    <span style={{ color: '#28a745' }}>Cart</span>
</h2>
                    </Link>
                </div>

                <div className="flex-grow-1 mx-4 position-relative"> 
                    <form onSubmit={handleSearchSubmit} className="input-group search-bar rounded-pill overflow-hidden bg-light border-0">
                        <input
                            type="text"
                            className="form-control border-0 bg-light py-2"
                            placeholder="Search by product, category or item"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onBlur={handleBlur}
                        />
                        <button type="submit" className="input-group-text btn border-0 bg-light">
                            <FontAwesomeIcon icon={faSearch} className="text-muted" />
                        </button>
                    </form>

                    {suggestions.length > 0 && (
                        <ListGroup 
                            className="position-absolute w-100 mt-1 shadow-sm" 
                            style={{ zIndex: 1000 }}
                        >
                            {suggestions.map(product => (
                                <ListGroup.Item 
                                    key={product.id} 
                                    action
                                    onClick={() => handleSuggestionClick(product.name)}
                                >
                                    <FontAwesomeIcon icon={faSearch} className="text-muted me-2" />
                                    {product.name}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>

                <div className="d-flex align-items-center">
                    <div 
                        className="text-center mx-3" 
                        onClick={() => setShowStoreModal(true)} 
                        style={{ cursor: 'pointer' }}
                    >
                        <FontAwesomeIcon icon={faLocationDot} size="lg" className="d-block mx-auto mb-1 text-success" />
                        <span className="text-decoration-none text-dark small">Find a store</span>
                    </div>

                    <LoginDropdown onLoginClick={onLoginClick} />

                    <Link to="/cart" className="text-decoration-none text-dark text-center ms-3">
                        <div className="position-relative d-inline-block">
                            <FontAwesomeIcon icon={faShoppingCart} size="lg" className="d-block mx-auto mb-1 text-success" />
                            {totalItems > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {totalItems}
                                    <span className="visually-hidden">items in cart</span>
                                </span>
                            )}
                        </div>
                        <span className="d-block small">Shopping cart</span>
                    </Link>
                </div>
            </div>

            <Modal show={showStoreModal} onHide={() => setShowStoreModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faLocationDot} className="me-2 text-success" />
                        Our Store Location
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2131.393430588145!2d11.96838861595191!3d57.70838198119889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x464ff368940e4f89%3A0x63fed68d301c360!2sNordstan!5e0!3m2!1sen!2sse!4v1678886085114!5m2!1sen!2sse"
                        width="100%" 
                        height="450" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Store Location Map"
                    ></iframe>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStoreModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </nav>
    );
}

export default Navbar;