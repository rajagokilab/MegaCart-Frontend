import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronRight, faUserCircle, faTruck, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext.jsx';

// Olive theme colors
const THEME_OLIVE = '#7A8450';
const THEME_OLIVE_HOVER = '#5F673C';

function LoginDropdown({ onLoginClick, theme = 'dark', customClass = '' }) {
    const { user, logout } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    let timeoutId = null;

    // Theme Logic: 'dark' means white text (for dark background), 'light' means olive text
    const iconColor = theme === 'dark' ? 'text-white' : 'text-[#7A8450]';
    const containerClass = theme === 'dark' ? '' : 'border border-gray-200 bg-white rounded-full p-2 shadow-sm';

    // Desktop Hover Handlers
    const handleMouseEnter = () => {
        if (window.innerWidth >= 992) {
            if (timeoutId) clearTimeout(timeoutId);
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (window.innerWidth >= 992) {
            timeoutId = setTimeout(() => setIsOpen(false), 300);
        }
    };

    // Mobile/Click Handler
    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleAction = (action) => {
        setIsOpen(false);
        if (action) action();
    };

    return (
        <div
            className={`relative z-50 ${customClass}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* 1. Backdrop for Mobile (Click outside to close) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-transparent lg:hidden" 
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* 2. Trigger Icon */}
            <div
                className={`cursor-pointer flex items-center justify-center transition-transform active:scale-95 ${containerClass}`}
                onClick={toggleOpen}
            >
                <FontAwesomeIcon icon={faUser} className={`text-lg sm:text-xl ${iconColor}`} />
            </div>

            {/* 3. Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95"
                >
                    {/* Arrow tip */}
                    <div className="absolute top-0 right-3 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45 -translate-y-1.5"></div>

                    <div className="relative z-10 p-4">
                        {!user ? (
                            // --- GUEST VIEW ---
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-3 font-medium">Welcome to VetriCart</p>
                                <button
                                    className="w-full py-2.5 rounded-lg font-bold text-white shadow-md transition-colors"
                                    style={{ backgroundColor: THEME_OLIVE }}
                                    onClick={() => handleAction(onLoginClick)}
                                >
                                    Log In / Sign Up
                                </button>
                            </div>
                        ) : (
                            // --- LOGGED IN VIEW ---
                            <div>
                                <div className="text-center mb-3 border-b border-gray-100 pb-3">
                                    <div className="w-10 h-10 bg-[#F0F2E9] rounded-full flex items-center justify-center mx-auto mb-2 text-[#7A8450]">
                                        <FontAwesomeIcon icon={faUser} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 truncate px-2">
                                        {user.username || user.email}
                                    </p>
                                    <p className="text-xs text-[#7A8450] font-medium">{user.role || 'Customer'}</p>
                                </div>

                                <div className="space-y-1">
                                    <Link
                                        to="/my-page"
                                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F0F2E9] text-gray-700 transition-colors group no-underline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FontAwesomeIcon icon={faUserCircle} className="text-[#7A8450]" />
                                            <span className="text-sm font-medium">My Profile</span>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400 group-hover:text-[#7A8450]" />
                                    </Link>

                                    <Link
                                        to="/my-orders"
                                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F0F2E9] text-gray-700 transition-colors group no-underline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FontAwesomeIcon icon={faTruck} className="text-[#7A8450]" />
                                            <span className="text-sm font-medium">My Orders</span>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400 group-hover:text-[#7A8450]" />
                                    </Link>
                                </div>

                                <div className="mt-3 pt-2 border-t border-gray-100">
                                    <button
                                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={() => handleAction(logout)}
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginDropdown;