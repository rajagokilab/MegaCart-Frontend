import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faTree, faUsers, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import appLogo from '../assets/logo.jpg';

// --- IMPORT LOCAL ASSETS ---
import educationImage from '../assets/education.jpg';
import sustainImage from '../assets/sustain.jpg';

// --- STYLING & THEME ---
const OLIVE_THEME = {
    main: '#7A8450',
    dark: '#5F673C',
    light: '#F0F2E9',
    text: '#333333',
    white: '#ffffff'
};

function Foundation() {
    const initiatives = [
        {
            title: 'Education for All',
            description: 'Supporting underprivileged children with school supplies and scholarships.',
            icon: faGraduationCap,
            // --- USING LOCAL IMAGE ---
            image: educationImage
        },
        {
            title: 'Sustainability',
            description: 'Promoting eco-friendly practices and planting 10,000+ trees in Nordic regions.',
            icon: faTree,
            // --- USING LOCAL IMAGE ---
            image: sustainImage
        },
        {
            title: 'Community Support',
            description: 'Helping local communities through donations and volunteer programs.',
            icon: faUsers,
            // Keeping the placeholder for the third image
            image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80'
        },
    ];

    const stats = [
        { label: 'Children Supported', value: '5,000+' },
        { label: 'Trees Planted', value: '10,500+' },
        { label: 'Volunteer Hours', value: '12,000+' },
    ];

    return (
        <div style={{ backgroundColor: OLIVE_THEME.light }}>
            <Container className="py-5">
                
                {/* HERO / INTRO */}
                <Row className="align-items-center mb-5">
                    <Col md={3} className="text-center mb-3 mb-md-0">
                        <img 
                            src={appLogo} 
                            alt="VetriCart Logo" 
                            className="shadow-sm"
                            style={{ width: '100px', borderRadius: '5px', border: `3px solid ${OLIVE_THEME.main}` }} 
                        />
                    </Col>
                    <Col md={9}>
                        <h1 className="display-4 fw-bold mb-3" style={{ color: OLIVE_THEME.main }}>
                            VetriCart Foundation
                        </h1>
                        <p className="lead" style={{ color: OLIVE_THEME.dark }}>
                            Our mission is to make a positive impact on society and the environment.
                            We focus on education, sustainability, and community support across the Nordic region.
                        </p>
                    </Col>
                </Row>

                {/* --- IMPACT STATS --- */}
                <div style={{ backgroundColor: OLIVE_THEME.main, color: OLIVE_THEME.white }} className="py-5 mb-5 rounded-3 shadow-lg">
                    <Row className="text-center">
                        {stats.map((stat, idx) => (
                            <Col md={4} key={idx} className="border-end border-opacity-25" style={{ borderColor: OLIVE_THEME.light }}>
                                <h2 className="display-4 fw-bold mb-0" style={{ color: OLIVE_THEME.light }}>{stat.value}</h2>
                                <p className="lead" style={{ opacity: 0.8 }}>{stat.label}</p>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* --- INITIATIVES / PROJECTS --- */}
                <Row className="mb-5">
                    <Col xs={12} className="mb-4">
                         <h2 className="fw-bold mb-4 text-center" style={{ color: OLIVE_THEME.dark }}>Our Core Initiatives</h2>
                    </Col>
                    {initiatives.map((item, idx) => (
                        <Col md={4} key={idx} className="mb-4">
                            <Card className="h-100 border-0 shadow-md hover-shadow" style={{ transition: 'all 0.3s' }}>
                                <Card.Img 
                                    variant="top" 
                                    src={item.image}
                                    alt={item.title}
                                    style={{ height: '200px', objectFit: 'cover' }} 
                                />
                                <Card.Body className="p-4">
                                    <div className="mb-3">
                                        <FontAwesomeIcon icon={item.icon} size="2x" style={{ color: OLIVE_THEME.main }} />
                                    </div>
                                    <Card.Title className="fw-bold" style={{ color: OLIVE_THEME.dark }}>{item.title}</Card.Title>
                                    <Card.Text className="text-muted small">{item.description}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* --- CTA --- */}
                <Row className="text-center justify-content-center">
                    <Col md={8}>
                        <div className="p-5 rounded-3 shadow-sm" style={{ border: `1px dashed ${OLIVE_THEME.main}`, backgroundColor: OLIVE_THEME.white }}>
                            <p className="lead mb-4" style={{ color: OLIVE_THEME.dark }}>
                                Want to be part of our mission? Join us in making a difference!
                            </p>
                            <Button 
                                style={{ backgroundColor: OLIVE_THEME.main, borderColor: OLIVE_THEME.dark }} 
                                className="px-5 py-2 fw-bold text-white hover-shadow"
                                href="/contact"
                            >
                                Get Involved <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                            </Button>
                        </div>
                    </Col>
                </Row>
                
            </Container>
        </div>
    );
}

export default Foundation;