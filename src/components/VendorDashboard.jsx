import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faClipboardList, faRupeeSign, faBoxOpen, faUsers, faPlus, faList } from '@fortawesome/free-solid-svg-icons';
import { getCachedUser, getAuthToken } from './auth';

const DASHBOARD_URL = 'http://127.0.0.1:8000/api/vendor/dashboard/';

function VendorDashboard() {
    const navigate = useNavigate();
    
    // ✅ ensure user object stays stable
    const user = useMemo(() => getCachedUser(), []);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // ✅ Security check (runs once)
        if (!user || user.role !== 'VENDOR') {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);

            try {
                const authToken = getAuthToken();

                const response = await fetch(DASHBOARD_URL, {
                    headers: {
                        'Authorization': `JWT ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    throw new Error("Access Denied. Please log in as a Vendor.");
                }
                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.status}`);
                }

                const result = await response.json();

                setData({
                    total_earnings: result.total_earnings || 0,
                    total_orders: result.total_orders || 0,
                    active_products: result.active_products || 0,
                    unique_customers: result.unique_customers || 0
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // ✅ runs once only

    const metrics = data || { total_earnings: 0, total_orders: 0, active_products: 0, unique_customers: 0 };

    if (loading) {
        return (
            <Container className="p-5 text-center">
                <Spinner animation="border" variant="success" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="p-5 text-center">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4">
                <FontAwesomeIcon icon={faChartBar} className="me-3 text-success" />
                {user.store_name || user.username} Dashboard
            </h1>

            <p className="text-muted">Overview of your business performance.</p>
            <hr className="mb-5" />

            <Row className="g-4">
                <Col md={3}>
                    <Card className="shadow-sm border-0 bg-success text-white">
                        <Card.Body>
                            <h6 className="card-subtitle mb-2">
                                <FontAwesomeIcon icon={faRupeeSign} /> Total Earnings
                            </h6>
                            <h2 className="display-4 fw-bold">₹{metrics.total_earnings.toFixed(2)}</h2>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="shadow-sm border-0 bg-primary text-white">
                        <Card.Body>
                            <h6 className="card-subtitle mb-2">
                                <FontAwesomeIcon icon={faClipboardList} /> Total Orders
                            </h6>
                            <h2 className="display-4 fw-bold">{metrics.total_orders}</h2>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="shadow-sm border-0 bg-info text-white">
                        <Card.Body>
                            <h6 className="card-subtitle mb-2">
                                <FontAwesomeIcon icon={faBoxOpen} /> Active Products
                            </h6>
                            <h2 className="display-4 fw-bold">{metrics.active_products}</h2>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h6 className="card-subtitle mb-2 text-secondary">
                                <FontAwesomeIcon icon={faUsers} /> Customers Served
                            </h6>
                            <h2 className="display-4 fw-bold text-dark">{metrics.unique_customers}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h4 className="mt-5 mb-3 fw-bold">Quick Actions</h4>

            <Alert variant="secondary" className="mt-4">
                <h5 className="fw-bold">Admin Approval Workflow</h5>
                <p className="mb-1">All new product listings automatically start in PENDING status.</p>
                <p className="mb-0">
                    You can edit or delete products while pending, but they won't appear on the site until approved.
                </p>
            </Alert>

            <div className="d-flex gap-3">
                <Button as={Link} to="/vendor/products/new" variant="success" className="fw-bold mt-3">
                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Add New Product
                </Button>

                <Button
                    onClick={() => navigate('/my-page?view=vendor-products')}
                    variant="outline-dark"
                    className="fw-bold mt-3"
                >
                    <FontAwesomeIcon icon={faList} className="me-2" /> View/Edit Inventory
                </Button>
            </div>
        </Container>
    );
}

export default VendorDashboard;
