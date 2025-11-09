import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCircle, faTachometerAlt, faUsersCog, faBoxOpen, 
    faListCheck, faTasks, faDollarSign, faShoppingCart, faUsers, faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';

// 1. --- Import Chart.js ---
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { getAuthToken } from './auth'; 
import { useUser } from '../context/UserContext.jsx'; 

// 2. --- Register Chart.js components ---
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// --- API Endpoints (Simplified) ---
const API = import.meta.env.VITE_API_URL;
const ADMIN_DASHBOARD_URL = `${API}/admin/dashboard/`;
const ADMIN_ALL_ORDERS_URL = `${API}/orders/admin/all/`;
const ADMIN_CATEGORIES_URL = `${API}/categories/`;


// 3. --- Chart Component ---
const SalesByCategoryChart = ({ chartData }) => {
    if (!chartData) return <div className="text-center p-4">Loading chart data...</div>;

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Total Sales',
                data: chartData.sales,
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // Tailwind's blue-500
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        family: 'Inter, sans-serif'
                    }
                }
            },
            title: {
                display: true,
                text: 'Total Sales by Category',
                font: {
                    size: 18,
                    weight: 'bold',
                    family: 'Inter, sans-serif'
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `₹${value}`
                }
            }
        }
    };

    return <Bar options={options} data={data} />;
};

// 4. --- Main AdminDashboard Component (Refactored for Tailwind) ---
function AdminDashboard() {
    const { user } = useUser();
    const navigate = useNavigate();

    // --- State (Simplified) ---
    const [adminDashboardData, setAdminDashboardData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [adminLoading, setAdminLoading] = useState(true);
    const [adminError, setAdminError] = useState(null);

    // --- Admin Universal Fetch Wrapper ---
    const authFetch = async (url, options = {}) => {
        const token = getAuthToken();
        if (!token) throw new Error("Admin authentication token not found.");
        
        return await fetch(url, {
            ...options,
            headers: {
                "Authorization": `JWT ${token}`,
                "Content-Type": "application/json",
                ...options.headers
            }
        });
    };

    // 5. --- Chart Data Processing Function ---
    const processChartData = (allOrders, allCategories) => {
        const salesData = {};
        
        // Initialize all categories with 0 sales
        allCategories.forEach(cat => {
            salesData[cat.name] = 0;
        });

        // Loop through all paid orders and sum sales
        allOrders.forEach(order => {
            if (order.status === "Paid") { // Or whatever your "completed" status is
                order.items.forEach(item => {
                    const category = item.product_category_name; // Make sure this name matches your serializer
                    if (category in salesData) {
                        salesData[category] += (item.price * item.quantity);
                    } else {
                        // Handle items with categories that might have been deleted
                        salesData[category] = (item.price * item.quantity);
                    }
                });
            }
        });

        const labels = Object.keys(salesData);
        const sales = Object.values(salesData);

        return { labels, sales };
    };


    // 6. --- Data Fetching Logic (With Debugging) ---
    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            setAdminLoading(true);
            
            Promise.all([
                authFetch(ADMIN_DASHBOARD_URL),
                authFetch(ADMIN_ALL_ORDERS_URL),
                authFetch(ADMIN_CATEGORIES_URL)
            ]).then(async ([dashRes, ordRes, catRes]) => {
                
                if (!dashRes.ok) throw new Error('Could not fetch admin stats');
                if (!ordRes.ok) throw new Error('Could not fetch all orders');
                if (!catRes.ok) throw new Error('Could not fetch categories');

                const dashData = await dashRes.json();
                const ordData = (await ordRes.json()).results || [];
                const catData = (await catRes.json()).results || [];

                setAdminDashboardData(dashData);
                
                // ▼▼▼ --- DEBUGGING --- ▼▼▼
                console.log("--- CHART DATA DEBUG ---");

                // 1. Check your categories
                console.log("Categories Loaded:", catData.map(c => c.name));

                // 2. Check your orders
                console.log("Total Orders Found:", ordData.length);
                const paidOrders = ordData.filter(o => o.status === "Paid");
                console.log("Paid Orders Found:", paidOrders.length);

                // 3. Check the items from the first paid order (if any)
                if (paidOrders.length > 0) {
                    console.log("Items from first paid order:", paidOrders[0].items);
                    console.log(
                        "Category names from first paid order:", 
                        paidOrders[0].items.map(item => item.product_category_name)
                    );
                }
                console.log("--------------------------");
                // ▲▲▲ --- END DEBUGGING --- ▲▲▲

                // Process and set chart data
                const processedData = processChartData(ordData, catData);
                
                // Debug the final processed data
                console.log("Final Processed Chart Data:", processedData);
                
                setChartData(processedData);

            }).catch(err => {
                setAdminError(err.message || "Failed to load admin resources.");
            }).finally(() => setAdminLoading(false));
        }
    }, [user]);

    // --- "Guard Clause" for non-admin users ---
    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="container mx-auto my-10 p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
                    <strong className="font-bold">Access Denied! </strong>
                    <span className="block sm:inline">You do not have permission to view this page.</span>
                </div>
            </div>
        );
    }

    // --- Loading State ---
    if (adminLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                <span className="ml-4 text-xl font-semibold text-gray-700">Loading Admin Portal...</span>
            </div>
        );
    }

    // --- Error State ---
    if (adminError) {
        return (
            <div className="container mx-auto my-10 p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{adminError}</span>
                </div>
            </div>
        );
    }
    
    // 7. --- Main RETURN (Rewritten with Tailwind) ---
    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
            <div className="container mx-auto">
                
                {/* --- Header --- */}
                <div className="mb-8 p-6 bg-white shadow-lg rounded-lg flex flex-col sm:flex-row justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-500">Welcome back, {user.username}!</p>
                    </div>
                    <div className="flex items-center mt-4 sm:mt-0">
                        <img 
                            src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} 
                            alt="avatar" 
                            className="w-12 h-12 rounded-full border-2 border-blue-500"
                        />
                        <div className="ml-3">
                            <h5 className="font-semibold text-gray-700">{user.username}</h5>
                            <span className="text-sm font-medium bg-red-500 text-white px-2 py-0.5 rounded-full">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* --- Stats Cards Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    
                    {/* Stat Card 1: Total Sales */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Total Sales</h3>
                            <FontAwesomeIcon icon={faDollarSign} size="2x" className="opacity-70" />
                        </div>
                        <p className="text-4xl font-bold mt-2">
                            ₹{adminDashboardData?.total_sales?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    {/* Stat Card 2: Total Commission */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Total Commission</h3>
                            <FontAwesomeIcon icon={faTachometerAlt} size="2x" className="opacity-70" />
                        </div>
                        <p className="text-4xl font-bold mt-2">
                            ₹{adminDashboardData?.total_commission?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    {/* Stat Card 3: New Orders */}
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">New Orders</h3>
                            <FontAwesomeIcon icon={faShoppingCart} size="2x" className="opacity-70" />
                        </div>
                        <p className="text-4xl font-bold mt-2">
                            {adminDashboardData?.new_orders || 0}
                        </p>
                    </div>

                    {/* Stat Card 4: Pending Vendors */}
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Pending Vendors</h3>
                            <FontAwesomeIcon icon={faHourglassHalf} size="2x" className="opacity-70" />
                        </div>
                        <p className="text-4xl font-bold mt-2">
                            {adminDashboardData?.pending_vendors || 0}
                        </p>
                    </div>
                </div>
                
                {/* --- Chart Container --- */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div style={{ height: '450px' }}>
                        <SalesByCategoryChart chartData={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;