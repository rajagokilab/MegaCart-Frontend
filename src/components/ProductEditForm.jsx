import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faSpinner, faBoxOpen, faTags, faMoneyBillWave, faLayerGroup, faEdit } from '@fortawesome/free-solid-svg-icons';
import { getAuthToken, logout } from './auth'; // Checked import path
import { useUser } from '../context/UserContext.jsx'; // ✅ Need UserContext to check if Admin

const API = import.meta.env.VITE_API_URL;
const PRODUCTS_URL = `${API}/products/`;
const CATEGORIES_URL = `${API}/categories/`;

function ProductEditForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser(); // Get current user info
    
    const [formData, setFormData] = useState({
        name: '', price: '', stock: '', category: '', image: null
    });
    
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState(null);
    const [categories, setCategories] = useState([]); 

    useEffect(() => {
        const loadData = async () => {
            try {
                const catRes = await fetch(CATEGORIES_URL);
                const catData = await catRes.json();
                setCategories(catData.results || catData);

                // Fetch Product (Backend checks permissions)
                const token = getAuthToken();
                const prodRes = await fetch(`${PRODUCTS_URL}${id}/`, {
                    headers: { 'Authorization': `JWT ${token}` }
                });
                
                if (!prodRes.ok) throw new Error('Failed to load product data.');
                
                const prodData = await prodRes.json();
                setFormData({
                    name: prodData.name,
                    price: prodData.price,
                    stock: prodData.stock,
                    category: prodData.category,
                    image: null
                });
                setExistingImageUrl(prodData.image || prodData.image_url);

            } catch (err) {
                setMessage({ type: 'error', text: err.message });
            } finally {
                setFetching(false);
            }
        };
        loadData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const payload = new FormData();
            payload.append('name', formData.name.trim());
            payload.append('price', formData.price);
            payload.append('stock', formData.stock);
            payload.append('category', formData.category);
            if (formData.image instanceof File) {
                payload.append('image', formData.image);
            }

            const token = getAuthToken();
            const response = await fetch(`${PRODUCTS_URL}${id}/`, {
                method: 'PATCH',
                headers: { 'Authorization': `JWT ${token}` }, // Content-Type auto-set for FormData
                body: payload,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to update product.");
            }

            setMessage({ type: 'success', text: 'Product updated successfully!' });

            // ✅ INTELLIGENT REDIRECT
            // If Admin, go to Admin Panel. If Vendor, go to Vendor Dashboard.
            setTimeout(() => {
                if (user?.role === 'ADMIN') {
                    navigate('/my-page?view=admin-products');
                } else {
                    navigate('/my-page?view=vendor-products');
                }
            }, 1500);

        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    // ... (Inputs and Render logic remains exactly the same as your code) ...
    // Just Ensure `handleChange` is defined here as you had it before
    const handleChange = (e) => {
        if (e.target.name === 'image') {
            const file = e.target.files[0];
            if (file) {
                setFormData({ ...formData, image: file });
                setPreview(URL.createObjectURL(file));
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    if (fetching) return <div className="min-h-screen flex justify-center items-center"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
             <div className="max-w-3xl w-full bg-white p-8 shadow-xl rounded-xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Edit Product</h2>
                {message && <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div><label className="block text-sm font-medium text-gray-700">Name</label><input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Price</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Stock</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full border p-2 rounded" required /></div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Category</label>
                         <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded" required>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </select>
                    </div>
                    
                    {/* Image Logic */}
                    <div className="border-2 border-dashed p-6 text-center rounded-lg">
                        {preview ? <img src={preview} className="h-32 mx-auto mb-2 object-cover" /> : existingImageUrl && <img src={existingImageUrl} className="h-32 mx-auto mb-2 object-cover opacity-75" />}
                        <input type="file" name="image" onChange={handleChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-[#7A8450] text-white p-3 rounded-lg hover:bg-[#5F673C] transition">
                        {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : 'Save Changes'}
                    </button>
                </form>
             </div>
        </div>
    );
}

export default ProductEditForm;