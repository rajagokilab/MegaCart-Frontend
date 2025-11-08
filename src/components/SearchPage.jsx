// src/components/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap'; // Added Button

const API = import.meta.env.VITE_API_URL;

// A simple card to display a product. 
const ProductCard = ({ product }) => (
    <Col md={4} lg={3} className="mb-4">
        <Card className="h-100 shadow-sm border-0">
            <Card.Img 
                variant="top" 
                src={product.image_url || 'https://via.placeholder.com/150'} 
                style={{ height: '200px', objectFit: 'cover' }}
            />
            <Card.Body className="d-flex flex-column">
                <Card.Title as="h6" className="flex-grow-1">{product.name}</Card.Title>
                <Card.Text className="h5 fw-bold text-dark">₹{product.price}</Card.Text>
                <Button as={Link} to={`/product/${product.id}`} variant="success" className="w-100">
                    View Details
                </Button>
            </Card.Body>
        </Card>
    </Col>
);

function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q'); 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                // This is your backend search endpoint
                const response = await fetch(`${API}/products/?search=${query}`);
                const data = await response.json();
                setProducts(data.results || data); 
            } catch (error) {
                console.error("Failed to fetch search results:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]); // Re-runs every time the query in the URL changes

    return (
        <Container className="my-5">
            <Row>
                <Col>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="success" />
                            <p className="mt-3">Loading results for "{query}"...</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="mb-4">Search Results for "<span className="text-success">{query}</span>"</h2>
                            {products.length === 0 ? (
                                <Alert variant="info">
                                    No products found matching your search.
                                </Alert>
                            ) : (
                                <Row>
                                    {products.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </Row>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default SearchPage;