import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const jobs = [
    { title: 'Frontend Developer', location: 'Stockholm, Sweden', description: 'React + Bootstrap, 2+ years experience' },
    { title: 'Customer Support Representative', location: 'Remote', description: 'Assist customers via chat and email.' },
    { title: 'Marketing Specialist', location: 'Stockholm', description: 'Digital campaigns and social media.' }
];

function WorkWithUs() {
    return (
        <Container className="py-5">
            <h1 className="mb-4">Join the MegaCart Team</h1>
            <p>We are always looking for talented individuals to join our team.</p>

            <Row>
                {jobs.map((job, idx) => (
                    <Col md={4} key={idx} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title>{job.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{job.location}</Card.Subtitle>
                                <Card.Text>{job.description}</Card.Text>
                                <Button variant="success">Apply Now</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default WorkWithUs;
