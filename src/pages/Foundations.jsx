import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import appLogo from '../assets/logo.jpg';

function Foundation() {
    const initiatives = [
        {
            title: 'Education for All',
            description: 'Supporting underprivileged children with school supplies and scholarships.',
        },
        {
            title: 'Sustainability',
            description: 'Promoting eco-friendly practices and planting 10,000+ trees in Nordic regions.',
        },
        {
            title: 'Community Support',
            description: 'Helping local communities through donations and volunteer programs.',
        },
    ];

    const stats = [
        { label: 'Children Supported', value: '5,000+' },
        { label: 'Trees Planted', value: '10,500+' },
        { label: 'Volunteer Hours', value: '12,000+' },
    ];

    return (
        <Container className="py-5">
            {/* HERO / INTRO */}
            <Row className="align-items-center mb-5">
                <Col md={3} className="text-center mb-3 mb-md-0">
                    <img src={appLogo} alt="MegaCart Logo" style={{ width: '100px', borderRadius: '5px' }} />
                </Col>
                <Col md={9}>
                    <h1>MegaCart Foundation</h1>
                    <p className="lead">
                        Our mission is to make a positive impact on society and the environment.
                        We focus on education, sustainability, and community support across the Nordic region.
                    </p>
                </Col>
            </Row>

            {/* INITIATIVES / PROJECTS */}
            <Row className="mb-5">
                {initiatives.map((item, idx) => (
                    <Col md={4} key={idx} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>{item.description}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* IMPACT STATS */}
            <Row className="text-center mb-5">
                {stats.map((stat, idx) => (
                    <Col md={4} key={idx}>
                        <h2 className="text-success">{stat.value}</h2>
                        <p className="text-white-50">{stat.label}</p>
                    </Col>
                ))}
            </Row>

            {/* CTA */}
            <Row className="text-center">
                <Col>
                    <p className="lead mb-3">
                        Want to be part of our mission? Join us in making a difference!
                    </p>
                    <Button variant="success" href="/contact">
                        Get Involved
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default Foundation;
