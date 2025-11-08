import React from 'react';
import { Container, Card } from 'react-bootstrap';

function CustomerSupport() {
    return (
        <Container className="py-5">
            <h1 className="mb-4">Customer Support</h1>
            <p>We are here to assist you with any questions or issues you may have.</p>

            <Card className="p-4 shadow-sm mt-4">
                <h4>Contact Information</h4>
                <p>
                    <strong>Email:</strong> <a href="mailto:support@megacart.com">support@megacart.com</a>
                </p>
                <p>
                    <strong>Phone:</strong> <a href="tel:+911234567890">+91-1234567890</a>
                </p>
                <p>
                    <strong>Working Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM
                </p>
            </Card>

            <p className="mt-4">
                If you need immediate assistance, please reach out using the contact details above. Our support team is happy to help!
            </p>
        </Container>
    );
}

export default CustomerSupport;
