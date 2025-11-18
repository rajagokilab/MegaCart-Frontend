import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCircle, faShieldAlt, faTag, faTruck, faCopy,
    faBoxOpen, faChartBar, faListCheck, faPlus, faPencilAlt, faTrashAlt, faRupeeSign, faList,
    faSignInAlt, faChevronRight, faCircleCheck, faTruckMoving, faBoxOpen as faBoxOpenSolid, faClock,
    faTasks, faUsersCog, faBuilding, faTachometerAlt, faCheck, faTimes, faTrash, faMoneyBillTransfer,
    faSpinner, faHeadset // ✅ Imported faHeadset for Support Messages
} from '@fortawesome/free-solid-svg-icons';
import { getAuthToken } from './auth'; 
import { useUser } from '../context/UserContext.jsx'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// --- STYLING & THEME ---
const OLIVE_THEME = {
    main: '#7A8450',
    dark: '#5F673C',
    light: '#F0F2E9',
    text: '#333333',
};

// Colors for Charts
const CHART_COLORS = ['#7A8450', '#5F673C', '#A9B47C', '#BFBFA9', '#8A8A7B'];

// --- API Endpoints ---
const API = import.meta.env.VITE_API_URL;
// Vendor
const VENDOR_PRODUCTS_URL = `${API}/products/`;
const DASHBOARD_URL = `${API}/vendor/dashboard/`;
const VENDOR_ORDERS_URL = `${API}/orders/vendor/`;
const STATUS_UPDATE_URL = `${API}/orders/update_status/`;
const VENDOR_PAYOUT_REQUEST_URL = `${API}/vendor/request-payout/`;
const VENDOR_PAYOUT_HISTORY_URL = `${API}/vendor/payouts/`;
const VENDOR_BANK_DETAILS_URL = `${API}/vendor/bank-details/`; 
// Admin
const ADMIN_DASHBOARD_URL = `${API}/users/dashboard/`;
const ADMIN_ALL_PRODUCTS_URL = `${API}/admin/all-products/`;
const ADMIN_CATEGORIES_URL = `${API}/categories/`;
const ADMIN_ALL_ORDERS_URL = `${API}/orders/admin/all/`;
const ADMIN_ALL_PAYOUTS_URL = `${API}/admin/payouts/`;
const ADMIN_UPDATE_PAYOUT_URL = `${API}/admin/payouts/update/`;
const ADMIN_EXPORT_ORDERS_EXCEL_URL = `${API}/admin/orders/export/excel/`;
const ADMIN_APPROVE_VENDOR_URL = `${API}/users/admin/vendors/approve/`;
const ADMIN_ALL_VENDORS_URL = `${API}/users/admin/vendors/all/`;
const ADMIN_EXPORT_EXCEL_URL = `${API}/users/admin/vendors/export/excel/`;

// ✅ SUPPORT MESSAGES ENDPOINTS
const ADMIN_SUPPORT_MESSAGES_URL = `${API}/support/admin/list/`; 
const ADMIN_SUPPORT_DETAIL_URL = `${API}/support/admin/`; 

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

    // --- State ---
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
    const [payouts, setPayouts] = useState([]); 
    const [payoutsLoading, setPayoutsLoading] = useState(false); 
    const [payoutsError, setPayoutsError] = useState(null); 
    const [payoutRequestLoading, setPayoutRequestLoading] = useState(false);
    
    const [bankDetails, setBankDetails] = useState({
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        upi_id: ''
    });
    const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
    const [bankDetailsError, setBankDetailsError] = useState(null);
    const [isSavingBank, setIsSavingBank] = useState(false);

    const [adminDashboardData, setAdminDashboardData] = useState(null);
    const [allVendors, setAllVendors] = useState([]); 
    const [allProducts, setAllProducts] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState(null);
    const [newCategory, setNewCategory] = useState("");
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [adminPayouts, setAdminPayouts] = useState([]);
    const [isPayoutUpdating, setIsPayoutUpdating] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    
    const [supportMessages, setSupportMessages] = useState([]); // ✅ NEW STATE
    const [messagesLoading, setMessagesLoading] = useState(false); // ✅ NEW STATE
    const [messagesError, setMessagesError] = useState(null); // ✅ NEW STATE
    const [isResolving, setIsResolving] = useState(null); // ✅ NEW STATE for resolving spinner

    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [discounts] = useState([{ id: 1, code: 'WELCOME10', description: '10% off your next purchase' }]);
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmVariant, setConfirmVariant] = useState("danger");

    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [trackingOrderId, setTrackingOrderId] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingError, setTrackingError] = useState(null);

    // 💰 --- Universal Fetch Wrapper ---
    const authFetch = async (url, options = {}) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication token not found.");
        
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
        if (user && isVendor) {
            if (!dashboardData) fetchDashboardData();
            if (vendorProducts.length === 0) fetchVendorProducts();
            if (vendorOrders.length === 0) fetchVendorOrders();
            if (payouts.length === 0) fetchPayoutHistory();
            fetchBankDetails(); 
        }
        if (user && isAdmin) {
            setAdminLoading(true);
            Promise.all([
                fetchAdminDashboard(),
                fetchAllVendors(),
                fetchAllProducts(),
                fetchAllOrders(),
                fetchCategories(),
                fetchAdminPayouts(),
                fetchSupportMessages() // ✅ ADDED fetch
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

    const fetchAllVendors = async () => {
        try {
            const res = await authFetch(ADMIN_ALL_VENDORS_URL);
            if (!res.ok) throw new Error('Could not fetch all vendors');
            const data = await res.json();
            setAllVendors(data.results || data);
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

    const fetchAdminPayouts = async () => {
        try {
            const res = await authFetch(ADMIN_ALL_PAYOUTS_URL);
            if (!res.ok) throw new Error('Could not fetch payout requests');
            const data = await res.json();
            setAdminPayouts(data.results || data);
        } catch (err) { 
            setAdminError(err.message); 
        }
    };

    // ✅ ADDED: Fetch Support Messages
    const fetchSupportMessages = async () => {
        if (!isAdmin) return;
        setMessagesLoading(true);
        setMessagesError(null);
        try {
            const res = await authFetch(ADMIN_SUPPORT_MESSAGES_URL);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Could not fetch support messages');
            }
            const data = await res.json();
            setSupportMessages(data.results || data);
        } catch (err) {
            setMessagesError(err.message);
        } finally {
            setMessagesLoading(false);
        }
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
                fetchAllVendors();
            } catch (err) {
                alert(`Failed to ${action.toLowerCase()} vendor: ${err.message}`);
            }
        });
        setShowConfirmModal(true);
    };
    
    // ✅ ADDED: Handle resolving a message
    const handleResolveMessage = async (messageId) => {
        setIsResolving(messageId); 

        setConfirmMessage(`Are you sure you want to mark message #${messageId} as RESOLVED?`);
        setConfirmVariant("success");
        
        setConfirmAction(() => async () => {
            try {
                const res = await authFetch(`${ADMIN_SUPPORT_DETAIL_URL}${messageId}/`, {
                    method: "PATCH",
                    body: JSON.stringify({ is_resolved: true }) // Send the update payload
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || 'Failed to update message status.');
                }
                
                // Success: Update the local state
                setSupportMessages(prevMessages => 
                    prevMessages.map(msg =>
                        msg.id === messageId ? { ...msg, is_resolved: true } : msg
                    )
                );
                
                alert(`Message #${messageId} marked as resolved!`);

            } catch (err) {
                alert(`Error resolving message: ${err.message}`);
            } finally {
                setIsResolving(null);
            }
        });
        setShowConfirmModal(true);
    };

    const handleExport = async (url, filename) => {
        setExportLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(url, {
                headers: { 'Authorization': `JWT ${token}` }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to download file.');
            }

            const blob = await response.blob();
            const href = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = href;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(href);

        } catch (err) {
            alert(`Error exporting file: ${err.message}`);
        } finally {
            setExportLoading(false);
        }
    };
    
    const handleVendorExportExcel = () => {
        handleExport(ADMIN_EXPORT_EXCEL_URL, 'vendor_report.xlsx');
    };
    
    const handleOrderExportExcel = () => {
        handleExport(ADMIN_EXPORT_ORDERS_EXCEL_URL, 'all_orders_report.xlsx');
    };

    const handleExportPdf = () => {
        alert("PDF export is complex and requires a dedicated backend library (like ReportLab or xhtml2pdf).");
    };

    const adminRemoveProduct = async (id) => {
        setConfirmMessage(`Are you sure you want to PERMANENTLY delete product ${id}? This cannot be undone.`);
        setConfirmVariant("danger");
        setConfirmAction(() => async () => {
            try {
                await authFetch(`${ADMIN_ALL_PRODUCTS_URL}${id}/`, { method: "DELETE" });
                fetchAllProducts();
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

    const createCategory = async (e) => {
        e.preventDefault();
        const categoryName = newCategory.trim();
        if (!categoryName) return;
        setCategoryLoading(true);
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');  
        try {
            await authFetch(ADMIN_CATEGORIES_URL, {
                method: "POST",
                body: JSON.stringify({ name: categoryName, slug: categorySlug })
            });
            setNewCategory("");
            fetchCategories();
        } catch (err) {
            alert(`Failed to create category. (Is the name or slug already taken?) Error: ${err.message}`);
        } finally {
            setCategoryLoading(false); 
        }
    };

    const deleteCategory = async (id) => {
        setConfirmMessage(`Are you sure you want to delete this category?`);
        setConfirmVariant("danger");
        setConfirmAction(() => async () => {
            try {
                await authFetch(`${ADMIN_CATEGORIES_URL}${id}/`, { method: "DELETE" });
                fetchCategories();
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
    
    const fetchPayoutHistory = async () => { 
        if (!isVendor) return;
        setPayoutsLoading(true);
        setPayoutsError(null);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");
            const response = await fetch(VENDOR_PAYOUT_HISTORY_URL, { 
                headers: { 'Authorization': `JWT ${token}` } 
            });
            if (!response.ok) throw new Error(`Failed to fetch payout history. Status: ${response.status}`);
            const data = await response.json();
            setPayouts(data.results || data);
        } catch (err) {
            setPayoutsError(err.message);
        } finally {
            setPayoutsLoading(false);
        }
    };

    const handlePayoutRequest = async () => { 
        if (!dashboardData?.available_for_payout || dashboardData.available_for_payout <= 0) {
            alert("No available balance to request payout.");
            return;
        }
        setPayoutRequestLoading(true);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");
            const response = await fetch(VENDOR_PAYOUT_REQUEST_URL, {
                method: 'POST',
                headers: { 
                    'Authorization': `JWT ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to request payout.`);
            }
            fetchDashboardData();
            fetchPayoutHistory();
            alert("Payout requested successfully!");
        } catch (err) {
            alert(`Error requesting payout: ${err.message}`); 
        } finally {
            setPayoutRequestLoading(false);
        }
    };

    const fetchBankDetails = async () => {
        if (!isVendor) return;
        setBankDetailsLoading(true);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");
            const response = await fetch(VENDOR_BANK_DETAILS_URL, {
                headers: { 'Authorization': `JWT ${token}` }
            });
            if (response.status === 404) {
                setBankDetails({ account_holder_name: '', account_number: '', ifsc_code: '', upi_id: '' });
                setBankDetailsError(null);
            } else if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to fetch bank details.`);
            } else {
                const data = await response.json();
                setBankDetails(data);
            }
        } catch (err) {
            setBankDetailsError(err.message);
        } finally {
            setBankDetailsLoading(false);
        }
    };

    const handleSaveBankDetails = async (e) => {
        e.preventDefault();
        setIsSavingBank(true);
        setBankDetailsError(null);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");
            const response = await fetch(VENDOR_BANK_DETAILS_URL, {
                method: 'POST',
                headers: { 
                    'Authorization': `JWT ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bankDetails)
            });
            if (!response.ok) {
                const errData = await response.json();
                let errorMsg = errData.error || "Failed to save details.";
                if (errData.ifsc_code) errorMsg = `IFSC: ${errData.ifsc_code[0]}`;
                if (errData.upi_id) errorMsg = `UPI: ${errData.upi_id[0]}`;
                if (errData.account_number) errorMsg = `Account: ${errData.account_number[0]}`;
                throw new Error(errorMsg);
            }
            const savedData = await response.json();
            setBankDetails(savedData); 
            alert("Bank details saved successfully!");
        } catch (err) {
            setBankDetailsError(err.message);
        } finally {
            setIsSavingBank(false);
        }
    };

    const executeStatusUpdate = async (orderId, newStatus, trackingNumber = null) => {
        setUpdatingOrderId(orderId);
        setTrackingError(null);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");

            const body = { status: newStatus };
            if (trackingNumber) {
                body.tracking_number = trackingNumber;
            }

            const response = await fetch(`${STATUS_UPDATE_URL}${orderId}/`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `JWT ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update status to ${newStatus}.`);
            }

            const updatedData = await response.json();

            setVendorOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, ...updatedData } : order
            ));
            
            setShowTrackingModal(false);
            setTrackingOrderId(null);
            setTrackingNumber("");

        } catch (err) {
            setTrackingError(err.message); 
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleStatusConfirmation = (orderId, newStatus) => {
        if (newStatus === 'Shipped') {
            setTrackingOrderId(orderId);
            setShowTrackingModal(true);
            setTrackingNumber("");
            setTrackingError(null);
        } else {
            setConfirmMessage(`Confirm marking Order ID ${orderId} as '${newStatus}'? This action will notify the customer.`);
            setConfirmVariant("primary");
            setConfirmAction(() => () => executeStatusUpdate(orderId, newStatus));
            setShowConfirmModal(true);
        }
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

    // --- UPDATED NavLink Styling ---
    const navLinkClasses = (view, activeView) => {
        const base = "flex items-center w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02]";
        const style = {
            active: 'font-semibold text-white shadow-lg',
            inactive: `text-gray-700 hover:text-white`
        };
        // Special case for admin: use olive theme
        const themeColor = OLIVE_THEME.main;
        const hoverColor = OLIVE_THEME.light;
        
        const isActive = activeView === view;
        return `${base} ${isActive ? style.active : `hover:bg-[${hoverColor}] hover:text-[${themeColor}]`}`;
    };

    // --- UPDATED Spinner ---
    const renderSpinner = (text = "Loading...") => (
        <div className="flex flex-col items-center justify-center p-10 min-h-[300px]">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-5xl" style={{ color: OLIVE_THEME.main }} />
            <p className="mt-4 text-gray-600">{text}</p>
        </div>
    );

    const handlePayoutUpdate = async (payoutId, newStatus) => {
        const payout = adminPayouts.find(p => p.id === payoutId);
        if (!payout) return;

        const action = newStatus === 'COMPLETED' ? 'Mark as Paid' : 'Reject';
        
        setConfirmMessage(`Are you sure you want to ${action} the payout request of ₹${payout.amount} for ${payout.vendor_name}?`);
        setConfirmVariant(newStatus === 'COMPLETED' ? "success" : "danger");
        
        setConfirmAction(() => async () => {
            setIsPayoutUpdating(payoutId); 
            try {
                await authFetch(`${ADMIN_UPDATE_PAYOUT_URL}${payoutId}/`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: newStatus })
                });
                fetchAdminPayouts();
            } catch (err) {
                alert(`Failed to ${action} payout: ${err.message}`);
            } finally {
                setIsPayoutUpdating(null); 
            }
        });
        setShowConfirmModal(true);
    };

    // --- Helper function for theme-aware form inputs ---
    const formInputClasses = (hasError = false) => {
        return `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            hasError ? 'border-red-500' : 'border-gray-300'
        } focus:ring-[${OLIVE_THEME.main}] focus:border-[${OLIVE_THEME.main}]`;
    };

    // --- Helper function for theme-aware buttons ---
    const ThemeButton = ({ onClick, disabled, className = '', children, type = 'button', variant = 'primary' }) => {
        const variants = {
            primary: {
                bg: OLIVE_THEME.main,
                hover: OLIVE_THEME.dark,
                text: 'white'
            },
            danger: {
                bg: '#DC2626', // red-600
                hover: '#B91C1C', // red-700
                text: 'white'
            },
            secondary: {
                bg: '#6B7280', // gray-500
                hover: '#4B5563', // gray-600
                text: 'white'
            },
        };
        const v = variants[variant] || variants.primary;

        return (
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-md shadow-sm transition-all duration-200 ease-in-out transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                style={{ 
                    backgroundColor: disabled ? '#D1D5DB' : v.bg, 
                    color: v.text 
                }}
                onMouseOver={e => !disabled && (e.currentTarget.style.backgroundColor = v.hover)}
                onMouseOut={e => !disabled && (e.currentTarget.style.backgroundColor = v.bg)}
            >
                {children}
            </button>
        );
    };

    // --------------------------------------------------
    // 💰 --- START: ADMIN RENDER Functions (Styled) ---
    // --------------------------------------------------

    const renderAdminDashboard = () => {
        if (!adminDashboardData) return renderSpinner("Loading Dashboard...");
        const stats = adminDashboardData; 
        
        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Admin Dashboard</h3>
                
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: OLIVE_THEME.light, border: `1px solid ${OLIVE_THEME.main}` }}>
                    <p style={{ color: OLIVE_THEME.dark }}>
                        <strong>Platform Commission</strong> is automatically calculated as <strong>10%</strong> of "Total Sales"
                        from all completed vendor orders.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.dark }}>
                        <h6 className="text-sm font-medium uppercase text-white/80">Total Sales</h6>
                        <h3 className="text-4xl font-bold">₹{stats.total_sales?.toFixed(2) || '0.00'}</h3>
                    </div>
                    <div className="p-6 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.main }}>
                        <h6 className="text-sm font-medium uppercase text-white/80">Total Commission (10%)</h6>
                        <h3 className="text-4xl font-bold">₹{stats.total_commission?.toFixed(2) || '0.00'}</h3>
                    </div>
                    <div className="p-6 rounded-xl shadow-lg text-white bg-gray-700">
                        <h6 className="text-sm font-medium uppercase text-white/80">New Orders (Paid)</h6>
                        <h3 className="text-4xl font-bold">{stats.new_orders}</h3>
                    </div>
                    <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: OLIVE_THEME.light }}>
                        <h6 className="text-sm font-medium uppercase" style={{ color: OLIVE_THEME.dark }}>Pending Vendors</h6>
                        <h3 className="text-4xl font-bold" style={{ color: OLIVE_THEME.main }}>{adminDashboardData.pending_vendors}</h3>
                    </div>
                </div>
            </div>
        );
    };

    const renderAdminVendorMgmt = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold" style={{ color: OLIVE_THEME.text }}>Vendor Management</h3>
                <div className="flex gap-2">
                    <ThemeButton
                        onClick={handleVendorExportExcel}
                        disabled={exportLoading}
                    >
                        {exportLoading ? '...' : 'Export Excel'}
                    </ThemeButton>
                    <ThemeButton
                        onClick={handleExportPdf}
                        variant="danger"
                    >
                        Export PDF
                    </ThemeButton>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Payout</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products (Active)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {adminLoading && (
                            <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading vendors...</td></tr>
                        )}
                        {!adminLoading && allVendors.length === 0 && (
                            <tr><td colSpan="6" className="p-4 text-center text-gray-500">No vendors found.</td></tr>
                        )}
                        {allVendors.map(v => (
                            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{v.store_name}</div>
                                    <div className="text-sm text-gray-500">{v.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        v.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {v.is_approved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    ₹{parseFloat(v.total_sales).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: OLIVE_THEME.main }}>
                                    ₹{parseFloat(v.available_for_payout).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {v.active_products}
                                    <span className="text-xs text-gray-500"> / {v.total_products} Total</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {!v.is_approved && (
                                        <button
                                            className="font-semibold transition-colors"
                                            style={{ color: OLIVE_THEME.main }}
                                            onClick={() => approveVendor(v.id, "APPROVE")}
                                        >
                                            Approve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAdminProductMgmt = () => (
        <div>
            <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>All Products</h3>
            <div className="mt-4 space-y-3">
                {allProducts.length === 0 && <div className="p-4 rounded-md bg-blue-100 text-blue-700">No products found.</div>}
                {allProducts.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap justify-between items-center transition-all hover:shadow-md">
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
                        <div className="flex-shrink-0 ml-0 md:ml-4 mt-2 md:mt-0 flex gap-2">
                            {p.status !== 'APPROVED' && (
                                <button
                                    className="p-2 w-10 h-10 rounded-full text-green-600 hover:bg-green-50 transition-colors"
                                    title="Approve"
                                    onClick={() => updateProductStatus(p.id, 'APPROVED')}
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                            )}
                            {p.status !== 'REJECTED' && (
                                <button
                                    className="p-2 w-10 h-10 rounded-full text-yellow-600 hover:bg-yellow-50 transition-colors"
                                    title="Reject"
                                    onClick={() => updateProductStatus(p.id, 'REJECTED')}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                            <button 
                                className="p-2 w-10 h-10 rounded-full text-red-600 hover:bg-red-50 transition-colors"
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

    const renderAdminPayoutMgmt = () => {
        if (adminLoading) return renderSpinner("Loading Payout Requests...");

        const pendingPayouts = adminPayouts.filter(p => p.status === 'PENDING');
        const otherPayouts = adminPayouts.filter(p => p.status !== 'PENDING');

        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Payout Requests</h3>

                <h4 className="text-xl font-semibold mb-4 text-yellow-700">Pending Requests</h4>
                {pendingPayouts.length === 0 ? (
                    <div className="bg-green-100 text-green-700 p-4 rounded-md">
                        No pending payout requests.
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        {pendingPayouts.map(p => {
                            const isUpdating = isPayoutUpdating === p.id;
                            const details = p.vendor_payment_details || {};
                            const hasUpi = details.upi_id;
                            const hasBank = details.account_number && details.ifsc_code;

                            return (
                                <div key={p.id} className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300">
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        
                                        <div className="pr-4">
                                            <strong className="text-xl font-bold text-gray-900">₹{parseFloat(p.amount).toFixed(2)}</strong><br />
                                            <small className="text-sm text-gray-500">To: <strong>{p.vendor_name}</strong></small><br />
                                            <small className="text-sm text-gray-500">Req: {new Date(p.requested_at).toLocaleString()}</small>
                                        </div>
                                        
                                        <div className="flex-1 bg-gray-50 p-3 rounded-md border min-w-[200px] my-2 md:my-0">
                                            <h5 className="text-sm font-semibold text-gray-800 mb-1">Payment Details:</h5>
                                            {hasUpi ? (
                                                <div>
                                                    <strong className="text-blue-600">UPI:</strong>
                                                    <p className="font-mono">{details.upi_id}</p>
                                                </div>
                                            ) : hasBank ? (
                                                <div className="text-sm">
                                                    <p><strong>Holder:</strong> {details.account_holder_name}</p>
                                                    <p><strong>Acct:</strong> {details.account_number}</p>
                                                    <p><strong>IFSC:</strong> {details.ifsc_code}</p>
                                                </div>
                                            ) : (
                                                <p className="text-red-500 text-sm italic">Vendor has not provided payment details.</p>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0 ml-0 md:ml-4 mt-2 md:mt-0 space-x-2">
                                            <ThemeButton
                                                onClick={() => handlePayoutUpdate(p.id, "COMPLETED")}
                                                disabled={isUpdating || (!hasUpi && !hasBank)}
                                                title={(!hasUpi && !hasBank) ? "Vendor has not provided payment details" : "Mark as paid"}
                                            >
                                                {isUpdating ? (
                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                                )}
                                                Mark as Paid
                                            </ThemeButton>
                                            <ThemeButton
                                                variant="danger"
                                                onClick={() => handlePayoutUpdate(p.id, "REJECTED")}
                                                disabled={isUpdating}
                                            >
                                                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Reject
                                            </ThemeButton>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <hr className="my-8" />

                <h4 className="text-xl font-semibold mb-4 text-gray-600">Completed History</h4>
                <div className="mt-4 space-y-3">
                    {otherPayouts.length === 0 ? (
                        <p className="text-gray-500">No completed payout history.</p>
                    ) : (
                          otherPayouts.map(p => (
                            <div key={p.id} className="bg-gray-50 p-3 rounded-lg opacity-80">
                                <div className="flex flex-wrap justify-between items-center">
                                    <div>
                                        <strong className={`font-semibold ${p.status === 'COMPLETED' ? 'text-green-700' : 'text-red-700'}`}>
                                            {p.status}
                                        </strong><br />
                                        <span className="text-gray-700">₹{parseFloat(p.amount).toFixed(2)}</span>
                                        <small className="text-sm text-gray-500 ml-2">to {p.vendor_name || 'Unknown'}</small>
                                    </div>
                                    <small className="text-sm text-gray-500">{new Date(p.requested_at).toLocaleDateString()}</small>
                                </div>
                            </div>
                         ))
                    )}
                </div>
            </div>
        );
    };

    const renderAdminOrderMgmt = () => {
        if (!allOrders) return renderSpinner("Loading Orders...");

        let vendorData = [], productData = [], statusData = [];

        if (allOrders.length > 0) {
            const vendorDataMap = {};
            allOrders.forEach(order => {
                const vendor = order.vendor_name || "Unknown";
                vendorDataMap[vendor] = vendorDataMap[vendor] || { vendor, totalOrders: 0, totalRevenue: 0 };
                vendorDataMap[vendor].totalOrders += 1;
                vendorDataMap[vendor].totalRevenue += Number(order.total_amount || 0);
            });
            vendorData = Object.values(vendorDataMap);

            const productDataMap = {};
            allOrders.forEach(order => {
                order.items.forEach(item => {
                    const product = item.product_name || "Unknown";
                    productDataMap[product] = productDataMap[product] || { product, quantity: 0 };
                    productDataMap[product].quantity += Number(item.quantity || 0);
                });
            });
            productData = Object.values(productDataMap);

            const statusMap = {};
            allOrders.forEach(order => {
                const status = order.status || "Unknown";
                statusMap[status] = (statusMap[status] || 0) + 1;
            });
            statusData = Object.entries(statusMap).map(([status, value]) => ({ name: status, value }));
        }

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold" style={{ color: OLIVE_THEME.text }}>Order Dashboard</h3>
                    <div className="flex gap-2">
                        <ThemeButton
                            onClick={handleOrderExportExcel}
                            disabled={exportLoading}
                        >
                            {exportLoading ? '...' : 'Export All Orders (Excel)'}
                        </ThemeButton>
                    </div>
                </div>
            
                <div className="space-y-10">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Orders by Vendor</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={vendorData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <XAxis dataKey="vendor" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalOrders" fill={CHART_COLORS[0]} name="Total Orders" />
                                <Bar dataKey="totalRevenue" fill={CHART_COLORS[1]} name="Revenue (₹)" />
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
                                <Bar dataKey="quantity" fill={CHART_COLORS[2]} name="Quantity Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">Order Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} fill={CHART_COLORS[0]} label>
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderAdminCategoryMgmt = () => (
        <div>
            <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Manage Categories</h3>
            <form onSubmit={createCategory} className="flex gap-3 mt-4">
                <input
                    type="text"
                    className={`flex-grow block w-full rounded-md shadow-sm border-gray-300 focus:ring-[${OLIVE_THEME.main}] focus:border-[${OLIVE_THEME.main}] disabled:opacity-50`}
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    disabled={categoryLoading}
                />
                <ThemeButton type="submit" disabled={categoryLoading} className="w-28">
                    {categoryLoading ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add
                        </>
                    )}
                </ThemeButton>
            </form>
            <hr className="my-6" />
            <div className="mt-3 space-y-3">
                {categories.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap justify-between items-center gap-2 hover:shadow-md transition-shadow">
                        <span className="font-medium">{c.name}</span>
                        <button
                            className="p-2 w-10 h-10 rounded-full text-red-600 hover:bg-red-50 transition-colors"
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
    
    // ✅ ADDED: Admin Support Messages Render Function
    const renderAdminSupportMessages = () => {
        if (messagesLoading) return renderSpinner("Loading Support Messages...");
        if (messagesError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{messagesError}</div>;

        const openMessages = supportMessages.filter(msg => !msg.is_resolved);
        const resolvedMessages = supportMessages.filter(msg => msg.is_resolved);

        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Customer Support Messages</h3>

                <h4 className="text-xl font-semibold mb-4 text-yellow-700">Open Messages ({openMessages.length})</h4>

                {openMessages.length === 0 ? (
                    <div className="bg-green-100 text-green-700 p-4 rounded-md">
                        No open support messages found. All clear!
                    </div>
                ) : (
                    <div className="space-y-4 mb-8">
                        {openMessages.map(msg => (
                            <div 
                                key={msg.id} 
                                className="bg-white p-4 rounded-lg shadow-md border border-yellow-300 transition-shadow duration-200"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <strong className="text-lg font-semibold text-gray-900">ID #{msg.id} - {msg.name}</strong> 
                                        <span className="ml-3 text-sm text-gray-500 block sm:inline-block">({msg.email})</span>
                                    </div>
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                        {new Date(msg.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed p-3 rounded-md border mb-4" style={{ borderColor: OLIVE_THEME.light, backgroundColor: '#FAFAFA' }}>
                                    {msg.message}
                                </p>
                                {/* RESOLVE BUTTON */}
                                <ThemeButton
                                    onClick={() => handleResolveMessage(msg.id)}
                                    disabled={isResolving === msg.id}
                                    variant="primary"
                                    className="!py-1 !px-3 !text-sm"
                                >
                                    {isResolving === msg.id ? (
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                    ) : (
                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    )}
                                    Mark as Resolved
                                </ThemeButton>
                            </div>
                        ))}
                    </div>
                )}
                
                <hr className="my-8"/>

                <h4 className="text-xl font-semibold mb-4 text-gray-600">Resolved History ({resolvedMessages.length})</h4>
                <div className="space-y-3 opacity-70">
                    {resolvedMessages.length === 0 ? (
                        <p className="text-gray-500">No resolved messages yet.</p>
                    ) : (
                        resolvedMessages.map(msg => (
                            <div key={msg.id} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center text-sm">
                                <span>ID #{msg.id}: {msg.name} - {msg.email}</span>
                                <span className="text-green-600 font-semibold"><FontAwesomeIcon icon={faCheck} className="mr-1"/> Resolved</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    // --------------------------------------------------
    // 💰 --- END: ADMIN RENDER Functions ---
    // --------------------------------------------------


    // --- VENDOR Render Functions (Styled) ---
    const renderVendorDashboard = () => {
        if (dashboardLoading) return renderSpinner("Loading Dashboard...");
        if (dashboardError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{dashboardError}</div>;
        
        const metrics = dashboardData || { lifetime_net_earnings: 0, available_for_payout: 0, total_orders: 0, active_products: 0 };
    
        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>{user.store_name || user.username} Dashboard</h3>

                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: OLIVE_THEME.light, border: `1px solid ${OLIVE_THEME.main}` }}>
                    <p style={{ color: OLIVE_THEME.dark }}>
                        <strong>Welcome, {user.store_name}!</strong> Your "All-Time Earnings" reflect your total net profit.
                        Your "Available for Payout" balance is what you can withdraw now.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.main }}>
                        <h6 className="text-sm font-medium uppercase text-white/80">Available for Payout</h6>
                        <h2 className="text-4xl font-bold">₹{metrics.available_for_payout ? metrics.available_for_payout.toFixed(2) : '0.00'}</h2>
                    </div>
                    <div className="p-5 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.dark }}>
                        <h6 className="text-sm font-medium uppercase text-white/80">All-Time Earnings (after commission)</h6>
                        <h2 className="text-4xl font-bold">₹{metrics.lifetime_net_earnings ? metrics.lifetime_net_earnings.toFixed(2) : '0.00'}</h2>
                    </div>
                    <div className="p-5 rounded-xl shadow-lg text-white bg-gray-700"><h6 className="text-sm font-medium uppercase text-white/80">Total Orders</h6><h2 className="text-4xl font-bold">{metrics.total_orders}</h2></div>
                    <div className="p-5 rounded-xl shadow-lg" style={{ backgroundColor: OLIVE_THEME.light }}><h6 className="text-sm font-medium uppercase" style={{ color: OLIVE_THEME.dark }}>Active Products</h6><h2 className="text-4xl font-bold" style={{ color: OLIVE_THEME.main }}>{metrics.active_products}</h2></div>
                </div>
                
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                    <h5 className="font-bold text-gray-800">Admin Approval Workflow</h5>
                    <p className="text-gray-700">All new products start as <strong>PENDING</strong>. You can edit/delete.</p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <ThemeButton onClick={() => handleProductAction('add')}>
                        <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Product
                    </ThemeButton>
                    <ThemeButton onClick={() => setActiveView('vendor-products')} variant="secondary">
                        <FontAwesomeIcon icon={faList} className="mr-2" /> View Inventory
                    </ThemeButton>
                </div>
            </div>
        );
    };

    const renderProductManagement = () => (
        <div>
            <h3 className="text-3xl font-bold mb-4" style={{ color: OLIVE_THEME.text }}>Product Management</h3>
            <ThemeButton onClick={() => handleProductAction('add')} className="mb-4">
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Product
            </ThemeButton>
            
            {productsLoading && renderSpinner("Loading Products...")}
            {productsError && <div className="p-4 rounded-md bg-red-100 text-red-700">{productsError}</div>}
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {vendorProducts.length === 0 ? (
                        <li className="p-4 text-gray-500">You have not added any products yet.</li>
                    ) : (
                        vendorProducts.map(p => (
                            <li key={p.id} className="p-4 flex flex-wrap justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <span className="font-medium text-gray-900">{p.name}</span>{" "}
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
                                        p.status === "APPROVED" ? 'bg-green-600' :
                                        p.status === "PENDING" ? 'bg-yellow-500' : 'bg-red-600'
                                    }`}>{p.status}</span>{" "}
                                    | ₹{parseFloat(p.price).toFixed(2)}
                                </div>
                                <div className="flex-shrink-0 ml-0 sm:ml-4 space-x-2 mt-2 sm:mt-0">
                                    <ThemeButton onClick={() => handleProductAction('edit', p.id)} variant="secondary">
                                        Edit
                                    </ThemeButton>
                                    <ThemeButton onClick={() => handleProductAction('delete', p.id)} variant="danger">
                                        Delete
                                    </ThemeButton>
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
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Customer Orders</h3>
                
                <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID / Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Summary</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vendorOrders.map(order => {
                                const nextStatus = STATUS_TRANSITIONS[order.status];
                                const isUpdating = updatingOrderId === order.id;
                                const isUpdateDisabled = !nextStatus || isUpdating;
                                
                                // Calculate total price for this order manually based on items
                                const orderTotal = order.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
                                
                                // Create a comma-separated string of items
                                const itemsSummary = order.items.map(i => `${i.product_name} (x${i.quantity})`).join(', ');

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Column 1: ID & Date */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                                            <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                                            {order.tracking_number && (
                                                <div className="text-xs text-blue-600 font-mono mt-1">
                                                    <FontAwesomeIcon icon={faTruck} className="mr-1"/>
                                                    {order.tracking_number}
                                                </div>
                                            )}
                                        </td>

                                        {/* Column 2: Customer */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {order.customer_name}
                                        </td>

                                        {/* Column 3: Items (Truncated with hover) */}
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={itemsSummary}>
                                            {itemsSummary}
                                        </td>

                                        {/* Column 4: Total Amount */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₹{orderTotal.toFixed(2)}
                                        </td>

                                        {/* Column 5: Status Badge */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span 
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${
                                                    order.status === 'Paid' ? 'bg-green-600' :
                                                    order.status === 'Shipped' ? 'bg-blue-600' :
                                                    order.status === 'Delivered' ? 'bg-sky-500' : 'bg-gray-500'
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        {/* Column 6: Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {order.status !== 'Delivered' && order.status !== 'Failed' ? (
                                                <ThemeButton
                                                    className="!py-1 !px-3 !text-xs"
                                                    variant="secondary"
                                                    disabled={isUpdateDisabled}
                                                    onClick={() => handleStatusConfirmation(order.id, nextStatus)} 
                                                >
                                                    {isUpdating ? (
                                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            Mark {nextStatus} 
                                                            <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                                                        </>
                                                    )}
                                                </ThemeButton>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Mobile Hint */}
                <div className="block sm:hidden mt-2 text-xs text-gray-400 text-center">
                    Scroll horizontally to view full order details
                </div>
            </div>
        );
    };
    const renderVendorPayouts = () => {
        const availableAmount = dashboardData?.available_for_payout || 0;
        const canRequest = availableAmount > 0 && !payoutRequestLoading;
        
        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Payouts</h3>
                
                <div className="mb-6 p-6 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.main }}>
                    <h6 className="text-sm font-medium uppercase text-white/80">Available for Payout</h6>
                    <h3 className="text-4xl font-bold">₹{availableAmount.toFixed(2)}</h3>
                </div>

                <ThemeButton
                    className="w-full sm:w-auto px-6 py-3"
                    onClick={handlePayoutRequest}
                    disabled={!canRequest}
                >
                    {payoutRequestLoading ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    ) : (
                        <FontAwesomeIcon icon={faRupeeSign} className="mr-2" />
                    )}
                    Request Payout of ₹{availableAmount.toFixed(2)}
                </ThemeButton>
                {!canRequest && !payoutRequestLoading && (
                    <p className="text-sm text-gray-500 mt-2">You must have an available balance to request a payout.</p>
                )}

                <hr className="my-8" />

                <h4 className="text-xl font-semibold mb-4">Payout History</h4>
                {payoutsLoading && renderSpinner("Loading Payout History...")}
                {payoutsError && <div className="p-4 rounded-md bg-red-100 text-red-700">{payoutsError}</div>}
                
                {!payoutsLoading && !payoutsError && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {payouts.length === 0 ? (
                                <li className="p-4 text-gray-500">No payout history found.</li>
                            ) : (
                                payouts.map(payout => (
                                    <li key={payout.id} className="p-4 flex flex-wrap justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div>
                                            <span className="font-medium text-gray-900">Amount: ₹{parseFloat(payout.amount).toFixed(2)}</span>
                                            <br />
                                            <small className="text-gray-500">
                                                Requested: {new Date(payout.requested_at).toLocaleString()}
                                            </small>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
                                            payout.status === "COMPLETED" ? 'bg-green-600' :
                                            payout.status === "PENDING" ? 'bg-yellow-500' : 'bg-red-600'
                                        }`}>
                                            {payout.status}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const renderVendorBankSettings = () => {
        if (bankDetailsLoading) return renderSpinner("Loading settings...");
    
        return (
            <div className="max-w-2xl">
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Payment Settings</h3>
                <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: OLIVE_THEME.light }}>
                    <p className="text-sm" style={{ color: OLIVE_THEME.dark }}>
                        <FontAwesomeIcon icon={faShieldAlt} className="mr-2"/>
                        Please provide your payment details. The admin will use these
                        to send you manual payouts. You can provide either
                        Bank Details or a UPI ID.
                    </p>
                </div>
    
                {bankDetailsError && (
                    <div className="p-4 rounded-md bg-red-100 text-red-700 mb-4">
                        Error: {bankDetailsError}
                    </div>
                )}
    
                <form onSubmit={handleSaveBankDetails} className="space-y-4 bg-white p-6 rounded-lg shadow-lg border">
                    
                    <h4 className="text-lg font-semibold text-gray-700">Bank Account Details (NEFT/IMPS)</h4>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                        <input 
                            type="text" 
                            className={formInputClasses(false)}
                            value={bankDetails.account_holder_name || ''}
                            onChange={(e) => setBankDetails({...bankDetails, account_holder_name: e.target.value})}
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input 
                            type="text" 
                            className={formInputClasses(false)}
                            value={bankDetails.account_number || ''}
                            onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})}
                            placeholder="e.g. 1234567890"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                        <input 
                            type="text" 
                            className={`${formInputClasses(false)} uppercase`}
                            value={bankDetails.ifsc_code || ''}
                            onChange={(e) => setBankDetails({...bankDetails, ifsc_code: e.target.value.toUpperCase()})}
                            placeholder="e.g. HDFC0001234"
                        />
                    </div>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-lg font-medium text-gray-500">OR</span>
                        </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-700">UPI (GPay/PhonePe)</h4>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                        <input 
                            type="text" 
                            className={formInputClasses(false)}
                            value={bankDetails.upi_id || ''}
                            onChange={(e) => setBankDetails({...bankDetails, upi_id: e.target.value})}
                            placeholder="e.g. yourname@okhdfcbank"
                        />
                    </div>
                    
                    <ThemeButton type="submit" className="w-full" disabled={isSavingBank}>
                        {isSavingBank ? "Saving..." : "Save Bank Details"}
                    </ThemeButton>
                </form>
            </div>
        );
    };


    // --- CUSTOMER Render Functions (Styled) ---
    const renderProfileView = () => (
        <div>
            <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Profile Details</h3>

            {(isAdmin || isVendor) && (
                <div className="mb-6 p-4 border rounded-lg shadow-sm" style={{ backgroundColor: OLIVE_THEME.light }}>
                    <h5 className="font-semibold" style={{ color: OLIVE_THEME.dark }}>Your Dashboard</h5>
                    <p className="mb-3" style={{ color: OLIVE_THEME.dark }}>
                        {isAdmin 
                            ? "Return to the main administrative dashboard." 
                            : "Return to your main vendor dashboard."
                        }
                    </p>
                    <ThemeButton
                        onClick={() => setActiveView(isAdmin ? 'admin-dashboard' : 'vendor-dashboard')}
                        className="w-full sm:w-auto"
                    >
                        <FontAwesomeIcon icon={isAdmin ? faTachometerAlt : faChartBar} className="mr-3" />
                        Go to Analysis Dashboard
                    </ThemeButton>
                </div>
            )}

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
                case 'admin-payouts': return renderAdminPayoutMgmt();
                case 'admin-support-messages': return renderAdminSupportMessages(); // ✅ ADDED CASE
                default: return renderAdminDashboard();
            }
        }
        // 2. VENDOR VIEW
        if (isVendor) {
            switch(activeView) {
                case 'vendor-dashboard': return renderVendorDashboard();
                case 'vendor-products': return renderProductManagement();
                case 'vendor-orders': return renderVendorOrders();
                case 'vendor-payouts': return renderVendorPayouts();
                case 'vendor-bank-settings': return renderVendorBankSettings(); 
                case 'profile': return renderProfileView();
                case 'security': 
                    return (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Old Password</label>
                                <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} />
                            </div>
                            <ThemeButton type="submit" disabled={passLoading}>
                                Update Password
                            </ThemeButton>
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
                            <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} />
                        </div>
                        <ThemeButton type="submit" disabled={passLoading}>
                            Update Password
                        </ThemeButton>
                    </form>
                );
            case 'discounts':
                return (
                    <div className="space-y-3">
                        {discounts.map(d => (
                            <div key={d.id} className="p-4 rounded-md flex justify-between items-center" style={{ backgroundColor: OLIVE_THEME.light }}>
                                <span style={{ color: OLIVE_THEME.dark }}><strong>{d.code}</strong>: {d.description}</span>
                                <ThemeButton onClick={() => copyToClipboard(d.code)}>
                                    Copy
                                </ThemeButton>
                            </div>
                        ))}
                    </div>
                );
            case 'profile':
            default: 
                return renderProfileView();
        }
    };

    // "Guard Clause" for logged-out users (Styled)
    if (!user) {
        return (
            <div className="container mx-auto my-12 p-6 text-center">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-6 rounded-md shadow-md max-w-lg mx-auto">
                    <h4 className="text-xl font-bold mb-2">Please Log In</h4>
                    <p className="mb-4">You must be logged in to view your account details.</p>
                    <hr className="my-4 border-yellow-300" />
                    <ThemeButton onClick={onLoginClick}>
                        <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                        Log In / Register
                    </ThemeButton>
                </div>
            </div>
        );
    }
    
    // --- Confirmation Modal (Reusable & Styled) ---
    const ConfirmationModal = () => {
        if (!showConfirmModal) return null;

        const variantClasses = {
            danger: {
                alert: 'bg-red-100 text-red-700',
                button: 'bg-red-600 hover:bg-red-700 text-white'
            },
            primary: {
                alert: 'bg-blue-100 text-blue-700',
                button: `text-white`, // BG color set by style
            },
            success: {
                alert: 'bg-green-100 text-green-700',
                button: `text-white`, // BG color set by style
            }
        };
        
        const classes = variantClasses[confirmVariant] || variantClasses.primary;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-300" aria-modal="true" role="dialog">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transition-all transform scale-100 opacity-100">
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
                            className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                            onClick={() => setShowConfirmModal(false)}>
                            Cancel
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${classes.button}`}
                            style={{ 
                                backgroundColor: (confirmVariant === 'primary' || confirmVariant === 'success') ? OLIVE_THEME.main : undefined,
                            }}
                            onMouseOver={e => {
                                if (confirmVariant !== 'danger') e.currentTarget.style.backgroundColor = OLIVE_THEME.dark;
                            }}
                            onMouseOut={e => {
                                if (confirmVariant !== 'danger') e.currentTarget.style.backgroundColor = OLIVE_THEME.main;
                            }}
                            onClick={handleConfirm}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Tracking Modal (Styled) ---
    const TrackingModal = () => {
        if (!showTrackingModal) return null;
        
        const isUpdating = updatingOrderId === trackingOrderId;

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!trackingNumber) {
                setTrackingError("Tracking number is required to mark as shipped.");
                return;
            }
            executeStatusUpdate(trackingOrderId, 'Shipped', trackingNumber);
        };

        const handleClose = () => {
            if (isUpdating) return;
            setShowTrackingModal(false);
            setTrackingOrderId(null);
            setTrackingNumber("");
            setTrackingError(null);
        }

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-300" aria-modal="true" role="dialog">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h5 className="text-lg font-semibold">Ship Order (ID: {trackingOrderId})</h5>
                        <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl" disabled={isUpdating}>&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-gray-600">
                            Please enter the tracking number provided by your shipping carrier.
                        </p>
                        <div>
                            <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">
                                Tracking Number
                            </label>
                            <input
                                type="text"
                                id="trackingNumber"
                                className={formInputClasses(trackingError)}
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="e.g. 1Z999AA10123456789"
                                required
                                disabled={isUpdating}
                            />
                        </div>
                        {trackingError && (
                            <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
                                {trackingError}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
                        <button 
                            type="button"
                            className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                            onClick={handleClose}
                            disabled={isUpdating}
                        >
                            Cancel
                        </button>
                        <ThemeButton type="submit" disabled={isUpdating}>
                            {isUpdating ? (
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                            ) : (
                                <FontAwesomeIcon icon={faTruck} className="mr-2" />
                            )}
                            Mark as Shipped
                        </ThemeButton>
                    </div>
                </form>
            </div>
        );
    };

    // --- Notification Logic ---
    // 1. Count pending payouts for Admin (requests coming FROM vendors)
    const pendingAdminPayoutsCount = adminPayouts.filter(p => p.status === 'PENDING').length;

    // 2. Count pending payouts for Vendor (requests sent TO admin)
    const pendingVendorPayoutsCount = payouts.filter(p => p.status === 'PENDING').length;
    
    // 3. Count pending support messages for Admin
    const pendingSupportMessagesCount = supportMessages.filter(msg => !msg.is_resolved).length;


    // ------------------- MAIN RETURN -------------------
    const navThemeColor = OLIVE_THEME.main;
    const navHoverColor = OLIVE_THEME.light;
    const navHoverTextColor = OLIVE_THEME.dark;

    return (
        <div className="container mx-auto my-12 px-4">
            
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold" style={{ color: OLIVE_THEME.text }}>
                    {isAdmin ? "Admin Portal" : (isVendor ? (user.store_name || "Vendor Dashboard") : "My Account")}
                </h2>
                
                {(isAdmin || isVendor) && (
                    <ThemeButton
                        onClick={() => {
                            if (isAdmin) navigate('/admin/dashboard');
                            else if (isVendor) navigate('/vendor/dashboard');
                        }}
                    >
                        <FontAwesomeIcon icon={isAdmin ? faTachometerAlt : faChartBar} className="mr-2" />
                        Analysis
                    </ThemeButton>
                )}
            </div>

            <div className="flex flex-col md:flex-row -mx-4">
                
                {/* --- Sidebar --- */}
                <div className="w-full md:w-1/3 lg:w-1/4 px-4 mb-6 md:mb-0 md:sticky md:top-24 md:self-start">
                    <div className="bg-white rounded-xl shadow-lg text-center p-6 mb-6 transition-all hover:shadow-xl">
                        <FontAwesomeIcon 
                            icon={faUserCircle} 
                            className="mb-3 text-7xl"
                            style={{ color: navThemeColor }}
                        />
                        <h5 className="text-xl font-semibold">{user.username}</h5>
                        <p className="text-gray-600">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 text-sm font-semibold text-white rounded-full"
                            style={{ backgroundColor: navThemeColor }}
                        >
                            {user.role}
                        </span>
                    </div>
                    
                    {/* --- Dynamic Navigation --- */}
                    <nav className="flex flex-col space-y-2">

                        {/* 1. ADMIN NAV */}
                        {isAdmin && <>
                            <button onClick={() => setActiveView('admin-dashboard')} className={navLinkClasses('admin-dashboard', activeView)} style={{ backgroundColor: activeView === 'admin-dashboard' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-dashboard') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-dashboard') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faTachometerAlt} className="mr-3 w-5"/> Dashboard</button>
                            <button onClick={() => setActiveView('admin-vendors')} className={navLinkClasses('admin-vendors', activeView)} style={{ backgroundColor: activeView === 'admin-vendors' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-vendors') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-vendors') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faUsersCog} className="mr-3 w-5"/> Vendor Report</button>
                            <button onClick={() => setActiveView('admin-products')} className={navLinkClasses('admin-products', activeView)} style={{ backgroundColor: activeView === 'admin-products' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-products') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-products') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5"/> Product Mgmt</button>
                            <button onClick={() => setActiveView('admin-orders')} className={navLinkClasses('admin-orders', activeView)} style={{ backgroundColor: activeView === 'admin-orders' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-orders') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-orders') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faListCheck} className="mr-3 w-5"/> All Orders</button>
                            <button onClick={() => setActiveView('admin-categories')} className={navLinkClasses('admin-categories', activeView)} style={{ backgroundColor: activeView === 'admin-categories' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-categories') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-categories') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faTasks} className="mr-3 w-5"/> Categories</button>
                            
                            {/* --- ADMIN PAYOUT BUTTON --- */}
                            <button 
                                onClick={() => setActiveView('admin-payouts')} 
                                className={navLinkClasses('admin-payouts', activeView)} 
                                style={{ backgroundColor: activeView === 'admin-payouts' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} 
                                onMouseOver={e => !activeView.includes('admin-payouts') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} 
                                onMouseOut={e => !activeView.includes('admin-payouts') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span><FontAwesomeIcon icon={faMoneyBillTransfer} className="mr-3 w-5"/> Payouts</span>
                                    {pendingAdminPayoutsCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                            {pendingAdminPayoutsCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                            
                            {/* ✅ ADDED SUPPORT MESSAGES BUTTON */}
                            <button 
                                onClick={() => setActiveView('admin-support-messages')} 
                                className={navLinkClasses('admin-support-messages', activeView)} 
                                style={{ backgroundColor: activeView === 'admin-support-messages' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} 
                                onMouseOver={e => !activeView.includes('admin-support-messages') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} 
                                onMouseOut={e => !activeView.includes('admin-support-messages') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span><FontAwesomeIcon icon={faHeadset} className="mr-3 w-5"/> Support Messages</span>
                                    {pendingSupportMessagesCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                            {pendingSupportMessagesCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                        </>}
                        
                        {/* 2. VENDOR NAV */}
                        {isVendor && <>
                            <button onClick={() => setActiveView('vendor-dashboard')} className={navLinkClasses('vendor-dashboard', activeView)} style={{ backgroundColor: activeView === 'vendor-dashboard' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-dashboard') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-dashboard') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faChartBar} className="mr-3 w-5"/> Dashboard</button>
                            <button onClick={() => setActiveView('vendor-products')} className={navLinkClasses('vendor-products', activeView)} style={{ backgroundColor: activeView === 'vendor-products' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-products') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-products') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5"/> Products</button>
                            <button onClick={() => setActiveView('vendor-orders')} className={navLinkClasses('vendor-orders', activeView)} style={{ backgroundColor: activeView === 'vendor-orders' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-orders') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-orders') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faListCheck} className="mr-3 w-5"/> Orders</button>
                            
                            {/* --- VENDOR PAYOUT BUTTON --- */}
                            <button 
                                onClick={() => setActiveView('vendor-payouts')} 
                                className={navLinkClasses('vendor-payouts', activeView)} 
                                style={{ backgroundColor: activeView === 'vendor-payouts' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} 
                                onMouseOver={e => !activeView.includes('vendor-payouts') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} 
                                onMouseOut={e => !activeView.includes('vendor-payouts') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span><FontAwesomeIcon icon={faRupeeSign} className="mr-3 w-5"/> Payouts</span>
                                    {pendingVendorPayoutsCount > 0 && (
                                        <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                            {pendingVendorPayoutsCount}
                                        </span>
                                    )}
                                </div>
                            </button>

                            <button onClick={() => setActiveView('vendor-bank-settings')} className={navLinkClasses('vendor-bank-settings', activeView)} style={{ backgroundColor: activeView === 'vendor-bank-settings' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-bank-settings') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-bank-settings') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faBuilding} className="mr-3 w-5"/> Bank Settings</button>
                        </>}

                        {/* 3. SHARED (CUSTOMER/VENDOR) NAV */}
                        {!isAdmin && <>
                            <button onClick={() => setActiveView('profile')} className={navLinkClasses('profile', activeView)} style={{ backgroundColor: activeView === 'profile' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('profile') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('profile') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faUserCircle} className="mr-3 w-5"/> Profile</button>
                            <button onClick={() => setActiveView('security')} className={navLinkClasses('security', activeView)} style={{ backgroundColor: activeView === 'security' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('security') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('security') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faShieldAlt} className="mr-3 w-5"/> Security</button>
                            
                            <Link 
                                to="/my-orders" 
                                className={`${navLinkClasses('__NEVER_ACTIVE__', activeView)} no-underline`}
                                style={{ '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }}
                                onMouseOver={e => (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)}
                                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}
                            >
                                <FontAwesomeIcon icon={faTruck} className="mr-3 w-5"/> My Orders
                            </Link>
                        </>}

                        {/* 4. CUSTOMER-ONLY NAV */}
                        {!isVendor && !isAdmin && (
                            <button onClick={() => setActiveView('discounts')} className={navLinkClasses('discounts', activeView)} style={{ backgroundColor: activeView === 'discounts' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('discounts') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('discounts') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faTag} className="mr-3 w-5"/> Discounts</button>
                        )}
                    </nav>
                </div>
                
                {/* --- Content Pane --- */}
                <div className="w-full md:w-2/3 lg:w-3/4 px-4">
                    {isAdmin && adminError && !adminLoading && <div className="p-4 rounded-md bg-red-100 text-red-700 mb-4">{adminError}</div>}
                    
                    <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 min-h-[400px] animate-in fade-in duration-300">
                        {renderActiveView()}
                    </div>
                </div>
            </div>
            
            <ConfirmationModal />
            <TrackingModal />
        </div>
    );
}

export default MyPage;