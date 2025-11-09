import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    Container, Row, Col, Card, ListGroup, Button, Spinner, Alert, Nav, Form, Image, Modal 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCircle, faShieldAlt, faTag, faTruck, faCopy,
    faBoxOpen, faChartBar, faListCheck, faPlus, faPencilAlt, faTrashAlt, faRupeeSign, faList,
    faSignInAlt, faChevronRight, faCircleCheck, faTruckMoving, faBoxOpen as faBoxOpenSolid, faClock,
    faTasks, faUsersCog, faBuilding, faTachometerAlt, faCheck, faTimes, faTrash // Admin Icons
} from '@fortawesome/free-solid-svg-icons';
import { getAuthToken } from './auth'; 
import { useUser } from '../context/UserContext.jsx'; 
import "./MyPage.css";

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
    const [newCategory, setNewCategory] = useState(""); // 💰 ADDED Admin State

    // --- State for Customer ---
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [discounts] = useState([{ id: 1, code: 'WELCOME10', description: '10% off your next purchase' }]);
    
    // --- State for Confirmation Modal ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmVariant, setConfirmVariant] = useState("danger");

    // 💰 --- ADMIN Universal Fetch Wrapper ---
    // This helper makes all admin API calls easier
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
    // 💰 --- START: FILLED-IN ADMIN API Functions ---
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
            // Note: Admin categories uses the public endpoint but will
            // have admin rights (POST/DELETE) due to the auth token
            const res = await authFetch(ADMIN_CATEGORIES_URL);
            if (!res.ok) throw new Error('Could not fetch categories');
            const data = await res.json();
            setCategories(data.results || data);
        } catch (err) { setAdminError(err.message); }
    };

    // --- Admin Action Functions ---

    const approveVendor = async (id, action) => {
        // Use confirmation modal
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

    const createCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await authFetch(ADMIN_CATEGORIES_URL, {
                method: "POST",
                body: JSON.stringify({ name: newCategory })
            });
            setNewCategory("");
            fetchCategories(); // Refresh the list
        } catch (err) {
            alert(`Failed to create category: ${err.message}`);
        }
    };

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
    // 💰 --- END: FILLED-IN ADMIN API Functions ---
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
            case 'Paid': return { icon: faCircleCheck, color: 'text-success' };
            case 'Shipped': return { icon: faTruckMoving, color: 'text-primary' };
            case 'Delivered': return { icon: faBoxOpenSolid, color: 'text-info' };
            case 'Failed': return { icon: faSignInAlt, color: 'text-danger' };
            case 'Pending':
            default: return { icon: faClock, color: 'text-warning' };
        }
    };


    // --------------------------------------------------
    // 💰 --- START: FILLED-IN ADMIN RENDER Functions ---
    // --------------------------------------------------

    const renderAdminDashboard = () => {
        if (!adminDashboardData) return <Spinner animation="border" />;
        const stats = adminDashboardData; // Use the direct object
        
        return (
            <div>
                <h3 className="mb-4">Admin Dashboard</h3>
                <Row className="mt-3 g-4">
                    <Col md={6}>
                        <Card className="p-3 bg-primary text-white shadow-sm">
                            <h6>Total Sales</h6>
                            <h3>₹{stats.total_sales?.toFixed(2) || '0.00'}</h3>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="p-3 bg-success text-white shadow-sm">
                            <h6>Total Commission (10%)</h6>
                            <h3>₹{stats.total_commission?.toFixed(2) || '0.00'}</h3>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="p-3 bg-info text-dark shadow-sm">
                            <h6>New Orders (Paid)</h6>
                            <h3>{stats.new_orders}</h3>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="p-3 bg-warning text-dark shadow-sm">
                            <h6>Pending Vendors</h6>
                            <h3>{stats.pending_vendors}</h3>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderAdminVendorMgmt = () => (
        <div>
            <h3 className="mb-4">Vendor Applications</h3>
            {pendingVendors.length === 0 && (
                <Alert variant="success">No pending vendor applications.</Alert>
            )}
            <ListGroup className="mt-3">
                {pendingVendors.map(v => (
                    <ListGroup.Item key={v.id} className="d-flex flex-wrap justify-content-between align-items-center">
                        <div className="mb-2 mb-md-0">
                            <strong>{v.store_name}</strong><br />
                            <small className="text-muted">{v.email}</small>
                        </div>
                        <div className="ms-auto">
                            <Button
                                variant="success"
                                className="me-2"
                                size="sm"
                                onClick={() => approveVendor(v.id, "APPROVE")}
                            >
                                <FontAwesomeIcon icon={faCheck} /> Approve
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => approveVendor(v.id, "REJECT")}
                            >
                                <FontAwesomeIcon icon={faTimes} /> Reject
                            </Button>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );

    const renderAdminProductMgmt = () => (
        <div>
            <h3 className="mb-4">All Products</h3>
            <ListGroup className="mt-3">
                {allProducts.length === 0 && <Alert variant="info">No products found.</Alert>}
                {allProducts.map(p => (
                    <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{p.name}</strong> — ₹{p.price}
                            <br />
                            <span className={`badge ${p.status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                {p.status}
                            </span>
                            <small className="text-muted ms-2">| By: {p.vendor_name}</small>
                        </div>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => adminRemoveProduct(p.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );

    const renderAdminOrderMgmt = () => (
        <div>
            <h3 className="mb-4">All Orders</h3>
            {allOrders.length === 0 && <Alert variant="info">No orders found.</Alert>}
            {allOrders.map(o => (
                <Card key={o.id} className="p-3 my-3 shadow-sm">
                    <Card.Header>
                        Order #{o.id} — <strong>Status: {o.status}</strong>
                    </Card.Header>
                    <Card.Body>
                        <p><strong>Total:</strong> ₹{o.total_amount}</p>
                        <p><strong>User:</strong> {o.user_email}</p>
                        <h6>Items:</h6>
                        <ul>
                            {o.items.map(i => (
                                <li key={i.id}>
                                    {i.product_name} × {i.quantity}
                                </li>
                            ))}
                        </ul>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );

    const renderAdminCategoryMgmt = () => (
        <div>
            <h3 className="mb-4">Manage Categories</h3>
            <Form onSubmit={createCategory} className="d-flex mt-3">
                <Form.Control
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                />
                <Button className="ms-2" type="submit" variant="primary">
                    <FontAwesomeIcon icon={faPlus} /> Add
                </Button>
            </Form>
            <hr />
            <ListGroup className="mt-3">
                {categories.map(c => (
                    <ListGroup.Item key={c.id} className="d-flex justify-content-between align-items-center">
                        {c.name}
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteCategory(c.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );

    // --------------------------------------------------
    // 💰 --- END: FILLED-IN ADMIN RENDER Functions ---
    // --------------------------------------------------


    // --- VENDOR Render Functions ---
    const renderVendorDashboard = () => {
        if (dashboardLoading) return <Spinner animation="border" />;
        if (dashboardError) return <Alert variant="danger">{dashboardError}</Alert>;
        const metrics = dashboardData || { total_earnings: 0, total_orders: 0, active_products: 0, unique_customers: 0 };
    
        return (
            <div>
                <h3 className="mb-4">{user.store_name || user.username} Dashboard</h3>
                <Row className="g-4">
                    <Col md={6} lg={3}><Card className="shadow-sm" style={{ backgroundColor: '#bb7300ff', color: 'white' }}><Card.Body><h6>Total Earnings</h6><h2>₹{metrics.total_earnings ? metrics.total_earnings.toFixed(2) : '0.00'}</h2></Card.Body></Card></Col>
                    <Col md={6} lg={3}><Card className="shadow-sm" style={{ backgroundColor: '#85a728ff', color: 'white' }}><Card.Body><h6>Total Orders</h6><h2>{metrics.total_orders}</h2></Card.Body></Card></Col>
                    <Col md={6} lg={3}><Card className="shadow-sm" style={{ backgroundColor: '#003366', color: 'white' }}><Card.Body><h6>Active Products</h6><h2>{metrics.active_products}</h2></Card.Body></Card></Col>
                    <Col md={6} lg={3}><Card className="shadow-sm border-0"style={{ backgroundColor: '#056600ff', color: 'white' }}><Card.Body><h6>Customers</h6><h2>{metrics.unique_customers}</h2></Card.Body></Card></Col>
                </Row>
                <Alert variant="secondary" className="mt-4">
                    <h5 className="fw-bold">Admin Approval Workflow</h5>
                    <p>All new products start as <strong>PENDING</strong>. You can edit/delete them before approval.</p>
                </Alert>
                <div className="d-flex gap-3">
                    <Button onClick={() => handleProductAction('add')} style={{ backgroundColor: '#ff7f50', borderColor: '#ff7f50', color: 'white' }}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Product
                    </Button>
                    <Button onClick={() => setActiveView('vendor-products')} style={{ backgroundColor: '#003366', borderColor: '#003366', color: 'white' }}>
                        <FontAwesomeIcon icon={faList} className="me-2" /> View Inventory
                    </Button>
                </div>
            </div>
        );
    };

    const renderProductManagement = () => (
        <div>
            <h3 className="mb-3">Product Management</h3>
            <Button onClick={() => handleProductAction('add')} style={{ backgroundColor: '#ff7f50', borderColor: '#ff7f50', color: 'white' }} className="mb-3">
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Product
            </Button>
            {productsLoading && <Spinner animation="border" />}
            {productsError && <Alert variant="danger">{productsError}</Alert>}
            <Card>
                <ListGroup variant="flush">
                    {vendorProducts.length === 0 ? (
                        <ListGroup.Item>You have not added any products yet.</ListGroup.Item>
                    ) : (
                        vendorProducts.map(p => (
                            <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    {p.name}{" "}
                                    <span style={{ 
                                        backgroundColor: p.status === "APPROVED" ? '#28a745' : p.status === "PENDING" ? '#ff7f50' : '#003366', 
                                        color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' 
                                    }}>{p.status}</span>{" "}
                                    | ₹{parseFloat(p.price).toFixed(2)}
                                </div>
                                <div>
                                    <Button size="sm" onClick={() => handleProductAction('edit', p.id)} style={{ marginRight: '5px', backgroundColor: '#003366', color: 'white', borderColor: '#003366' }}>Edit</Button>
                                    <Button size="sm" onClick={() => handleProductAction('delete', p.id)} style={{ backgroundColor: '#ff7f50', color: 'white', borderColor: '#ff7f50' }}>Delete</Button>
                                </div>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            </Card>
        </div>
    );
    
    const renderVendorOrders = () => {
        if (ordersLoading) return <Spinner animation="border" />;
        if (ordersError) return <Alert variant="danger">{ordersError}</Alert>;
        if (vendorOrders.length === 0) {
            return <Alert variant="info">You have not received any orders yet.</Alert>;
        }

        return (
            <div>
                <h3 className="mb-3">Customer Orders</h3>
                {vendorOrders.map(order => {
                    const nextStatus = STATUS_TRANSITIONS[order.status];
                    const isUpdating = updatingOrderId === order.id;
                    const isUpdateDisabled = !nextStatus || isUpdating;

                    return (
                        <Card key={order.id} className="mb-3 shadow-sm">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                                <div>
                                    <strong>Order ID: {order.id}</strong>
                                    <span 
                                        className={`ms-2 badge fw-bold`} 
                                        style={{ 
                                            backgroundColor: order.status === 'Paid' ? '#28aa45' : order.status === 'Shipped' ? '#0d6efd' : '#6c757d',
                                            color: 'white'
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
                                    
                                    {order.status !== 'Delivered' && order.status !== 'Failed' && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="ms-3"
                                            disabled={isUpdateDisabled}
                                            onClick={() => handleStatusConfirmation(order.id, nextStatus)} 
                                        >
                                            {isUpdating ? (
                                                <Spinner as="span" size="sm" animation="border" className="me-2" />
                                            ) : (
                                                <>
                                                    Mark as {nextStatus} 
                                                    <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Card.Text><strong>Customer:</strong> {order.customer_name}</Card.Text>
                                <hr />
                                <h6 className="mb-3">Items in this Order:</h6>
                                <ListGroup variant="flush">
                                    {order.items.map(item => (
                                        <ListGroup.Item key={item.id} className="d-flex align-items-center">
                                            {/* <Image 
                                                src={item.product_image || 'https://via.placeholder.com/60?text=No+Image'} 
                                                rounded 
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                                                className="me-3"
                                            /> */}
                                            <div className="flex-grow-1">
                                                <strong>{item.product_name}</strong>
                                                <br />
                                                <small className="text-muted">Quantity: {item.quantity}</small>
                                            </div>
                                            <div className="fw-bold">
                                                ₹{parseFloat(item.price).toFixed(2)}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                            <Card.Footer className="bg-white">
                                <h6 className="fw-bold mb-2">Tracking History</h6>
                                <ListGroup horizontal className="d-flex justify-content-between">
                                    {order.history && order.history.map(record => {
                                        const { icon, color } = getStatusIcon(record.status);
                                        return (
                                            <ListGroup.Item 
                                                key={record.timestamp} 
                                                className={`text-center p-2 border-0`}
                                            >
                                                <FontAwesomeIcon icon={icon} size="lg" className={color} /><br />
                                                <small>{record.status}</small>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            </Card.Footer>
                        </Card>
                    );
                })}
            </div>
        );
    };

    // --- CUSTOMER Render Functions ---
    const renderProfileView = () => (
        <div>
            <h3>Profile Details</h3>
            <ListGroup variant="flush">
                <ListGroup.Item>Username: {user.username}</ListGroup.Item>
                <ListGroup.Item>Email: {user.email}</ListGroup.Item>
                <ListGroup.Item>Role: {user.role}</ListGroup.Item>
            </ListGroup>
        </div>
    );

    // --- Main View Router ---
    const renderActiveView = () => {
        // 1. ADMIN VIEW
        if (isAdmin) {
            if (adminLoading) return <Container className="p-5 text-center"><Spinner animation="border" /></Container>;
            if (adminError) return <Alert variant="danger">{adminError}</Alert>;
            
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
                        <Form onSubmit={handlePasswordSubmit}>
                            {/* ... (Password Form) ... */}
                        </Form>
                    );
                default: return renderVendorDashboard();
            }
        }
        // 3. CUSTOMER VIEW
        switch(activeView) {
            case 'security':
                return (
                    <Form onSubmit={handlePasswordSubmit}>
                        <Form.Group className="mb-2"><Form.Label>Old Password</Form.Label><Form.Control type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordFormChange}/></Form.Group>
                        <Form.Group className="mb-2"><Form.Label>New Password</Form.Label><Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordFormChange}/></Form.Group>
                        <Form.Group className="mb-2"><Form.Label>Confirm New Password</Form.Label><Form.Control type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordFormChange}/></Form.Group>
                        <Button type="submit" disabled={passLoading} style={{ backgroundColor: '#28a745', borderColor: '#28a745', color: 'white' }}>Update Password</Button>
                    </Form>
                );
            case 'discounts':
                return discounts.map(d => <Alert key={d.id}>{d.code}: {d.description} <Button size="sm" onClick={() => copyToClipboard(d.code)}>Copy</Button></Alert>);
            case 'profile':
            default: 
                return renderProfileView();
        }
    };

    // "Guard Clause" for logged-out users
    if (!user) {
        return (
            <Container className="my-5 p-5 text-center">
                <Alert variant="warning" className="shadow-sm">
                    <Alert.Heading>Please Log In</Alert.Heading>
                    <p>You must be logged in to view your account details.</p>
                    <hr />
                    <Button variant="success" onClick={onLoginClick}>
                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                        Log In / Register
                    </Button>
                </Alert>
            </Container>
        );
    }
    
    // --- Confirmation Modal (Reusable) ---
    const ConfirmationModal = () => (
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant={confirmVariant}>{confirmMessage}</Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                    Cancel
                </Button>
                <Button variant={confirmVariant} onClick={handleConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );

    // ------------------- MAIN RETURN -------------------
    // This now renders the correct sidebar based on role
    return (
        <Container className="my-5">
            <h2>{isAdmin ? "Admin Portal" : (isVendor ? (user.store_name || "Vendor Dashboard") : "My Account")}</h2>
            <Row>
                <Col md={4}>
                    <Card className="text-center mb-4">
                        <Card.Body>
                            <FontAwesomeIcon icon={faUserCircle} size="4x" className="mb-2" style={{ color: isAdmin ? '#dc9635ff' : (isVendor ? '#d2d17fff' : '#003366') }}/>
                            <h5>{user.username}</h5>
                            <p>{user.email}</p>
                            <span className={`badge ${isAdmin ? 'bg-[danger]' : (isVendor ? 'bg-success' : 'bg-primary')}`}>{user.role}</span>
                        </Card.Body>
                    </Card>
                    
                    {/* --- DYNAMIC NAVIGATION --- */}
                    <Nav variant="pills" className="flex-column" activeKey={activeView} onSelect={k => setActiveView(k)}>
                        
                        {/* 1. ADMIN NAV */}
                        {isAdmin && <>
                            <Nav.Item><Nav.Link eventKey="admin-dashboard"style={{ color: activeView === 'admin-dashboard' ? 'white' : '#003366', backgroundColor: activeView === 'admin-dashboard' ? '#dc9135ff' : 'transparent', marginBottom: '5px', borderRadius: '5px' }}><FontAwesomeIcon icon={faTachometerAlt} className="me-2"/> Dashboard</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="admin-vendors"style={{ color: activeView === 'admin-vendors' ? 'white' : '#003366', backgroundColor: activeView === 'admin-vendors' ? '#dc9135ff' : 'transparent', marginBottom: '5px', borderRadius: '5px' }}><FontAwesomeIcon icon={faUsersCog} className="me-2"/> Vendor Apps</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="admin-products"style={{ color: activeView === 'admin-products' ? 'white' : '#003366', backgroundColor: activeView === 'admin-products' ? '#dc9135ff' : 'transparent', marginBottom: '5px', borderRadius: '5px' }}><FontAwesomeIcon icon={faBoxOpen} className="me-2"/> Product Mgmt </Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="admin-orders"  style={{ color: activeView === 'admin-orders' ? 'white' : '#003366', backgroundColor: activeView === 'admin-orders' ? '#dc9135ff' : 'transparent', marginBottom: '5px', borderRadius: '5px' }}><FontAwesomeIcon icon={faListCheck} className="me-2"/> All Orders</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="admin-categories"style={{ color: activeView === 'admin-categories' ? 'white' : '#003366', backgroundColor: activeView === 'admin-categories' ? '#dc9135ff' : 'transparent', marginBottom: '5px', borderRadius: '5px'}}><FontAwesomeIcon icon={faTasks} className="me-2"/> Categories</Nav.Link></Nav.Item>
                        </>}
                        
                        {/* 2. VENDOR NAV */}
                        {isVendor && <>
                            <Nav.Item><Nav.Link eventKey="vendor-dashboard" style={{ color: activeView === 'vendor-dashboard' ? 'white' : '#003366', backgroundColor: activeView === 'vendor-dashboard' ? '#b4c666ff' : 'transparent', marginBottom: '5px', borderRadius: '5px' }}><FontAwesomeIcon icon={faChartBar} className="me-2"/> Dashboard</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="vendor-products" style={{ color: activeView === 'vendor-products' ? 'white' : '#003366', backgroundColor: activeView === 'vendor-products' ? '#b4c666ff' : 'transparent', marginBottom: '5px', borderRadius: '5px' }}><FontAwesomeIcon icon={faBoxOpen} className="me-2"/> Products</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="vendor-orders"style={{ color: activeView === 'vendor-orders' ? 'white' : '#003366', backgroundColor: activeView === 'vendor-orders' ? '#b4c666ff' : 'transparent', marginBottom: '5px', borderRadius: '5px' }}><FontAwesomeIcon icon={faListCheck} className="me-2"/> Orders</Nav.Link></Nav.Item>
                        </>}

                        {/* 3. SHARED (CUSTOMER/VENDOR) NAV */}
                        {!isAdmin && <>
                            <Nav.Item><Nav.Link eventKey="profile" style={{ color: activeView === 'profile' ? 'white' : '#003366', backgroundColor: activeView === 'profile' ? '#28a745' : 'transparent', borderRadius: '5px', marginBottom: '5px' }}><FontAwesomeIcon icon={faUserCircle} className="me-2"/> Profile</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="security" style={{ color: activeView === 'security' ? 'white' : '#003366', backgroundColor: activeView === 'security' ? '#28a745' : 'transparent', borderRadius: '5px', marginBottom: '5px' }}><FontAwesomeIcon icon={faShieldAlt} className="me-2"/> Security</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link as={Link} to="/my-orders" style={{ color: '#003366', borderRadius: '5px', marginBottom: '5px' }}><FontAwesomeIcon icon={faTruck} className="me-2"/> My Orders</Nav.Link></Nav.Item>
                        </>}

                        {/* 4. CUSTOMER-ONLY NAV */}
                        {!isVendor && !isAdmin && (
                            <Nav.Item><Nav.Link eventKey="discounts" style={{ color: activeView === 'discounts' ? 'white' : '#003366', backgroundColor: activeView === 'discounts' ? '#28a745' : 'transparent', borderRadius: '5px', marginBottom: '5px' }}><FontAwesomeIcon icon={faTag} className="me-2"/> Discounts</Nav.Link></Nav.Item>
                        )}
                    </Nav>
                </Col>
                
                {/* --- CONTENT PANE --- */}
                <Col md={8}>
                    {/* Render a global error for the admin panel if something went wrong */}
                    {isAdmin && adminError && <Alert variant="danger">{adminError}</Alert>}
                    
                    <Card className="p-4">{renderActiveView()}</Card>
                </Col>
            </Row>
            
            {showConfirmModal && <ConfirmationModal />}
        </Container>
    );
}

export default MyPage;