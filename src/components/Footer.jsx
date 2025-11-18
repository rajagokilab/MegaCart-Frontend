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

function Footer({ closeMenus }) { // optional prop to close dropdowns/offcanvas
  const currentYear = new Date().getFullYear();

  // --- NEW THEME COLORS ---
  const THEME_COLOR = '#7A8450'; // Olive Green
  const BACKGROUND_COLOR = '#F7F3E8'; // Creamy Beige
  const TEXT_DARK = '#333333'; // Dark grey for text
  const TEXT_MUTED = '#6c757d'; // Standard muted grey

  const footerLinks = {
    legal: [
      { to: '/terms', label: 'Purchase Terms' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/cookies', label: 'Cookie Settings' },
    ],
    customerService: [
      { to: '/support', label: 'Customer Support' },
      { to: '/my-orders', label: 'Track your delivery' },
      { to: '/help', label: 'Help & FAQ' },
    ],
    information: [
      { to: '/my-orders', label: 'Shipping & Delivery' },
      { to: '/about-us', label: 'Privacy Policy' },
      { to: '/my-page', label: 'Gift Cards' },
    ],
    inspiration: [
      { to: '/foundation', label: 'Campaigns' },
      { to: '/help', label: 'Guides & Inspiration' },
      { to: '/my-page', label: 'Black Friday 2025' },
    ],
    about: [
      { to: '/about-us', label: 'About VetriCart Nordic' },
      { to: '/careers', label: 'Work with us' },
      { to: '/foundation', label: 'VetriCart Foundation' },
      { to: '/support', label: 'Pressroom' },
    ]
  };

  const socialLinks = [
    { icon: faFacebookF, url: 'https://facebook.com', name: 'Facebook' },
    { icon: faTwitter, url: 'https://twitter.com', name: 'Twitter' },
    { icon: faInstagram, url: 'https://instagram.com', name: 'Instagram' },
    { icon: faLinkedinIn, url: 'https://linkedin.com', name: 'LinkedIn' },
  ];

  // helper click handler to close dropdown/offcanvas if passed
  const handleLinkClick = () => {
    if (closeMenus) closeMenus();
  };

  return (
    <>
      <footer className="pt-4" style={{ backgroundColor: BACKGROUND_COLOR, color: TEXT_DARK }}>
        
        {/* TOP ICON BAR */}
        <Container className="pt-4 pb-5 border-bottom">
          <Row className="text-center">
            <Col md={4} className="mb-3 mb-md-0">
              <FontAwesomeIcon icon={faBox} size="2x" className="mb-2" style={{ color: THEME_COLOR }} />
              <h5 className="fs-6 fw-bold" style={{ color: THEME_COLOR }}>Fast Delivery</h5>
              <p className="mb-0 text-muted small">Get your items shipped fast</p>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <FontAwesomeIcon icon={faCalendarCheck} size="2x" className="mb-2" style={{ color: THEME_COLOR }} />
              <h5 className="fs-6 fw-bold" style={{ color: THEME_COLOR }}>30-Day Returns</h5>
              <p className="mb-0 text-muted small">Easy returns for all members</p>
            </Col>
            <Col md={4}>
              <FontAwesomeIcon icon={faBullseye} size="2x" className="mb-2" style={{ color: THEME_COLOR }} />
              <h5 className="fs-6 fw-bold" style={{ color: THEME_COLOR }}>Price Match</h5>
              <p className="mb-0 text-muted small">We'll match any competitor</p>
            </Col>
          </Row>
        </Container>

        {/* MAIN LINKS AREA */}
        <Container className="py-5">
          <Row>
            {/* Column 1: Logo + Legal */}
            <Col lg={3} md={12} className="mb-4">
              <Link to="/" className="text-decoration-none d-flex align-items-center mb-3" onClick={handleLinkClick}>
                <img 
                  src={appLogo} 
                  alt="VetriCart Logo"
                  style={{ 
                    height: '50px', 
                    width: 'auto', 
                    marginRight: '8px', 
                    borderRadius: '2px',
                    backgroundColor: 'white' // Kept white bg for logo clarity
                  }}
                />
                <h2 className="mb-0 fw-bold">
                  <span style={{ color: THEME_COLOR }}>Vetri</span>
                  <span style={{ color: TEXT_DARK }}>Cart</span>
                </h2>
              </Link>

              <p className="text-muted small">
                &copy; {currentYear} VetriCart. All rights reserved.
                <br />
                Organisation number: 123456-7890
              </p>

              <Nav className="flex-column small">
                {footerLinks.legal.map(link => (
                  <Nav.Link 
                    key={link.to} 
                    as={Link} 
                    to={link.to} 
                    className="text-muted p-0 mb-1 footer-link" 
                    onClick={handleLinkClick}
                  >
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
                    className="fs-5 footer-social-link"
                    style={{ color: TEXT_DARK }}
                  >
                    <FontAwesomeIcon icon={social.icon} />
                  </a>
                ))}
              </div>
            </Col>

            {/* Column 2: Customer Service */}
            <Col lg={2} md={3} sm={6} className="mb-4">
              <h5 className="fs-6 fw-bold" style={{ color: THEME_COLOR }}>Customer Service</h5>
              <Nav className="flex-column small">
                {footerLinks.customerService.map(link => (
                  <Nav.Link 
                    key={link.to} 
                    as={Link} 
                    to={link.to} 
                    className="text-dark p-0 mb-2 footer-link" 
                    onClick={handleLinkClick}
                  >
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>

            {/* Column 3: Information */}
            <Col lg={2} md={3} sm={6} className="mb-4">
              <h5 className="fs-6 fw-bold" style={{ color: THEME_COLOR }}>Information</h5>
              <Nav className="flex-column small">
                {footerLinks.information.map(link => (
                  <Nav.Link 
                    key={link.to} 
                    as={Link} 
                    to={link.to} 
                    className="text-dark p-0 mb-2 footer-link" 
                    onClick={handleLinkClick}
                  >
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>

            {/* Column 4: Inspiration */}
            <Col lg={2} md={3} sm={6} className="mb-4">
              <h5 className="fs-6 fw-bold" style={{ color: THEME_COLOR }}>Inspiration</h5>
              <Nav className="flex-column small">
                {footerLinks.inspiration.map(link => (
                  <Nav.Link 
                    key={link.to} 
                    as={Link} 
                    to={link.to} 
                    className="text-dark p-0 mb-2 footer-link" 
                    onClick={handleLinkClick}
                  >
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>

            {/* Column 5: About VetriCart */}
            <Col lg={3} md={3} sm={6} className="mb-4">
              <h5 className="fs-6 fw-bold" style={{ color: THEME_COLOR }}>About VetriCart</h5>
              <Nav className="flex-column small">
                {footerLinks.about.map(link => (
                  <Nav.Link 
                    key={link.to} 
                    as={Link} 
                    to={link.to} 
                    className="text-dark p-0 mb-2 footer-link" 
                    onClick={handleLinkClick}
                  >
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Added style block for hover effects */}
      <style>{`
        .footer-link, .footer-social-link {
          transition: color 0.2s ease-in-out;
          text-decoration: none;
        }
        .footer-link:hover {
          color: ${THEME_COLOR} !important;
          text-decoration: underline;
        }
        .footer-social-link:hover {
           color: ${THEME_COLOR} !important;
        }
      `}</style>
    </>
  );
}

export default Footer;