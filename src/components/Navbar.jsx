import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginDropdown from './LoginDropdown.jsx';
import LoginFormModal from './LoginFormModal.jsx'; // <--- IMPORTED MODAL
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Offcanvas } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faShoppingCart,
    faSearch,
    faBars,
    faTruck,
    faTimes,
    faBagShopping,
    faCoins,
    faPercent,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import { getCachedUser } from './auth';
import { useCart } from '../context/CartContext.jsx';
import appLogo from '../assets/logo.jpg';

const API_BASE = import.meta.env.VITE_API_URL;

// --- CUSTOM STYLES ---
const customStyles = `
  @keyframes drive {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(3px); }
  }
  .animate-drive {
    animation: drive 2s infinite ease-in-out;
  }
  @keyframes spill-float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(4px, -6px) rotate(10deg); }
  }
  @keyframes spill-float-delayed {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-4px, -8px) rotate(-10deg); }
  }
  .animate-spill-1 { animation: spill-float 2.5s infinite ease-in-out; }
  .animate-spill-2 { animation: spill-float-delayed 3s infinite ease-in-out; }
  .nav-link-hover { position: relative; }
  .nav-link-hover::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    left: 50%;
    background-color: white;
    transition: all 0.3s ease-in-out;
    transform: translateX(-50%);
  }
  .nav-link-hover:hover::after { width: 100%; }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .stagger-item {
    opacity: 0;
    animation: slideInRight 0.4s ease-out forwards;
  }
`;

// --- LOGO COMPONENT ---
const Logo = () => (
    <Link to="/" className="!no-underline flex items-center transition-transform hover:scale-105 duration-300 group relative">
        <img
            src={appLogo}
            alt="VetriCart Logo"
            className="h-12 w-auto rounded-md shadow-lg border border-white/20 hover:shadow-xl transition-shadow z-10"
        />
        <div className="absolute -bottom-2 -left-6 flex items-end z-20">
            <div className="relative text-[#7A8450] drop-shadow-md">
                <FontAwesomeIcon icon={faBagShopping} className="text-2xl" />
                <div className="absolute -top-3 -left-2 text-yellow-500 animate-spill-2">
                    <div className="bg-white rounded-full p-[1px] shadow-sm">
                        <FontAwesomeIcon icon={faCoins} className="text-xs" />
                    </div>
                </div>
                <div className="absolute -top-4 right-0 text-[#A9B47C] animate-spill-1">
                    <div className="bg-white rounded-md px-[2px] shadow-sm border border-gray-100 transform rotate-12">
                        <FontAwesomeIcon icon={faPercent} className="text-[10px] font-bold" />
                    </div>
                </div>
                <div className="absolute top-0 left-1 text-yellow-300 animate-pulse">
                    <FontAwesomeIcon icon={faStar} className="text-[6px]" />
                </div>
            </div>
        </div>
    </Link>
);

// --- SEARCH BAR ---
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
        <div className={`relative group transition-all duration-500 ease-in-out ${inMobile ? 'w-full mt-4' : isFocused ? 'w-72 lg:w-96' : 'w-60 lg:w-80'}`}>
            <form
                onSubmit={handleSearchSubmit}
                className={`flex items-center rounded-full transition-all duration-300 ${
                    inMobile 
                        ? 'bg-gray-100 border border-gray-200 focus-within:bg-white focus-within:shadow-md' 
                        : `bg-gray-100/10 backdrop-blur-md border border-white/20 ${isFocused ? 'bg-white/20 shadow-lg ring-1 ring-white/50' : 'shadow-inner hover:bg-white/10'}`
                }`}
            >
                <input
                    type="text"
                    className={`flex-grow px-4 py-1.5 bg-transparent outline-none text-xs sm:text-sm placeholder-gray-300 rounded-l-full transition-colors ${inMobile ? 'text-gray-700 placeholder-gray-500' : 'text-white'}`}
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                />
                <button 
                    type="submit" 
                    className={`px-4 py-1.5 rounded-r-full transition-all duration-300 ${
                        inMobile ? 'text-gray-500' : 'text-white/80 hover:text-white hover:scale-110'
                    }`}
                >
                    <FontAwesomeIcon icon={faSearch} className="text-sm" />
                </button>
            </form>

            {isFocused && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 bg-white shadow-2xl rounded-xl mt-2 z-50 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map((product) => (
                        <div
                            key={product.id}
                            className="px-4 py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-[#7A8450]/10 hover:text-[#7A8450] hover:pl-6 cursor-pointer flex items-center transition-all duration-200 border-b border-gray-50 last:border-none"
                            onMouseDown={() => handleSuggestionClick(product.name)}
                        >
                            <FontAwesomeIcon icon={faSearch} className="mr-3 text-gray-300 text-xs" />
                            {product.name}
                        </div>
                    ))}
                </div>
            )}
            {isFocused && (
                <div className="fixed inset-0 z-40 bg-transparent" onMouseDown={() => setIsFocused(false)}></div>
            )}
        </div>
    );
};

function Navbar() {
    const [user, setUser] = useState(null);
    const { cartItems } = useCart();
    
    // --- MODAL STATES ---
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false); // <--- LOGIN MODAL STATE

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const handleShowOffcanvas = () => setShowOffcanvas(true);

    useEffect(() => setUser(getCachedUser()), []);
    
    useEffect(() => {
        const handleAuthChange = () => setUser(getCachedUser());
        window.addEventListener('authChanged', handleAuthChange);
        return () => window.removeEventListener('authChanged', handleAuthChange);
    }, []);

    useEffect(() => handleCloseOffcanvas(), [location]);

    // --- LISTEN FOR PASSWORD RESET REDIRECT ---
    useEffect(() => {
        if (location.state?.openLogin) {
            setShowLoginModal(true);
        }
    }, [location]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setShowOffcanvas(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const navLinkStyles = "nav-link-hover !text-white/90 hover:!text-white font-medium text-xs lg:text-sm uppercase tracking-widest transition-colors duration-300 !no-underline";
    const iconBtnStyles = "!text-white/90 hover:!text-white transition-all duration-300 relative bg-transparent border-none p-0 hover:-translate-y-0.5 hover:drop-shadow-md";

    return (
        <>
            <style>{customStyles}</style>
            
            <header className={`fixed w-full top-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'shadow-lg' : ''}`}>
                
                {/* Top Bar */}
                <div className="bg-neutral-900 text-white text-[10px] lg:text-xs font-medium tracking-widest text-center py-1 relative z-50 overflow-hidden">
                    <div className="container mx-auto flex justify-center items-center gap-2">
                        <div className="animate-drive">
                            <FontAwesomeIcon icon={faTruck} className="text-[#A9B47C]" />
                        </div>
                        <span className="opacity-90">FREE SHIPPING ACROSS TAMILNADU</span>
                    </div>
                </div>

                {/* Main Navbar */}
                <nav 
                    className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-b border-white/10 backdrop-blur-md
                    ${scrolled ? 'py-1 bg-[#7A8450]/95 supports-[backdrop-filter]:bg-[#7A8450]/80' : 'py-2 bg-[#7A8450]'}`}
                >
                    <div className="container mx-auto px-4 lg:px-8 relative">
                        <div className="flex items-center justify-between h-12 lg:h-14">

                            {/* Left Side: Mobile Menu */}
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleShowOffcanvas} 
                                    className="lg:hidden !text-white text-lg hover:bg-white/20 p-1.5 rounded-full transition-all duration-300 active:scale-90"
                                >
                                    <FontAwesomeIcon icon={faBars} />
                                </button>
                            </div>

                            {/* Logo Logic */}
                            <div className="
                                flex-shrink-0 z-20 animate-in fade-in zoom-in duration-500
                                max-[800px]:absolute max-[800px]:left-1/2 max-[800px]:top-1/2 max-[800px]:-translate-x-1/2 max-[800px]:-translate-y-1/2
                                min-[800px]:block
                            ">
                                <Logo />
                            </div>

                            {/* Middle: Navigation Links & Search (Desktop) */}
                            <div className="hidden lg:flex flex-1 items-center justify-center gap-8 mx-4">
                                <div className="flex gap-8">
                                    <Link to="/shop" className={navLinkStyles}>Shop</Link>
                                    <Link to="/about-us" className={navLinkStyles}>Blog</Link>
                                </div>
                                
                                <div className="ml-2">
                                    <SearchBar
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        handleSearchSubmit={handleSearchSubmit}
                                        suggestions={suggestions}
                                        handleSuggestionClick={handleSuggestionClick}
                                    />
                                </div>
                            </div>

                            {/* Right: Icons */}
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => setShowStoreModal(true)} 
                                    className={`hidden md:block ${iconBtnStyles}`}
                                    title="Find Store"
                                >
                                    <FontAwesomeIcon icon={faLocationDot} className="text-base lg:text-lg" />
                                </button>

                                <div className="hidden md:block hover:-translate-y-0.5 transition-transform duration-300">
                                    <div className="text-sm">
                                        {/* UPDATED: Opens internal modal */}
                                        <LoginDropdown onLoginClick={() => setShowLoginModal(true)} theme="dark" iconColor="white" />
                                    </div>
                                </div>

                                <Link to="/cart" className={`${iconBtnStyles} flex items-center group`}>
                                    <div className="relative p-1">
                                        <FontAwesomeIcon icon={faShoppingCart} className="text-base lg:text-lg !text-white group-hover:animate-pulse" />
                                        {totalItems > 0 && (
                                            <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[9px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full shadow-md ring-1 ring-[#7A8450] animate-in zoom-in duration-300">
                                                {totalItems}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Offcanvas */}
                <Offcanvas 
                    show={showOffcanvas} 
                    onHide={handleCloseOffcanvas} 
                    placement="start"
                    className="!bg-[#fafafa] !border-r-0 w-[80%] max-w-[280px]"
                >
                    <Offcanvas.Header className="bg-[#7A8450] text-white shadow-md py-3">
                        <Offcanvas.Title className="font-bold tracking-wide text-base flex items-center gap-2">
                            <img src={appLogo} alt="Logo" className="h-6 w-auto rounded shadow-sm" />
                            MENU
                        </Offcanvas.Title>
                        <button onClick={handleCloseOffcanvas} className="!text-white hover:rotate-90 transition-transform duration-300 bg-transparent border-none">
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>
                    </Offcanvas.Header>

                    <Offcanvas.Body className="p-0 flex flex-col">
                        <div className="p-3 bg-white border-b border-gray-100 shadow-sm">
                            <SearchBar
                                inMobile={true}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                handleSearchSubmit={handleSearchSubmit}
                                suggestions={suggestions}
                                handleSuggestionClick={handleSuggestionClick}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto py-2">
                            <nav className="flex flex-col">
                                {[
                                    { to: "/shop", label: "Shop" },
                                    { to: "/about-us", label: "About Us" },
                                ].map((item, index) => (
                                    <Link 
                                        key={item.to}
                                        to={item.to} 
                                        onClick={handleCloseOffcanvas}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        className="stagger-item px-5 py-3 !text-[#7A8450] text-sm font-bold border-b border-gray-100 hover:bg-gray-50 hover:pl-7 transition-all duration-300 flex justify-between items-center group !no-underline"
                                    >
                                        {item.label}
                                        <span className="text-gray-300 group-hover:text-[#7A8450] text-xs transition-colors">→</span>
                                    </Link>
                                ))}
                                <button 
                                    onClick={() => { handleCloseOffcanvas(); setShowStoreModal(true); }}
                                    style={{ animationDelay: '200ms' }}
                                    className="stagger-item w-full text-left px-5 py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:bg-gray-50 hover:text-[#7A8450] hover:pl-7 transition-all duration-300 flex justify-between items-center group bg-transparent border-none"
                                >
                                    <span className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 group-hover:text-[#7A8450] transition-colors" />
                                        Find a Store
                                    </span>
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col gap-3">
                                {/* UPDATED: Opens internal modal */}
                                <LoginDropdown 
                                    onLoginClick={() => { handleCloseOffcanvas(); setShowLoginModal(true); }} 
                                    theme="light" 
                                    customClass="w-full flex justify-center bg-white border border-gray-200 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all text-sm"
                                />
                            </div>
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>

                {/* Store Modal */}
                <Modal show={showStoreModal} onHide={() => setShowStoreModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="flex items-center text-[#7A8450] font-bold text-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <FontAwesomeIcon icon={faLocationDot} className="mr-2 bounce" />
                            Visit Our Store
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-3">
                        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-100 transform transition-all hover:scale-[1.01] duration-500">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.207433463813!2d77.7095!3d8.7139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f1ae0c3e8e2d%3A0xbdf9ea9d95c0b2f8!2sNew%20Bus%20Stand%2C%20Tirunelveli!"
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Store Location Map"
                            ></iframe>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="outline-secondary" size="sm" onClick={() => setShowStoreModal(false)}>Close</Button>
                    </Modal.Footer>
                </Modal>

                {/* --- LOGIN FORM MODAL (Rendered Here) --- */}
                <LoginFormModal 
                    show={showLoginModal} 
                    handleClose={() => setShowLoginModal(false)} 
                />

            </header>

            {/* Spacer Div */}
            <div className="h-[90px] lg:h-[100px] w-full bg-transparent"></div>
        </>
    );
}

export default Navbar;