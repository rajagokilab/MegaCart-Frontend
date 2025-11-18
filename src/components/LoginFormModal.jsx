// LoginFormModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { setSessionData } from "./auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner

// --- THEME ---
const OLIVE_THEME = {
  main: '#7A8450',
  dark: '#5F673C',
  light: '#F0F2E9',
};

// --- Constants ---
const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register'
};

// --- API base ---
const API_BASE = import.meta.env.VITE_API_URL;

// --- API Functions (Unchanged) ---
const apiLogin = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/jwt/create/`, { email, password });
    const { access, refresh } = response.data;
    const userResponse = await axios.get(`${API_BASE}/auth/users/me/`, {
      headers: { Authorization: `JWT ${access}` }
    });
    return { success: true, token: access, refresh, user: userResponse.data };
  } catch (err) {
    if (err.response && err.response.status === 401) {
      return { success: false, message: 'Incorrect email or password.' };
    }
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

    // --- Validation (Unchanged) ---
    if (isRegister) {
        if (!email || !password || !confirmPassword || (isVendor && !storeName)) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
    } else if (!email || !password) {
        setMessage({ type: 'error', text: 'Please fill in both email and password.' });
        return;
    }
    // --- End Validation ---

    setIsLoading(true);

    // --- Core Registration/Login Logic (Unchanged) ---
    let result = null; 
    try {
      if (view === VIEWS.LOGIN) {
        result = await apiLogin({ email, password });
      } else { // VIEWS.REGISTER
        if (isVendor) {
            derivedUsername = storeName;
        } else {
            derivedUsername = email.split('@')[0];
        }
        result = await apiRegister({ 
            email, 
            username: derivedUsername,
            password, 
            confirmPassword, 
            storeName, 
            isPrivate 
        });
      }

      // --- Handle Result (Unchanged) ---
      if (result.success) {
        if (view === VIEWS.REGISTER) {
          setMessage({ type: 'success', text: 'Registration successful! Please log in.' });
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

  // --- Tailwind Form Classes ---
  const formInputClasses = (hasError = false) => {
    return `block w-full rounded-md shadow-sm sm:text-sm ${
        hasError ? 'border-red-500' : 'border-gray-300'
    } focus:ring-[${OLIVE_THEME.main}] focus:border-[${OLIVE_THEME.main}]`;
  };
  const formLabelClasses = "block text-sm font-medium text-gray-700";

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 animate-in fade-in-0 duration-300"
        style={{ backgroundColor: 'rgba(40, 50, 10, 0.85)' }} // Dark Olive backdrop
        onClick={handleClose} 
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in-0 zoom-in-95 duration-300">

          {/* Close button */}
          <button 
            type="button" 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={handleClose}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          {/* Header */}
          <div className="text-center mb-5 mt-2">
            <h2 className="text-3xl font-bold" style={{ color: OLIVE_THEME.dark }}>
              VETRICART
            </h2>
            <h5 className="mt-3 text-sm font-semibold uppercase text-gray-400 tracking-wider">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h5>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-md mb-4 text-sm ${
              message.type === 'error' 
              ? 'bg-red-100 border border-red-300 text-red-800' 
              : `border`
            }`}
            style={{
              backgroundColor: message.type === 'success' ? OLIVE_THEME.light : undefined,
              borderColor: message.type === 'success' ? OLIVE_THEME.main : undefined,
              color: message.type === 'success' ? OLIVE_THEME.dark : undefined,
            }}
            >
              {message.text}
            </div>
          )}

          {/* Private/Business Toggle */}
          {isRegister && (
            <div className="flex w-full max-w-xs mx-auto mb-5 p-1 rounded-full" style={{ backgroundColor: OLIVE_THEME.light }}>
              <button 
                type="button" 
                className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all ${isPrivate ? 'bg-white shadow' : 'text-gray-600'}`}
                onClick={() => setIsPrivate(true)}
                style={{ color: isPrivate ? OLIVE_THEME.dark : undefined }}
              >
                Private
              </button>
              <button 
                type="button" 
                className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all ${!isPrivate ? 'bg-white shadow' : 'text-gray-600'}`}
                onClick={() => setIsPrivate(false)}
                style={{ color: !isPrivate ? OLIVE_THEME.dark : undefined }}
              >
                Business
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={formLabelClasses}>Email</label>
              <input type="email" className={formInputClasses()} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className={formLabelClasses}>Password</label>
              <div className="relative">
                <input 
                  type={passwordVisible ? 'text' : 'password'} 
                  className={`${formInputClasses()} pr-10`}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className={formLabelClasses}>Confirm Password</label>
                  <input 
                    type="password" 
                    className={formInputClasses(password !== confirmPassword && confirmPassword.length > 0)} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                  />
                  {password !== confirmPassword && confirmPassword.length > 0 && (
                    <small className="text-red-600">Passwords must match.</small>
                  )}
                </div>

                {isVendor && (
                  <div>
                    <label className={formLabelClasses}>Store Name (Will be your Username)</label>
                    <input type="text" className={formInputClasses()} value={storeName} onChange={e => setStoreName(e.target.value)} required />
                  </div>
                )}
              </>
            )}

            <button 
              type="submit" 
              className="w-full flex justify-center items-center py-3 px-4 text-white font-bold rounded-md shadow-sm transition-colors duration-200 disabled:bg-gray-400"
              style={{ 
                backgroundColor: OLIVE_THEME.main,
                '--hover-bg': OLIVE_THEME.dark
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = OLIVE_THEME.dark}
              onMouseOut={e => e.currentTarget.style.backgroundColor = OLIVE_THEME.main}
              disabled={isLoading}
            > 
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                isRegister ? 'Register Account' : 'Log in'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              {isLogin
                ? <>Don't have an account? </>
                : <>Already registered? </>}
              <a 
                href="#" 
                onClick={e => { 
                  e.preventDefault(); 
                  setView(isLogin ? VIEWS.REGISTER : VIEWS.LOGIN); 
                  setEmail(''); 
                  setPassword(''); 
                  setMessage(null); 
                }}
                className="font-medium hover:underline"
                style={{ color: OLIVE_THEME.main }}
              >
                {isLogin ? 'Register' : 'Log in'}
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginFormModal;