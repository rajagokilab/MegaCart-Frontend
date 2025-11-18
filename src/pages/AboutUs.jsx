import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faHandshake, faLightbulb, faGlobe, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import appLogo from '../assets/logo.jpg';

// --- STYLING & THEME ---
const OLIVE_THEME = {
    main: '#7A8450',
    dark: '#5F673C',
    light: '#F0F2E9',
    text: '#333333',
    white: '#ffffff'
};

function AboutUs() {
    return (
        <div style={{ color: OLIVE_THEME.text, backgroundColor: '#f9f9f9' }}>
            
            {/* --- HERO SECTION --- */}
            <div style={{ backgroundColor: OLIVE_THEME.light }} className="py-5 mb-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <div className="d-flex align-items-center mb-3">
                                <img 
                                    src={appLogo} 
                                    alt="VetriCart Logo" 
                                    className="shadow-sm me-3" 
                                    style={{ width: '80px', borderRadius: '12px' }} 
                                />
                                <span className="text-uppercase ls-2" style={{ color: OLIVE_THEME.dark, letterSpacing: '2px', fontWeight: 'bold' }}>
                                    Since 2010
                                </span>
                            </div>
                            <h1 className="display-4 fw-bold mb-3" style={{ color: OLIVE_THEME.main }}>
                                VetriCart Nordic
                            </h1>
                            <p className="lead text-muted mb-4">
                                Your trusted online marketplace connecting the Nordic region with quality products. 
                                We combine fast delivery, easy returns, and sustainability into one seamless shopping experience.
                            </p>
                        </Col>
                        <Col lg={6}>
                            {/* Placeholder for a Hero Image (e.g., Nordic Landscape or Happy Shopper) */}
                            <img 
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                alt="Nordic Lifestyle" 
                                className="img-fluid rounded-3 shadow-lg"
                                style={{ border: `4px solid ${OLIVE_THEME.white}` }}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="mb-5">
                {/* --- HISTORY SECTION --- */}
                <Row className="align-items-center mb-5 g-5">
                    <Col md={6} className="order-md-2">
                         <img 
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                            alt="Our Office" 
                            className="img-fluid rounded-3 shadow-md"
                        />
                    </Col>
                    <Col md={6} className="order-md-1">
                        <h2 className="fw-bold mb-4" style={{ color: OLIVE_THEME.dark }}>Our History</h2>
                        <div className="border-start ps-4" style={{ borderColor: OLIVE_THEME.main }}>
                            <div className="mb-4">
                                <h5 className="fw-bold" style={{ color: OLIVE_THEME.main }}>2010 — Founded in Stockholm</h5>
                                <p className="text-muted">Started as a small family business passionate about local goods.</p>
                            </div>
                            <div className="mb-4">
                                <h5 className="fw-bold" style={{ color: OLIVE_THEME.main }}>2015 — Nordic Expansion</h5>
                                <p className="text-muted">Expanded logistics to cover Norway, Finland, and Denmark.</p>
                            </div>
                            <div className="mb-4">
                                <h5 className="fw-bold" style={{ color: OLIVE_THEME.main }}>2020 — Digital Marketplace</h5>
                                <p className="text-muted">Launched our full-scale multi-vendor platform.</p>
                            </div>
                            <div>
                                <h5 className="fw-bold" style={{ color: OLIVE_THEME.main }}>2025 — 1 Million+ Customers</h5>
                                <p className="text-muted">Celebrating a community of trust and quality.</p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* --- MISSION & VISION --- */}
                <Row className="mb-5 g-4">
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm hover-shadow" style={{ overflow: 'hidden' }}>
                            {/* <div style={{ height: '200px', overflow: 'hidden' }}>
                                <Card.Img 
                                    variant="top" 
                                    // src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                    style={{ objectFit: 'cover', height: '100%' }}
                                />
                            </div> */}
                            <Card.Body className="p-4">
                                <Card.Title className="fw-bold h3 mb-3" style={{ color: OLIVE_THEME.dark }}>Our Mission</Card.Title>
                                <Card.Text className="text-muted">
                                    To provide an exceptional shopping experience defined by speed, transparency, and customer-first service. 
                                    We aim to make quality products accessible to everyone in the region without the hassle.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm hover-shadow" style={{ overflow: 'hidden' }}>
                            <div style={{ height: '200px', overflow: 'hidden' }}>
                                <Card.Img 
                                    variant="top" 
                                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                    style={{ objectFit: 'cover', height: '100%' }}
                                />
                            </div>
                            <Card.Body className="p-4">
                                <Card.Title className="fw-bold h3 mb-3" style={{ color: OLIVE_THEME.dark }}>Our Vision</Card.Title>
                                <Card.Text className="text-muted">
                                    To be the leading e-commerce platform in the Nordic region, connecting people with products that enhance their lives, 
                                    while setting the standard for sustainable logistics.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* --- VALUES SECTION --- */}
                <div className="mb-5 py-5 rounded-3" style={{ backgroundColor: '#fff' }}>
                    <Row className="text-center mb-4">
                        <Col>
                            <h2 className="fw-bold" style={{ color: OLIVE_THEME.dark }}>Our Core Values</h2>
                            <div className="mx-auto mt-2" style={{ width: '60px', height: '3px', backgroundColor: OLIVE_THEME.main }}></div>
                        </Col>
                    </Row>
                    <Row className="g-4 text-center">
                        <Col md={3} sm={6}>
                            <div className="p-3">
                                <FontAwesomeIcon icon={faHandshake} size="3x" className="mb-3" style={{ color: OLIVE_THEME.main }} />
                                <h5 className="fw-bold">Customer-Centric</h5>
                                <p className="small text-muted">You come first in every decision we make.</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="p-3">
                                <FontAwesomeIcon icon={faLeaf} size="3x" className="mb-3" style={{ color: OLIVE_THEME.main }} />
                                <h5 className="fw-bold">Sustainability</h5>
                                <p className="small text-muted">Commited to eco-friendly packaging and shipping.</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="p-3">
                                <FontAwesomeIcon icon={faLightbulb} size="3x" className="mb-3" style={{ color: OLIVE_THEME.main }} />
                                <h5 className="fw-bold">Innovation</h5>
                                <p className="small text-muted">Always improving our tech for a better experience.</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="p-3">
                                <FontAwesomeIcon icon={faGlobe} size="3x" className="mb-3" style={{ color: OLIVE_THEME.main }} />
                                <h5 className="fw-bold">Integrity</h5>
                                <p className="small text-muted">Honest pricing and transparent policies.</p>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* --- COMMITMENT CTA --- */}
                <Row className="justify-content-center">
                    <Col md={10}>
                        <Card className="text-center border-0 shadow text-white" style={{ backgroundColor: OLIVE_THEME.main }}>
                            <Card.Body className="py-5 px-4">
                                <h2 className="fw-bold mb-3">Our Commitment to the Future</h2>
                                <p className="lead mb-4" style={{ opacity: 0.9 }}>
                                    Through the VetriCart Foundation, we support education and sustainability projects across the region.
                                    We believe in giving back to the communities that support us.
                                </p>
                                <Button 
                                    variant="light" 
                                    size="lg" 
                                    className="fw-bold"
                                    style={{ color: OLIVE_THEME.dark }}
                                >
                                    Learn More <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>
        </div>
    );
}

export default AboutUs;