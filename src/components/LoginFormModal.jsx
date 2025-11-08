// LoginFormModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { setSessionData } from "./auth";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimes } from '@fortawesome/free-solid-svg-icons';

// --- Constants ---
const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register'
};

// --- API base ---
const API_BASE = import.meta.env.VITE_API_URL;


// --- API Functions ---
const apiLogin = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/jwt/create/`, { email, password });
    const { access, refresh } = response.data;

    // Get user details
    const userResponse = await axios.get(`${API_BASE}/auth/users/me/`, {
      headers: { Authorization: `JWT ${access}` }
    });

    return { success: true, token: access, refresh, user: userResponse.data };
  } catch (err) {
    // Handle 401 gracefully and prevent console.error
    if (err.response && err.response.status === 401) {
      return { success: false, message: 'Incorrect email or password.' };
    }

    // Handle other errors
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

const apiRegister = async ({ email, username, password, confirmPassword, storeName, isPrivate }) => {
  try {
    const payload = {
      email,
      username,
      password,
      re_password: confirmPassword,
      role: isPrivate ? 'CUSTOMER' : 'VENDOR',
      // Send the storeName field regardless of role (Django view should handle it)
      store_name: storeName 
    };

    await axios.post(`${API_BASE}/auth/users/`, payload);

    return { success: true, message: 'Registration successful!' };
  } catch (err) {
    return { success: false, message: err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || 'Registration failed' };
  }
};

// --- Component ---
function LoginFormModal({ show, handleClose, onLoginSuccess }) {
  const [view, setView] = useState(VIEWS.LOGIN);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!show) {
      setEmail(''); setPassword(''); setConfirmPassword('');
      setStoreName(''); setMessage(null); setIsLoading(false);
      setView(VIEWS.LOGIN);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    

    const isRegister = view === VIEWS.REGISTER;
    const isVendor = !isPrivate;
    let derivedUsername;

    // --- Validation ---
    if (isRegister) {
        if (!email || !password || !confirmPassword || (isVendor && !storeName)) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
    } else if (!email || !password) { // Login validation
        setMessage({ type: 'error', text: 'Please fill in both email and password.' });
        return;
    }
    // --- End Validation ---

    setIsLoading(true);

    // --- Core Registration/Login Logic ---
    let result = null; 

    try {
      if (view === VIEWS.LOGIN) {
        result = await apiLogin({ email, password });

      } else { // VIEWS.REGISTER
        
        // 🛑 NEW LOGIC: Use storeName as username if it's a vendor account
        if (isVendor) {
            derivedUsername = storeName;
        } else {
            derivedUsername = email.split('@')[0];
        }

        result = await apiRegister({ 
            email, 
            username: derivedUsername, // Pass the derived username
            password, 
            confirmPassword, 
            storeName, 
            isPrivate 
        });
      }

      // --- Handle Result ---
      if (result.success) {
        
        if (view === VIEWS.REGISTER) {
          setMessage({ type: 'success', text: 'Registration successful! Please log in with your new credentials.' });
          setView(VIEWS.LOGIN);
          setPassword(''); 
          setConfirmPassword('');
          setIsLoading(false);
          return;
        } else { // VIEWS.LOGIN
          setSessionData(result.token, result.user, result.refresh);
          setMessage({ type: 'success', text: 'Login successful!' });
          if (onLoginSuccess) onLoginSuccess(result.user);
          window.dispatchEvent(new Event("authChanged"));

          handleClose(); 
        }
        
      } else {
        let errorText = result.message;
        
        if (errorText === 'Incorrect email or password.') {
          errorText = 'Incorrect password. Please check your credentials or register first.';
        }
        
        setMessage({ type: 'error', text: errorText });
      }
    } catch {
      setMessage({ type: 'error', text: 'A network error occurred. Please try again.' });
    } finally {
      if (result === null || !result?.success) {
        setIsLoading(false);
      }
    }
  };

  if (!show) return null;

  const isRegister = view === VIEWS.REGISTER;
  const isLogin = view === VIEWS.LOGIN;
  const isVendor = !isPrivate;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"
        style={{ backgroundColor: '#011F4B', opacity: 0.9 }}
        onClick={handleClose} />

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1" style={{ overflowY: 'auto' }}>
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content p-4" style={{ borderRadius: '8px' }}>

            {/* Close button (Standard Bootstrap) */}
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 m-3" 
              onClick={handleClose}
              aria-label="Close"
            ></button>


            {/* Header */}
            <div className="text-center mb-4 mt-3">
              <h2 className="mb-0 fw-bold" style={{ color: '#0055A0' }}>
                MEGACART <span style={{ color: '#62AA46' }}>{'>'}</span>
              </h2>
              <h5 className="mt-3 text-uppercase text-muted small">{isRegister ? 'Register' : 'Login'}</h5>
            </div>

            {/* Message */}
            {message && (
              <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} mb-4`}>
                {message.text}
              </div>
            )}

            {/* Private/Business Toggle */}
            {isRegister && (
              <div className="btn-group w-100 w-md-75 mx-auto mb-4 p-1 bg-light border" style={{ borderRadius: '25px', borderColor: '#e0e0e0ff' }} role="group">
                <button type="button" className={`btn btn-sm ${isPrivate ? 'bg-white shadow-sm fw-bold' : 'btn-light text-muted'}`} onClick={() => setIsPrivate(true)} style={{ borderRadius: '25px' }}>Private</button>
                <button type="button" className={`btn btn-sm ${!isPrivate ? 'bg-white shadow-sm fw-bold' : 'btn-light text-muted'}`} onClick={() => setIsPrivate(false)} style={{ borderRadius: '25px' }}>Business</button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted">Email</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Password</label>
                <div className="input-group">
                  <input type={passwordVisible ? 'text' : 'password'} className="form-control border-end-0" value={password} onChange={e => setPassword(e.target.value)} required />
                  <span className="input-group-text bg-white border-start-0" style={{ cursor: 'pointer' }} onClick={() => setPasswordVisible(!passwordVisible)}>
                    <FontAwesomeIcon icon={faEye} className="text-muted" />
                  </span>
                </div>
              </div>

              {isRegister && (
                <>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Confirm Password</label>
                    <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    {password !== confirmPassword && confirmPassword.length > 0 && (
                      <small className="text-danger">Passwords must match.</small>
                    )}
                  </div>

                  {isVendor && (
                    <div className="mb-3">
                      <label className="form-label small text-muted">Store Name (Will be your Username)</label>
                      <input type="text" className="form-control" value={storeName} onChange={e => setStoreName(e.target.value)} required />
                    </div>
                  )}
                </>
              )}

              <button type="submit" className="btn w-100 py-2 mb-3"
                style={{
                  backgroundColor: '#62AA46',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                disabled={isLoading}> 
                {isLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : isRegister ? 'Register Account' : 'Log in'}
              </button>

              <p className="text-center small">
                {isLogin
                  ? <>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setView(VIEWS.REGISTER); setEmail(''); setPassword(''); setMessage(null); }}>Register</a></>
                  : <>Already registered? <a href="#" onClick={e => { e.preventDefault(); setView(VIEWS.LOGIN); setEmail(''); setPassword(''); setMessage(null); }}>Log in</a></>}
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginFormModal;