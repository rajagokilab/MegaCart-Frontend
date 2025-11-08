import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronRight, faUserCircle, faTruck } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
// 1. Import the useUser hook
import { useUser } from '../context/UserContext.jsx'; 

const VENDOR_GREEN = '#62AA46';

function LoginDropdown({ onLoginClick }) { 
    const [isOpen, setIsOpen] = useState(false);
    
    // 2. Get user and logout function from the context
    const { user, logout } = useUser(); 

    // 3. We no longer need local 'user' state or the useEffect
    const [timeoutId, setTimeoutId] = useState(null);

    const handleTriggerClick = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsOpen(!isOpen);
    };

    const handleMouseEnter = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        if (!isOpen) setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (user) {
            setIsOpen(false);
            return;
        }
        const id = setTimeout(() => setIsOpen(false), 300);
        setTimeoutId(id);
    };

    const handleLoginCtaClick = () => {
        if (onLoginClick) onLoginClick(); 
    };

    // 4. This is now much simpler!
    const handleLogout = () => {
        logout(); // This calls the context's logout function
        setIsOpen(false);
        // No window.location.reload() needed!
    };

    return (
        <div 
            className="text-center mx-3 position-relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                className="d-flex flex-column align-items-center" 
                onClick={handleTriggerClick} 
                style={{ cursor: 'pointer' }}
            >
                <FontAwesomeIcon icon={faUser} size="lg" className="mb-1 text-success" />
                <span className="text-decoration-none text-dark small">
                    {/* 5. This 'user' is now from the context and always up-to-date */}
                    {user ? user.username || user.email : 'Log in'}
                </span>
            </div>

            {isOpen && (
                <div 
                    className="position-absolute bg-white p-4 shadow-lg rounded"
                    style={{ zIndex: 1050, top: '100%', right: '-50%', minWidth: '300px' }}
                >
                    {!user ? (
                        <>
                            <button 
                                className="btn btn-block w-100 py-2 rounded"
                                style={{ backgroundColor: VENDOR_GREEN, color: 'white', fontWeight: 'bold' }}
                                onClick={handleLoginCtaClick} 
                            >
                                Log in
                            </button>
                            <p className="mt-3 mb-4 text-center small">
                                Don't have an account? <a href="#" className="text-decoration-none fw-bold text-success" onClick={handleLoginCtaClick}>Register here</a>
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="small text-center mb-2">Logged in as <strong>{user.username || user.email}</strong></p>
                            <button 
                                className="btn btn-block w-100 py-2 rounded mb-3"
                                style={{ backgroundColor: '#d9534f', color: 'white', fontWeight: 'bold' }}
                                onClick={handleLogout}
                            >
                                Log out
                            </button>
                        </>
                    )}

                    <hr className="my-2" />

                    <div className="list-group list-group-flush mt-3">
                        {[ 
                            { icon: faUserCircle, text: 'My page', path: '/my-page' },
                            { icon: faTruck, text: 'My Orders', path: '/my-orders' },
                        ].map((item, index) => (
                            <Link 
                                key={index} 
                                to={item.path} 
                                className="list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center p-2 bg-white"
                                onClick={() => setIsOpen(false)} // Close dropdown on click
                            >
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={item.icon} className="me-3 text-dark" />
                                    <span>{item.text}</span>
                                </div>
                                <FontAwesomeIcon icon={faChevronRight} className="small text-muted" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginDropdown;