import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; 
import { useUser } from '../context/UserContext'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimes, faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// --- THEME ---
const OLIVE_THEME = {
  main: '#7A8450',
  dark: '#5F673C',
  light: '#F0F2E9',
};

const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password'
};

const API_BASE = import.meta.env.VITE_API_URL;

// --- API FUNCTIONS ---

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

const apiRegister = async ({ email, username, password, confirmPassword, storeName, isPrivate, businessId, kycFile }) => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('re_password', confirmPassword);
    formData.append('role', isPrivate ? 'CUSTOMER' : 'VENDOR');
    
    if (!isPrivate) {
        formData.append('store_name', storeName);
        formData.append('business_reg_id', businessId);
        // Append the file if it exists
        if (kycFile) {
            formData.append('kyc_document', kycFile); 
        }
    }

    // ✅ CORRECT URL: Removes the extra '/api' if API_BASE already has it.
    // Result: http://127.0.0.1:8000/api/users/register/
    await axios.post(`${API_BASE}/users/register/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    
    return { success: true };
  } catch (err) {
    console.error("Registration Error:", err.response); 
    const message = err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || 'Registration failed';
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
  const { login } = useUser(); 
  const [view, setView] = useState(VIEWS.LOGIN);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [businessId, setBusinessId] = useState('');
  const [kycFile, setKycFile] = useState(null);
  
  // UI State
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (show) {
        setIsLoading(false);
        setMessage(null);
        if (location.state?.prefillPassword || location.state?.message) {
            setView(VIEWS.LOGIN);
            if (location.state.email) setEmail(location.state.email);
            if (location.state.prefillPassword) setPassword(location.state.prefillPassword);
            setMessage({ type: 'success', text: location.state.message || 'Password updated successfully!' });
            window.history.replaceState({}, document.title);
        } else {
            // Reset form
            setEmail(''); setPassword(''); setConfirmPassword('');
            setStoreName(''); setBusinessId(''); setKycFile(null);
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
        if (!email || !password) { setMessage({ type: 'error', text: 'Please fill in email and password.' }); setIsLoading(false); return; }
        result = await apiLogin({ email, password });
        if (result.success) {
          login(result.user, result.token, result.refresh);
          setMessage({ type: 'success', text: 'Login successful!' });
          if (onLoginSuccess) onLoginSuccess(result.user);
          setTimeout(() => { handleClose(); setPassword(''); }, 1000);
        } else { setMessage({ type: 'error', text: result.message }); }

      } else if (view === VIEWS.REGISTER) {
        if (!email || !password || !confirmPassword) { setMessage({ type: 'error', text: 'Fill all required fields.' }); setIsLoading(false); return; }
        if (!isPrivate && (!storeName || !businessId || !kycFile)) { setMessage({ type: 'error', text: 'Provide Store Name, ID, and Document.' }); setIsLoading(false); return; }
        if (password !== confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match.' }); setIsLoading(false); return; }
        
        const username = isPrivate ? email.split('@')[0] : storeName;
        result = await apiRegister({ email, username, password, confirmPassword, storeName, isPrivate, businessId, kycFile });
        
        if (result.success) {
          setMessage({ type: 'success', text: 'Registration successful! Please log in.' });
          setView(VIEWS.LOGIN); setPassword(''); setConfirmPassword(''); setKycFile(null);
        } else { setMessage({ type: 'error', text: result.message }); }

      } else if (view === VIEWS.FORGOT_PASSWORD) {
        if (!email) { setMessage({ type: 'error', text: 'Enter your email.' }); setIsLoading(false); return; }
        result = await apiResetPassword({ email });
        setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      }
    } catch { setMessage({ type: 'error', text: 'Network error.' }); } finally { setIsLoading(false); }
  };

  if (!show) return null;

  const isLogin = view === VIEWS.LOGIN;
  const isRegister = view === VIEWS.REGISTER;
  const isForgot = view === VIEWS.FORGOT_PASSWORD;

  const formInputClasses = (hasError = false) => `block w-full rounded-md shadow-sm text-base sm:text-sm ${hasError ? 'border-red-500' : 'border-gray-300'} focus:ring-[${OLIVE_THEME.main}] focus:border-[${OLIVE_THEME.main}] p-2.5 sm:p-2 border`;
  const formLabelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const getTitle = () => isRegister ? 'Create Account' : isForgot ? 'Reset Password' : 'Welcome Back';

  return (
    <>
      <div className="fixed inset-0 z-40 animate-in fade-in-0 duration-300" style={{ backgroundColor: 'rgba(40, 50, 10, 0.85)' }} onClick={handleClose} />
      
      {/* Container to center modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Modal Card */}
        <div className="relative bg-white rounded-xl shadow-2xl text-left w-full max-w-md flex flex-col max-h-[90vh] animate-in fade-in-0 zoom-in-95 duration-300">
            
            {/* 1. FIXED HEADER */}
            <div className="p-6 pb-2 sm:p-8 sm:pb-2 flex-shrink-0">
                <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2" onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: OLIVE_THEME.dark }}>VETRICART</h2>
                    <h5 className="mt-2 text-xs sm:text-sm font-semibold uppercase text-gray-400 tracking-wider">{getTitle()}</h5>
                </div>
                 {/* Error/Success Messages */}
                {message && (
                <div className={`mt-4 p-3 rounded-md text-sm break-words ${message.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' : 'border'}`}
                    style={{ backgroundColor: message.type === 'success' ? OLIVE_THEME.light : undefined, borderColor: message.type === 'success' ? OLIVE_THEME.main : undefined, color: message.type === 'success' ? OLIVE_THEME.dark : undefined }}>
                    {message.text}
                </div>
                )}
            </div>

            {/* FORM WRAPPER */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden px-6 sm:px-8 pb-6 sm:pb-8">
                
                {/* 2. SCROLLABLE BODY (Inputs Only) */}
                <div className="overflow-y-auto max-h-[55vh] pr-2 -mr-2 space-y-4 pt-2">
                    
                    {isRegister && (
                    <div className="flex w-full max-w-xs mx-auto mb-4 p-1 rounded-full sticky top-0 z-10" style={{ backgroundColor: OLIVE_THEME.light }}>
                        <button type="button" className={`w-1/2 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${isPrivate ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setIsPrivate(true)} style={{ color: isPrivate ? OLIVE_THEME.dark : undefined }}>Private</button>
                        <button type="button" className={`w-1/2 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${!isPrivate ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setIsPrivate(false)} style={{ color: !isPrivate ? OLIVE_THEME.dark : undefined }}>Business</button>
                    </div>
                    )}

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
                        {password !== confirmPassword && confirmPassword.length > 0 && <small className="text-red-600 block mt-1">Passwords must match.</small>}
                        </div>
                        
                        {/* ⭐️ The Business KYC Section */}
                        {!isPrivate && (
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 space-y-3 mt-4">
                            <h6 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Business KYC Details</h6>
                            <div>
                                <label className={formLabelClasses}>Store Name</label>
                                <input type="text" className={formInputClasses()} value={storeName} onChange={e => setStoreName(e.target.value)} required placeholder="e.g. Green Valley Organics" />
                            </div>
                            <div>
                                <label className={formLabelClasses}>Business Reg. / Tax ID</label>
                                <input type="text" className={formInputClasses()} value={businessId} onChange={e => setBusinessId(e.target.value)} required placeholder="GSTIN, EIN, or License No." />
                            </div>
                            <div>
                                <label className={formLabelClasses}>Upload Document</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setKycFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 cursor-pointer" required />
                                <small className="text-xs text-gray-500 block mt-1">Business License, Tax Cert (PDF/Image)</small>
                            </div>
                        </div>
                        )}
                    </>
                    )}
                </div>

                {/* 3. FIXED FOOTER (Button & Links) */}
                <div className="mt-4 pt-2 border-t border-gray-100 flex-shrink-0">
                    <button type="submit" className="w-full flex justify-center items-center py-3 px-4 text-white font-bold rounded-md shadow-sm transition-colors hover:opacity-90 text-sm sm:text-base" style={{ backgroundColor: OLIVE_THEME.main }} disabled={isLoading}>
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : isRegister ? 'Register' : isForgot ? 'Send Reset Link' : 'Log In'}
                    </button>

                    {isLogin && (
                        <div className="text-center mt-3">
                        <a href="#" onClick={e => { e.preventDefault(); setView(VIEWS.FORGOT_PASSWORD); setMessage(null); }} className="text-sm font-medium hover:underline p-2" style={{ color: OLIVE_THEME.main }}>Forgot Password?</a>
                        </div>
                    )}

                    {isForgot && (
                        <button type="button" onClick={() => { setView(VIEWS.LOGIN); setMessage(null); }} className="w-full text-center text-sm text-gray-600 hover:underline flex items-center justify-center gap-2 mt-4 p-2">
                        <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                        </button>
                    )}

                    {!isForgot && (
                        <p className="text-center text-sm text-gray-600 mt-4">
                        {isLogin ? "Don't have an account? " : "Already registered? "}
                        <a href="#" onClick={e => { e.preventDefault(); setView(isLogin ? VIEWS.REGISTER : VIEWS.LOGIN); setEmail(''); setPassword(''); setMessage(null); }} className="font-medium hover:underline p-1" style={{ color: OLIVE_THEME.main }}>
                            {isLogin ? 'Register' : 'Log in'}
                        </a>
                        </p>
                    )}
                </div>
            </form>
        </div>
      </div>
    </>
  );
}



export default LoginFormModal;
