import React, { useState } from 'react';
import { Container, Row, Col, Accordion, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const faqs = [
    {
        category: 'Orders',
        items: [
            { question: 'How do I track my order?', answer: 'Use the Track Order page to see your delivery status.' },
            { question: 'Can I cancel my order?', answer: 'Orders can be cancelled within 24 hours of purchase.' }
        ]
    },
    {
        category: 'Returns & Refunds',
        items: [
            { question: 'How do I return a product?', answer: 'Return products within 30 days using our Return portal.' },
            { question: 'When will I get my refund?', answer: 'Refunds are processed within 5-7 business days after receiving the return.' }
        ]
    },
    {
        category: 'Payments',
        items: [
            { question: 'What payment methods are accepted?', answer: 'We accept cards, PayPal, and Klarna.' },
            { question: 'Is my payment information secure?', answer: 'Yes, we use SSL encryption to protect your data.' }
        ]
    }
];

function Help() {
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/support/create/', formData);
            setSuccess(true);
            setError('');
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setSuccess(false);
        }
    };

    const filteredFaqs = faqs
        .map(category => ({
            ...category,
            items: category.items.filter(item =>
                item.question.toLowerCase().includes(search.toLowerCase()) ||
                item.answer.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(category => category.items.length > 0);

    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col>
                    <h1>Help & Support</h1>
                    <p className="lead">Find answers to common questions or contact our support team directly.</p>
                </Col>
            </Row>

            <Row className="mb-5">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Search for a question..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
            </Row>

            {filteredFaqs.map((category, idx) => (
                <Row key={idx} className="mb-4">
                    <Col>
                        <h3>{category.category}</h3>
                        <Accordion>
                            {category.items.map((item, itemIdx) => (
                                <Accordion.Item eventKey={itemIdx.toString()} key={itemIdx}>
                                    <Accordion.Header>{item.question}</Accordion.Header>
                                    <Accordion.Body>{item.answer}</Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </Col>
                </Row>
            ))}

            <Row className="mt-5">
                <Col md={6}>
                    <h3>Contact Support</h3>
                    {success && <Alert variant="success">Message sent successfully!</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control as="textarea" rows={4} name="message" value={formData.message} onChange={handleChange} required />
                        </Form.Group>

                        <Button variant="success" type="submit">Send Message</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Help;
