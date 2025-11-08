import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    ListGroup,
    Button,
    Spinner,
    Alert,
    Nav,
    Form
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTachometerAlt,
    faUsersCog,
    faBoxOpen,
    faListCheck,
    faTasks,
    faTrash,
    faCheck,
    faTimes,
    faPlus,
    faChartBar // 💰 1. Import new icon
} from "@fortawesome/free-solid-svg-icons";

// 💰 2. Import Chart.js components
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { getAuthToken } from "../components/auth";
import { useUser } from "../context/UserContext";


// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// ✅ API endpoints
// ✅ Use VITE_API_URL for dynamic backend switching
const API = import.meta.env.VITE_API_URL;

// ✅ Admin API endpoints
const ADMIN_DASHBOARD_URL = `${API}/admin/dashboard/`;
const ADMIN_VENDORS_URL = `${API}/admin/vendors/`;
const ADMIN_APPROVE_VENDOR_URL = `${API}/admin/vendors/approve/`;
const ADMIN_ALL_PRODUCTS_URL = `${API}/admin/all-products/`;
const ADMIN_ALL_ORDERS_URL = `${API}/orders/admin/all/`;
const ADMIN_CATEGORIES_URL = `${API}/categories/`;
const ADMIN_SUPPORT_MESSAGES_URL = `${API}/admin/support-messages/`;



// 💰 3. Chart Helper Component
// We can define this right in the same file
const SalesByCategoryChart = ({ chartData }) => {
    if (!chartData) return <Spinner animation="border" />;

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Total Sales',
                data: chartData.sales,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Total Sales by Category',
            },
        },
    };

    return <Bar options={options} data={data} />;
};


export default function AdminDashboard() {
    const { user } = useUser();

    const [activeView, setActiveView] = useState("dashboard");

    // ✅ Admin data states
    const [dashboard, setDashboard] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [supportMessages, setSupportMessages] = useState([]);


    // 💰 4. Add state for processed chart data
    const [chartData, setChartData] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // 💰 Add a global error state

    // ✅ Universal fetch wrapper
    const authFetch = async (url, options = {}) => {
        const token = getAuthToken();
        return await fetch(url, {
            ...options,
            headers: {
                "Authorization": `JWT ${token}`,
                "Content-Type": "application/json",
                ...options.headers
            }
        });
    };

    // 💰 5. Data processing function for the chart
    const processChartData = (allOrders, allCategories) => {
        const salesData = {};
        
        // Initialize all categories with 0 sales
        allCategories.forEach(cat => {
            salesData[cat.name] = 0;
        });

        // Loop through all paid orders and sum sales
        allOrders.forEach(order => {
            if (order.status === "Paid") {
                order.items.forEach(item => {
                    const category = item.product_category_name;
                    if (category in salesData) {
                        salesData[category] += item.price * item.quantity;
                    }
                });
            }
        });

        return {
            labels: Object.keys(salesData),
            sales: Object.values(salesData),
        };
    };

    // ✅ Load all admin data
    useEffect(() => {
        if (user?.role !== "ADMIN") return;

        setLoading(true);
        setError(null); // Clear previous errors

        // We will fetch and then process the data
        const loadAllData = async () => {
            try {
                // Fetch all data in parallel
                const [dashRes, venRes, prodRes, ordRes, catRes] = await Promise.all([
                    authFetch(ADMIN_DASHBOARD_URL),
                    authFetch(ADMIN_VENDORS_URL),
                    authFetch(ADMIN_ALL_PRODUCTS_URL),
                    authFetch(ADMIN_ALL_ORDERS_URL),
                    authFetch(ADMIN_CATEGORIES_URL)
                ]);

                // Check all responses
                if (!dashRes.ok) throw new Error("Failed to load dashboard stats");
                if (!venRes.ok) throw new Error("Failed to load vendors");
                if (!prodRes.ok) throw new Error("Failed to load products");
                if (!ordRes.ok) throw new Error("Failed to load orders");
                if (!catRes.ok) throw new Error("Failed to load categories");

                // Get JSON data
                const dashData = await dashRes.json();
                const venData = (await venRes.json()).results || [];
                const prodData = (await prodRes.json()).results || [];
                const ordData = (await ordRes.json()).results || [];
                const catData = (await catRes.json()).results || [];
                const supportRes = await authFetch(ADMIN_SUPPORT_MESSAGES_URL);
if (!supportRes.ok) throw new Error("Failed to load support messages");
const supportData = (await supportRes.json()).results || [];
setSupportMessages(supportData);


                // Set all states
                setDashboard(dashData);
                setVendors(venData);
                setProducts(prodData);
                setOrders(ordData);
                setCategories(catData);

                // 💰 6. Process and set chart data
                const processedData = processChartData(ordData, catData);
                setChartData(processedData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [user]);

    // ✅ API functions
    // (Note: The main load functions are now inside useEffect)

    const approveVendor = async (id, action) => {
        await authFetch(`${ADMIN_APPROVE_VENDOR_URL}${id}/`, {
            method: "PATCH",
            body: JSON.stringify({ action })
        });
        // Reload vendors
        authFetch(ADMIN_VENDORS_URL).then(res => res.json()).then(data => setVendors(data.results || data));
    };

    const removeProduct = async (id) => {
        await authFetch(`${ADMIN_ALL_PRODUCTS_URL}${id}/`, { method: "DELETE" });
        // Reload products
        authFetch(ADMIN_ALL_PRODUCTS_URL).then(res => res.json()).then(data => setProducts(data.results || data));
    };

    const createCategory = async (e) => {
        e.preventDefault(); // 💰 Handle form submission
        if (!newCategory.trim()) return; // 💰 Don't submit empty
        await authFetch(ADMIN_CATEGORIES_URL, {
            method: "POST",
            body: JSON.stringify({ name: newCategory })
        });
        setNewCategory("");
        // Reload categories
        authFetch(ADMIN_CATEGORIES_URL).then(res => res.json()).then(data => setCategories(data.results || data));
    };

    const deleteCategory = async (id) => {
        await authFetch(`${ADMIN_CATEGORIES_URL}${id}/`, { method: "DELETE" });
        // Reload categories
        authFetch(ADMIN_CATEGORIES_URL).then(res => res.json()).then(data => setCategories(data.results || data));
    };

    // ✅ Loading screen
    if (loading) {
        return (
            <Container className="text-center p-5">
                <Spinner animation="border" />
                <p>Loading admin portal...</p>
            </Container>
        );
    }
    
    // 💰 Show global error if any fetch failed
    if (error) {
        return <Container className="p-5"><Alert variant="danger">Error: {error}</Alert></Container>;
    }

    // ⚠️ Guard: Only admin can access
    if (!user || user.role !== "ADMIN") {
        return <Container className="p-5"><Alert variant="danger">Access denied. Admins only.</Alert></Container>;
    }

    // ✅ Admin Nav
    const Sidebar = () => (
        <Nav
            variant="pills"
            className="flex-column"
            activeKey={activeView}
            onSelect={setActiveView}
        >
            <Nav.Item>
                <Nav.Link eventKey="dashboard">
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                    Dashboard (A-1)
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="vendors">
                    <FontAwesomeIcon icon={faUsersCog} className="me-2" />
                    Vendor Applications (A-2)
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="products">
                    <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                    Product Management (A-4)
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="orders">
                    <FontAwesomeIcon icon={faListCheck} className="me-2" />
                    All Orders (A-5)
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="categories">
                    <FontAwesomeIcon icon={faTasks} className="me-2" />
                    Categories (A-7)
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
    <Nav.Link eventKey="support">
        <FontAwesomeIcon icon={faTasks} className="me-2" />
        Support Messages 
    </Nav.Link>
</Nav.Item>

        </Nav>

    );

    // ✅ RENDER VIEWS
    const ViewDashboard = () => (
        <div>
            <h3>Admin Dashboard</h3>
            {!dashboard && <Alert>Loading...</Alert>}

            {dashboard && (
                <Row className="mt-3 g-4">
                    <Col md={6} lg={3}>
                        <Card className="p-3 bg-primary text-white shadow-sm">
                            <h6>Total Sales</h6>
                            <h3>₹{dashboard.total_sales?.toFixed(2) || '0.00'}</h3>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="p-3 bg-success text-white shadow-sm">
                            <h6>Total Commission</h6>
                            <h3>₹{dashboard.total_commission?.toFixed(2) || '0.00'}</h3>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="p-3 bg-info text-dark shadow-sm">
                            <h6>New Orders</h6>
                            <h3>{dashboard.new_orders}</h3>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="p-3 bg-warning text-dark shadow-sm">
                            <h6>Pending Vendors</h6>
                            <h3>{dashboard.pending_vendors}</h3>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* 💰 7. Render the new chart */}
            <Row className="mt-4">
                <Col>
                    <Card className="p-3 shadow-sm">
                        <SalesByCategoryChart chartData={chartData} />
                    </Card>
                </Col>
            </Row>

        </div>
    );

    const ViewVendors = () => (
        <div>
            <h3>Vendor Applications</h3>
            {vendors.length === 0 && (
                <Alert variant="success">No pending vendors.</Alert>
            )}
            <ListGroup className="mt-3">
                {vendors.map(v => (
                    <ListGroup.Item key={v.id} className="d-flex justify-content-between">
                        <div>
                            <strong>{v.store_name}</strong><br />
                            {v.email}
                        </div>
                        <div>
                            <Button
                                variant="success"
                                className="me-2"
                                onClick={() => approveVendor(v.id, "APPROVE")}
                            >
                                <FontAwesomeIcon icon={faCheck} /> Approve
                            </Button>
                            <Button
                                variant="danger"
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

    const ViewProducts = () => (
        <div>
            <h3>All Products</h3>
            <ListGroup className="mt-3">
                {products.length === 0 && <Alert>No products found.</Alert>}
                {products.map(p => (
                    <ListGroup.Item key={p.id} className="d-flex justify-content-between">
                        <div>
                            <strong>{p.name}</strong> — ₹{p.price}
                            <br />
                            <span className={`badge ${p.status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>{p.status}</span>
                            <small className="text-muted ms-2">| By: {p.vendor_name}</small>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeProduct(p.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} /> Remove
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );

    const ViewOrders = () => (
        <div>
            <h3>All Orders</h3>
            {orders.length === 0 && <Alert>No orders found.</Alert>}
            {orders.map(o => (
                <Card key={o.id} className="p-3 my-3 shadow-sm">
                    <h5>Order #{o.id}</h5>
                    <p><strong>Total:</strong> ₹{o.total_amount?.toFixed(2) || '0.00'}</p>
                    <p><strong>Status:</strong> {o.status}</p>
                    <p><strong>Customer:</strong> {o.user_email}</p>
                    <h6>Items:</h6>
                    <ul>
                        {o.items.map(i => (
                            <li key={i.id}>
                                {i.product_name} × {i.quantity}
                            </li>
                        ))}
                    </ul>
                </Card>
            ))}
        </div>
    );

    const ViewCategories = () => (
        <div>
            <h3>Manage Categories</h3>
            {/* 💰 Use onSubmit for the form */}
            <Form className="d-flex mt-3" onSubmit={createCategory}>
                <Form.Control
                    placeholder="New category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button className="ms-2" type="submit">
                    <FontAwesomeIcon icon={faPlus} /> Add
                </Button>
            </Form>
            <hr />
            <ListGroup className="mt-3">
                {categories.map(c => (
                    <ListGroup.Item key={c.id} className="d-flex justify-content-between">
                        {c.name}
                        <Button
                            variant="danger"
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
    const ViewSupportMessages = () => (
    <div>
        <h3>Support Messages</h3>
        {supportMessages.length === 0 && <Alert>No messages found.</Alert>}
        <ListGroup className="mt-3">
            {supportMessages.map(msg => (
                <ListGroup.Item key={msg.id} className="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>{msg.name}</strong> ({msg.email}) <br />
                        <small className="text-muted">{new Date(msg.created_at).toLocaleString()}</small>
                        <p className="mt-1">{msg.message}</p>
                        <span className={`badge ${msg.is_resolved ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {msg.is_resolved ? 'Resolved' : 'Pending'}
                        </span>
                    </div>
                    <div>
                        {!msg.is_resolved && (
                            <Button 
                                variant="success" 
                                size="sm" 
                                onClick={async () => {
                                    await authFetch(`${ADMIN_SUPPORT_MESSAGES_URL}${msg.id}/`, {
                                        method: 'PATCH',
                                        body: JSON.stringify({ is_resolved: true })
                                    });
                                    setSupportMessages(supportMessages.map(m => m.id === msg.id ? { ...m, is_resolved: true } : m));
                                }}
                            >
                                Mark Resolved
                            </Button>
                        )}
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    </div>
);


    return (
        <Container className="my-5">
            <Row>
                <Col md={4}>
                    <Sidebar />
                </Col>
                <Col md={8}>
                    <Card className="p-4 shadow-sm">
                        {activeView === "dashboard" && <ViewDashboard />}
                        {activeView === "vendors" && <ViewVendors />}
                        {activeView === "products" && <ViewProducts />}
                        {activeView === "orders" && <ViewOrders />}
                        {activeView === "categories" && <ViewCategories />}
                        {activeView === "support" && <ViewSupportMessages />}

                    </Card>
                </Col>
            </Row>
        </Container>
    );
}