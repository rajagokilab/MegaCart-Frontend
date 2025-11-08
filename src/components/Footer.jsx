import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, faCalendarCheck, faBullseye 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, faTwitter, faInstagram, faLinkedinIn 
} from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import appLogo from '../assets/logo.jpg'; // path to your logo
import MyOrdersPage from './MyOrdersPage.jsx'; 

function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        legal: [
            { to: '/terms', label: 'Purchase Terms' },
            { to: '/privacy', label: 'Privacy Policy' },
            { to: '/cookies', label: 'Cookie Settings' },
        ],
        customerService: [
            { to: '/support', label: 'Customer Support' },
            // { to: '/store-locator', label: 'Find a Store' },
            { to: '/my-orders', label: 'Track your delivery' },
            { to: '/help', label: 'Help & FAQ' },
        ],
        information: [
            { to: '/my-orders', label: 'Shipping & Delivery' },
            // { to: '/payment', label: 'Payment Options' },
            { to: '/about-us', label: 'Privacy Policy' },
            { to: '/my-page', label: 'Gift Cards' },
        ],
        inspiration: [
            { to: '/foundation', label: 'Campaigns' },
            { to: '/help', label: 'Guides & Inspiration' },
            { to: '/my-page', label: 'Black Friday 2025' },
        ],
        about: [
            { to: '/about-us', label: 'About MegaCart Nordic' },
            { to: '/careers', label: 'Work with us' },
            { to: '/foundation', label: 'MegaCart Foundation' },
            { to: '/support', label: 'Pressroom' },
        ]
    };

    const socialLinks = [
        { icon: faFacebookF, url: 'https://facebook.com', name: 'Facebook' },
        { icon: faTwitter, url: 'https://twitter.com', name: 'Twitter' },
        { icon: faInstagram, url: 'https://instagram.com', name: 'Instagram' },
        { icon: faLinkedinIn, url: 'https://linkedin.com', name: 'LinkedIn' },
    ];

    return (
        <footer className="text-light pt-4" style={{ backgroundColor: '#001f3f' }}>
            
            {/* TOP ICON BAR */}
            <Container className="pt-4 pb-5 border-bottom border-secondary">
                <Row className="text-center">
                    <Col md={4} className="mb-3 mb-md-0">
                        <FontAwesomeIcon icon={faBox} size="2x" className="mb-2 text-success" />
                        <h5 className="fs-6 fw-bold text-light">Fast Delivery</h5>
                        <p className="mb-0 text-white-50 small">Get your items shipped fast</p>
                    </Col>
                    <Col md={4} className="mb-3 mb-md-0">
                        <FontAwesomeIcon icon={faCalendarCheck} size="2x" className="mb-2 text-success" />
                        <h5 className="fs-6 fw-bold text-light">30-Day Returns</h5>
                        <p className="mb-0 text-white-50 small">Easy returns for all members</p>
                    </Col>
                    <Col md={4}>
                        <FontAwesomeIcon icon={faBullseye} size="2x" className="mb-2 text-success" />
                        <h5 className="fs-6 fw-bold text-light">Price Match</h5>
                        <p className="mb-0 text-white-50 small">We'll match any competitor</p>
                    </Col>
                </Row>
            </Container>

            {/* MAIN LINKS AREA */}
            <Container className="py-5">
                <Row>
                    {/* Column 1: Logo + Legal */}
                    <Col lg={3} md={12} className="mb-4">
                        <Link to="/" className="text-decoration-none d-flex align-items-center mb-3">
                            <img 
                                src={appLogo} 
                                alt="MegaCart Logo"
                                style={{ 
                                    height: '50px', 
                                    width: 'auto', 
                                    marginRight: '8px', 
                                    borderRadius: '2px',
                                    backgroundColor: 'white' 
                                }}
                            />
                            <h2 className="mb-0 fw-bold">
                                <span style={{ color: '#0055A0' }}>Mega</span>
                                <span style={{ color: '#28a745' }}>Cart</span>
                            </h2>
                        </Link>

                        <p className="text-white-50 small">
                            &copy; {currentYear} MegaCart. All rights reserved.
                            <br />
                            Organisation number: 123456-7890
                        </p>

                        <Nav className="flex-column small">
                            {footerLinks.legal.map(link => (
                                <Nav.Link key={link.to} as={Link} to={link.to} className="text-white-50 p-0 mb-1">
                                    {link.label}
                                </Nav.Link>
                            ))}
                        </Nav>

                        {/* SOCIAL MEDIA */}
                        <div className="mt-3 d-flex gap-3">
                            {socialLinks.map(social => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white fs-5"
                                >
                                    <FontAwesomeIcon icon={social.icon} />
                                </a>
                            ))}
                        </div>
                    </Col>

                    {/* Column 2: Customer Service */}
                    <Col lg={2} md={3} sm={6} className="mb-4">
                        <h5 className="text-white fs-6 fw-bold">Customer Service</h5>
                        <Nav className="flex-column small">
                            {footerLinks.customerService.map(link => (
                                <Nav.Link key={link.to} as={Link} to={link.to} className="text-light p-0 mb-2">
                                    {link.label}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Col>

                    {/* Column 3: Information */}
                    <Col lg={2} md={3} sm={6} className="mb-4">
                        <h5 className="text-white fs-6 fw-bold">Information</h5>
                        <Nav className="flex-column small">
                            {footerLinks.information.map(link => (
                                <Nav.Link key={link.to} as={Link} to={link.to} className="text-light p-0 mb-2">
                                    {link.label}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Col>

                    {/* Column 4: Inspiration */}
                    <Col lg={2} md={3} sm={6} className="mb-4">
                        <h5 className="text-white fs-6 fw-bold">Inspiration</h5>
                        <Nav className="flex-column small">
                            {footerLinks.inspiration.map(link => (
                                <Nav.Link key={link.to} as={Link} to={link.to} className="text-light p-0 mb-2">
                                    {link.label}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Col>

                    {/* Column 5: About MegaCart */}
                    <Col lg={3} md={3} sm={6} className="mb-4">
                        <h5 className="text-white fs-6 fw-bold">About MegaCart</h5>
                        <Nav className="flex-column small">
                            {footerLinks.about.map(link => (
                                <Nav.Link key={link.to} as={Link} to={link.to} className="text-light p-0 mb-2">
                                    {link.label}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;
