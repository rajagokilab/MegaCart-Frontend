import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';

const API_BASE = import.meta.env.VITE_API_URL;
const OLIVE_THEME = { main: '#7A8450', dark: '#5F673C', light: '#F0F2E9' };

const ResetPasswordConfirm = () => {
  // 1. Get UID and Token from the email link URL
  const { uid, token } = useParams();
  const navigate = useNavigate();

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
      // 2. Send the new password + UID + Token to Djoser
      await axios.post(`${API_BASE}/auth/users/reset_password_confirm/`, {
        uid,
        token,
        new_password: newPassword,
        re_new_password: reNewPassword,
      });

      setMessage({ type: 'success', text: 'Password reset successful!' });
      
      // 3. Navigate back to Home and open Login Modal
      // We pass "state" so the homepage knows to open the login modal
      setTimeout(() => {
        navigate('/', { 
            state: { 
                openLogin: true, 
                prefillPassword: newPassword // Passing password to auto-fill (optional)
            } 
        });
      }, 1500);

    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid link or expired token. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: OLIVE_THEME.dark }}>
          Set New Password
        </h2>

        {message && (
          <div className={`p-3 rounded mb-4 text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
                <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-olive-500 focus:ring-olive-500 sm:text-sm p-2 border"
                    required
                />
                 <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400" onClick={() => setShowPass(!showPass)}>
                    <FontAwesomeIcon icon={faEye} />
                 </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={reNewPassword}
              onChange={(e) => setReNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-olive-500 focus:ring-olive-500 sm:text-sm p-2 border"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
            style={{ backgroundColor: OLIVE_THEME.main }}
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;