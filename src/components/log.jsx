import React, { useState } from 'react';
import LoginFormModal from './LoginFormModal.jsx'; // your modal component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronDown } from '@fortawesome/free-solid-svg-icons';

function Log({ currentUser, setCurrentUser }) {
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLoginClick = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('cachedUser');
        setCurrentUser(null);
        setShowDropdown(false);
    };

    return (
        <div className="position-relative">
            {currentUser ? (
                <div className="dropdown">
                    <button 
                        className="btn btn-outline-secondary d-flex align-items-center"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        {currentUser.email}
                        <FontAwesomeIcon icon={faChevronDown} className="ms-1" />
                    </button>
                    {showDropdown && (
                        <div className="dropdown-menu dropdown-menu-end show">
                            <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            ) : (
                <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleLoginClick}>
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Login
                </button>
            )}

            {/* Login Modal */}
            <LoginFormModal 
                show={showModal} 
                handleClose={handleCloseModal} 
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
}

export default Log;
