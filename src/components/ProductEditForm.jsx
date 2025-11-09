import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { getAuthToken } from './auth';

const API = import.meta.env.VITE_API_URL;
const PRODUCTS_URL = `${API}/products/`;
const CATEGORIES_URL = `${API}/categories/`;

function ProductEditForm() {
    const { id } = useParams(); // Get product ID from URL
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '', price: '', stock: '', image_url: '', category: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [productLoading, setProductLoading] = useState(true);

    // --- Fetch categories ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(CATEGORIES_URL);
                if (!response.ok) throw new Error('Failed to load categories.');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setMessage({ type: 'danger', text: err.message });
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // --- Fetch existing product ---
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${PRODUCTS_URL}${id}/`);
                if (!response.ok) throw new Error('Failed to load product.');
                const data = await response.json();
                setFormData({
                    name: data.name || '',
                    price: data.price || '',
                    stock: data.stock || '',
                    image_url: data.image_url || '',
                    category: data.category || ''
                });
            } catch (err) {
                setMessage({ type: 'danger', text: err.message });
            } finally {
                setProductLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const getAuthHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        const token = getAuthToken();
        const csrfToken = getCsrfToken();
        if (token) headers['Authorization'] = `JWT ${token}`;
        if (csrfToken) headers['X-CSRFToken'] = csrfToken;
        return headers;
    };

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

            const payload = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                category: parseInt(formData.category, 10),
            };

            const response = await fetch(`${PRODUCTS_URL}${id}/`, {
                method: 'PATCH', // PATCH for edit
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.name?.[0] ||
                    data.price?.[0] ||
                    data.stock?.[0] ||
                    data.image?.[0] ||
                    data.category?.[0] ||
                    data.detail ||
                    "Failed to update product."
                );
            }

            setMessage({ type: 'success', text: 'Product updated successfully!' });
            setTimeout(() => navigate('/vendor/dashboard'), 1500);

        } catch (err) {
            setMessage({ type: 'danger', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (categoriesLoading || productLoading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" /> Loading...
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">Edit Product</h2>
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
                        <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="" disabled>Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" size="sm" animation="border" className="me-2" /> : 'Update Product'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default ProductEditForm;
