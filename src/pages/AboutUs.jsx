import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faHandshake, faLightbulb, faGlobe, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import appLogo from '../assets/logo.jpg';

// --- STYLING & THEME ---
const OLIVE_THEME = {
    main: '#7A8450',
    dark: '#5F673C',
    light: '#F0F2E9', // Soft olive white
    text: '#2C3E50',  // Darker, cleaner text
    white: '#ffffff',
    gradient: 'linear-gradient(135deg, #F0F2E9 0%, #FFFFFF 100%)' // Modern gradient
};

const styles = {
    heroSection: {
        background: OLIVE_THEME.gradient,
        padding: '80px 0',
        borderBottomRightRadius: '50px',
        borderBottomLeftRadius: '50px',
    },
    heroImg: {
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        transform: 'rotate(-2deg)', // Modern tilt effect
        transition: 'transform 0.3s ease'
    },
    logo: {
        width: '60px',
        height: '60px',
        borderRadius: '15px',
        objectFit: 'cover'
    },
    card: {
        border: 'none',
        borderRadius: '20px',
        background: '#fff',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        height: '100%',
        overflow: 'hidden'
    },
    iconBox: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `${OLIVE_THEME.light}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px auto',
        color: OLIVE_THEME.main
    },
    timelineItem: {
        position: 'relative',
        paddingLeft: '30px',
        marginBottom: '40px'
    },
    timelineDot: {
        position: 'absolute',
        left: '-9px',
        top: '5px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: OLIVE_THEME.main,
        border: `4px solid #fff`,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
    }
};

function AboutUs() {
    return (
        <div style={{ color: OLIVE_THEME.text, backgroundColor: '#FCFCFC', minHeight: '100vh', overflowX: 'hidden' }}>
            
            {/* --- HERO SECTION --- */}
            <div style={styles.heroSection} className="mb-5 shadow-sm">
                <Container>
                    <Row className="align-items-center gy-5">
                        <Col lg={6}>
                            <div className="d-flex align-items-center mb-4 p-3 bg-white d-inline-flex rounded-pill shadow-sm">
                                <img 
                                    src={appLogo} 
                                    alt="VetriCart Logo" 
                                    style={styles.logo}
                                    className="me-3" 
                                />
                                <span style={{ color: OLIVE_THEME.dark, letterSpacing: '1.5px', fontWeight: '700', fontSize: '0.9rem' }}>
                                    EST. 2010
                                </span>
                            </div>
                            <h1 className="display-3 fw-bold mb-4" style={{ color: OLIVE_THEME.dark, lineHeight: '1.2' }}>
                                Redefining Nordic <br/>
                                <span style={{ color: OLIVE_THEME.main }}>E-Commerce.</span>
                            </h1>
                            <p className="lead text-muted mb-5" style={{ lineHeight: '1.8' }}>
                                Your trusted online marketplace connecting the Nordic region with quality products. 
                                We combine fast delivery, easy returns, and sustainability into one seamless experience.
                            </p>
                            {/* Optional: Add minimal stats here if desired */}
                        </Col>
                        <Col lg={6} className="text-center">
                            <img 
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                alt="Nordic Lifestyle" 
                                className="img-fluid"
                                style={styles.heroImg}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="mb-5">
                {/* --- HISTORY SECTION --- */}
                <Row className="align-items-center mb-5 py-5 g-5">
                    <Col md={6} className="order-md-2">
                         <div style={{ position: 'relative' }}>
                            <div style={{ 
                                position: 'absolute', 
                                top: '-20px', 
                                right: '-20px', 
                                width: '100%', 
                                height: '100%', 
                                border: `2px solid ${OLIVE_THEME.main}`, 
                                borderRadius: '20px', 
                                zIndex: 0 
                            }}></div>
                            <img 
                                src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                alt="Our Office" 
                                className="img-fluid position-relative shadow-lg"
                                style={{ borderRadius: '20px', zIndex: 1 }}
                            />
                        </div>
                    </Col>
                    <Col md={6} className="order-md-1">
                        <h6 className="text-uppercase fw-bold mb-3" style={{ color: OLIVE_THEME.main, letterSpacing: '2px' }}>Our Journey</h6>
                        <h2 className="fw-bold mb-5 display-6" style={{ color: OLIVE_THEME.dark }}>From Local Roots to <br/>Global Reach</h2>
                        
                        <div className="border-start ps-0" style={{ borderColor: '#e9ecef' }}>
                            {[
                                { year: '2010', title: 'Founded in Stockholm', desc: 'Started as a small family business passionate about local goods.' },
                                { year: '2015', title: 'Nordic Expansion', desc: 'Expanded logistics to cover Norway, Finland, and Denmark.' },
                                { year: '2020', title: 'Digital Marketplace', desc: 'Launched our full-scale multi-vendor platform.' },
                                { year: '2025', title: '1 Million+ Customers', desc: 'Celebrating a community of trust and quality.' }
                            ].map((item, index) => (
                                <div key={index} style={styles.timelineItem}>
                                    <div style={styles.timelineDot}></div>
                                    <span className="badge bg-light text-dark mb-2" style={{ fontSize: '0.8rem', fontWeight: '700' }}>{item.year}</span>
                                    <h5 className="fw-bold mb-1" style={{ color: OLIVE_THEME.dark }}>{item.title}</h5>
                                    <p className="text-muted small mb-0">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>

                {/* --- MISSION & VISION --- */}
                <Row className="mb-5 g-4 py-5">
                    <Col md={6}>
                        <Card style={styles.card} className="hover-lift">
                            <Card.Body className="p-5 d-flex flex-column justify-content-center">
                                <div className="mb-4 text-start">
                                    <FontAwesomeIcon icon={faGlobe} size="2x" style={{ color: OLIVE_THEME.main }} />
                                </div>
                                <Card.Title className="fw-bold h2 mb-3" style={{ color: OLIVE_THEME.dark }}>Our Mission</Card.Title>
                                <Card.Text className="text-muted lead fs-6">
                                    To provide an exceptional shopping experience defined by speed, transparency, and customer-first service. 
                                    We aim to make quality products accessible to everyone in the region without the hassle.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card style={{...styles.card, backgroundColor: OLIVE_THEME.dark, color: 'white'}} className="hover-lift">
                            <Card.Body className="p-5 d-flex flex-column justify-content-center">
                                <div className="mb-4 text-start">
                                    <FontAwesomeIcon icon={faLightbulb} size="2x" style={{ color: '#fff', opacity: 0.8 }} />
                                </div>
                                <Card.Title className="fw-bold h2 mb-3 text-white">Our Vision</Card.Title>
                                <Card.Text className="lead fs-6" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                    To be the leading e-commerce platform in the Nordic region, connecting people with products that enhance their lives, 
                                    while setting the standard for sustainable logistics.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* --- VALUES SECTION --- */}
                <div className="mb-5 py-5">
                    <Row className="text-center mb-5">
                        <Col lg={8} className="mx-auto">
                            <h6 className="text-uppercase fw-bold mb-2" style={{ color: OLIVE_THEME.main, letterSpacing: '2px' }}>Why Choose Us</h6>
                            <h2 className="fw-bold display-6" style={{ color: OLIVE_THEME.dark }}>Driven by Core Values</h2>
                        </Col>
                    </Row>
                    <Row className="g-4">
                        {[
                            { icon: faHandshake, title: 'Customer-Centric', desc: 'You come first in every decision we make.' },
                            { icon: faLeaf, title: 'Sustainability', desc: 'Committed to eco-friendly packaging and shipping.' },
                            { icon: faLightbulb, title: 'Innovation', desc: 'Always improving our tech for a better experience.' },
                            { icon: faGlobe, title: 'Integrity', desc: 'Honest pricing and transparent policies.' }
                        ].map((val, idx) => (
                            <Col md={3} sm={6} key={idx}>
                                <Card className="text-center h-100 py-4" style={{...styles.card, boxShadow: 'none', background: 'transparent'}}>
                                    <Card.Body>
                                        <div style={styles.iconBox}>
                                            <FontAwesomeIcon icon={val.icon} size="lg" />
                                        </div>
                                        <h5 className="fw-bold mb-3">{val.title}</h5>
                                        <p className="text-muted small">{val.desc}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* --- COMMITMENT CTA --- */}
                <Row className="justify-content-center pb-5">
                    <Col md={12}>
                        <div style={{ 
                            borderRadius: '30px', 
                            background: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80') center/cover no-repeat`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(31, 41, 55, 0.8)' }}></div>
                            <div className="position-relative p-5 text-center text-white">
                                <Container>
                                    <Row className="justify-content-center">
                                        <Col lg={8}>
                                            <h2 className="fw-bold mb-4 display-5">Our Commitment to the Future</h2>
                                            <p className="lead mb-5" style={{ opacity: 0.9, fontWeight: '300' }}>
                                                Through the VetriCart Foundation, we support education and sustainability projects across the region.
                                                We believe in giving back to the communities that support us.
                                            </p>
                                            <Button 
                                                size="lg" 
                                                className="fw-bold px-5 py-3 rounded-pill border-0"
                                                style={{ backgroundColor: OLIVE_THEME.main, color: '#fff', boxShadow: '0 10px 20px rgba(122, 132, 80, 0.3)' }}
                                            >
                                                Learn More <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                                            </Button>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </div>
                    </Col>
                </Row>

            </Container>

            <style>
                {`
                    .hover-lift:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                    }
                `}
            </style>
        </div>
    );
}

export default AboutUs;