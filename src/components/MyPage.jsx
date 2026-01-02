import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCircle, faShieldAlt, faTag, faTruck, faCopy,
    faBoxOpen, faChartBar, faListCheck, faPlus, 
    faRupeeSign, faList, faSignInAlt, faChevronRight, faCircleCheck, 
    faTruckMoving, faBoxOpen as faBoxOpenSolid, faClock,
    faTasks, faUsersCog, faBuilding, faTachometerAlt, faMoneyBillTransfer,
    faSpinner, faHeadset, faSearch, faFilter, faSort,
    faToggleOn, faToggleOff, faEye, faEyeSlash, faUsers, faHourglassHalf,
    faPercent,
    // ✅ MODERN ICONS
    faPenToSquare, // Edit
    faTrashCan,    // Delete
    faXmark,       // Close/Cancel
    faCheck,       // Save/Approve
    faBan          // Reject
} from '@fortawesome/free-solid-svg-icons';
import { getAuthToken } from '../components/auth'; 
import { useUser } from '../context/UserContext.jsx'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
const VENDOR_PRODUCTS_URL = `${API}/vendor/my-products/`;
const DASHBOARD_URL = `${API}/vendor/dashboard/`;
const VENDOR_ORDERS_URL = `${API}/orders/vendor/`;
const STATUS_UPDATE_URL = `${API}/orders/update_status/`;
const VENDOR_PAYOUT_REQUEST_URL = `${API}/vendor/request-payout/`;
const VENDOR_PAYOUT_HISTORY_URL = `${API}/vendor/payouts/`;
const VENDOR_BANK_DETAILS_URL = `${API}/vendor/bank-details/`; 
const VENDOR_KYC_UPLOAD_URL = `${API}/vendor/kyc/upload/`; 
const CURRENT_USER_URL = `${API}/auth/users/me/`; 

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
const ADMIN_ALL_CUSTOMERS_URL = `${API}/users/admin/customers/all/`;
const ADMIN_EXPORT_EXCEL_URL = `${API}/users/admin/vendors/export/excel/`;

// Support
const ADMIN_SUPPORT_MESSAGES_URL = `${API}/support/admin/list/`; 
const ADMIN_SUPPORT_DETAIL_URL = `${API}/support/admin/`; 

// Status transitions for vendors
const STATUS_TRANSITIONS = {
    'Paid': 'Shipped',
    'Shipped': 'Delivered',
};

// ----------------------------------------------------------------------
// ⭐️ TRENDY SVG ICONS (Outline Style)
// ----------------------------------------------------------------------
const TRENDY_ICONS = {
    edit: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
    ),
    delete: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    approve: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    reject: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    pending: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
};

// ----------------------------------------------------------------------
// ⭐️ Modern Action Button Component
// ----------------------------------------------------------------------
const ModernIconButton = ({ iconName, color, onClick, title, disabled, isLoading, className = "" }) => {
    // Highly polished, soft UI color palettes
    const colors = {
        blue: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100",
        red: "text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-100",
        green: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100",
        yellow: "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100",
        gray: "text-slate-500 bg-slate-50 hover:bg-slate-100 border-slate-200"
    };

    const activeColor = colors[color] || colors.gray;

    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            title={title}
            className={`
                group relative w-8 h-8 rounded-lg flex items-center justify-center border 
                transition-all duration-200 ease-out 
                hover:shadow-sm transform hover:-translate-y-0.5 active:scale-95
                ${activeColor} 
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                ${className}
            `}
        >
            {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
            ) : (
                <span className="transition-transform group-hover:scale-110">
                    {TRENDY_ICONS[iconName]}
                </span>
            )}
        </button>
    );
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

    useEffect(() => {
        if (activeView) {
            const params = new URLSearchParams(location.search);
            if (params.get("view") !== activeView) {
                navigate(`?view=${activeView}`, { replace: true });
            }
        }
    }, [activeView, navigate, location.search]);

    // --- State ---
    const [profileData, setProfileData] = useState(user); 
    
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
    
    // KYC Upload State
    const [kycFile, setKycFile] = useState(null);
    const [isUploadingKyc, setIsUploadingKyc] = useState(false);
    
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
    const [allCustomers, setAllCustomers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState(null);
    const [newCategory, setNewCategory] = useState("");
    
    // ✅ NEW: Category Image State
    const [newCategoryImage, setNewCategoryImage] = useState(null);

    const [categoryLoading, setCategoryLoading] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");
    const [updatingCategoryLoading, setUpdatingCategoryLoading] = useState(false);
    const [adminPayouts, setAdminPayouts] = useState([]);
    const [isPayoutUpdating, setIsPayoutUpdating] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    
    const [supportMessages, setSupportMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [isResolving, setIsResolving] = useState(null);

    // Track which product is currently being updated by Admin
    const [productUpdatingId, setProductUpdatingId] = useState(null);

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

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [sortOrder, setSortOrder] = useState("newest"); 

    // 💰 --- START: DISCOUNT MODAL STATE ---
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountProduct, setDiscountProduct] = useState(null);
    const [discountValue, setDiscountValue] = useState(0);
    const [isDiscountSaving, setIsDiscountSaving] = useState(false);
    // 💰 --- END: DISCOUNT MODAL STATE ---

    // ✅ NEW: Start Editing Mode
    const startEditingCategory = (category) => {
        setEditingCategoryId(category.id);
        setEditingCategoryName(category.name);
    };

    // ✅ NEW: Cancel Editing
    const cancelEditingCategory = () => {
        setEditingCategoryId(null);
        setEditingCategoryName("");
    };

    // ✅ NEW: Save Edited Category
    const updateCategory = async (id) => {
        const trimmedName = editingCategoryName.trim();
        if (!trimmedName) return alert("Category name cannot be empty.");

        setUpdatingCategoryLoading(true);
        
        // Generate a simple slug from the new name
        const newSlug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

        try {
            const response = await authFetch(`${ADMIN_CATEGORIES_URL}${id}/`, {
                method: "PATCH", 
                body: JSON.stringify({ name: trimmedName, slug: newSlug })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update category.");
            }

            // Refresh list and close edit mode
            await fetchCategories();
            setEditingCategoryId(null);
            setEditingCategoryName("");
        } catch (err) {
            alert(`Error updating category: ${err.message}`);
        } finally {
            setUpdatingCategoryLoading(false);
        }
    };

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

    // 💰 --- NEW: Handle KYC Upload ---
    const handleKycUpload = async (e) => {
        e.preventDefault();
        if (!kycFile) return alert("Please select a file first.");

        setIsUploadingKyc(true);
        const formData = new FormData();
        formData.append('kyc_document', kycFile);

        try {
            const token = getAuthToken();
            const response = await fetch(VENDOR_KYC_UPLOAD_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `JWT ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to upload document.");
            }

            alert("KYC Document uploaded successfully!");
            setKycFile(null);
            window.location.reload(); 
        } catch (err) {
            alert(`Error uploading document: ${err.message}`);
        } finally {
            setIsUploadingKyc(false);
        }
    };

    // 💰 --- NEW: Fetch Latest User Profile ---
    const fetchUserProfile = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;
            const response = await fetch(CURRENT_USER_URL, {
                headers: { 'Authorization': `JWT ${token}` }
            });
            if (response.ok) {
                const freshData = await response.json();
                setProfileData(freshData); 
            }
        } catch (err) {
            console.error("Failed to refresh profile:", err);
        }
    };

    // --- Data Fetching Logic ---
    useEffect(() => {
        if (user) {
            fetchUserProfile();

            if (isVendor) {
                if (!dashboardData) fetchDashboardData();
                if (vendorProducts.length === 0) fetchVendorProducts();
                if (vendorOrders.length === 0) fetchVendorOrders();
                if (payouts.length === 0) fetchPayoutHistory();
                fetchBankDetails(); 
            }
            if (isAdmin) {
                setAdminLoading(true);
                Promise.all([
                    fetchAdminDashboard(),
                    fetchAllVendors(),
                    fetchAllCustomers(), 
                    fetchAllProducts(),
                    fetchAllOrders(),
                    fetchCategories(),
                    fetchAdminPayouts(),
                    fetchSupportMessages()
                ]).catch(err => {
                    setAdminError(err.message || "Failed to load one or more admin resources.");
                }).finally(() => setAdminLoading(false));
            }
        }
    }, [user, isVendor, isAdmin]);


    // --------------------------------------------------
    // 💰 --- START: ADMIN API Functions ---
    // --------------------------------------------------
    const fetchAdminDashboard = async () => { try { const res = await authFetch(ADMIN_DASHBOARD_URL); if (!res.ok) throw new Error('Could not fetch admin stats'); setAdminDashboardData(await res.json()); } catch (err) { setAdminError(err.message); } };
    const fetchAllVendors = async () => { try { const res = await authFetch(ADMIN_ALL_VENDORS_URL); if (!res.ok) throw new Error('Could not fetch all vendors'); const data = await res.json(); setAllVendors(data.results || data); } catch (err) { setAdminError(err.message); } };
    const fetchAllCustomers = async () => { try { const res = await authFetch(ADMIN_ALL_CUSTOMERS_URL); if (!res.ok) { if(res.status === 404) return setAllCustomers([]); throw new Error('Could not fetch customers'); } const data = await res.json(); setAllCustomers(data.results || data); } catch (err) { console.error(err); } };
    const fetchAllProducts = async () => { try { const res = await authFetch(ADMIN_ALL_PRODUCTS_URL); if (!res.ok) throw new Error('Could not fetch all products'); const data = await res.json(); setAllProducts(data.results || data); } catch (err) { setAdminError(err.message); } };
    const fetchAllOrders = async () => { try { const res = await authFetch(ADMIN_ALL_ORDERS_URL); if (!res.ok) throw new Error('Could not fetch all orders'); const data = await res.json(); setAllOrders(data.results || data); } catch (err) { setAdminError(err.message); } };
    const fetchCategories = async () => { try { const res = await authFetch(ADMIN_CATEGORIES_URL); if (!res.ok) throw new Error('Could not fetch categories'); const data = await res.json(); setCategories(data.results || data); } catch (err) { setAdminError(err.message); } };
    const fetchAdminPayouts = async () => { try { const res = await authFetch(ADMIN_ALL_PAYOUTS_URL); if (!res.ok) throw new Error('Could not fetch payout requests'); const data = await res.json(); setAdminPayouts(data.results || data); } catch (err) { setAdminError(err.message); } };
    const fetchSupportMessages = async () => { if (!isAdmin) return; setMessagesLoading(true); setMessagesError(null); try { const res = await authFetch(ADMIN_SUPPORT_MESSAGES_URL); if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.detail || 'Could not fetch support messages'); } const data = await res.json(); setSupportMessages(data.results || data); } catch (err) { setMessagesError(err.message); } finally { setMessagesLoading(false); } };
    
    // ✅ CORRECTED: Approve/Reject Logic with Status Update
    const approveVendor = async (id, action) => { 
        let message = "";
        let variant = "primary";
        
        if(action === "APPROVE") {
             message = `Are you sure you want to APPROVE vendor ${id}?`;
             variant = "success";
        } else if (action === "REJECT") {
            message = `Are you sure you want to REJECT vendor ${id}? This will send a rejection email.`;
            variant = "danger";
        } else {
            message = `Are you sure you want to set vendor ${id} to PENDING?`;
            variant = "secondary"; 
        }

        setConfirmMessage(message); 
        setConfirmVariant(variant); 
        
        setConfirmAction(() => async () => { 
            try { 
                const response = await authFetch(`${ADMIN_APPROVE_VENDOR_URL}${id}/`, { 
                    method: "PATCH", 
                    body: JSON.stringify({ action }) 
                }); 

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || "Action failed");
                }

                fetchAllVendors(); 
                alert(`Vendor status updated to ${action}`);

            } catch (err) { 
                alert(`Failed to update vendor status: ${err.message}`); 
            } 
        }); 
        setShowConfirmModal(true); 
    };

    const handleResolveMessage = async (messageId) => { setIsResolving(messageId); setConfirmMessage(`Are you sure you want to mark message #${messageId} as RESOLVED?`); setConfirmVariant("success"); setConfirmAction(() => async () => { try { const res = await authFetch(`${ADMIN_SUPPORT_DETAIL_URL}${messageId}/`, { method: "PATCH", body: JSON.stringify({ is_resolved: true }) }); if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.detail || 'Failed to update message status.'); } setSupportMessages(prevMessages => prevMessages.map(msg => msg.id === messageId ? { ...msg, is_resolved: true } : msg)); alert(`Message #${messageId} marked as resolved!`); } catch (err) { alert(`Error resolving message: ${err.message}`); } finally { setIsResolving(null); } }); setShowConfirmModal(true); };
    const handleExport = async (url, filename) => { setExportLoading(true); try { const token = getAuthToken(); const response = await fetch(url, { headers: { 'Authorization': `JWT ${token}` } }); if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to download file.'); } const blob = await response.blob(); const href = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = href; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(href); } catch (err) { alert(`Error exporting file: ${err.message}`); } finally { setExportLoading(false); } };
    const handleVendorExportExcel = () => { handleExport(ADMIN_EXPORT_EXCEL_URL, 'vendor_report.xlsx'); };
    const handleOrderExportExcel = () => { handleExport(ADMIN_EXPORT_ORDERS_EXCEL_URL, 'all_orders_report.xlsx'); };
    const handleExportPdf = () => { alert("PDF export is complex and requires a dedicated backend library (like ReportLab or xhtml2pdf)."); };
    const adminRemoveProduct = async (id) => { setConfirmMessage(`Are you sure you want to PERMANENTLY delete product ${id}? This cannot be undone.`); setConfirmVariant("danger"); setConfirmAction(() => async () => { try { await authFetch(`${ADMIN_ALL_PRODUCTS_URL}${id}/`, { method: "DELETE" }); fetchAllProducts(); } catch (err) { alert(`Failed to delete product: ${err.message}`); } }); setShowConfirmModal(true); };
    
    const updateProductStatus = async (id, newStatus) => { setProductUpdatingId(id); try { const response = await authFetch(`${ADMIN_ALL_PRODUCTS_URL}${id}/`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) }); if (!response.ok) { const errorData = await response.json().catch(() => ({ detail: response.statusText })); throw new Error(errorData.detail || errorData.error || "Failed to update status"); } fetchAllProducts(); } catch (err) { alert(`Failed to update product status. \nCheck backend logs (Email config might be wrong).\nError: ${err.message}`); } finally { setProductUpdatingId(null); } };
    
  const toggleProductPublish = async (id, currentStatus) => {
    setProductUpdatingId(id);
    try {
        const response = await authFetch(`${ADMIN_ALL_PRODUCTS_URL}${id}/`, {
            method: "PATCH",
            body: JSON.stringify({ is_published: !currentStatus })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null); 
            const errorMessage = errorData 
                ? (errorData.detail || JSON.stringify(errorData)) 
                : "Failed to toggle publish status (Unknown Error)";
            
            throw new Error(errorMessage);
        }
        fetchAllProducts(); 
    } catch (err) {
        alert(`Error updating publish status: ${err.message}`);
    } finally {
        setProductUpdatingId(null);
    }
};

    // ✅ UPDATED: Create Category with Image (FormData)
    const createCategory = async (e) => {
        e.preventDefault();
        const categoryName = newCategory.trim();
        if (!categoryName) return;

        setCategoryLoading(true);
        
        const formData = new FormData();
        formData.append('name', categoryName);
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
        formData.append('slug', categorySlug);
        
        if (newCategoryImage) {
            formData.append('image', newCategoryImage); 
        }

        try {
            const token = getAuthToken();
            // Use fetch directly for FormData to handle boundary correctly
            const response = await fetch(ADMIN_CATEGORIES_URL, {
                method: "POST",
                headers: {
                    'Authorization': `JWT ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to create category");
            }
            
            // Reset form
            setNewCategory("");
            setNewCategoryImage(null);
            document.getElementById('category-file-input').value = ""; // Reset file input visual
            
            fetchCategories();
            alert("Category created successfully!");
        } catch (err) {
            alert(`Failed to create category. Error: ${err.message}`);
        } finally {
            setCategoryLoading(false);
        }
    };

    const deleteCategory = async (id) => { setConfirmMessage(`Are you sure you want to delete this category?`); setConfirmVariant("danger"); setConfirmAction(() => async () => { try { await authFetch(`${ADMIN_CATEGORIES_URL}${id}/`, { method: "DELETE" }); fetchCategories(); } catch (err) { alert(`Failed to delete category: ${err.message}`); } }); setShowConfirmModal(true); };

    // --------------------------------------------------
    // 💰 --- END: ADMIN API Functions ---
    // --------------------------------------------------
    
    // --- VENDOR API Functions ---
    const fetchDashboardData = async () => { if (!isVendor) return; setDashboardLoading(true); try { const token = getAuthToken(); if (!token) throw new Error("Authentication token not found."); const response = await fetch(DASHBOARD_URL, { headers: { 'Authorization': `JWT ${token}`, 'Content-Type': 'application/json' } }); if (!response.ok) throw new Error(`Failed to fetch dashboard. Status: ${response.status}`); const result = await response.json(); setDashboardData(result); } catch (err) { setDashboardError(err.message); } finally { setDashboardLoading(false); } };
    const fetchVendorProducts = async () => { if (!isVendor) return; setProductsLoading(true); setProductsError(null); try { const token = getAuthToken(); if (!token) throw new Error("Authentication token not found."); const response = await fetch(VENDOR_PRODUCTS_URL, { headers: { 'Authorization': `JWT ${token}` } }); if (!response.ok) throw new Error(`Failed to fetch products. Status: ${response.status}`); const data = await response.json(); setVendorProducts(data.results || data); } catch (err) { setProductsError(err.message); } finally { setProductsLoading(false); } };
    const fetchVendorOrders = async () => { if (!isVendor) return; setOrdersLoading(true); setOrdersError(null); try { const token = getAuthToken(); if (!token) throw new Error("Authentication token not found."); const response = await fetch(VENDOR_ORDERS_URL, { headers: { 'Authorization': `JWT ${token}` } }); if (!response.ok) throw new Error(`Failed to fetch orders. Status: ${response.status}`); const data = await response.json(); setVendorOrders(data.results || data); } catch (err) { setOrdersError(err.message); } finally { setOrdersLoading(false); } };
    const fetchPayoutHistory = async () => { if (!isVendor) return; setPayoutsLoading(true); setPayoutsError(null); try { const token = getAuthToken(); if (!token) throw new Error("Authentication token not found."); const response = await fetch(VENDOR_PAYOUT_HISTORY_URL, { headers: { 'Authorization': `JWT ${token}` } }); if (!response.ok) throw new Error(`Failed to fetch payout history. Status: ${response.status}`); const data = await response.json(); setPayouts(data.results || data); } catch (err) { setPayoutsError(err.message); } finally { setPayoutsLoading(false); } };
    const handlePayoutRequest = async () => { if (!dashboardData?.available_for_payout || dashboardData.available_for_payout <= 0) { alert("No available balance to request payout."); return; } setPayoutRequestLoading(true); try { const token = getAuthToken(); if (!token) throw new Error("Authentication token not found."); const response = await fetch(VENDOR_PAYOUT_REQUEST_URL, { method: 'POST', headers: { 'Authorization': `JWT ${token}`, 'Content-Type': 'application/json' }, }); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Failed to request payout.`); } fetchDashboardData(); fetchPayoutHistory(); alert("Payout requested successfully!"); } catch (err) { alert(`Error requesting payout: ${err.message}`); } finally { setPayoutRequestLoading(false); } };
    const fetchBankDetails = async () => { if (!isVendor) return; setBankDetailsLoading(true); try { const token = getAuthToken(); if (!token) throw new Error("Authentication token not found."); const response = await fetch(VENDOR_BANK_DETAILS_URL, { headers: { 'Authorization': `JWT ${token}` } }); if (response.status === 404) { setBankDetails({ account_holder_name: '', account_number: '', ifsc_code: '', upi_id: '' }); setBankDetailsError(null); } else if (!response.ok) { const data = await response.json(); throw new Error(data.error || `Failed to fetch bank details.`); } else { const data = await response.json(); setBankDetails(data); } } catch (err) { setBankDetailsError(err.message); } finally { setBankDetailsLoading(false); } };
    const handleSaveBankDetails = async (e) => { e.preventDefault(); setIsSavingBank(true); setBankDetailsError(null); try { const token = getAuthToken(); if (!token) throw new Error("Authentication token not found."); const response = await fetch(VENDOR_BANK_DETAILS_URL, { method: 'POST', headers: { 'Authorization': `JWT ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(bankDetails) }); if (!response.ok) { const errData = await response.json(); let errorMsg = errData.error || "Failed to save details."; if (errData.ifsc_code) errorMsg = `IFSC: ${errData.ifsc_code[0]}`; if (errData.upi_id) errorMsg = `UPI: ${errData.upi_id[0]}`; if (errData.account_number) errorMsg = `Account: ${errData.account_number[0]}`; throw new Error(errorMsg); } const savedData = await response.json(); setBankDetails(savedData); alert("Bank details saved successfully!"); } catch (err) { setBankDetailsError(err.message); } finally { setIsSavingBank(false); } };
    
    const executeStatusUpdate = async (orderId, newStatus, trackingNumber = null) => { setUpdatingOrderId(orderId); setTrackingError(null); try { const token = getAuthToken(); if (!token) throw new Error("Authentication token not found."); const body = { status: newStatus }; if (trackingNumber) { body.tracking_number = trackingNumber; } const response = await fetch(`${STATUS_UPDATE_URL}${orderId}/`, { method: 'PATCH', headers: { 'Authorization': `JWT ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Failed to update status to ${newStatus}.`); } const updatedData = await response.json(); setVendorOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, ...updatedData } : order )); setShowTrackingModal(false); setTrackingOrderId(null); setTrackingNumber(""); } catch (err) { setTrackingError(err.message); } finally { setUpdatingOrderId(null); } };
    const handleStatusConfirmation = (orderId, newStatus) => { if (newStatus === 'Shipped') { setTrackingOrderId(orderId); setShowTrackingModal(true); setTrackingNumber(""); setTrackingError(null); } else { setConfirmMessage(`Confirm marking Order ID ${orderId} as '${newStatus}'? This action will notify the customer.`); setConfirmVariant("primary"); setConfirmAction(() => () => executeStatusUpdate(orderId, newStatus)); setShowConfirmModal(true); } };
    const executeDeletion = async (productId) => { try { const token = getAuthToken(); setProductsLoading(true); const response = await fetch(`${VENDOR_PRODUCTS_URL}${productId}/`, { method: 'DELETE', headers: { 'Authorization': `JWT ${token}` } }); if (response.status === 204) { fetchVendorProducts(); } else { throw new Error('Failed to delete product.'); } } catch (err) { alert(err.message); setProductsLoading(false); } };
    const handleProductAction = (action, productId = null) => { if (!isVendor) return; if (action === 'delete') { setConfirmMessage(`Are you absolutely sure you want to delete Product ID ${productId}? This cannot be undone.`); setConfirmVariant("danger"); setConfirmAction(() => () => executeDeletion(productId)); setShowConfirmModal(true); } else if (action === 'add') { navigate('/vendor/products/new'); } else if (action === 'edit') { navigate(`/vendor/products/edit/${productId}`); } };

    // 💰 --- NEW: Discount Helper Functions ---
    const openDiscountModal = (product) => {
        setDiscountProduct(product);
        setDiscountValue(product.discount_percentage || 0);
        setShowDiscountModal(true);
    };

    const saveDiscount = async () => {
        if (!discountProduct) return;
        setIsDiscountSaving(true);
        try {
            const url = isAdmin 
                ? `${ADMIN_ALL_PRODUCTS_URL}${discountProduct.id}/` 
                : `${VENDOR_PRODUCTS_URL}${discountProduct.id}/`;

            const response = await authFetch(url, {
                method: "PATCH",
                body: JSON.stringify({ discount_percentage: discountValue })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to save discount.");
            }

            if (isAdmin) fetchAllProducts();
            if (isVendor) fetchVendorProducts();
            
            setShowDiscountModal(false);
            setDiscountProduct(null);
            alert("Discount updated successfully!");

        } catch (err) {
            alert(`Error saving discount: ${err.message}`);
        } finally {
            setIsDiscountSaving(false);
        }
    };

    // --- Modal & Helper Functions ---
    const handleConfirm = () => { if (confirmAction) { confirmAction(); } setShowConfirmModal(false); setConfirmAction(null); setConfirmMessage(""); };
    const handlePasswordFormChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    const handlePasswordSubmit = (e) => { e.preventDefault(); alert('Password change attempted'); };
    const copyToClipboard = (code) => { navigator.clipboard.writeText(code); alert(`Copied: ${code}`); };
    const navLinkClasses = (view, activeView) => { const base = "flex items-center w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02]"; const style = { active: 'font-semibold text-white shadow-lg', inactive: `text-gray-700 hover:text-white` }; const themeColor = OLIVE_THEME.main; const hoverColor = OLIVE_THEME.light; const isActive = activeView === view; return `${base} ${isActive ? style.active : `hover:bg-[${hoverColor}] hover:text-[${themeColor}]`}`; };
    const renderSpinner = (text = "Loading...") => ( <div className="flex flex-col items-center justify-center p-10 min-h-[300px]"> <FontAwesomeIcon icon={faSpinner} className="animate-spin text-5xl" style={{ color: OLIVE_THEME.main }} /> <p className="mt-4 text-gray-600">{text}</p> </div> );

const handlePayoutUpdate = async (payoutId, newStatus) => {
        const payout = adminPayouts.find(p => p.id === payoutId);
        if (!payout) return;

        const action = newStatus === 'COMPLETED' ? 'Mark as Paid' : 'Reject';
        let msg = `Are you sure you want to ${action} the payout request of ₹${payout.amount} for ${payout.vendor_name}?`;
        if (newStatus === 'COMPLETED') {
            msg += " This will automatically send an email notification to the vendor.";
        }

        setConfirmMessage(msg);
        setConfirmVariant(newStatus === 'COMPLETED' ? "success" : "danger");

        setConfirmAction(() => async () => {
            setIsPayoutUpdating(payoutId);
            try {
                const response = await authFetch(`${ADMIN_UPDATE_PAYOUT_URL}${payoutId}/`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update payout');
                }

                fetchAdminPayouts();
                
                if (newStatus === 'COMPLETED') {
                    alert(`Payout marked as COMPLETED. Email notification sent to ${payout.vendor_name}.`);
                } else {
                    alert(`Payout status updated to ${newStatus}.`);
                }

            } catch (err) {
                alert(`Failed to ${action} payout: ${err.message}`);
            } finally {
                setIsPayoutUpdating(null);
            }
        });
        setShowConfirmModal(true);
    };
        const formInputClasses = (hasError = false) => { return `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${ hasError ? 'border-red-500' : 'border-gray-300' } focus:ring-[${OLIVE_THEME.main}] focus:border-[${OLIVE_THEME.main}]`; };
    const ThemeButton = ({ onClick, disabled, className = '', children, type = 'button', variant = 'primary', title }) => { const variants = { primary: { bg: OLIVE_THEME.main, hover: OLIVE_THEME.dark, text: 'white' }, danger: { bg: '#DC2626', hover: '#B91C1C', text: 'white' }, secondary: { bg: '#6B7280', hover: '#4B5563', text: 'white' }, }; const v = variants[variant] || variants.primary; return ( <button type={type} onClick={onClick} title={title} disabled={disabled} className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-md shadow-sm transition-all duration-200 ease-in-out transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${className}`} style={{ backgroundColor: disabled ? '#D1D5DB' : v.bg, color: v.text }} onMouseOver={e => !disabled && (e.currentTarget.style.backgroundColor = v.hover)} onMouseOut={e => !disabled && (e.currentTarget.style.backgroundColor = v.bg)} > {children} </button> ); };

    const RenderSearchFilterBar = ({ placeholder, statusOptions }) => (
        <div className="mb-6 flex flex-col lg:flex-row gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> </div>
                <input type="text" className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-olive-500 focus:border-olive-500 sm:text-sm p-2" placeholder={placeholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                {statusOptions && (
                    <div className="relative sm:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">  </div>
                        <select className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-olive-500 focus:border-olive-500 sm:text-sm p-2" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} >
                            <option value="ALL">All Statuses</option>
                            {statusOptions.map(opt => ( <option key={opt.value} value={opt.value}>{opt.label}</option> ))}
                        </select>
                    </div>
                )}
                <div className="relative sm:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> </div>
                    <select className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-olive-500 focus:border-olive-500 sm:text-sm p-2" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>
        </div>
    );
// 💰 --- HELPER: Render Price with Clickable Discount Tag ---
    const renderPriceWithDiscount = (product) => {
        const price = parseFloat(product.price);
        const discountPercent = parseFloat(product.discount_percentage || 0);

        if (discountPercent > 0) {
            const discountedPrice = price - (price * (discountPercent / 100));
            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through text-xs">₹{price.toFixed(2)}</span>
                        <span className="font-bold text-green-700">₹{discountedPrice.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={() => openDiscountModal(product)}
                        className="mt-1 flex items-center text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full hover:bg-red-200 transition-colors w-fit"
                        title="Click to Edit Discount"
                    >
                        {discountPercent}% OFF <FontAwesomeIcon icon={faPenToSquare} className="ml-1 text-[8px]" />
                    </button>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-start">
                <span className="font-medium">₹{price.toFixed(2)}</span>
                <button 
                    onClick={() => openDiscountModal(product)}
                    className="text-[10px] text-blue-500 hover:underline mt-1"
                >
                    + Add Discount
                </button>
            </div>
        );
    };
    // --------------------------------------------------
    // 💰 --- ADMIN RENDER Functions ---
    // --------------------------------------------------

    const renderAdminDashboard = () => {
        if (!adminDashboardData) return renderSpinner("Loading Dashboard...");
        const stats = adminDashboardData; 
        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Admin Dashboard</h3>
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: OLIVE_THEME.light, border: `1px solid ${OLIVE_THEME.main}` }}>
                    <p style={{ color: OLIVE_THEME.dark }}> <strong>Platform Commission</strong> is automatically calculated as <strong>10%</strong> of "Total Sales" from all completed vendor orders. </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.dark }}> <h6 className="text-sm font-medium uppercase text-white/80">Total Sales</h6> <h3 className="text-4xl font-bold">₹{stats.total_sales?.toFixed(2) || '0.00'}</h3> </div>
                    <div className="p-6 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.main }}> <h6 className="text-sm font-medium uppercase text-white/80">Total Commission (10%)</h6> <h3 className="text-4xl font-bold">₹{stats.total_commission?.toFixed(2) || '0.00'}</h3> </div>
                    <div className="p-6 rounded-xl shadow-lg text-white bg-gray-700"> <h6 className="text-sm font-medium uppercase text-white/80">New Orders (Paid)</h6> <h3 className="text-4xl font-bold">{stats.new_orders}</h3> </div>
                    <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: OLIVE_THEME.light }}> <h6 className="text-sm font-medium uppercase" style={{ color: OLIVE_THEME.dark }}>Pending Vendors</h6> <h3 className="text-4xl font-bold" style={{ color: OLIVE_THEME.main }}>{adminDashboardData.pending_vendors}</h3> </div>
                </div>
            </div>
        );
    };

    const renderAdminVendorMgmt = () => {
        const filteredVendors = allVendors.filter(v => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = v.store_name?.toLowerCase().includes(searchLower) || v.email?.toLowerCase().includes(searchLower);
            
            // ✅ UPDATED FILTER LOGIC (Supports APPROVED, PENDING, REJECTED)
            if (filterStatus === 'ALL') return matchesSearch;
            // Check vendor_status first, fallback to is_approved logic for older records
            const status = v.vendor_status || (v.is_approved ? 'APPROVED' : 'PENDING');
            return matchesSearch && status === filterStatus;
        });

        const sortedVendors = [...filteredVendors].sort((a, b) => { if (sortOrder === 'newest') return b.id - a.id; return a.id - b.id; });

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold" style={{ color: OLIVE_THEME.text }}>Vendor Management</h3>
                    <div className="flex gap-2"> <ThemeButton onClick={handleVendorExportExcel} disabled={exportLoading}>{exportLoading ? '...' : 'Export Excel'}</ThemeButton> <ThemeButton onClick={handleExportPdf} variant="danger">Export PDF</ThemeButton> </div>
                </div>
                
                {/* ✅ UPDATED OPTIONS */}
                <RenderSearchFilterBar 
                    placeholder="Search by Store Name or Email..." 
                    statusOptions={[ 
                        { value: 'APPROVED', label: 'Approved' }, 
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'REJECTED', label: 'Rejected' } 
                    ]} 
                />
                
                <div className="overflow-x-auto bg-white rounded-lg shadow-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Payout</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products (Active)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {adminLoading && ( <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading vendors...</td></tr> )}
                            {!adminLoading && sortedVendors.length === 0 && ( <tr><td colSpan="6" className="p-4 text-center text-gray-500">No vendors found matching your filters.</td></tr> )}
                            {sortedVendors.map(v => {
                                // ✅ NEW STATUS LOGIC: Prioritize vendor_status
                                let statusLabel = "Pending";
                                let statusClass = "bg-yellow-100 text-yellow-800";
                                
                                // Explicit check for new status field
                                if (v.vendor_status === 'APPROVED') {
                                    statusLabel = "Approved"; 
                                    statusClass = "bg-green-100 text-green-800";
                                } else if (v.vendor_status === 'REJECTED') {
                                    statusLabel = "Rejected"; 
                                    statusClass = "bg-red-100 text-red-800"; // 🔴 Red Badge
                                } else if (v.vendor_status === 'PENDING') {
                                    statusLabel = "Pending"; 
                                    statusClass = "bg-yellow-100 text-yellow-800";
                                } else {
                                    // Fallback for older data (is_approved boolean)
                                    if (v.is_approved) {
                                        statusLabel = "Approved";
                                        statusClass = "bg-green-100 text-green-800";
                                    } else {
                                        statusLabel = "Pending";
                                        statusClass = "bg-yellow-100 text-yellow-800";
                                    }
                                }
                                
                                return (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap"> <div className="font-medium text-gray-900">{v.store_name}</div> <div className="text-sm text-gray-500">{v.email}</div> </td>
                                        <td className="px-6 py-4 whitespace-nowrap"> 
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClass}`}> {statusLabel} </span> 
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{parseFloat(v.total_sales).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: OLIVE_THEME.main }}>₹{parseFloat(v.available_for_payout).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{v.active_products}<span className="text-xs text-gray-500"> / {v.total_products} Total</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {/* ✨ MODERN ICON BUTTONS ✨ */}
                                            <div className="flex gap-2">
                                                <ModernIconButton 
                                                    iconName="approve"
                                                    color="green"
                                                    title="Approve Vendor"
                                                    disabled={v.vendor_status === 'APPROVED'}
                                                    onClick={() => approveVendor(v.id, "APPROVE")}
                                                />
                                                <ModernIconButton 
                                                    iconName="pending"
                                                    color="yellow"
                                                    title="Set Pending"
                                                    disabled={v.vendor_status === 'PENDING'}
                                                    onClick={() => approveVendor(v.id, "PENDING")}
                                                />
                                                <ModernIconButton 
                                                    iconName="reject"
                                                    color="red"
                                                    title="Reject Vendor"
                                                    disabled={v.vendor_status === 'REJECTED'}
                                                    onClick={() => approveVendor(v.id, "REJECT")}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderAdminCustomerMgmt = () => {
        const safeCustomers = Array.isArray(allCustomers) ? allCustomers : [];
        const filteredCustomers = safeCustomers.filter(c => {
            const searchLower = searchTerm.toLowerCase();
            const username = c.username ? c.username.toLowerCase() : '';
            const email = c.email ? c.email.toLowerCase() : '';
            return username.includes(searchLower) || email.includes(searchLower);
        });

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold" style={{ color: OLIVE_THEME.text }}>Customer Report</h3>
                    <div className="text-sm text-gray-500">
                        Total Customers: {safeCustomers.length}
                    </div>
                </div>
                <RenderSearchFilterBar placeholder="Search by Username or Email..." />
                <div className="overflow-x-auto bg-white rounded-lg shadow-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {adminLoading && ( <tr><td colSpan="5" className="p-4 text-center text-gray-500">Loading data...</td></tr> )}
                            {!adminLoading && filteredCustomers.length === 0 && ( <tr><td colSpan="5" className="p-4 text-center text-gray-500">No customers found.</td></tr> )}
                            {filteredCustomers.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.username || 'No Username'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{c.role || 'CUSTOMER'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.date_joined ? new Date(c.date_joined).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderAdminProductMgmt = () => {
        const filteredProducts = allProducts.filter(p => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(searchLower) || (p.vendor_name && p.vendor_name.toLowerCase().includes(searchLower));
            const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        const sortedProducts = [...filteredProducts].sort((a, b) => {
            if (sortOrder === 'newest') return b.id - a.id; 
            return a.id - b.id;
        });

        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>All Products</h3>
                <RenderSearchFilterBar placeholder="Search by Product Name or Vendor..." statusOptions={[ { value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' } ]} />

                <div className="mt-4 space-y-3">
                    {sortedProducts.length === 0 && <div className="p-4 rounded-md bg-blue-100 text-blue-700">No products found matching criteria.</div>}
                    {sortedProducts.map(p => {
                        const isThisProductUpdating = productUpdatingId === p.id;
                        return (
                            <div key={p.id} className={`bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center transition-all hover:shadow-md border-l-4 ${ p.status === 'PENDING' ? 'border-yellow-500' : (p.status === 'APPROVED' ? 'border-green-500' : 'border-red-500') }`}>
                                <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-auto">
                                    <img src={p.image_url || 'https://via.placeholder.com/80'} alt={p.name} className="w-20 h-20 rounded-md object-cover border border-gray-200 flex-shrink-0 bg-gray-50" />
                                    <div className="flex-grow">
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                            <strong className="font-semibold text-lg leading-tight">{p.name}</strong>
                                            <div className="mt-1 sm:mt-0">
                                                {renderPriceWithDiscount(p)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ p.status === 'APPROVED' ? 'bg-green-100 text-green-800' : (p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800') }`}>
                                                {p.status}
                                            </span>
                                            <button onClick={() => toggleProductPublish(p.id, p.is_published)} disabled={isThisProductUpdating} className={`relative overflow-hidden group flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 shadow-lg ${p.is_published ? 'bg-[#7A8450] border-[#5F673C] text-white hover:bg-[#5F673C] hover:shadow-[#7A8450]/50' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200'} ${isThisProductUpdating ? 'opacity-70 cursor-wait' : ''}`}>
                                                {p.is_published && <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12 -ml-4 w-full h-full" />}
                                                <div className={`z-10 transition-transform duration-300 ${p.is_published ? 'rotate-0' : '-rotate-180'}`}>
                                                    {isThisProductUpdating ? ( <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> ) : ( <FontAwesomeIcon icon={p.is_published ? faToggleOn : faToggleOff} className="text-lg" /> )}
                                                </div>
                                                <span className="z-10">{p.is_published ? "Published" : "Hidden"}</span>
                                            </button>
                                        </div>
                                        <small className="text-sm text-gray-500 mt-1 block border-l-2 border-gray-300 pl-2">By: {p.vendor_name} (ID: {p.id})</small>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 ml-0 md:ml-4 flex gap-2 self-end md:self-center mt-2 md:mt-0">
                                    {/* ✨ MODERN ICON BUTTONS ✨ */}
                                    <ModernIconButton 
                                        iconName="edit"
                                        color="blue"
                                        title="Edit Product Details"
                                        disabled={isThisProductUpdating}
                                        onClick={() => navigate(`/vendor/products/edit/${p.id}`)}
                                    />
                                    
                                    {p.status !== 'APPROVED' && (
                                        <ModernIconButton 
                                            iconName="approve"
                                            color="green"
                                            title="Approve"
                                            isLoading={isThisProductUpdating}
                                            disabled={isThisProductUpdating}
                                            onClick={() => updateProductStatus(p.id, 'APPROVED')}
                                        />
                                    )}
                                    {p.status !== 'PENDING' && (
                                        <ModernIconButton 
                                            iconName="pending"
                                            color="yellow"
                                            title="Set as Pending"
                                            isLoading={isThisProductUpdating}
                                            disabled={isThisProductUpdating}
                                            onClick={() => updateProductStatus(p.id, 'PENDING')}
                                        />
                                    )}
                                    {p.status !== 'REJECTED' && (
                                        <ModernIconButton 
                                            iconName="reject"
                                            color="yellow"
                                            title="Reject"
                                            isLoading={isThisProductUpdating}
                                            disabled={isThisProductUpdating}
                                            onClick={() => updateProductStatus(p.id, 'REJECTED')}
                                        />
                                    )}
                                    <ModernIconButton 
                                        iconName="delete"
                                        color="red"
                                        title="Delete"
                                        disabled={isThisProductUpdating}
                                        onClick={() => adminRemoveProduct(p.id)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    const renderAdminPayoutMgmt = () => {
        if (adminLoading) return renderSpinner("Loading Payout Requests...");
        const filteredPayouts = adminPayouts.filter(p => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = p.vendor_name?.toLowerCase().includes(searchLower);
            const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
        const sortedPayouts = [...filteredPayouts].sort((a, b) => { const dateA = new Date(a.requested_at); const dateB = new Date(b.requested_at); return sortOrder === 'newest' ? dateB - dateA : dateA - dateB; });
        const pendingPayouts = sortedPayouts.filter(p => p.status === 'PENDING');
        const otherPayouts = sortedPayouts.filter(p => p.status !== 'PENDING');

        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Payout Requests</h3>
                <RenderSearchFilterBar placeholder="Search by Vendor Name..." statusOptions={[ { value: 'PENDING', label: 'Pending' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'REJECTED', label: 'Rejected' } ]} />
                <h4 className="text-xl font-semibold mb-4 text-yellow-700">Pending Requests</h4>
                {pendingPayouts.length === 0 ? ( <div className="bg-green-100 text-green-700 p-4 rounded-md"> No pending payout requests found. </div> ) : (
                    <div className="mt-4 space-y-4">
                        {pendingPayouts.map(p => {
                            const isUpdating = isPayoutUpdating === p.id;
                            const details = p.vendor_payment_details || {};
                            const hasUpi = details.upi_id;
                            const hasBank = details.account_number && details.ifsc_code;
                            return (
                                <div key={p.id} className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300">
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div className="pr-4"> <strong className="text-xl font-bold text-gray-900">₹{parseFloat(p.amount).toFixed(2)}</strong><br /> <small className="text-sm text-gray-500">To: <strong>{p.vendor_name}</strong></small><br /> <small className="text-sm text-gray-500">Req: {new Date(p.requested_at).toLocaleString()}</small> </div>
                                        <div className="flex-1 bg-gray-50 p-3 rounded-md border min-w-[200px] my-2 md:my-0">
                                            <h5 className="text-sm font-semibold text-gray-800 mb-1">Payment Details:</h5>
                                            {hasUpi ? ( <div> <strong className="text-blue-600">UPI:</strong> <p className="font-mono">{details.upi_id}</p> </div> ) : hasBank ? ( <div className="text-sm"> <p><strong>Holder:</strong> {details.account_holder_name}</p> <p><strong>Acct:</strong> {details.account_number}</p> <p><strong>IFSC:</strong> {details.ifsc_code}</p> </div> ) : ( <p className="text-red-500 text-sm italic">Vendor has not provided payment details.</p> )}
                                        </div>
                                        <div className="flex-shrink-0 ml-0 md:ml-4 mt-2 md:mt-0 space-x-2 flex">
                                            {/* ✨ MODERN ICON BUTTONS ✨ */}
                                            <ModernIconButton 
                                                iconName="approve"
                                                color="green"
                                                title={(!hasUpi && !hasBank) ? "Vendor has not provided payment details" : "Mark as paid"}
                                                disabled={isUpdating || (!hasUpi && !hasBank)}
                                                onClick={() => handlePayoutUpdate(p.id, "COMPLETED")}
                                                isLoading={isUpdating}
                                            />
                                            <ModernIconButton 
                                                iconName="reject"
                                                color="red"
                                                title="Reject"
                                                disabled={isUpdating}
                                                onClick={() => handlePayoutUpdate(p.id, "REJECT")}
                                            />
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
                    {otherPayouts.length === 0 ? ( <p className="text-gray-500">No completed payout history found.</p> ) : ( otherPayouts.map(p => ( <div key={p.id} className="bg-gray-50 p-3 rounded-lg opacity-80"> <div className="flex flex-wrap justify-between items-center"> <div> <strong className={`font-semibold ${p.status === 'COMPLETED' ? 'text-green-700' : 'text-red-700'}`}>{p.status}</strong><br /> <span className="text-gray-700">₹{parseFloat(p.amount).toFixed(2)}</span> <small className="text-sm text-gray-500 ml-2">to {p.vendor_name || 'Unknown'}</small> </div> <small className="text-sm text-gray-500">{new Date(p.requested_at).toLocaleDateString()}</small> </div> </div> )) )}
                </div>
            </div>
        );
    };

    const renderAdminOrderMgmt = () => {
        if (!allOrders) return renderSpinner("Loading Orders...");
        const filteredOrders = allOrders.filter(order => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = String(order.id).includes(searchLower) || order.customer_name.toLowerCase().includes(searchLower) || order.vendor_name.toLowerCase().includes(searchLower);
            const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
        const sortedOrders = [...filteredOrders].sort((a, b) => { const dateA = new Date(a.created_at); const dateB = new Date(b.created_at); return sortOrder === 'newest' ? dateB - dateA : dateA - dateB; });
        let vendorData = [], productData = [], statusData = [];
        if (allOrders.length > 0) {
            const vendorDataMap = {};
            allOrders.forEach(order => { const vendor = order.vendor_name || "Unknown"; vendorDataMap[vendor] = vendorDataMap[vendor] || { vendor, totalOrders: 0, totalRevenue: 0 }; vendorDataMap[vendor].totalOrders += 1; vendorDataMap[vendor].totalRevenue += Number(order.total_amount || 0); });
            vendorData = Object.values(vendorDataMap);
            const productDataMap = {};
            allOrders.forEach(order => { order.items.forEach(item => { const product = item.product_name || "Unknown"; productDataMap[product] = productDataMap[product] || { product, quantity: 0 }; productDataMap[product].quantity += Number(item.quantity || 0); }); });
            productData = Object.values(productDataMap);
            const statusMap = {};
            allOrders.forEach(order => { const status = order.status || "Unknown"; statusMap[status] = (statusMap[status] || 0) + 1; });
            statusData = Object.entries(statusMap).map(([status, value]) => ({ name: status, value }));
        }

        return (
            <div>
                <div className="flex justify-between items-center mb-6"> <h3 className="text-3xl font-bold" style={{ color: OLIVE_THEME.text }}>Order Dashboard</h3> <div className="flex gap-2"> <ThemeButton onClick={handleOrderExportExcel} disabled={exportLoading}>{exportLoading ? '...' : 'Export All Orders (Excel)'}</ThemeButton> </div> </div>
                <div className="mb-8">
                    <h4 className="text-xl font-semibold mb-4">All Orders List</h4>
                    <RenderSearchFilterBar placeholder="Search Order ID, Customer, Vendor..." statusOptions={[ { value: 'Paid', label: 'Paid' }, { value: 'Shipped', label: 'Shipped' }, { value: 'Delivered', label: 'Delivered' } ]} />
                    <div className="overflow-x-auto bg-white rounded-lg shadow border max-h-[400px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0"> <tr> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th> </tr> </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedOrders.map(o => ( <tr key={o.id}> <td className="px-6 py-4 whitespace-nowrap">#{o.id}</td> <td className="px-6 py-4 whitespace-nowrap">{o.vendor_name}</td> <td className="px-6 py-4 whitespace-nowrap">{o.customer_name}</td> <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(o.total_amount).toFixed(2)}</td> <td className="px-6 py-4 whitespace-nowrap"> <span className={`px-2 py-1 text-xs rounded-full ${o.status==='Paid'?'bg-green-100 text-green-800':'bg-gray-100 text-gray-800'}`}> {o.status} </span> </td> </tr> ))}
                                {sortedOrders.length === 0 && ( <tr><td colSpan="5" className="p-4 text-center">No orders match filter.</td></tr> )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="space-y-10 border-t pt-8"> <div> <h3 className="text-xl font-semibold mb-4">Orders by Vendor</h3> <ResponsiveContainer width="100%" height={300}> <BarChart data={vendorData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}> <XAxis dataKey="vendor" /> <YAxis /> <Tooltip /> <Legend /> <Bar dataKey="totalOrders" fill={CHART_COLORS[0]} name="Total Orders" /> <Bar dataKey="totalRevenue" fill={CHART_COLORS[1]} name="Revenue (₹)" /> </BarChart> </ResponsiveContainer> </div> </div>
            </div>
        );
    };

   const renderAdminCategoryMgmt = () => {
       const getCategoryImgSource = (cat) => {
           const rawPath = cat.image || cat.image_url || cat.icon;
           if (!rawPath) return null;
           if (rawPath.startsWith('http') || rawPath.startsWith('https')) return rawPath;
           if (rawPath.startsWith('image/upload')) return `https://res.cloudinary.com/dykdiqcye/${rawPath}`;
           const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
           return `http://127.0.0.1:8000${cleanPath}`;
       };

       return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-end mb-6 border-b pb-4">
                <div>
                    <h3 className="text-3xl font-bold" style={{ color: OLIVE_THEME.text }}>Manage Categories</h3>
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {categories.length} Active
                </span>
            </div>

            {/* ADD FORM */}
            <form onSubmit={createCategory} className="flex flex-col md:flex-row gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner items-end">
                <div className="flex-grow w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category Name</label>
                    <input 
                        type="text" 
                        className="block w-full rounded-lg border-gray-300 pl-4 py-2.5 shadow-sm focus:border-olive-500 focus:ring-olive-500" 
                        placeholder="e.g. Organic Fruits" 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value)} 
                        required 
                        disabled={categoryLoading} 
                    />
                </div>
                
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cover Image</label>
                    <input 
                        id="category-file-input"
                        type="file" 
                        accept="image/*"
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2.5 file:px-4
                            file:rounded-lg file:border-0
                            file:text-xs file:font-semibold
                            file:bg-white file:text-olive-700
                            file:shadow-sm file:border-gray-300
                            hover:file:bg-gray-100 cursor-pointer"
                        onChange={(e) => setNewCategoryImage(e.target.files[0])}
                        disabled={categoryLoading}
                    />
                </div>

                <ThemeButton type="submit" disabled={categoryLoading} className="w-full md:w-auto h-[42px] shadow-lg">
                     {categoryLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <><FontAwesomeIcon icon={faPlus} className="mr-2" /> Add</>}
                </ThemeButton>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(c => {
                    const isEditing = editingCategoryId === c.id;
                    const finalImageSrc = getCategoryImgSource(c);

                    return (
                        <div key={c.id} className={`relative bg-white p-3 rounded-xl border transition-all duration-300 flex items-center ${isEditing ? `ring-2 ring-[${OLIVE_THEME.main}]` : 'hover:shadow-md border-gray-100'}`}>
                            {isEditing ? (
                                // EDIT MODE
                                <div className="flex items-center gap-2 w-full">
                                    <input type="text" autoFocus className="flex-grow block w-full rounded-md border-gray-300 py-2 px-3" value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') updateCategory(c.id); if (e.key === 'Escape') cancelEditingCategory(); }} />
                                    {/* ✅ UPDATED: Use faCheck and faXmark explicitly */}
                                    <button onClick={() => updateCategory(c.id)} className="w-8 h-8 rounded-full bg-green-100 text-green-600"><FontAwesomeIcon icon={faCheck} /></button>
                                    <button onClick={cancelEditingCategory} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500"><FontAwesomeIcon icon={faXmark} /></button>
                                </div>
                            ) : (
                                // VIEW MODE
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0">
                                            {finalImageSrc ? (
                                                <img src={finalImageSrc} alt={c.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                            ) : null}
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg border border-gray-200" style={{ display: finalImageSrc ? 'none' : 'flex' }}>
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-700 text-lg line-clamp-1">{c.name}</span>
                                    </div>
                                    {/* ✨ MODERN ICON BUTTONS ✨ */}
                                    <div className="flex gap-2 ml-2">
                                        <ModernIconButton 
                                            iconName="edit"
                                            color="blue"
                                            onClick={() => startEditingCategory(c)}
                                        />
                                        <ModernIconButton 
                                            iconName="delete"
                                            color="red"
                                            onClick={() => deleteCategory(c.id)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
        );
    };
    
    
    const renderAdminSupportMessages = () => {
        if (messagesLoading) return renderSpinner("Loading Support Messages...");
        if (messagesError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{messagesError}</div>;
        const openMessages = supportMessages.filter(msg => !msg.is_resolved);
        const resolvedMessages = supportMessages.filter(msg => msg.is_resolved);
        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Customer Support Messages</h3>
                <h4 className="text-xl font-semibold mb-4 text-yellow-700">Open Messages ({openMessages.length})</h4>
                {openMessages.length === 0 ? ( <div className="bg-green-100 text-green-700 p-4 rounded-md"> No open support messages found. All clear! </div> ) : (
                    <div className="space-y-4 mb-8">
                        {openMessages.map(msg => (
                            <div key={msg.id} className="bg-white p-4 rounded-lg shadow-md border border-yellow-300 transition-shadow duration-200">
                                <div className="flex justify-between items-start mb-2"> <div> <strong className="text-lg font-semibold text-gray-900">ID #{msg.id} - {msg.name}</strong> <span className="ml-3 text-sm text-gray-500 block sm:inline-block">({msg.email})</span> </div> <span className="text-xs text-gray-500 flex-shrink-0"> {new Date(msg.created_at).toLocaleString()} </span> </div>
                                <p className="text-gray-700 leading-relaxed p-3 rounded-md border mb-4" style={{ borderColor: OLIVE_THEME.light, backgroundColor: '#FAFAFA' }}> {msg.message} </p>
                                <ThemeButton onClick={() => handleResolveMessage(msg.id)} disabled={isResolving === msg.id} variant="primary" className="!py-1 !px-3 !text-sm"> {isResolving === msg.id ? ( <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> ) : ( <FontAwesomeIcon icon={faCheck} className="mr-2" /> )} Mark as Resolved </ThemeButton>
                            </div>
                        ))}
                    </div>
                )}
                <hr className="my-8"/>
                <h4 className="text-xl font-semibold mb-4 text-gray-600">Resolved History ({resolvedMessages.length})</h4>
                <div className="space-y-3 opacity-70"> {resolvedMessages.length === 0 ? ( <p className="text-gray-500">No resolved messages yet.</p> ) : ( resolvedMessages.map(msg => ( <div key={msg.id} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center text-sm"> <span>ID #{msg.id}: {msg.name} - {msg.email}</span> <span className="text-green-600 font-semibold"><FontAwesomeIcon icon={faCheck} className="mr-1"/> Resolved</span> </div> )) )} </div>
            </div>
        );
    };

    // --------------------------------------------------
    // 💰 --- VENDOR RENDER Functions ---
    // --------------------------------------------------
    const renderVendorDashboard = () => {
        if (dashboardLoading) return renderSpinner("Loading Dashboard...");
        if (dashboardError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{dashboardError}</div>;
        const metrics = dashboardData || { lifetime_net_earnings: 0, available_for_payout: 0, total_orders: 0, active_products: 0 };
        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>{user.store_name || user.username} Dashboard</h3>
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: OLIVE_THEME.light, border: `1px solid ${OLIVE_THEME.main}` }}> <p style={{ color: OLIVE_THEME.dark }}> <strong>Welcome, {user.store_name}!</strong> Your "All-Time Earnings" reflect your total net profit. Your "Available for Payout" balance is what you can withdraw now. </p> </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.main }}> <h6 className="text-sm font-medium uppercase text-white/80">Available for Payout</h6> <h2 className="text-4xl font-bold">₹{metrics.available_for_payout ? metrics.available_for_payout.toFixed(2) : '0.00'}</h2> </div>
                    <div className="p-5 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.dark }}> <h6 className="text-sm font-medium uppercase text-white/80">All-Time Earnings (after commission)</h6> <h2 className="text-4xl font-bold">₹{metrics.lifetime_net_earnings ? metrics.lifetime_net_earnings.toFixed(2) : '0.00'}</h2> </div>
                    <div className="p-5 rounded-xl shadow-lg text-white bg-gray-700"><h6 className="text-sm font-medium uppercase text-white/80">Total Orders</h6><h2 className="text-4xl font-bold">{metrics.total_orders}</h2></div>
                    <div className="p-5 rounded-xl shadow-lg" style={{ backgroundColor: OLIVE_THEME.light }}><h6 className="text-sm font-medium uppercase" style={{ color: OLIVE_THEME.dark }}>Active Products</h6><h2 className="text-4xl font-bold" style={{ color: OLIVE_THEME.main }}>{metrics.active_products}</h2></div>
                </div>
                <div className="mt-6 bg-gray-100 p-4 rounded-lg"> <h5 className="font-bold text-gray-800">Admin Approval Workflow</h5> <p className="text-gray-700">All new products start as <strong>PENDING</strong>. You can edit/delete.</p> </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3"> <ThemeButton onClick={() => handleProductAction('add')}> <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Product </ThemeButton> <ThemeButton onClick={() => setActiveView('vendor-products')} variant="secondary"> <FontAwesomeIcon icon={faList} className="mr-2" /> View Inventory </ThemeButton> </div>
            </div>
        );
    };

    const renderProductManagement = () => {
        const filteredProducts = vendorProducts.filter(p => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(searchLower);
            const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        const sortedProducts = [...filteredProducts].sort((a, b) => {
            if (sortOrder === 'newest') return b.id - a.id;
            return a.id - b.id;
        });

        return (
            <div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: OLIVE_THEME.text }}>Product Management</h3>
                
                <div className="flex flex-wrap justify-between items-center mb-4">
                    <ThemeButton onClick={() => handleProductAction('add')}>
                        <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Product
                    </ThemeButton>
                </div>

                <RenderSearchFilterBar 
                    placeholder="Search product name..." 
                    statusOptions={[
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'APPROVED', label: 'Approved' },
                        { value: 'REJECTED', label: 'Rejected' }
                    ]}
                />
                
                {productsLoading && renderSpinner("Loading Products...")}
                {productsError && <div className="p-4 rounded-md bg-red-100 text-red-700">{productsError}</div>}
                
                {!productsLoading && !productsError && (
                    <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th> 
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="p-4 text-center text-gray-500">No products found matching your filters.</td>
                                    </tr>
                                )}
                                {sortedProducts.map(p => {
                                    const isLocked = p.status === 'APPROVED';
                                    const stockCount = parseInt(p.stock || 0);
                                    const isLowStock = stockCount > 0 && stockCount < 5;
                                    const isOutOfStock = stockCount === 0;

                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img 
                                                    src={p.image_url || 'https://via.placeholder.com/50'} 
                                                    alt={p.name} 
                                                    className="h-12 w-12 rounded object-cover border border-gray-200"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{p.name}</div>
                                                <div className="text-xs text-gray-500">{p.category_name || 'Uncategorized'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {renderPriceWithDiscount(p)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : (isLowStock ? 'text-orange-500' : 'text-gray-700')}`}>
                                                        {stockCount}
                                                    </span>
                                                    {isLowStock && (
                                                        <span className="ml-2 text-orange-500 text-xs bg-orange-100 px-2 py-0.5 rounded-full font-bold" title="Low Stock">
                                                            Low
                                                        </span>
                                                    )}
                                                    {isOutOfStock && (
                                                        <span className="ml-2 text-red-600 text-xs bg-red-100 px-2 py-0.5 rounded-full font-bold" title="Out of Stock">
                                                            Empty
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                    p.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                                    (p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {p.is_published ? (
                                                        <span className="flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                            <FontAwesomeIcon icon={faEye} className="mr-1" /> Live
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                            <FontAwesomeIcon icon={faEyeSlash} className="mr-1" /> Hidden
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {/* ✨ MODERN ICON BUTTONS ✨ */}
                                                <div className="flex space-x-2">
                                                    <ModernIconButton 
                                                        iconName="edit"
                                                        color="blue"
                                                        title={isLocked ? "Approved products cannot be edited" : "Edit Product"}
                                                        disabled={isLocked}
                                                        onClick={() => handleProductAction('edit', p.id)}
                                                    />
                                                    <ModernIconButton 
                                                        iconName="delete"
                                                        color="red"
                                                        title="Delete Product"
                                                        onClick={() => handleProductAction('delete', p.id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };
    
    const renderVendorOrders = () => {
        if (ordersLoading) return renderSpinner("Loading Orders...");
        if (ordersError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{ordersError}</div>;
        if (vendorOrders.length === 0) { return <div className="p-4 rounded-md bg-blue-100 text-blue-700">You have not received any orders yet.</div>; }
        const filteredOrders = vendorOrders.filter(order => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = String(order.id).includes(searchLower) || order.customer_name.toLowerCase().includes(searchLower);
            const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
        const sortedOrders = [...filteredOrders].sort((a, b) => { const dateA = new Date(a.created_at); const dateB = new Date(b.created_at); return sortOrder === 'newest' ? dateB - dateA : dateA - dateB; });

        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Customer Orders</h3>
                <RenderSearchFilterBar placeholder="Search by Order ID or Customer..." statusOptions={[ { value: 'Paid', label: 'Paid' }, { value: 'Shipped', label: 'Shipped' }, { value: 'Delivered', label: 'Delivered' } ]} />
                <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"> <tr> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID / Date</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Summary</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> </tr> </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedOrders.length === 0 && ( <tr><td colSpan="6" className="p-4 text-center text-gray-500">No orders match your search/filter.</td></tr> )}
                            {sortedOrders.map(order => {
                                const nextStatus = STATUS_TRANSITIONS[order.status];
                                const isUpdating = updatingOrderId === order.id;
                                const isUpdateDisabled = !nextStatus || isUpdating;
                                const orderTotal = order.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
                                const itemsSummary = order.items.map(i => `${i.product_name} (x${i.quantity})`).join(', ');
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm font-bold text-gray-900">#{order.id}</div> <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div> {order.tracking_number && ( <div className="text-xs text-blue-600 font-mono mt-1"> <FontAwesomeIcon icon={faTruck} className="mr-1"/> {order.tracking_number} </div> )} </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer_name}</td> <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={itemsSummary}>{itemsSummary}</td> <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{orderTotal.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"> <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${ order.status === 'Paid' ? 'bg-green-600' : order.status === 'Shipped' ? 'bg-blue-600' : order.status === 'Delivered' ? 'bg-sky-500' : 'bg-gray-500' }`}> {order.status} </span> </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"> {order.status !== 'Delivered' && order.status !== 'Failed' ? ( <ThemeButton className="!py-1 !px-3 !text-xs" variant="secondary" disabled={isUpdateDisabled} onClick={() => handleStatusConfirmation(order.id, nextStatus)}> {isUpdating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <> Mark {nextStatus} <FontAwesomeIcon icon={faChevronRight} className="ml-1" /> </>} </ThemeButton> ) : ( <span className="text-gray-400 text-xs italic">Completed</span> )} </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
                <div className="mb-6 p-6 rounded-xl shadow-lg text-white" style={{ backgroundColor: OLIVE_THEME.main }}> <h6 className="text-sm font-medium uppercase text-white/80">Available for Payout</h6> <h3 className="text-4xl font-bold">₹{availableAmount.toFixed(2)}</h3> </div>
                <ThemeButton className="w-full sm:w-auto px-6 py-3" onClick={handlePayoutRequest} disabled={!canRequest}> {payoutRequestLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> : <FontAwesomeIcon icon={faRupeeSign} className="mr-2" />} Request Payout of ₹{availableAmount.toFixed(2)} </ThemeButton>
                {!canRequest && !payoutRequestLoading && ( <p className="text-sm text-gray-500 mt-2">You must have an available balance to request a payout.</p> )}
                <hr className="my-8" />
                <h4 className="text-xl font-semibold mb-4">Payout History</h4>
                {payoutsLoading && renderSpinner("Loading Payout History...")}
                {payoutsError && <div className="p-4 rounded-md bg-red-100 text-red-700">{payoutsError}</div>}
                {!payoutsLoading && !payoutsError && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {payouts.length === 0 ? ( <li className="p-4 text-gray-500">No payout history found.</li> ) : (
                                [...payouts].sort((a, b) => { const dateA = new Date(a.requested_at); const dateB = new Date(b.requested_at); return sortOrder === 'newest' ? dateB - dateA : dateA - dateB; }).map(payout => ( <li key={payout.id} className="p-4 flex flex-wrap justify-between items-center hover:bg-gray-50 transition-colors"> <div> <span className="font-medium text-gray-900">Amount: ₹{parseFloat(payout.amount).toFixed(2)}</span><br /> <small className="text-gray-500"> Requested: {new Date(payout.requested_at).toLocaleString()}</small> </div> <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${ payout.status === "COMPLETED" ? 'bg-green-600' : payout.status === "PENDING" ? 'bg-yellow-500' : 'bg-red-600' }`}> {payout.status} </span> </li> ))
                            )}
                        </ul>
                    </div>
                )}
            </div>
        );
    };
    
    const renderVendorBankSettings = () => { if (bankDetailsLoading) return renderSpinner("Loading settings..."); return ( <div className="max-w-2xl"> <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Payment Settings</h3> <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: OLIVE_THEME.light }}> <p className="text-sm" style={{ color: OLIVE_THEME.dark }}> <FontAwesomeIcon icon={faShieldAlt} className="mr-2"/> Please provide your payment details. The admin will use these to send you manual payouts. You can provide either Bank Details or a UPI ID. </p> </div> {bankDetailsError && ( <div className="p-4 rounded-md bg-red-100 text-red-700 mb-4"> Error: {bankDetailsError} </div> )} <form onSubmit={handleSaveBankDetails} className="space-y-4 bg-white p-6 rounded-lg shadow-lg border"> <h4 className="text-lg font-semibold text-gray-700">Bank Account Details (NEFT/IMPS)</h4> <div> <label className="block text-sm font-medium text-gray-700">Account Holder Name</label> <input type="text" className={formInputClasses(false)} value={bankDetails.account_holder_name || ''} onChange={(e) => setBankDetails({...bankDetails, account_holder_name: e.target.value})} placeholder="e.g. John Doe" /> </div> <div> <label className="block text-sm font-medium text-gray-700">Account Number</label> <input type="text" className={formInputClasses(false)} value={bankDetails.account_number || ''} onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})} placeholder="e.g. 1234567890" /> </div> <div> <label className="block text-sm font-medium text-gray-700">IFSC Code</label> <input type="text" className={`${formInputClasses(false)} uppercase`} value={bankDetails.ifsc_code || ''} onChange={(e) => setBankDetails({...bankDetails, ifsc_code: e.target.value.toUpperCase()})} placeholder="e.g. HDFC0001234" /> </div> <div className="relative my-4"> <div className="absolute inset-0 flex items-center" aria-hidden="true"> <div className="w-full border-t border-gray-300"></div> </div> <div className="relative flex justify-center"> <span className="bg-white px-3 text-lg font-medium text-gray-500">OR</span> </div> </div> <h4 className="text-lg font-semibold text-gray-700">UPI (GPay/PhonePe)</h4> <div> <label className="block text-sm font-medium text-gray-700">UPI ID</label> <input type="text" className={formInputClasses(false)} value={bankDetails.upi_id || ''} onChange={(e) => setBankDetails({...bankDetails, upi_id: e.target.value})} placeholder="e.g. yourname@okhdfcbank" /> </div> <ThemeButton type="submit" className="w-full" disabled={isSavingBank}> {isSavingBank ? "Saving..." : "Save Bank Details"} </ThemeButton> </form> </div> ); };
    
    // ✅ MODIFIED: Updated Profile View to show Vendor Details & Upload
    const renderProfileView = () => {
        // ⚠️ Use profileData (fresh) instead of user (stale login data) here
        const currentUser = profileData || user; 
        let statusLabel = "PENDING APPROVAL";
    let statusClass = "bg-yellow-100 text-yellow-700";

    // 1. Check if backend sent specific status text (Best)
    if (currentUser.vendor_status === 'APPROVED') {
        statusLabel = "VERIFIED";
        statusClass = "bg-green-100 text-green-700";
    } else if (currentUser.vendor_status === 'REJECTED') {
        statusLabel = "REJECTED";
        statusClass = "bg-red-100 text-red-700"; // 🔴 Red Badge
    } 
    // 2. Fallback for older data (Boolean check)
    else if (currentUser.is_approved === true) {
        statusLabel = "VERIFIED";
        statusClass = "bg-green-100 text-green-700";
    }

        return (
            <div>
                <h3 className="text-3xl font-bold mb-6" style={{ color: OLIVE_THEME.text }}>Profile Details</h3>

                {/* Navigation Helper */}
                {(isAdmin || isVendor) && (
                    <div className="mb-6 p-4 border rounded-lg shadow-sm" style={{ backgroundColor: OLIVE_THEME.light }}>
                        <h5 className="font-semibold" style={{ color: OLIVE_THEME.dark }}>Your Dashboard</h5>
                        <p className="mb-3" style={{ color: OLIVE_THEME.dark }}>
                            {isAdmin ? "Return to the main administrative dashboard." : "Return to your main vendor dashboard."}
                        </p>
                        <ThemeButton onClick={() => setActiveView(isAdmin ? 'admin-dashboard' : 'vendor-dashboard')} className="w-full sm:w-auto">
                            <FontAwesomeIcon icon={isAdmin ? faTachometerAlt : faChartBar} className="mr-3" /> Go to Analysis Dashboard
                        </ThemeButton>
                    </div>
                )}

                {/* Basic Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
                    <h4 className="text-xl font-bold mb-4 text-gray-800">Account Information</h4>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-3 flex justify-between">
                            <span className="font-medium text-gray-700">Username:</span>
                            <span className="text-gray-900">{user.username}</span>
                        </li>
                        <li className="py-3 flex justify-between">
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-gray-900">{user.email}</span>
                        </li>
                        <li className="py-3 flex justify-between">
                            <span className="font-medium text-gray-700">Role:</span>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 rounded-full">{user.role}</span>
                        </li>
                    </ul>
                </div>

                {/* 💰 VENDOR SPECIFIC DETAILS */}
                {/* 💰 VENDOR SPECIFIC DETAILS */}
            {isVendor && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-gray-800">Business & KYC Details</h4>
                        
                        {/* 👇 2. Use the calculated variables here */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>
                            {statusLabel}
                        </span>
                    </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Store Name</label>
                                    <p className="text-lg font-medium text-gray-900">{currentUser.store_name || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Business Reg. ID (Tax ID)</label>
                                    <p className="text-lg font-medium text-gray-900">{currentUser.business_reg_id || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Current Document</label>
                                    {currentUser.kyc_document ? (
                                        <a 
                                            href={currentUser.kyc_document} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            <FontAwesomeIcon icon={faCopy} className="mr-2" /> View Uploaded PDF/Image
                                        </a>
                                    ) : (
                                        <p className="text-red-500 italic text-sm">No document uploaded yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Right: Upload Form */}
                            <div className="bg-gray-50 p-5 rounded-lg border border-dashed border-gray-300">
                                <h5 className="font-semibold text-gray-700 mb-2">Update Document</h5>
                                <p className="text-xs text-gray-500 mb-4">Upload a new Business License or Tax Certificate (PDF/Image) to update your KYC status.</p>
                                
                                <form onSubmit={handleKycUpload} className="space-y-3">
                                    <input 
                                        type="file" 
                                        // Accepts all common document types
                                        accept=".pdf,.jpg,.jpeg,.png,.csv,.txt,.xls,.xlsx,.doc,.docx"
                                        onChange={(e) => setKycFile(e.target.files[0])}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-xs file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    <ThemeButton 
                                        type="submit" 
                                        disabled={!kycFile || isUploadingKyc} 
                                        className="w-full"
                                    >
                                        {isUploadingKyc ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2"/> : <FontAwesomeIcon icon={faCopy} className="mr-2"/>}
                                        {isUploadingKyc ? "Uploading..." : "Upload New Document"}
                                    </ThemeButton>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    const renderActiveView = () => { 
        if (isAdmin) { 
            if (adminLoading) return renderSpinner("Loading Admin Portal..."); 
            if (adminError) return <div className="p-4 rounded-md bg-red-100 text-red-700">{adminError}</div>; 
            switch(activeView) { 
                case 'admin-dashboard': return renderAdminDashboard(); 
                case 'admin-vendors': return renderAdminVendorMgmt(); 
                case 'admin-customers': return renderAdminCustomerMgmt(); // ✅ NEW: Route for Customers
                case 'admin-products': return renderAdminProductMgmt(); 
                case 'admin-orders': return renderAdminOrderMgmt(); 
                case 'admin-categories': return renderAdminCategoryMgmt(); 
                case 'admin-payouts': return renderAdminPayoutMgmt(); 
                case 'admin-support-messages': return renderAdminSupportMessages(); 
                default: return renderAdminDashboard(); 
            } 
        } 
        if (isVendor) { 
            switch(activeView) { 
                case 'vendor-dashboard': return renderVendorDashboard(); 
                case 'vendor-products': return renderProductManagement(); 
                case 'vendor-orders': return renderVendorOrders(); 
                case 'vendor-payouts': return renderVendorPayouts(); 
                case 'vendor-bank-settings': return renderVendorBankSettings(); 
                case 'profile': return renderProfileView(); 
                case 'security': return ( <form onSubmit={handlePasswordSubmit} className="space-y-4"> <div> <label className="block text-sm font-medium text-gray-700">Old Password</label> <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} /> </div> <div> <label className="block text-sm font-medium text-gray-700">New Password</label> <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} /> </div> <div> <label className="block text-sm font-medium text-gray-700">Confirm New Password</label> <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} /> </div> <ThemeButton type="submit" disabled={passLoading}> Update Password </ThemeButton> </form> ); default: return renderVendorDashboard(); } 
        } 
        switch(activeView) { 
            case 'security': return ( <form onSubmit={handlePasswordSubmit} className="space-y-4"> <div> <label className="block text-sm font-medium text-gray-700">Old Password</label> <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} /> </div> <div> <label className="block text-sm font-medium text-gray-700">New Password</label> <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} /> </div> <div> <label className="block text-sm font-medium text-gray-700">Confirm New Password</label> <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordFormChange} className={formInputClasses(false)} /> </div> <ThemeButton type="submit" disabled={passLoading}> Update Password </ThemeButton> </form> ); 
            case 'discounts': return ( <div className="space-y-3"> {discounts.map(d => ( <div key={d.id} className="p-4 rounded-md flex justify-between items-center" style={{ backgroundColor: OLIVE_THEME.light }}> <span style={{ color: OLIVE_THEME.dark }}><strong>{d.code}</strong>: {d.description}</span> <ThemeButton onClick={() => copyToClipboard(d.code)}> Copy </ThemeButton> </div> ))} </div> ); 
            case 'profile': default: return renderProfileView(); 
        } 
    };
    if (!user) { return ( <div className="container mx-auto my-12 p-6 text-center"> <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-6 rounded-md shadow-md max-w-lg mx-auto"> <h4 className="text-xl font-bold mb-2">Please Log In</h4> <p className="mb-4">You must be logged in to view your account details.</p> <hr className="my-4 border-yellow-300" /> <ThemeButton onClick={onLoginClick}> <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Log In / Register </ThemeButton> </div> </div> ); }
    const ConfirmationModal = () => { if (!showConfirmModal) return null; const variantClasses = { danger: { alert: 'bg-red-100 text-red-700', button: 'bg-red-600 hover:bg-red-700 text-white' }, primary: { alert: 'bg-blue-100 text-blue-700', button: `text-white`, }, success: { alert: 'bg-green-100 text-green-700', button: `text-white`, }, secondary: { alert: 'bg-yellow-100 text-yellow-700', button: 'bg-yellow-500 hover:bg-yellow-600 text-white'} }; const classes = variantClasses[confirmVariant] || variantClasses.primary; return ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-300" aria-modal="true" role="dialog"> <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transition-all transform scale-100 opacity-100"> <div className="flex justify-between items-center p-4 border-b"> <h5 className="text-lg font-semibold">Confirm Action</h5> <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button> </div> <div className="p-6"> <div className={`p-4 rounded-md ${classes.alert}`}> {confirmMessage} </div> </div> <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg"> <button className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors" onClick={() => setShowConfirmModal(false)}> Cancel </button> <button className={`px-4 py-2 rounded-md font-semibold transition-colors ${classes.button}`} style={{ backgroundColor: (confirmVariant === 'primary' || confirmVariant === 'success') ? OLIVE_THEME.main : undefined, }} onMouseOver={e => { if (confirmVariant !== 'danger' && confirmVariant !== 'secondary') e.currentTarget.style.backgroundColor = OLIVE_THEME.dark; }} onMouseOut={e => { if (confirmVariant !== 'danger' && confirmVariant !== 'secondary') e.currentTarget.style.backgroundColor = OLIVE_THEME.main; }} onClick={handleConfirm}> Confirm </button> </div> </div> </div> ); };
    const TrackingModal = () => { if (!showTrackingModal) return null; const isUpdating = updatingOrderId === trackingOrderId; const handleSubmit = (e) => { e.preventDefault(); if (!trackingNumber) { setTrackingError("Tracking number is required to mark as shipped."); return; } executeStatusUpdate(trackingOrderId, 'Shipped', trackingNumber); }; const handleClose = () => { if (isUpdating) return; setShowTrackingModal(false); setTrackingOrderId(null); setTrackingNumber(""); setTrackingError(null); }; return ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-300" aria-modal="true" role="dialog"> <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"> <div className="flex justify-between items-center p-4 border-b"> <h5 className="text-lg font-semibold">Ship Order (ID: {trackingOrderId})</h5> <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl" disabled={isUpdating}>&times;</button> </div> <div className="p-6 space-y-4"> <p className="text-gray-600"> Please enter the tracking number provided by your shipping carrier. </p> <div> <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700"> Tracking Number </label> <input type="text" id="trackingNumber" className={formInputClasses(trackingError)} value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. 1Z999AA10123456789" required disabled={isUpdating} /> </div> {trackingError && ( <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm"> {trackingError} </div> )} </div> <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg"> <button type="button" className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors" onClick={handleClose} disabled={isUpdating} > Cancel </button> <ThemeButton type="submit" disabled={isUpdating}> {isUpdating ? ( <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> ) : ( <FontAwesomeIcon icon={faTruck} className="mr-2" /> )} Mark as Shipped </ThemeButton> </div> </form> </div> ); };
    
    // ✅ NEW: Discount Modal Component
    const DiscountModal = () => {
        if (!showDiscountModal || !discountProduct) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
                <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 relative">
                    <button onClick={() => setShowDiscountModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                    
                    <h5 className="text-xl font-bold mb-4 flex items-center" style={{ color: OLIVE_THEME.dark }}>
                        <FontAwesomeIcon icon={faTag} className="mr-2" /> Edit Discount
                    </h5>
                    
                    <p className="text-sm text-gray-600 mb-4">
                        Set a percentage discount for <strong>{discountProduct.name}</strong>.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-olive-500 focus:border-olive-500" 
                                value={discountValue} 
                                onChange={(e) => setDiscountValue(e.target.value)} 
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <FontAwesomeIcon icon={faPercent} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Original: ₹{parseFloat(discountProduct.price).toFixed(2)} <br/>
                            New Price: <strong>₹{(discountProduct.price - (discountProduct.price * (discountValue / 100))).toFixed(2)}</strong>
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setShowDiscountModal(false)}
                            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <ThemeButton onClick={saveDiscount} disabled={isDiscountSaving}>
                            {isDiscountSaving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2"/> : <FontAwesomeIcon icon={faCheck} className="mr-2"/>}
                            Save
                        </ThemeButton>
                    </div>
                </div>
            </div>
        );
    };
    const pendingAdminPayoutsCount = adminPayouts.filter(p => p.status === 'PENDING').length;
    const pendingVendorPayoutsCount = payouts.filter(p => p.status === 'PENDING').length;
    const pendingSupportMessagesCount = supportMessages.filter(msg => !msg.is_resolved).length;
    const pendingProductsCount = allProducts.filter(p => p.status === 'PENDING').length;

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
                {(isAdmin || isVendor) && ( <ThemeButton onClick={() => { if (isAdmin) navigate('/admin/dashboard'); else if (isVendor) navigate('/vendor/dashboard'); }}> <FontAwesomeIcon icon={isAdmin ? faTachometerAlt : faChartBar} className="mr-2" /> Analysis </ThemeButton> )}
            </div>
            <div className="flex flex-col md:flex-row -mx-4">
                <div className="w-full md:w-1/3 lg:w-1/4 px-4 mb-6 md:mb-0 md:sticky md:top-24 md:self-start">
                    <div className="bg-white rounded-xl shadow-lg text-center p-6 mb-6 transition-all hover:shadow-xl"> <FontAwesomeIcon icon={faUserCircle} className="mb-3 text-7xl" style={{ color: navThemeColor }} /> <h5 className="text-xl font-semibold">{user.username}</h5> <p className="text-gray-600">{user.email}</p> <span className="inline-block mt-2 px-3 py-1 text-sm font-semibold text-white rounded-full" style={{ backgroundColor: navThemeColor }} > {user.role} </span> </div>
                    <nav className="flex flex-col space-y-2">
                        {isAdmin && <>
                            <button onClick={() => setActiveView('admin-dashboard')} className={navLinkClasses('admin-dashboard', activeView)} style={{ backgroundColor: activeView === 'admin-dashboard' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-dashboard') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-dashboard') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faTachometerAlt} className="mr-3 w-5"/> Dashboard</button>
                            <button onClick={() => setActiveView('admin-vendors')} className={navLinkClasses('admin-vendors', activeView)} style={{ backgroundColor: activeView === 'admin-vendors' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-vendors') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-vendors') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faUsersCog} className="mr-3 w-5"/> Vendor Report</button>
                            
                            <button onClick={() => setActiveView('admin-customers')} className={navLinkClasses('admin-customers', activeView)} style={{ backgroundColor: activeView === 'admin-customers' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-customers') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-customers') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}>
                                <FontAwesomeIcon icon={faUsers} className="mr-3 w-5"/> Customer Report
                            </button>

                            <button onClick={() => setActiveView('admin-products')} className={navLinkClasses('admin-products', activeView)} style={{ backgroundColor: activeView === 'admin-products' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-products') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-products') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}>
                                <div className="flex justify-between items-center w-full"> <span><FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5"/> Product Mgmt</span> {pendingProductsCount > 0 && ( <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse"> {pendingProductsCount} </span> )} </div>
                            </button>
                            <button onClick={() => setActiveView('admin-orders')} className={navLinkClasses('admin-orders', activeView)} style={{ backgroundColor: activeView === 'admin-orders' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-orders') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-orders') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faListCheck} className="mr-3 w-5"/> All Orders</button>
                            <button onClick={() => setActiveView('admin-categories')} className={navLinkClasses('admin-categories', activeView)} style={{ backgroundColor: activeView === 'admin-categories' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-categories') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-categories') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faTasks} className="mr-3 w-5"/> Categories</button>
                            <button onClick={() => setActiveView('admin-payouts')} className={navLinkClasses('admin-payouts', activeView)} style={{ backgroundColor: activeView === 'admin-payouts' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-payouts') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-payouts') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}>
                                <div className="flex justify-between items-center w-full"> <span><FontAwesomeIcon icon={faMoneyBillTransfer} className="mr-3 w-5"/> Payouts</span> {pendingAdminPayoutsCount > 0 && ( <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse"> {pendingAdminPayoutsCount} </span> )} </div>
                            </button>
                            <button onClick={() => setActiveView('admin-support-messages')} className={navLinkClasses('admin-support-messages', activeView)} style={{ backgroundColor: activeView === 'admin-support-messages' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('admin-support-messages') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('admin-support-messages') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}>
                                <div className="flex justify-between items-center w-full"> <span><FontAwesomeIcon icon={faHeadset} className="mr-3 w-5"/> Support Messages</span> {pendingSupportMessagesCount > 0 && ( <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse"> {pendingSupportMessagesCount} </span> )} </div>
                            </button>
                        </>}
                        {isVendor && <>
                            <button onClick={() => setActiveView('vendor-dashboard')} className={navLinkClasses('vendor-dashboard', activeView)} style={{ backgroundColor: activeView === 'vendor-dashboard' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-dashboard') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-dashboard') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faChartBar} className="mr-3 w-5"/> Dashboard</button>
                            <button onClick={() => setActiveView('vendor-products')} className={navLinkClasses('vendor-products', activeView)} style={{ backgroundColor: activeView === 'vendor-products' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-products') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-products') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5"/> Products</button>
                            <button onClick={() => setActiveView('vendor-orders')} className={navLinkClasses('vendor-orders', activeView)} style={{ backgroundColor: activeView === 'vendor-orders' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-orders') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-orders') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faListCheck} className="mr-3 w-5"/> Orders</button>
                            <button onClick={() => setActiveView('vendor-payouts')} className={navLinkClasses('vendor-payouts', activeView)} style={{ backgroundColor: activeView === 'vendor-payouts' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-payouts') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-payouts') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}>
                                <div className="flex justify-between items-center w-full"> <span><FontAwesomeIcon icon={faRupeeSign} className="mr-3 w-5"/> Payouts</span> {pendingVendorPayoutsCount > 0 && ( <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"> {pendingVendorPayoutsCount} </span> )} </div>
                            </button>
                            <button onClick={() => setActiveView('vendor-bank-settings')} className={navLinkClasses('vendor-bank-settings', activeView)} style={{ backgroundColor: activeView === 'vendor-bank-settings' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('vendor-bank-settings') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('vendor-bank-settings') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faBuilding} className="mr-3 w-5"/> Bank Settings</button>
                        </>}
                        {!isAdmin && <>
                            <button onClick={() => setActiveView('profile')} className={navLinkClasses('profile', activeView)} style={{ backgroundColor: activeView === 'profile' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('profile') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('profile') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faUserCircle} className="mr-3 w-5"/> Profile</button>
                            <button onClick={() => setActiveView('security')} className={navLinkClasses('security', activeView)} style={{ backgroundColor: activeView === 'security' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('security') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('security') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faShieldAlt} className="mr-3 w-5"/> Security</button>
                            
                            <Link 
                                to="/my-orders" 
                                className={`${navLinkClasses('__NEVER_ACTIVE__', activeView)} !no-underline !text-gray-700 hover:!text-white`} 
                                style={{ textDecoration: 'none', color: '#374151' }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = navHoverColor;
                                    e.currentTarget.style.color = navHoverTextColor;
                                }} 
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#374151';
                                }}
                            > 
                                <FontAwesomeIcon icon={faTruck} className="mr-3 w-5"/> My Orders 
                            </Link>
                        </>}
                        {!isVendor && !isAdmin && ( <button onClick={() => setActiveView('discounts')} className={navLinkClasses('discounts', activeView)} style={{ backgroundColor: activeView === 'discounts' ? navThemeColor : 'transparent', '--hover-bg': navHoverColor, '--hover-text': navHoverTextColor }} onMouseOver={e => !activeView.includes('discounts') && (e.currentTarget.style.backgroundColor = navHoverColor, e.currentTarget.style.color = navHoverTextColor)} onMouseOut={e => !activeView.includes('discounts') && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#374151')}><FontAwesomeIcon icon={faTag} className="mr-3 w-5"/> Discounts</button> )}
                    </nav>
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4 px-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 min-h-[400px] animate-in fade-in duration-300"> {renderActiveView()} </div>
                </div>
            </div>
            <ConfirmationModal />
            <TrackingModal />
            <DiscountModal />
        </div>
    );
}

export default MyPage;