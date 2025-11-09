import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { getAuthToken } from './auth';


const API = import.meta.env.VITE_API_URL;

const PRODUCTS_URL = `${API}/products/`;
const CATEGORIES_URL = `${API}/categories/`; // Assuming this endpoint exists

function ProductCreateForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', price: '', stock: '', image_url: '', category: '', // Category starts empty
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    // New state for categories data
    const [categories, setCategories] = useState([]); 
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // --- Data Fetching: Categories ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(CATEGORIES_URL);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                    // Set default category ID if list is not empty
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, category: data[0].id })); 
                    }
                } else {
                    throw new Error("Failed to load categories.");
                }
            } catch (err) {
                setMessage({ type: 'danger', text: `Category fetch failed: ${err.message}` });
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // --- Helper Function to Get Headers ---
    const getAuthHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        const token = getAuthToken();
        const csrfToken = getCsrfToken(); // Assuming getCsrfToken is globally accessible or imported

        if (token) headers['Authorization'] = `JWT ${token}`;
        if (csrfToken) headers['X-CSRFToken'] = csrfToken;
        return headers;
    };
    
    // (Assuming getCsrfToken() is defined in a global utility file or in your auth.js)
    const getCsrfToken = () => {
        const cookieValue = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        return cookieValue ? cookieValue.split('=')[1] : null;
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        if (!formData.name || !formData.price || !formData.stock || !formData.category) {
            throw new Error("Please fill all required fields.");
        }

        // ✅ Build payload exactly how Django expects it
        const payload = {
            name: formData.name.trim(),
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
            category: parseInt(formData.category, 10),
        };

        const response = await fetch(PRODUCTS_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.log("Backend error:", data);
            throw new Error(
                data.name?.[0] ||
                data.price?.[0] ||
                data.stock?.[0] ||
                data.image?.[0] ||
                data.category?.[0] ||
                data.detail ||
                "Failed to create product."
            );
        }

        setMessage({
            type: 'success',
            text: 'Product submitted successfully! Pending admin approval.',
        });

        setTimeout(() => navigate('/vendor/dashboard'), 1500);

    } catch (err) {
        setMessage({ type: 'danger', text: err.message });
    } finally {
        setLoading(false);
    }
};

    
    // Show spinner if categories are still loading
    if (categoriesLoading) {
        return <Container className="py-5 text-center"><Spinner animation="border" /> Loading Categories...</Container>;
    }


    return (
        <Container className="py-5">
            <h2 className="mb-4">Create New Product Listing</h2>
            <Card className="p-4 shadow-sm">
                {message && <Alert variant={message.type}>{message.text}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </Form.Group>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formPrice">
                                <Form.Label>Price (₹)</Form.Label>
                                <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formStock">
                                <Form.Label>Stock Quantity</Form.Label>
                                <Form.Control type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="formImage">
                        <Form.Label>Image URL (Optional)</Form.Label>
                        <Form.Control type="url" name="image_url" value={formData.image_url} onChange={handleChange} />
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="formCategory">
                        <Form.Label>Category</Form.Label>
                        <Form.Select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Button variant="success" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" size="sm" animation="border" className="me-2" /> : 'Submit for Approval'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default ProductCreateForm;