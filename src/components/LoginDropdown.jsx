import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronRight, faUserCircle, faTruck } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext.jsx';

// Olive theme colors
const THEME_OLIVE = '#556B2F';
const THEME_OLIVE_HOVER = '#4A5D27';

function LoginDropdown({ onLoginClick }) {
    const { user, logout } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseEnter = () => {
        if (window.innerWidth < 992) return;
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        if (!isOpen) setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (window.innerWidth < 992) return;
        const id = setTimeout(() => setIsOpen(false), 300);
        setTimeoutId(id);
    };

    const handleTriggerClick = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsOpen(!isOpen);
    };

    const handleLoginCtaClick = () => {
        if (onLoginClick) onLoginClick();
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <div
            className="relative text-center z-50" // Added z-50 for better visibility
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Trigger Icon (white profile icon) */}
            <div
                className="flex items-center cursor-pointer"
                onClick={handleTriggerClick}
            >
                <FontAwesomeIcon icon={faUser} className="text-xl text-white" />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute bg-white p-3 shadow-lg rounded-lg z-[100] top-full mt-2 right-0 w-full lg:w-[300px] lg:max-w-[300px] lg:-right-1/2"
                    onMouseEnter={handleMouseEnter}
                >
                    {!user ? (
                        // --- GUEST VIEW (Not Logged In) ---
                        <>
                            <button
                                className="w-full py-2 rounded-md font-bold text-white"
                                style={{ backgroundColor: THEME_OLIVE }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = THEME_OLIVE_HOVER}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME_OLIVE}
                                onClick={handleLoginCtaClick}
                            >
                                Log in
                            </button>
                            <p className="mt-3 mb-4 text-center text-sm text-[#556B2F] font-bold">
                                Welcome to VetriCart
                            </p>
                        </>
                    ) : (
                        // --- LOGGED IN VIEW ---
                        <>
                            <p className="text-sm text-center mb-2 text-[#556B2F]">
                                Logged in as <strong>{user.username || user.email}</strong>
                            </p>

                            <hr className="border-t my-2 border-gray-300" />

                            {/* MENU LINKS (Only visible when logged in) */}
                            <div className="mt-3 space-y-1 ">
                                {[
                                    { icon: faUserCircle, text: 'My page', path: '/my-page' },
                                    { icon: faTruck, text: 'My Orders', path: '/my-orders' },
                                ].map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.path}
                                        className="flex justify-between items-center p-2 rounded-md hover:bg-[#f0f5eb] text-[#556B2F] no-underline text-sm"
                                        onClick={() => setIsOpen(false)}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={item.icon} className="mr-3 w-5 text-[#556B2F]" />
                                            <span>{item.text}</span>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-sm text-[#556B2F]" />
                                    </Link>
                                ))}
                            </div>

                            <hr className="border-t my-2 border-gray-300" />

                            <button
                                className="w-full py-2 rounded-md font-bold text-white mt-2"
                                style={{ backgroundColor: THEME_OLIVE }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = THEME_OLIVE_HOVER}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME_OLIVE}
                                onClick={handleLogout}
                            >
                                Log out
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default LoginDropdown;