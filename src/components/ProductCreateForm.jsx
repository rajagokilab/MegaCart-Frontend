import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faSpinner, faBoxOpen, faTags, faMoneyBillWave, faLayerGroup, faPercent } from '@fortawesome/free-solid-svg-icons';
import { getAuthToken } from '../components/auth.js';

const API = import.meta.env.VITE_API_URL;
const PRODUCTS_URL = `${API}/products/`;
const CATEGORIES_URL = `${API}/categories/`;

function ProductCreateForm() {
    const navigate = useNavigate();
    // 1. ✅ UPDATE: Added discount_price to state
    const [formData, setFormData] = useState({
        name: '', 
        price: '', 
        discount_price: '', // New Field
        stock: '', 
        category: '', 
        image: null 
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [categories, setCategories] = useState([]); 
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(CATEGORIES_URL);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.results || data);
                    if (data.length > 0 || (data.results && data.results.length > 0)) {
                        const firstCat = data.results ? data.results[0] : data[0];
                        setFormData(prev => ({ ...prev, category: firstCat.id })); 
                    }
                } else {
                    throw new Error("Failed to load categories.");
                }
            } catch (err) {
                setMessage({ type: 'error', text: `Category fetch failed: ${err.message}` });
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const getAuthHeaders = () => {
        const token = getAuthToken();
        const headers = {}; 
        if (token) headers['Authorization'] = `JWT ${token}`;
        return headers;
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (!formData.name || !formData.price || !formData.stock || !formData.category) {
                throw new Error("Please fill all required fields.");
            }

            // 2. ✅ UPDATE: Validation for Discount Price
            const priceVal = parseFloat(formData.price);
            const discountVal = parseFloat(formData.discount_price);

            if (formData.discount_price && discountVal >= priceVal) {
                throw new Error("Discount price must be lower than the regular price.");
            }

            const payload = new FormData();
            payload.append('name', formData.name.trim());
            payload.append('price', formData.price);
            // 3. ✅ UPDATE: Append discount_price if it exists
            if (formData.discount_price) {
                payload.append('discount_price', formData.discount_price);
            }
            payload.append('stock', formData.stock);
            payload.append('category', formData.category);
            
            if (formData.image) {
                payload.append('image', formData.image);
            }

            const response = await fetch(PRODUCTS_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: payload,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.name?.[0] || data.price?.[0] || data.stock?.[0] || 
                    data.image?.[0] || data.detail || "Failed to create product."
                );
            }

            setMessage({
                type: 'success',
                text: 'Product submitted successfully! Pending admin approval.',
            });

            setTimeout(() => navigate('/vendor/dashboard'), 1500);

        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (categoriesLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-[#7A8450] mb-4" />
                <p className="text-gray-600 font-medium">Loading Categories...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-3xl w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create New Listing</h2>
                    <p className="mt-2 text-sm text-gray-600">Add a new product to your inventory.</p>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg text-sm font-medium flex items-center ${
                            message.type === 'error' 
                                ? 'bg-red-50 text-red-700 border border-red-200' 
                                : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
                        
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FontAwesomeIcon icon={faBoxOpen} className="mr-2 text-[#7A8450]" /> Product Name
                            </label>
                            <input
                                name="name" type="text" required value={formData.name} onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-[#7A8450] focus:border-[#7A8450] sm:text-sm"
                                placeholder="e.g. Handcrafted Ceramic Vase"
                            />
                        </div>

                        {/* 4. ✅ UPDATE: Grid Layout for Price, Discount, Stock */}
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                            {/* Regular Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-[#7A8450]" /> Price (₹)
                                </label>
                                <input
                                    name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-[#7A8450] focus:border-[#7A8450] sm:text-sm"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Discount Price Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FontAwesomeIcon icon={faPercent} className="mr-2 text-red-500" /> Discount Price
                                </label>
                                <input
                                    name="discount_price" type="number" step="0.01" value={formData.discount_price} onChange={handleChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-[#7A8450] focus:border-[#7A8450] sm:text-sm"
                                    placeholder="Optional"
                                />
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FontAwesomeIcon icon={faTags} className="mr-2 text-[#7A8450]" /> Stock
                                </label>
                                <input
                                    name="stock" type="number" required value={formData.stock} onChange={handleChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-[#7A8450] focus:border-[#7A8450] sm:text-sm"
                                    placeholder="Qty"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-[#7A8450]" /> Category
                            </label>
                            <select
                                name="category" required value={formData.category} onChange={handleChange}
                                className="block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-[#7A8450] focus:border-[#7A8450] sm:text-sm"
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors duration-200 group cursor-pointer relative">
                                <div className="space-y-1 text-center">
                                    {preview ? (
                                        <div className="relative">
                                            <img src={preview} alt="Preview" className="mx-auto h-48 object-cover rounded-lg shadow-md" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg transition-opacity duration-200">
                                                 <p className="text-white font-semibold">Change Image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCloudUploadAlt} className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#7A8450] transition-colors duration-200" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#7A8450] hover:text-[#5F673C] focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleChange} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </>
                                    )}
                                    {preview && <input id="file-upload-overlay" name="image" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleChange} />}
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div>
                            <button type="submit" disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#7A8450] hover:bg-[#5F673C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7A8450] transition-all duration-200 transform hover:-translate-y-0.5 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Submitting...</> : 'Submit Product for Approval'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProductCreateForm;