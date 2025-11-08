import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card, Button, ListGroup, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSignInAlt, faHistory, faClock, faCircleCheck, faTruckMoving, faBoxOpen, 
    faRupeeSign, faChevronDown, faChevronUp, faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { getAuthToken } from './auth';
import { useUser } from '../context/UserContext.jsx'; 

const API = import.meta.env.VITE_API_URL;
const MY_ORDERS_URL = `${API}/orders/my-orders/`;

// Helper function to map status to an icon and color
const getStatusData = (status) => {
    switch (status) {
        case 'Paid':
            return { icon: faCircleCheck, color: '#28a745', label: 'Processing' }; // Green
        case 'Shipped':
            return { icon: faTruckMoving, color: '#0055A0', label: 'Shipped' }; // Brand Blue
        case 'Delivered':
            return { icon: faBoxOpen, color: '#17a2b8', label: 'Delivered' }; // Info/Teal
        case 'Failed':
            return { icon: faSignInAlt, color: '#dc3545', label: 'Failed' }; // Red
        case 'Pending':
        default:
            return { icon: faClock, color: '#ffc107', label: 'Pending' }; // Warning/Yellow
    }
};

function MyOrdersPage({ onLoginClick }) { 
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    
    const { user } = useUser();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = getAuthToken(); 
                if (!token) {
                    throw new Error('Authentication token not found.');
                }

                const response = await fetch(MY_ORDERS_URL, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `JWT ${token}`
                    }
                });

                if (response.status === 401) {
                    throw new Error('Your session expired. Please log in to view your orders.');
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch orders.');
                }

                const data = await response.json();
                // Ensure data is sorted newest first
                setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);
    
    const toggleHistory = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) return <Container className="p-5 text-center"><Spinner animation="border" /></Container>;
    
    if (!user) {
        return (
            <Container className="my-5 p-5 text-center">
                <Alert variant="warning" className="shadow-sm">
                    <Alert.Heading>Please Log In</Alert.Heading>
                    <p>You must be logged in to view your order history.</p>
                    <hr />
                    <Button variant="success" onClick={onLoginClick}>
                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                        Log In / Register
                    </Button>
                </Alert>
            </Container>
        );
    }
    
    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold" style={{ color: '#0055A0' }}>My Orders</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {!error && orders.length === 0 ? (
                <Alert variant="info">You have not placed any orders yet.</Alert>
            ) : (
                orders.map(order => {
                    const statusData = getStatusData(order.status);
                    const isExpanded = expandedOrder === order.id;

                    return (
                        <Card key={order.id} className="mb-4 shadow-lg border-0">
                            <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#cce5ff', borderBottom: `3px solid ${statusData.color}` }}>
                                <div>
                                    <h5 className="mb-0 fw-bold" style={{ color: '#0055A0' }}>
                                        Order # {order.razorpay_order_id || order.id}
                                    </h5>
                                </div>
                                <div className="text-end">
                                    <span className={`fw-bold me-2`} style={{ color: statusData.color }}>
                                        <FontAwesomeIcon icon={statusData.icon} className="me-2" />
                                        {statusData.label}
                                    </span>
                                    <small className="text-muted d-block">Placed: {new Date(order.created_at).toLocaleDateString()}</small>
                                </div>
                            </Card.Header>
                            
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                    <h4 className="mb-0" style={{ color: '#28a745' }}>
                                        <FontAwesomeIcon icon={faRupeeSign} className="me-1 small" />
                                        {parseFloat(order.total_amount).toFixed(2)}
                                    </h4>
                                    <Button 
                                        variant="link" 
                                        onClick={() => toggleHistory(order.id)}
                                        className="p-0 text-decoration-none fw-bold"
                                        style={{ color: '#0055A0' }}
                                    >
                                        <FontAwesomeIcon icon={faHistory} className="me-2" />
                                        {isExpanded ? 'Hide Tracking' : 'View Tracking'}
                                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="ms-2 small" />
                                    </Button>
                                </div>

                                {/* --- ITEM LIST --- */}
                                <h6 className="fw-bold mb-2">Items Purchased:</h6>
                                <ListGroup variant="flush">
                                    {order.items.map(item => (
                                        <ListGroup.Item key={item.id} className="d-flex align-items-center py-2" style={{ backgroundColor: 'transparent' }}>
                                            <Image 
                                                src={item.product?.image_url || 'https://placehold.co/60x60?text=Item'} 
                                                rounded 
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                                className="me-3 border"
                                            />
                                            <div className="flex-grow-1">
                                                <strong style={{ color: '#0055A0' }}>{item.product?.name || 'Deleted Product'}</strong>
                                                <small className="text-muted d-block">Qty: {item.quantity}</small>
                                            </div>
                                            <div className="fw-bold text-end" style={{ color: '#28a745' }}>
                                                ₹{parseFloat(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                            
                            {/* --- TRACKING HISTORY (EXPANDABLE) --- */}
                            {isExpanded && (
                                <Card.Footer className="bg-light pt-3">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> Delivery Status Timeline
                                    </h6>
                                    <ListGroup variant="flush" className="border rounded">
                                        {order.history && order.history.length > 0 ? (
                                            order.history.map(record => {
                                                const recordStatus = getStatusData(record.status);
                                                return (
                                                    <ListGroup.Item key={record.timestamp} className="d-flex justify-content-between align-items-center">
                                                        <div className="small" style={{ color: recordStatus.color }}>
                                                            <FontAwesomeIcon icon={recordStatus.icon} className="me-3" />
                                                            <strong>{recordStatus.label}</strong>
                                                        </div>
                                                        <div className="text-end small text-muted">
                                                            {new Date(record.timestamp).toLocaleString()}
                                                        </div>
                                                    </ListGroup.Item>
                                                );
                                            })
                                        ) : (
                                            <ListGroup.Item className="text-center text-muted">
                                                No detailed tracking history available.
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </Card.Footer>
                            )}
                        </Card>
                    );
                })
            )}
        </Container>
    );
}

export default MyOrdersPage;