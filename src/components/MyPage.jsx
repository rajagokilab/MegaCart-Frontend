import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCircle, faShieldAlt, faTag, faTruck, faCopy,
    faBoxOpen, faChartBar, faListCheck, faPlus, faPencilAlt, faTrashAlt, faRupeeSign, faList,
    faSignInAlt, faChevronRight, faCircleCheck, faTruckMoving, faBoxOpen as faBoxOpenSolid, faClock,
    faTasks, faUsersCog, faBuilding, faTachometerAlt, faCheck, faTimes, faTrash // Admin Icons
} from '@fortawesome/free-solid-svg-icons';
import { getAuthToken } from './auth'; 
import { useUser } from '../context/UserContext.jsx'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6666'];
// --- API Endpoints ---
const API = import.meta.env.VITE_API_URL;

// Vendor
const VENDOR_PRODUCTS_URL = `${API}/products/`;
const DASHBOARD_URL = `${API}/vendor/dashboard/`;
const VENDOR_ORDERS_URL = `${API}/orders/vendor/`;
const STATUS_UPDATE_URL = `${API}/orders/update_status/`;

// Admin
const ADMIN_DASHBOARD_URL = `${API}/admin/dashboard/`;
const ADMIN_VENDORS_URL = `${API}/admin/vendors/`;
const ADMIN_APPROVE_VENDOR_URL = `${API}/admin/vendors/approve/`;
const ADMIN_ALL_PRODUCTS_URL = `${API}/admin/all-products/`;
const ADMIN_ALL_ORDERS_URL = `${API}/orders/admin/all/`;
const ADMIN_CATEGORIES_URL = `${API}/categories/`;


// Status transitions for vendors
const STATUS_TRANSITIONS = {
    'Paid': 'Shipped',
    'Shipped': 'Delivered',
};

// --- Main Component ---
function MyPage({ onLoginClick }) {
    const navigate = useNavigate();
    const location = useLocation();

    // --- Role Detection ---
    const { user } = useUser();
    const isVendor = user && user.role === 'VENDOR';
    const isAdmin = user && user.role === 'ADMIN';

    const query = new URLSearchParams(location.search);
    let initialView;
    if (isAdmin) {
        initialView = query.get("view") || "admin-dashboard";
    } else if (isVendor) {
        initialView = query.get("view") || "vendor-dashboard";
    } else {
        initialView = query.get("view") || "profile";
    }
    const [activeView, setActiveView] = useState(initialView);

    // --- State for Vendor ---
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState(null);
    const [vendorProducts, setVendorProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState(null);
    const [vendorOrders, setVendorOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    // --- State for Admin ---
    const [adminDashboardData, setAdminDashboardData] = useState(null);
    const [pendingVendors, setPendingVendors] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState(null);
    const [newCategory, setNewCategory] = useState("");
    const [categoryLoading, setCategoryLoading] = useState(false); 

    // --- State for Customer ---
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [discounts] = useState([{ id: 1, code: 'WELCOME10', description: '10% off your next purchase' }]);
    
    // --- State for Confirmation Modal ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmVariant, setConfirmVariant] = useState("danger"); // 'danger', 'primary', 'success'

    // 💰 --- ADMIN Universal Fetch Wrapper ---
    const authFetch = async (url, options = {}) => {
        const token = getAuthToken();
        if (!token) throw new Error("Admin authentication token not found.");
        
        return await fetch(url, {
            ...options,
            headers: {
                "Authorization": `JWT ${token}`,
                "Content-Type": "application/json",
                ...options.headers
            }
        });
    };

    // --- Data Fetching Logic ---
    useEffect(() => {
        // Fetch data based on user role
        if (user && isVendor) {
            if (!dashboardData) fetchDashboardData();
            if (vendorProducts.length === 0) fetchVendorProducts();
            if (vendorOrders.length === 0) fetchVendorOrders();
        }
        if (user && isAdmin) {
            // Fetch all admin data
            setAdminLoading(true);
            Promise.all([
                fetchAdminDashboard(),
                fetchPendingVendors(),
                fetchAllProducts(),
                fetchAllOrders(),
                fetchCategories()
            ]).catch(err => {
                setAdminError(err.message || "Failed to load one or more admin resources.");
            }).finally(() => setAdminLoading(false));
        }
    }, [user, isVendor, isAdmin]);


    // --------------------------------------------------
    // 💰 --- START: ADMIN API Functions ---
    // --------------------------------------------------

    const fetchAdminDashboard = async () => {
        try {
            const res = await authFetch(ADMIN_DASHBOARD_URL);
            if (!res.ok) throw new Error('Could not fetch admin stats');
            setAdminDashboardData(await res.json());
        } catch (err) { setAdminError(err.message); }
    };

    const fetchPendingVendors = async () => {
        try {
            const res = await authFetch(ADMIN_VENDORS_URL);
            if (!res.ok) throw new Error('Could not fetch vendors');
            const data = await res.json();
            setPendingVendors(data.results || data);
        } catch (err) { setAdminError(err.message); }
    };

    const fetchAllProducts = async () => {
        try {
            const res = await authFetch(ADMIN_ALL_PRODUCTS_URL);
            if (!res.ok) throw new Error('Could not fetch all products');
            const data = await res.json();
            setAllProducts(data.results || data);
        } catch (err) { setAdminError(err.message); }
    };

    const fetchAllOrders = async () => {
        try {
            const res = await authFetch(ADMIN_ALL_ORDERS_URL);
            if (!res.ok) throw new Error('Could not fetch all orders');
            const data = await res.json();
            setAllOrders(data.results || data);
        } catch (err) { setAdminError(err.message); }
    };

    const fetchCategories = async () => {
        try {
            const res = await authFetch(ADMIN_CATEGORIES_URL);
            if (!res.ok) throw new Error('Could not fetch categories');
            const data = await res.json();
            setCategories(data.results || data);
        } catch (err) { setAdminError(err.message); }
    };

    // --- Admin Action Functions ---

    const approveVendor = async (id, action) => {
        const message = action === "APPROVE" 
            ? `Are you sure you want to approve vendor ${id}?`
            : `Are you sure you want to REJECT and DELETE vendor ${id}?`;
            
        setConfirmMessage(message);
        setConfirmVariant(action === "APPROVE" ? "success" : "danger");
        setConfirmAction(() => async () => {
            try {
                await authFetch(`${ADMIN_APPROVE_VENDOR_URL}${id}/`, {
                    method: "PATCH",
                    body: JSON.stringify({ action })
                });
                fetchPendingVendors(); // Refresh the list
            } catch (err) {
                alert(`Failed to ${action.toLowerCase()} vendor: ${err.message}`);
            }
        });
        setShowConfirmModal(true);
    };

    const adminRemoveProduct = async (id) => {
        setConfirmMessage(`Are you sure you want to PERMANENTLY delete product ${id}? This cannot be undone.`);
        setConfirmVariant("danger");
        setConfirmAction(() => async () => {
            try {
                await authFetch(`${ADMIN_ALL_PRODUCTS_URL}${id}/`, { method: "DELETE" });
                fetchAllProducts(); // Refresh the list
            } catch (err) {
                alert(`Failed to delete product: ${err.message}`);
            }
        });
        setShowConfirmModal(true);
    };

    const updateProductStatus = async (id, newStatus) => {
        try {
            await authFetch(`${ADMIN_ALL_PRODUCTS_URL}${id}/`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus })
            });
            fetchAllProducts(); 
        } catch (err) {
            alert(`Failed to update product status: ${err.message}`);
        }
    };

    // ▼▼▼ UPDATED FUNCTION ▼▼▼
    const createCategory = async (e) => {
        e.preventDefault();
        const categoryName = newCategory.trim();
        if (!categoryName) return;

        setCategoryLoading(true);

        // 1. Generate the slug from the name
        const categorySlug = categoryName
            .toLowerCase()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '') // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -

        try {
            await authFetch(ADMIN_CATEGORIES_URL, {
                method: "POST",
                // 2. Send both name and slug
                body: JSON.stringify({ 
                    name: categoryName,
                    slug: categorySlug 
                })
            });
            setNewCategory("");
            fetchCategories(); // Refresh the list
        } catch (err) {
            // This will now catch the error if the slug already exists
            alert(`Failed to create category. (Is the name or slug already taken?) Error: ${err.message}`);
        } finally {
            setCategoryLoading(false); 
        }
    };
    // ▲▲▲ UPDATED FUNCTION ▲▲▲

    const deleteCategory = async (id) => {
        setConfirmMessage(`Are you sure you want to delete this category?`);
        setConfirmVariant("danger");
        setConfirmAction(() => async () => {
            try {
                await authFetch(`${ADMIN_CATEGORIES_URL}${id}/`, { method: "DELETE" });
                fetchCategories(); // Refresh the list
            } catch (err) {
                alert(`Failed to delete category: ${err.message}`);
            }
        });
        setShowConfirmModal(true);
    };

    // --------------------------------------------------
    // 💰 --- END: ADMIN API Functions ---
    // --------------------------------------------------
    
    // --- VENDOR API Functions ---
    const fetchDashboardData = async () => {
        if (!isVendor) return;
        setDashboardLoading(true);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");

            const response = await fetch(DASHBOARD_URL, {
                headers: { 'Authorization': `JWT ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`Failed to fetch dashboard. Status: ${response.status}`);
            const result = await response.json();
            setDashboardData(result);
        } catch (err) {
            setDashboardError(err.message);
        } finally {
            setDashboardLoading(false);
        }
    };
    
    const fetchVendorProducts = async () => {
        if (!isVendor) return;
        setProductsLoading(true);
        setProductsError(null);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");

            const response = await fetch(VENDOR_PRODUCTS_URL, { headers: { 'Authorization': `JWT ${token}` } });
            if (!response.ok) throw new Error(`Failed to fetch products. Status: ${response.status}`);
            const data = await response.json();
            setVendorProducts(data.results || data);
        } catch (err) {
            setProductsError(err.message);
        } finally {
            setProductsLoading(false);
        }
    };
    

    const fetchVendorOrders = async () => {
        if (!isVendor) return;
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");

            const response = await fetch(VENDOR_ORDERS_URL, { 
                headers: { 'Authorization': `JWT ${token}` } 
            });
            if (!response.ok) throw new Error(`Failed to fetch orders. Status: ${response.status}`);
            const data = await response.json();
            setVendorOrders(data.results || data);
        } catch (err) {
            setOrdersError(err.message);
        } finally {
            setOrdersLoading(false);
        }
    };
    
    const executeStatusUpdate = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");

            const response = await fetch(`${STATUS_UPDATE_URL}${orderId}/`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `JWT ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update status to ${newStatus}.`);
            }

            const updatedData = await response.json();

            setVendorOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, status: updatedData.status, history: updatedData.history } : order
            ));
            
        } catch (err) {
            alert(`Error updating order: ${err.message}`); 
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleStatusConfirmation = (orderId, newStatus) => {
        setConfirmMessage(`Confirm marking Order ID ${orderId} as '${newStatus}'? This action will notify the customer.`);
        setConfirmVariant("primary");
        setConfirmAction(() => () => executeStatusUpdate(orderId, newStatus));
        setShowConfirmModal(true);
    };

    const executeDeletion = async (productId) => {
        try {
            const token = getAuthToken();
            setProductsLoading(true);
            const response = await fetch(`${VENDOR_PRODUCTS_URL}${productId}/`, { 
                method: 'DELETE', 
                headers: { 'Authorization': `JWT ${token}` } 
            });
            if (response.status === 204) {
                fetchVendorProducts();
            } else {
                throw new Error('Failed to delete product.');
            }
        } catch (err) {
            alert(err.message); 
            setProductsLoading(false);
        }
    };
    
    const handleProductAction = (action, productId = null) => {
        if (!isVendor) return;
        
        if (action === 'delete') {
            setConfirmMessage(`Are you absolutely sure you want to delete Product ID ${productId}? This cannot be undone.`);
            setConfirmVariant("danger");
            setConfirmAction(() => () => executeDeletion(productId));
            setShowConfirmModal(true);
            
        } else if (action === 'add') {
            navigate('/vendor/products/new');
        } else if (action === 'edit') {
            navigate(`/vendor/products/edit/${productId}`);
        }
    };
    
    // --- Modal & Helper Functions ---
    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction();
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmMessage("");
    };

    const handlePasswordFormChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    const handlePasswordSubmit = (e) => { e.preventDefault(); alert('Password change attempted'); };
    const copyToClipboard = (code) => { navigator.clipboard.writeText(code); alert(`Copied: ${code}`); };
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Paid': return { icon: faCircleCheck, color: 'text-green-500' };
            case 'Shipped': return { icon: faTruckMoving, color: 'text-blue-500' };
            case 'Delivered': return { icon: faBoxOpenSolid, color: 'text-sky-500' };
            case 'Failed': return { icon: faSignInAlt, color: 'text-red-500' };
            case 'Pending':
            default: return { icon: faClock, color: 'text-yellow-500' };
        }
    };

    // --- Helper for dynamic nav link styling ---
    const navLinkClasses = (view, activeView, theme) => {
        const base = "flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200";
        const themes = {
            admin: { active: 'bg-yellow-500 text-white', inactive: 'text-gray-700 hover:bg-yellow-50' },
            vendor: { active: 'bg-lime-600 text-white', inactive: 'text-gray-700 hover:bg-lime-50' },
            customer: { active: 'bg-green-600 text-white', inactive: 'text-gray-700 hover:bg-green-50' }
        };
        const style = themes[theme] || themes.customer;
        return `${base} ${activeView === view ? style.active : style.inactive}`;
    };

    // --- Helper for loading spinner ---
    const renderSpinner = (text = "Loading...") => (
        <div className="flex flex-col items-center justify-center p-10">
            <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">{text}</p>
        </div>
    );

    // --------------------------------------------------
    // 💰 --- START: ADMIN RENDER Functions ---
    // --------------------------------------------------

    const renderAdminDashboard = () => {
        if (!adminDashboardData) return renderSpinner("Loading Dashboard...");
        const stats = adminDashboardData; 
        
        return (
            <div>
                <h3 className="text-2xl font-semibold mb-6">Admin Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-lg shadow-md bg-blue-600 text-white">
                        <h6 className="text-sm font-medium uppercase text-white/80">Total Sales</h6>
                        <h3 className="text-4xl font-bold">₹{stats.total_sales?.toFixed(2) || '0.00'}</h3>
                    </div>
                    <div className="p-6 rounded-lg shadow-md bg-green-600 text-white">
                        <h6 className="text-sm font-medium uppercase text-white/80">Total Commission (10%)</h6>
                        <h3 className="text-4xl font-bold">₹{stats.total_commission?.toFixed(2) || '0.00'}</h3>
                    </div>
                    <div className="p-6 rounded-lg shadow-md bg-sky-500 text-white">
                        <h6 className="text-sm font-medium uppercase text-white/80">New Orders (Paid)</h6>
                        <h3 className="text-4xl font-bold">{stats.new_orders}</h3>
                    </div>
                    <div className="p-6 rounded-lg shadow-md bg-yellow-400 text-gray-900">
                        <h6 className="text-sm font-medium uppercase text-gray-900/80">Pending Vendors</h6>
                        <h3 className="text-4xl font-bold">{stats.pending_vendors}</h3>
                    </div>
                </div>
            </div>
        );
    };

    const renderAdminVendorMgmt = () => (
        <div>
            <h3 className="text-2xl font-semibold mb-6">Vendor Applications</h3>
            {pendingVendors.length === 0 && (
                <div className="bg-green-100 text-green-700 p-4 rounded-md">
                    No pending vendor applications.
                </div>
            )}
            <div className="mt-4 space-y-3">
                {pendingVendors.map(v => (
                    <div key={v.id} className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap justify-between items-center">
                        <div className="mb-2 md:mb-0">
                            <strong className="font-semibold text-gray-900">{v.store_name}</strong><br />
                            <small className="text-sm text-gray-500">{v.email}</small>
                        </div>
                        <div className="flex-shrink-0 ml-4 space-x-2">
                            <button
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm transition hover:bg-green-700"
                                onClick={() => approveVendor(v.id, "APPROVE")}
                            >
                                <FontAwesomeIcon icon={faCheck} className="mr-1" /> Approve
                            </button>
                            <button
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm transition hover:bg-red-700"
                                onClick={() => approveVendor(v.id, "REJECT")}
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAdminProductMgmt = () => (
        <div>
            <h3 className="text-2xl font-semibold mb-6">All Products</h3>
            <div className="mt-4 space-y-3">
                {allProducts.length === 0 && <div className="bg-blue-100 text-blue-700 p-4 rounded-md">No products found.</div>}
                {allProducts.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                        <div>
                            <strong className="font-semibold">{p.name}</strong> — ₹{p.price}
                            <br />
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                p.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                (p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
                            }`}>
                                {p.status}
                            </span>
                            <small className="text-sm text-gray-500 ml-2 border-l border-gray-300 pl-2">By: {p.vendor_name}</small>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4 flex gap-2">
                            {p.status !== 'APPROVED' && (
                                <button
                                    className="p-2 rounded-md border border-green-500 text-green-500 hover:bg-green-50 transition"
                                    title="Approve"
                                    onClick={() => updateProductStatus(p.id, 'APPROVED')}
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                            )}
                            {p.status !== 'REJECTED' && (
                                <button
                                    className="p-2 rounded-md border border-yellow-500 text-yellow-500 hover:bg-yellow-50 transition"
                                    title="Reject"
                                    onClick={() => updateProductStatus(p.id, 'REJECTED')}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                            <button 
                                className="p-2 rounded-md border border-red-500 text-red-500 hover:bg-red-50 transition"
                                title="Delete"
                                onClick={() => adminRemoveProduct(p.id)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAdminOrderMgmt = () => {
        if (allOrders.length === 0) return <p className="text-gray-600">No orders found.</p>;

        // --- Orders by Vendor ---
        const vendorDataMap = {};
        allOrders.forEach(order => {
            const vendor = order.vendor_name || "Unknown";
            vendorDataMap[vendor] = vendorDataMap[vendor] || { vendor, totalOrders: 0, totalRevenue: 0 };
            vendorDataMap[vendor].totalOrders += 1;
            vendorDataMap[vendor].totalRevenue += Number(order.total_amount || 0);
        });
        const vendorData = Object.values(vendorDataMap);

        // --- Orders by Product ---
        const productDataMap = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const product = item.product_name || "Unknown";
                productDataMap[product] = productDataMap[product] || { product, quantity: 0 };
                productDataMap[product].quantity += Number(item.quantity || 0);
            });
        });
        const productData = Object.values(productDataMap);

        // --- Order Status Distribution ---
        const statusMap = {};
        allOrders.forEach(order => {
            const status = order.status || "Unknown";
            statusMap[status] = (statusMap[status] || 0) + 1;
        });
        const statusData = Object.entries(statusMap).map(([status, value]) => ({ name: status, value }));

        return (
            <div className="space-y-10">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Orders by Vendor</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={vendorData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <XAxis dataKey="vendor" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalOrders" fill="#3b82f6" name="Total Orders" />
                            <Bar dataKey="totalRevenue" fill="#f59e0b" name="Revenue (₹)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4">Orders by Product</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart layout="vertical" data={productData} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="product" />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#10b981" name="Quantity Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4">Order Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                fill="#6366f1"
                                label
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderAdminCategoryMgmt = () => (
        <div>
            <h3 className="text-2xl font-semibold mb-6">Manage Categories</h3>
            <form onSubmit={createCategory} className="flex gap-3 mt-4">
                <input
                    type="text"
                    className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    disabled={categoryLoading}
                />
                <button 
                    type="submit" 
                    className="inline-flex items-center justify-center px-4 py-2 w-20 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                    disabled={categoryLoading}
                >
                    {categoryLoading ? (
                        <div className="w-5 h-5 border-2 border-t-white border-gray-200 rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add
                        </>
                    )}
                </button>
            </form>
            <hr className="my-6" />
            <div className="mt-3 space-y-3">
                {categories.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                        <span className="font-medium">{c.name}</span>
                        <button
                            className="p-2 rounded-md border border-red-500 text-red-500 hover:bg-red-50 transition"
                            onClick={() => deleteCategory(c.id)}
                            title="Delete Category"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    // --------------------------------------------------
    // 💰 --- END: ADMIN RENDER Functions ---
    // --------------------------------------------------


    // --- VENDOR Render Functions ---
    const renderVendorDashboard = () => {
        if (dashboardLoading) return renderSpinner("Loading Dashboard...");
        if (dashboardError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{dashboardError}</div>;
        const metrics = dashboardData || { total_earnings: 0, total_orders: 0, active_products: 0, unique_customers: 0 };
    
        return (
            <div>
                <h3 className="text-2xl font-semibold mb-6">{user.store_name || user.username} Dashboard</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-5 rounded-lg shadow-md text-white bg-orange-600"><h6 className="text-sm font-medium uppercase text-white/80">Total Earnings</h6><h2 className="text-4xl font-bold">₹{metrics.total_earnings ? metrics.total_earnings.toFixed(2) : '0.00'}</h2></div>
                    <div className="p-5 rounded-lg shadow-md text-white bg-lime-600"><h6 className="text-sm font-medium uppercase text-white/80">Total Orders</h6><h2 className="text-4xl font-bold">{metrics.total_orders}</h2></div>
                    <div className="p-5 rounded-lg shadow-md text-white bg-blue-900"><h6 className="text-sm font-medium uppercase text-white/80">Active Products</h6><h2 className="text-4xl font-bold">{metrics.active_products}</h2></div>
                    <div className="p-5 rounded-lg shadow-md text-white bg-green-800"><h6 className="text-sm font-medium uppercase text-white/80">Customers</h6><h2 className="text-4xl font-bold">{metrics.unique_customers}</h2></div>
                </div>
                
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                    <h5 className="font-bold text-gray-800">Admin Approval Workflow</h5>
                    <p className="text-gray-700">All new products start as <strong>PENDING</strong>. You can edit/delete them before approval.</p>
                </div>

                <div className="mt-6 flex gap-3">
                    <button 
                        onClick={() => handleProductAction('add')} 
                        className="inline-flex items-center px-4 py-2 font-medium text-white bg-orange-500 rounded-md shadow-sm hover:bg-orange-600 transition"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Product
                    </button>
                    <button 
                        onClick={() => setActiveView('vendor-products')} 
                        className="inline-flex items-center px-4 py-2 font-medium text-white bg-blue-900 rounded-md shadow-sm hover:bg-blue-800 transition"
                    >
                        <FontAwesomeIcon icon={faList} className="mr-2" /> View Inventory
                    </button>
                </div>
            </div>
        );
    };

    const renderProductManagement = () => (
        <div>
            <h3 className="text-2xl font-semibold mb-4">Product Management</h3>
            <button 
                onClick={() => handleProductAction('add')} 
                className="inline-flex items-center px-4 py-2 font-medium text-white bg-orange-500 rounded-md shadow-sm hover:bg-orange-600 transition mb-4"
            >
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Product
            </button>
            
            {productsLoading && renderSpinner("Loading Products...")}
            {productsError && <div className="p-4 rounded-md bg-red-100 text-red-700">{productsError}</div>}
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {vendorProducts.length === 0 ? (
                        <li className="p-4 text-gray-500">You have not added any products yet.</li>
                    ) : (
                        vendorProducts.map(p => (
                            <li key={p.id} className="p-4 flex flex-wrap justify-between items-center">
                                <div>
                                    <span className="font-medium text-gray-900">{p.name}</span>{" "}
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
                                        p.status === "APPROVED" ? 'bg-green-600' :
                                        p.status === "PENDING" ? 'bg-orange-500' : 'bg-blue-900'
                                    }`}>{p.status}</span>{" "}
                                    | ₹{parseFloat(p.price).toFixed(2)}
                                </div>
                                <div className="flex-shrink-0 ml-4 space-x-2 mt-2 sm:mt-0">
                                    <button 
                                        onClick={() => handleProductAction('edit', p.id)} 
                                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-900 rounded-md shadow-sm hover:bg-blue-800 transition"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleProductAction('delete', p.id)} 
                                        className="px-3 py-1.5 text-sm font-medium text-white bg-orange-500 rounded-md shadow-sm hover:bg-orange-600 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
    
    const renderVendorOrders = () => {
        if (ordersLoading) return renderSpinner("Loading Orders...");
        if (ordersError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{ordersError}</div>;
        if (vendorOrders.length === 0) {
            return <div className="p-4 rounded-md bg-blue-100 text-blue-700">You have not received any orders yet.</div>;
        }

        return (
            <div>
                <h3 className="text-2xl font-semibold mb-4">Customer Orders</h3>
                <div className="space-y-4">
                    {vendorOrders.map(order => {
                        const nextStatus = STATUS_TRANSITIONS[order.status];
                        const isUpdating = updatingOrderId === order.id;
                        const isUpdateDisabled = !nextStatus || isUpdating;

                        return (
                            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                <div className="flex flex-wrap justify-between items-center p-4 bg-gray-50 border-b">
                                    <div>
                                        <strong className="text-gray-900">Order ID: {order.id}</strong>
                                        <span 
                                            className={`ml-2 px-2.5 py-0.5 rounded-full text-sm font-bold text-white ${
                                                order.status === 'Paid' ? 'bg-green-600' :
                                                order.status === 'Shipped' ? 'bg-blue-600' : 'bg-gray-500'
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center mt-2 sm:mt-0">
                                        <span className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</span>
                                        
                                        {order.status !== 'Delivered' && order.status !== 'Failed' && (
                                            <button
                                                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-gray-600 rounded-md shadow-sm hover:bg-gray-700 transition ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isUpdateDisabled}
                                                onClick={() => handleStatusConfirmation(order.id, nextStatus)} 
                                            >
                                                {isUpdating ? (
                                                    <div className="w-4 h-4 border-2 border-t-white border-gray-200 rounded-full animate-spin mr-2"></div>
                                                ) : (
                                                    <>
                                                        Mark as {nextStatus} 
                                                        <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="font-medium text-gray-700"><strong>Customer:</strong> {order.customer_name}</p>
                                    <hr className="my-4" />
                                    <h6 className="text-lg font-semibold mb-3">Items in this Order:</h6>
                                    <ul className="divide-y divide-gray-200">
                                        {order.items.map(item => (
                                            <li key={item.id} className="py-3 flex justify-between items-center">
                                                <div className="flex-grow">
                                                    <strong className="text-gray-800">{item.product_name}</strong>
                                                    <br />
                                                    <small className="text-gray-500">Quantity: {item.quantity}</small>
                                                </div>
                                                <div className="font-bold text-gray-900">
                                                    ₹{parseFloat(item.price).toFixed(2)}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-4 bg-white border-t">
                                    <h6 className="font-bold mb-2 text-gray-800">Tracking History</h6>
                                    <ul className="flex flex-wrap justify-between -m-2">
                                        {order.history && order.history.map(record => {
                                            const { icon, color } = getStatusIcon(record.status);
                                            return (
                                                <li key={record.timestamp} className="text-center p-2">
                                                    <FontAwesomeIcon icon={icon} size="lg" className={`text-2xl ${color}`} /><br />
                                                    <small className="text-gray-600">{record.status}</small>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- CUSTOMER Render Functions ---
    const renderProfileView = () => (
        <div>
            <h3 className="text-2xl font-semibold mb-6">Profile Details</h3>
            <ul className="divide-y divide-gray-200">
                <li className="py-3"><span className="font-medium text-gray-700">Username:</span> {user.username}</li>
                <li className="py-3"><span className="font-medium text-gray-700">Email:</span> {user.email}</li>
                <li className="py-3"><span className="font-medium text-gray-700">Role:</span> {user.role}</li>
            </ul>
        </div>
    );

    // --- Main View Router ---
    const renderActiveView = () => {
        // 1. ADMIN VIEW
        if (isAdmin) {
            if (adminLoading) return renderSpinner("Loading Admin Portal...");
            if (adminError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{adminError}</div>;
            
            switch(activeView) {
                case 'admin-dashboard': return renderAdminDashboard();
                case 'admin-vendors': return renderAdminVendorMgmt();
                case 'admin-products': return renderAdminProductMgmt();
                case 'admin-orders': return renderAdminOrderMgmt();
                case 'admin-categories': return renderAdminCategoryMgmt();
                default: return renderAdminDashboard();
            }
        }
        // 2. VENDOR VIEW
        if (isVendor) {
            switch(activeView) {
                case 'vendor-dashboard': return renderVendorDashboard();
                case 'vendor-products': return renderProductManagement();
                case 'vendor-orders': return renderVendorOrders();
                case 'profile': return renderProfileView();
                case 'security': 
                    return (
                        <form onSubmit={handlePasswordSubmit}>
                            {/* ... (Password Form from Customer View) ... */}
                        </form>
                    );
                default: return renderVendorDashboard();
            }
        }
        // 3. CUSTOMER VIEW
        switch(activeView) {
            case 'security':
                return (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Old Password</label>
                            <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
                        </div>
                        <button type="submit" disabled={passLoading} className="inline-flex items-center px-4 py-2 font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 transition disabled:opacity-50">
                            Update Password
                        </button>
                    </form>
                );
            case 'discounts':
                return (
                    <div className="space-y-3">
                        {discounts.map(d => (
                            <div key={d.id} className="p-4 rounded-md bg-blue-100 text-blue-700 flex justify-between items-center">
                                <span><strong>{d.code}</strong>: {d.description}</span>
                                <button 
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 transition"
                                    onClick={() => copyToClipboard(d.code)}
                                >
                                    Copy
                                </button>
                            </div>
                        ))}
                    </div>
                );
            case 'profile':
            default: 
                return renderProfileView();
        }
    };

    // "Guard Clause" for logged-out users
    if (!user) {
        return (
            <div className="container mx-auto my-12 p-6 text-center">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-md shadow-md max-w-lg mx-auto">
                    <h4 className="text-xl font-bold mb-2">Please Log In</h4>
                    <p className="mb-4">You must be logged in to view your account details.</p>
                    <hr className="my-4 border-yellow-400" />
                    <button 
                        className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        onClick={onLoginClick}
                    >
                        <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                        Log In / Register
                    </button>
                </div>
            </div>
        );
    }
    
    // --- Confirmation Modal (Reusable) ---
    const ConfirmationModal = () => {
        if (!showConfirmModal) return null;

        const variantClasses = {
            danger: {
                alert: 'bg-red-100 text-red-700',
                button: 'bg-red-600 hover:bg-red-700 text-white'
            },
            primary: {
                alert: 'bg-blue-100 text-blue-700',
                button: 'bg-blue-600 hover:bg-blue-700 text-white'
            },
            success: {
                alert: 'bg-green-100 text-green-700',
                button: 'bg-green-600 hover:bg-green-700 text-white'
            }
        };
        
        const classes = variantClasses[confirmVariant] || variantClasses.primary;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h5 className="text-lg font-semibold">Confirm Action</h5>
                        <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <div className="p-6">
                        <div className={`p-4 rounded-md ${classes.alert}`}>
                            {confirmMessage}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
                        <button 
                            className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                            onClick={() => setShowConfirmModal(false)}>
                            Cancel
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-md font-semibold transition ${classes.button}`}
                            onClick={handleConfirm}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ------------------- MAIN RETURN -------------------
    return (
        <div className="container mx-auto my-12 px-4">
            <h2 className="text-3xl font-bold mb-6">
                {isAdmin ? "Admin Portal" : (isVendor ? (user.store_name || "Vendor Dashboard") : "My Account")}
            </h2>
            <div className="flex flex-wrap -mx-4">
                
                {/* --- Sidebar --- */}
                <div className="w-full md:w-1/3 px-4 mb-6 md:mb-0">
                    <div className="bg-white rounded-lg shadow-md text-center p-6 mb-6">
                        <FontAwesomeIcon 
                            icon={faUserCircle} 
                            className={`mb-3 text-6xl ${isAdmin ? 'text-yellow-500' : (isVendor ? 'text-lime-500' : 'text-green-600')}`}
                        />
                        <h5 className="text-xl font-semibold">{user.username}</h5>
                        <p className="text-gray-600">{user.email}</p>
                        <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${
                            isAdmin ? 'bg-yellow-500' : (isVendor ? 'bg-lime-600' : 'bg-green-600')
                        }`}>{user.role}</span>
                    </div>
                    
                    {/* --- Dynamic Navigation --- */}
                    <nav className="flex flex-col space-y-2">
                        
                        {/* 1. ADMIN NAV */}
                        {isAdmin && <>
                            <button onClick={() => setActiveView('admin-dashboard')} className={navLinkClasses('admin-dashboard', activeView, 'admin')}><FontAwesomeIcon icon={faTachometerAlt} className="mr-3 w-5"/> Dashboard</button>
                            <button onClick={() => setActiveView('admin-vendors')} className={navLinkClasses('admin-vendors', activeView, 'admin')}><FontAwesomeIcon icon={faUsersCog} className="mr-3 w-5"/> Vendor Apps</button>
                            <button onClick={() => setActiveView('admin-products')} className={navLinkClasses('admin-products', activeView, 'admin')}><FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5"/> Product Mgmt</button>
                            <button onClick={() => setActiveView('admin-orders')} className={navLinkClasses('admin-orders', activeView, 'admin')}><FontAwesomeIcon icon={faListCheck} className="mr-3 w-5"/> All Orders</button>
                            <button onClick={() => setActiveView('admin-categories')} className={navLinkClasses('admin-categories', activeView, 'admin')}><FontAwesomeIcon icon={faTasks} className="mr-3 w-5"/> Categories</button>
                        </>}
                        
                        {/* 2. VENDOR NAV */}
                        {isVendor && <>
                            <button onClick={() => setActiveView('vendor-dashboard')} className={navLinkClasses('vendor-dashboard', activeView, 'vendor')}><FontAwesomeIcon icon={faChartBar} className="mr-3 w-5"/> Dashboard</button>
                            <button onClick={() => setActiveView('vendor-products')} className={navLinkClasses('vendor-products', activeView, 'vendor')}><FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5"/> Products</button>
                            <button onClick={() => setActiveView('vendor-orders')} className={navLinkClasses('vendor-orders', activeView, 'vendor')}><FontAwesomeIcon icon={faListCheck} className="mr-3 w-5"/> Orders</button>
                        </>}

                        {/* 3. SHARED (CUSTOMER/VENDOR) NAV */}
                        {!isAdmin && <>
                            <button onClick={() => setActiveView('profile')} className={navLinkClasses('profile', activeView, isVendor ? 'vendor' : 'customer')}><FontAwesomeIcon icon={faUserCircle} className="mr-3 w-5"/> Profile</button>
                            <button onClick={() => setActiveView('security')} className={navLinkClasses('security', activeView, isVendor ? 'vendor' : 'customer')}><FontAwesomeIcon icon={faShieldAlt} className="mr-3 w-5"/> Security</button>
                            <Link to="/my-orders" className={navLinkClasses('__NEVER_ACTIVE__', activeView, isVendor ? 'vendor' : 'customer')}><FontAwesomeIcon icon={faTruck} className="mr-3 w-5"/> My Orders</Link>
                        </>}

                        {/* 4. CUSTOMER-ONLY NAV */}
                        {!isVendor && !isAdmin && (
                            <button onClick={() => setActiveView('discounts')} className={navLinkClasses('discounts', activeView, 'customer')}><FontAwesomeIcon icon={faTag} className="mr-3 w-5"/> Discounts</button>
                        )}
                    </nav>
                </div>
                
                {/* --- Content Pane --- */}
                <div className="w-full md:w-2/3 px-4">
                    {/* Render a global error for the admin panel if something went wrong */}
                    {isAdmin && adminError && !adminLoading && <div className="p-4 rounded-md bg-red-100 text-red-700 mb-4">{adminError}</div>}
                    
                    <div className="bg-white rounded-lg shadow-md p-6 min-h-[400px]">
                        {renderActiveView()}
                    </div>
                </div>
            </div>
            
            <ConfirmationModal />
        </div>
    );
}

export default MyPage;