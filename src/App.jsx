import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext.jsx'; 
import { CartProvider } from './context/CartContext.jsx'; 
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProductList from './components/ProductLists.jsx';
import ProductDetails from './components/ProductDetails.jsx';
import CartPage from './components/CartPage.jsx'; 
import CheckoutPage from './components/CheckoutPage.jsx'; 
import LoginFormModal from './components/LoginFormModal.jsx'; 
import MyOrdersPage from './components/MyOrdersPage.jsx'; 
import MyPage from './components/MyPage.jsx';
import SearchPage from './components/SearchPage.jsx'; 

import VendorDashboard from './components/VendorDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ProductCreateForm from './components/ProductCreateForm.jsx';
import ProductEditForm from './components/ProductEditForm.jsx';
import VendorStorefrontPage from './components/VendorStorefrontPage.jsx';
import ResetPassword from './components/ResetPassword'; 
import ResetPasswordConfirm from './components/ResetPasswordConfirm'; // Import the new file// adjust path if needed


import AboutUs from './pages/AboutUs.jsx';
import WorkWithUs from './pages/WorkWithUs.jsx';
import CustomerSupport from './pages/CustomerSupport.jsx';
import Help from './pages/Help.jsx';
import Foundation from './pages/Foundations.jsx';

// ✅ Shop and Category Pages
import ShopPage from './pages/ShopPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';

// --- Admin Route Wrapper ---
const AdminRoute = ({ children }) => {
    const { user, loading } = useUser();

    if (loading) return <Spinner animation="border" />;

    if (user && user.role === 'ADMIN') return children;

    return <Navigate to="/" replace />;
};

// --- AppContent: main app routes ---
function AppContent() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { login } = useUser();

    const handleLoginSuccess = (loggedInUser) => {
        login(loggedInUser);
        setShowLoginModal(false);
    };

    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLoginModal(true)} />

            <main className="app-content-area" style={{ flex: 1 }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<ProductList onLoginClick={() => setShowLoginModal(true)} />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/careers" element={<WorkWithUs />} />
                    <Route path="/support" element={<CustomerSupport />} />
                    <Route path="/foundation" element={<Foundation />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
                    <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />

                    

                    {/* Category Route */}
<Route path="/category/:categoryName" element={<CategoryPage />} />
                    {/* Admin Route */}
                    <Route 
                        path="/admin/dashboard" 
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        } 
                    />

                    {/* User Account Routes */}
                    <Route path="/my-orders" element={<MyOrdersPage onLoginClick={() => setShowLoginModal(true)} />} />
                    <Route path="/my-page" element={<MyPage onLoginClick={() => setShowLoginModal(true)} />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* Vendor Routes */}
                    <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                    <Route path="/vendor/products/new" element={<ProductCreateForm />} />
                    <Route path="/vendor/products/edit/:id" element={<ProductEditForm />} />
                    <Route path="/vendor/:vendorId" element={<VendorStorefrontPage />} />

                    {/* Catch-all route (optional) */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            <Footer />

            <LoginFormModal 
                show={showLoginModal} 
                handleClose={() => setShowLoginModal(false)} 
                onLoginSuccess={handleLoginSuccess} 
            />
        </div>
    );
}

// --- Main App: wrap providers ---
function App() {
    return (
        <UserProvider> 
            <CartProvider>
                <Router>
                    <AppContent />
                </Router>
            </CartProvider>
        </UserProvider>
    );
}

export default App;
