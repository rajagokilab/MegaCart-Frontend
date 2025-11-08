import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext.jsx'; 
import { CartProvider } from './context/CartContext.jsx'; 
import Navbar from './components/Navbar.jsx';
import CheckoutPage from './components/CheckoutPage.jsx'; 
import ProductList from './components/ProductLists.jsx';
import Footer from './components/Footer.jsx'; 
import ProductDetails from './components/ProductDetails.jsx';
import LoginFormModal from './components/LoginFormModal.jsx'; 
import CartPage from './components/CartPage.jsx'; 
import MyOrdersPage from './components/MyOrdersPage.jsx'; 
import AboutUs from './pages/AboutUs';
import WorkWithUs from './pages/WorkWithUs';
import Help from './pages/Help.jsx';
import CustomerSupport from './pages/CustomerSupport';
import Foundation from './pages/Foundations.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/ProductLists.css'; 
import MyPage from './components/MyPage'; 
import SearchPage from './components/SearchPage.jsx'; 
import VendorDashboard from './components/VendorDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ProductCreateForm from './components/ProductCreateForm.jsx';
// import ProductEditForm from './components/ProductEditForm.jsx'; 


// 1. ✅ IMPORT THE NEW COMPONENT
import VendorStorefrontPage from './components/VendorStorefrontPage.jsx';


// Helper component to access UserContext within the Router
function AppContent() {
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 🛑 We no longer need the trigger state, but we need the login function
    const { login } = useUser(); 

    const handleLoginSuccess = (loggedInUser) => {
        // This updates the global UserContext state
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
                    
                    {/* ProductDetails no longer needs the trigger prop */}
                    <Route path="/product/:id" element={<ProductDetails />} />
                    
                    <Route path="/cart" element={<CartPage />} /> 
                    <Route path="/checkout" element={<CheckoutPage />} /> 
                     <Route path="/about-us" element={<AboutUs />} />
        <Route path="/careers" element={<WorkWithUs />} />
        <Route path="/support" element={<CustomerSupport />} />
        <Route path="/foundation" element={<Foundation />} />
        <Route path="/help" element={<Help/>} />


                    {/* User Account Routes */}
                    <Route path="/my-orders" element={<MyOrdersPage onLoginClick={() => setShowLoginModal(true)} />} />
                    <Route path="/my-page" element={<MyPage onLoginClick={() => setShowLoginModal(true)} />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* VENDOR MANAGEMENT ROUTES */}
                    <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/vendor/products/new" element={<ProductCreateForm />} />
                    {/* <Route path="/vendor/products/edit/:id" element={<ProductEditForm />} /> */}
                    <Route path="/vendor/:vendorId" element={<VendorStorefrontPage />} />
                    

                    
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

// Main App component wraps everything in context providers
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