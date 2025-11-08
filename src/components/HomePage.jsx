import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Sample categories
const categories = [
    { id: 1, name: 'Electronics', image: 'https://via.placeholder.com/150?text=Electronics' },
    { id: 2, name: 'Fashion', image: 'https://via.placeholder.com/150?text=Fashion' },
    { id: 3, name: 'Home & Kitchen', image: 'https://via.placeholder.com/150?text=Home+%26+Kitchen' },
    { id: 4, name: 'Sports', image: 'https://via.placeholder.com/150?text=Sports' },
];

// Sample discount banner
const discount = {
    title: "Mega Sale - Up to 50% OFF!",
    subtitle: "Grab your favorites at unbeatable prices.",
    image: "https://via.placeholder.com/1200x300?text=Discount+Banner",
};

function HomePage() {
    return (
        <div>
            {/* Banner */}
            <section className="mb-5">
                <img src={discount.image} alt="Discount Banner" className="img-fluid w-100" />
                <div className="text-center mt-3">
                    <h2>{discount.title}</h2>
                    <p>{discount.subtitle}</p>
                    <Button as={Link} to="/search" variant="success">Shop Now</Button>
                </div>
            </section>

            {/* Categories */}
            <Container className="mb-5">
                <h3 className="mb-4">Shop by Category</h3>
                <Row className="g-4">
                    {categories.map(cat => (
                        <Col key={cat.id} md={3}>
                            <Card className="shadow-sm text-center h-100">
                                <Card.Img variant="top" src={cat.image} style={{ height: '150px', objectFit: 'cover' }} />
                                <Card.Body>
                                    <Card.Title>{cat.name}</Card.Title>
                                    <Button as={Link} to={`/search?category=${cat.name}`} variant="primary">Shop {cat.name}</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Featured Products Section */}
            <Container className="mb-5">
                <h3 className="mb-4">Featured Products</h3>
                <Row className="g-4">
                    {[1,2,3,4].map(id => (
                        <Col key={id} md={3}>
                            <Card className="shadow-sm h-100">
                                <Card.Img variant="top" src={`https://via.placeholder.com/300?text=Product+${id}`} />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>Product {id}</Card.Title>
                                    <Card.Text>₹{(1000 + id*50).toFixed(2)}</Card.Text>
                                    <Button as={Link} to={`/product/${id}`} variant="success" className="mt-auto">View Details</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
}

export default HomePage;
