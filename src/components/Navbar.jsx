import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginDropdown from './LoginDropdown.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, ListGroup, Offcanvas } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faShoppingCart,
    faSearch,
    faBars,
    faTruck,
} from '@fortawesome/free-solid-svg-icons';
import { getCachedUser } from './auth';
import { useCart } from '../context/CartContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL;
import appLogo from '../assets/logo.jpg';

// Logo Component
const Logo = () => (
    <Link to="/" className="!no-underline flex flex-col items-center">
        <img
            src={appLogo}
            alt="VetriCart Logo"
            className="h-[60px] w-[100px] rounded-md bg-white shadow-sm"
        />
    </Link>
);

// SearchBar Component
const SearchBar = ({
    inMobile = false,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    suggestions,
    handleSuggestionClick,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative ${inMobile ? 'px-3 pb-3' : 'w-72'}`}>
            <form
                onSubmit={handleSearchSubmit}
                className="flex bg-white rounded-full overflow-hidden shadow-sm border"
            >
                <input
                    type="text"
                    className="flex-grow px-4 py-2 bg-white outline-none text-sm rounded-full"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                />
                <button type="submit" className="px-4 bg-white text-[#93A267]">
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </form>

            {isFocused && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 bg-white shadow-lg rounded-lg mt-2 z-50">
                    {suggestions.map((product) => (
                        <div
                            key={product.id}
                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer search-suggestion"
                            onMouseDown={() => handleSuggestionClick(product.name)}
                        >
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="mr-2 text-gray-400"
                            />
                            {product.name}
                        </div>
                    ))}
                </div>
            )}
            {isFocused && (
                <div
                    className="fixed inset-0 z-40"
                    onMouseDown={() => setIsFocused(false)}
                ></div>
            )}
        </div>
    );
};

// Navbar Component
function Navbar({ onLoginClick }) {
    const [user, setUser] = useState(null);
    const { cartItems } = useCart();
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const handleShowOffcanvas = () => setShowOffcanvas(true);

    useEffect(() => setUser(getCachedUser()), []);
    useEffect(() => {
        const handleAuthChange = () => setUser(getCachedUser());
        window.addEventListener('authChanged', handleAuthChange);
        return () => window.removeEventListener('authChanged', handleAuthChange);
    }, []);
    useEffect(() => handleCloseOffcanvas(), [location]);

    useEffect(() => {
        if (searchTerm.trim() === '') return setSuggestions([]);
        const timerId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/products/?search=${encodeURIComponent(searchTerm.trim())}&limit=5`
                );
                const data = await response.json();
                setSuggestions(data.results || data);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setSuggestions([]);
            setSearchTerm('');
            document.activeElement.blur();
        }
    };

    const handleSuggestionClick = (suggestionTerm) => {
        navigate(`/search?q=${encodeURIComponent(suggestionTerm)}`);
        setSuggestions([]);
        setSearchTerm('');
    };

    const oliveBg = 'bg-[#7A8450]';
    const darkBlueBg = 'bg-black';
    const lightText = 'text-white';
    const lightTextHover = 'hover:text-gray-200';
    const navLinkClasses = `!no-underline ${lightText} ${lightTextHover} font-medium uppercase text-sm tracking-wider`;
    const navIconClasses = `!no-underline ${lightText} ${lightTextHover} text-xl relative bg-transparent border-none p-0`;

    return (
        <nav className="sticky top-0 bg-white shadow-sm z-50">
            {/* Top Bar */}
            <div
                className={`${darkBlueBg} text-white text-center p-2 text-xs tracking-wide flex items-center justify-center`}
            >
                <FontAwesomeIcon icon={faTruck} className="mr-2" />
                FREE SHIPPING ALL OVER TAMILNADU
            </div>

            {/* Desktop Navbar */}
            <div className={`hidden lg:block py-4 px-8 ${oliveBg} border-b border-stone-200`}>
                <div className="flex items-center justify-between">
                    {/* Left Links */}
                    <div className="flex-1 flex items-center justify-start">
                        <Link to="/shop" className={`${navLinkClasses} mr-6`}>
                            Shop
                        </Link>
                        
                        {/* FIXED: Desktop link now points to /about-us */}
                        <Link to="/about-us" className={`${navLinkClasses} mr-6`}>
                            About
                        </Link>
                        
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            handleSearchSubmit={handleSearchSubmit}
                            suggestions={suggestions}
                            handleSuggestionClick={handleSuggestionClick}
                        />
                    </div>

                    {/* Center Logo */}
                    <div className="flex-auto flex justify-center">
                        <Logo />
                    </div>

                    {/* Right Icons */}
                    <div className="flex-1 flex items-center justify-end">
                        <button
                            onClick={() => setShowStoreModal(true)}
                            className={`${navIconClasses} ml-8`}
                        >
                            <FontAwesomeIcon icon={faLocationDot} />
                        </button>

                        <div className={`ml-8 ${lightText}`}>
                            <LoginDropdown onLoginClick={onLoginClick} theme="dark" iconColor="white" />
                        </div>

                        <Link
                            to="/cart"
                            className={`${navIconClasses} ml-8`}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                            {totalItems > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-xs">
                                    {totalItems}
                                    <span className="visually-hidden">items in cart</span>
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Navbar */}
            <div className={`lg:hidden ${oliveBg}`}>
                <div className="px-4 py-3 flex items-center justify-between">
                    <Button variant="link" onClick={handleShowOffcanvas} className={`${lightText} text-2xl p-0 mr-3`}>
                        <FontAwesomeIcon icon={faBars} />
                    </Button>

                    <Logo />

                    <Link to="/cart" className={`!no-underline ml-3 relative ${lightText}`}>
                        <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                        {totalItems > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-xs">
                                {totalItems}
                                <span className="visually-hidden">items in cart</span>
                            </span>
                        )}
                    </Link>
                </div>

                <SearchBar
                    inMobile={true}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleSearchSubmit={handleSearchSubmit}
                    suggestions={suggestions}
                    handleSuggestionClick={handleSuggestionClick}
                />
            </div>

            {/* Mobile Offcanvas */}
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <ListGroup variant="flush">
                        <div className="py-3 px-3">
                            <LoginDropdown onLoginClick={() => { handleCloseOffcanvas(); onLoginClick(); }} />
                        </div>

                        {/* Mobile Links */}
                        <ListGroup.Item action onClick={() => { handleCloseOffcanvas(); navigate('/shop'); }} className="py-3">
                            Shop
                        </ListGroup.Item>
                        
                        {/* FIXED: Mobile link now points to /about-us */}
                        <ListGroup.Item action onClick={() => { handleCloseOffcanvas(); navigate('/about-us'); }} className="py-3">
                            About
                        </ListGroup.Item>

                        <ListGroup.Item action onClick={() => { handleCloseOffcanvas(); setShowStoreModal(true); }} className="py-3">
                            <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-[#93A267]" />
                            Find a store
                        </ListGroup.Item>
                    </ListGroup>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Store Modal */}
            <Modal
                show={showStoreModal}
                onHide={() => setShowStoreModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-[#93A267]" />
                        Our Store Location
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <iframe
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.207433463813!2d77.7095!3d8.7139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f1ae0c3e8e2d%3A0xbdf9ea9d95c0b2f8!2sNew%20Bus%20Stand%2C%20Tirunelveli!"
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