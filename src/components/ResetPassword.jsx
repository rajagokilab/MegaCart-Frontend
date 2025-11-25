import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const API_BASE = import.meta.env.VITE_API_URL;
const OLIVE_THEME = { main: '#7A8450', dark: '#5F673C', light: '#F0F2E9' };

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  // We ask for email here so we can pass it to the Login screen later
  const [email, setEmail] = useState(''); 
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== reNewPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        setLoading(false);
        return;
    }

    try {
      // Note: The API technically doesn't need the email to reset (it uses UID/Token), 
      // but we collected it to help the user login immediately after.
      await axios.post(`${API_BASE}/auth/users/reset_password_confirm/`, {
        uid,
        token,
        new_password: newPassword,
        re_new_password: reNewPassword,
      });

      setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
      
      // --- THE KEY FIX ---
      // We navigate back and pass BOTH the email and the new password
      setTimeout(() => {
        navigate('/', { 
            state: { 
                openLogin: true,           // Tells HomePage to open the modal
                email: email,              // <--- PASS EMAIL BACK
                prefillPassword: newPassword, // <--- PASS PASSWORD BACK
                message: "Password changed! Please log in."
            } 
        });
      }, 1500);

    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Invalid link or expired token. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold" style={{ color: OLIVE_THEME.dark }}>
            Reset Password
          </h2>
          <p className="text-gray-500 text-sm mt-2">Enter your email and choose a new password.</p>
        </div>

        {message && (
          <div className={`p-3 rounded mb-6 text-center text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. EMAIL FIELD (Added so we can pass it back to login) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Email</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-olive-500 focus:border-olive-500 sm:text-sm p-2.5 border"
                    placeholder="name@example.com"
                    required
                />
            </div>
          </div>

          {/* 2. NEW PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FontAwesomeIcon icon={faLock} />
                </div>
                <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 rounded-md border-gray-300 shadow-sm focus:ring-olive-500 focus:border-olive-500 sm:text-sm p-2.5 border"
                    required
                />
                 <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowPass(!showPass)}>
                    <FontAwesomeIcon icon={faEye} />
                 </button>
            </div>
          </div>

          {/* 3. CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FontAwesomeIcon icon={faLock} />
                </div>
                <input
                    type="password"
                    value={reNewPassword}
                    onChange={(e) => setReNewPassword(e.target.value)}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-olive-500 focus:border-olive-500 sm:text-sm p-2.5 border"
                    required
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: OLIVE_THEME.main }}
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;