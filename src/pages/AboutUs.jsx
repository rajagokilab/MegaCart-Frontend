import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import appLogo from '../assets/logo.jpg';

function AboutUs() {
    return (
        <Container className="py-5">
            {/* Hero */}
            <Row className="align-items-center mb-5">
                <Col md={3} className="text-center mb-3 mb-md-0">
                    <img src={appLogo} alt="MegaCart Logo" style={{ width: '100px', borderRadius: '5px' }} />
                </Col>
                <Col md={9}>
                    <h1>MegaCart Nordic</h1>
                    <p className="lead">
                        MegaCart is your trusted online marketplace, offering fast delivery, easy returns, and unbeatable prices.
                    </p>
                </Col>
            </Row>

            {/* History */}
            <Row className="mb-5">
                <Col>
                    <h2>Our History</h2>
                    <p>
                        2010: Founded in Stockholm.<br />
                        2015: Expanded to the Nordic region.<br />
                        2020: Online marketplace launched.<br />
                        2025: Serving 1 million+ customers.
                    </p>
                </Col>
            </Row>

            {/* Mission & Vision */}
            <Row className="mb-5">
                <Col md={6} className="mb-3 mb-md-0">
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <Card.Title>Our Mission</Card.Title>
                            <Card.Text>Exceptional shopping experience with speed, transparency, and customer-first service.</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <Card.Title>Our Vision</Card.Title>
                            <Card.Text>Leading e-commerce platform in the Nordic region, connecting people with products that enhance their lives.</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Values */}
            <Row className="mb-5">
                <Col>
                    <h2>Our Values</h2>
                    <ul>
                        <li>Customer-Centric</li>
                        <li>Integrity</li>
                        <li>Innovation</li>
                        <li>Sustainability</li>
                    </ul>
                </Col>
            </Row>

            {/* Foundation / CTA */}
            <Row>
                <Col>
                    <h2>Our Commitment</h2>
                    <p>Through the MegaCart Foundation, we support education and sustainability projects. <a href="/foundation" className="text-success">Learn more</a>.</p>
                </Col>
            </Row>
        </Container>
    );
}

export default AboutUs;
