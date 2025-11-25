// src/components/LoginFormModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; 
import { useUser } from '../context/UserContext'; // <--- 1. IMPORT CONTEXT
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimes, faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// --- THEME ---
const OLIVE_THEME = {
  main: '#7A8450',
  dark: '#5F673C',
  light: '#F0F2E9',
};

// --- Views ---
const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password'
};

// --- API base ---
const API_BASE = import.meta.env.VITE_API_URL;

// --- API Calls ---
const apiLogin = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/jwt/create/`, { email, password });
    const { access, refresh } = response.data;
    const userResponse = await axios.get(`${API_BASE}/auth/users/me/`, {
      headers: { Authorization: `JWT ${access}` }
    });
    return { success: true, token: access, refresh, user: userResponse.data };
  } catch (err) {
    return { success: false, message: 'Incorrect email or password.' };
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
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.email?.[0] 
                 || err.response?.data?.password?.[0] 
                 || 'Registration failed';
    return { success: false, message };
  }
};

const apiResetPassword = async ({ email }) => {
  try {
    await axios.post(`${API_BASE}/auth/users/reset_password/`, { email });
    return { success: true, message: 'If an account exists, a reset link has been sent to your email.' };
  } catch {
    return { success: false, message: 'Failed to send reset email. Try again later.' };
  }
};

// --- Component ---
function LoginFormModal({ show, handleClose, onLoginSuccess }) {
  const { login } = useUser(); // <--- 2. USE CONTEXT LOGIN FUNCTION
  const [view, setView] = useState(VIEWS.LOGIN);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  
  // UI State
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hook to read data passed from ResetPasswordConfirm page
  const location = useLocation();

  // 3. RESET OR PRE-FILL WHEN MODAL OPENS
  useEffect(() => {
    if (show) {
        // Default state
        setIsLoading(false);
        setMessage(null);

        // CHECK: Did we come from the Reset Password Page?
        if (location.state?.prefillPassword || location.state?.message) {
            setView(VIEWS.LOGIN);
            // Pre-fill fields if provided (passed from Step 2)
            if (location.state.email) setEmail(location.state.email);
            if (location.state.prefillPassword) setPassword(location.state.prefillPassword);
            
            // Show success message
            setMessage({ 
                type: 'success', 
                text: location.state.message || 'Password updated successfully! Please login.' 
            });
            
            // Clear the location state so it doesn't persist on refresh
            window.history.replaceState({}, document.title);
        } else {
            // --- 4. FIX: CLEAR FORM FOR NEW LOGIN ---
            // This fixes the issue where you can't login as a different user
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setStoreName('');
            setView(VIEWS.LOGIN);
        }
    } 
  }, [show, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    let result = null;

    try {
      if (view === VIEWS.LOGIN) {
        if (!email || !password) {
          setMessage({ type: 'error', text: 'Please fill in email and password.' });
          setIsLoading(false);
          return;
        }
        result = await apiLogin({ email, password });
        if (result.success) {
          // --- 5. FIX: USE CONTEXT LOGIN ---
          // This ensures Navbar updates immediately and tokens are saved correctly
          login(result.user, result.token, result.refresh);

          setMessage({ type: 'success', text: 'Login successful!' });
          if (onLoginSuccess) onLoginSuccess(result.user);
          
          // Delay closing slightly so user sees success
          setTimeout(() => {
              handleClose();
              setPassword(''); // Clear password for security
          }, 1000);
        } else {
             setMessage({ type: 'error', text: result.message });
        }
      } else if (view === VIEWS.REGISTER) {
        if (!email || !password || !confirmPassword || (!isPrivate && !storeName)) {
          setMessage({ type: 'error', text: 'Please fill all required fields.' });
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match.' });
          setIsLoading(false);
          return;
        }
        const username = isPrivate ? email.split('@')[0] : storeName;
        result = await apiRegister({ email, username, password, confirmPassword, storeName, isPrivate });
        if (result.success) {
          setMessage({ type: 'success', text: 'Registration successful! Please log in.' });
          setView(VIEWS.LOGIN);
          setPassword(''); setConfirmPassword('');
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } else if (view === VIEWS.FORGOT_PASSWORD) {
        if (!email) {
          setMessage({ type: 'error', text: 'Please enter your email address.' });
          setIsLoading(false);
          return;
        }
        result = await apiResetPassword({ email });
        setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  const isLogin = view === VIEWS.LOGIN;
  const isRegister = view === VIEWS.REGISTER;
  const isForgot = view === VIEWS.FORGOT_PASSWORD;

  const formInputClasses = (hasError = false) =>
    `block w-full rounded-md shadow-sm sm:text-sm ${hasError ? 'border-red-500' : 'border-gray-300'} focus:ring-[${OLIVE_THEME.main}] focus:border-[${OLIVE_THEME.main}] p-2 border`;
  const formLabelClasses = "block text-sm font-medium text-gray-700 mb-1";

  const getTitle = () => isRegister ? 'Create Account' : isForgot ? 'Reset Password' : 'Welcome Back';

  return (
    <>
      <div 
        className="fixed inset-0 z-40 animate-in fade-in-0 duration-300"
        style={{ backgroundColor: 'rgba(40, 50, 10, 0.85)' }} 
        onClick={handleClose} 
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in-0 zoom-in-95 duration-300 pointer-events-auto">
          
          <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          <div className="text-center mb-5 mt-2">
            <h2 className="text-3xl font-bold" style={{ color: OLIVE_THEME.dark }}>VETRICART</h2>
            <h5 className="mt-3 text-sm font-semibold uppercase text-gray-400 tracking-wider">{getTitle()}</h5>
          </div>

          {message && (
            <div className={`p-3 rounded-md mb-4 text-sm ${message.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' : 'border'}`}
              style={{
                backgroundColor: message.type === 'success' ? OLIVE_THEME.light : undefined,
                borderColor: message.type === 'success' ? OLIVE_THEME.main : undefined,
                color: message.type === 'success' ? OLIVE_THEME.dark : undefined
              }}>
              {message.text}
            </div>
          )}

          {isRegister && (
            <div className="flex w-full max-w-xs mx-auto mb-5 p-1 rounded-full" style={{ backgroundColor: OLIVE_THEME.light }}>
              <button type="button" className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all ${isPrivate ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setIsPrivate(true)} style={{ color: isPrivate ? OLIVE_THEME.dark : undefined }}>Private</button>
              <button type="button" className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all ${!isPrivate ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setIsPrivate(false)} style={{ color: !isPrivate ? OLIVE_THEME.dark : undefined }}>Business</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={formLabelClasses}>Email</label>
              <input type="email" className={formInputClasses()} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            {!isForgot && (
              <div>
                <label className={formLabelClasses}>Password</label>
                <div className="relative">
                  <input type={passwordVisible ? 'text' : 'password'} className={`${formInputClasses()} pr-10`} value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600" onClick={() => setPasswordVisible(!passwordVisible)}>
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <>
                <div>
                  <label className={formLabelClasses}>Confirm Password</label>
                  <input type="password" className={formInputClasses(password !== confirmPassword && confirmPassword.length > 0)} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  {password !== confirmPassword && confirmPassword.length > 0 && <small className="text-red-600">Passwords must match.</small>}
                </div>
                {!isPrivate && (
                  <div>
                    <label className={formLabelClasses}>Store Name</label>
                    <input type="text" className={formInputClasses()} value={storeName} onChange={e => setStoreName(e.target.value)} required />
                  </div>
                )}
              </>
            )}

            <button type="submit" className="w-full flex justify-center items-center py-3 px-4 text-white font-bold rounded-md shadow-sm transition-colors hover:opacity-90" style={{ backgroundColor: OLIVE_THEME.main }} disabled={isLoading}>
              {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : isRegister ? 'Register' : isForgot ? 'Send Reset Link' : 'Log In'}
            </button>

            {isLogin && (
              <div className="text-center mt-2">
                <a href="#" onClick={e => { e.preventDefault(); setView(VIEWS.FORGOT_PASSWORD); setMessage(null); }} className="text-sm font-medium hover:underline" style={{ color: OLIVE_THEME.main }}>Forgot Password?</a>
              </div>
            )}

            {isForgot && (
              <button type="button" onClick={() => { setView(VIEWS.LOGIN); setMessage(null); }} className="w-full text-center text-sm text-gray-600 hover:underline flex items-center justify-center gap-2 mt-2">
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
              </button>
            )}

            {!isForgot && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {isLogin ? <>Don't have an account? </> : <>Already registered? </>}
                <a href="#" onClick={e => { e.preventDefault(); setView(isLogin ? VIEWS.REGISTER : VIEWS.LOGIN); setEmail(''); setPassword(''); setMessage(null); }} className="font-medium hover:underline" style={{ color: OLIVE_THEME.main }}>
                  {isLogin ? 'Register' : 'Log in'}
                </a>
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginFormModal;