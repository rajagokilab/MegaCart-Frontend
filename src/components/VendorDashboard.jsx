import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChartBar, faClipboardList, faRupeeSign, faBoxOpen, faUsers, 
    faPlus, faList, faMoneyBillWave, faArrowRight, faTag, 
    faTruckFast, faStarHalfAlt, faChartLine, faSpinner, faWallet
} from '@fortawesome/free-solid-svg-icons';

// --- START: Chart.js Imports ---
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    TimeScale,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
// --- END: Chart.js Imports ---

import { getCachedUser, getAuthToken } from './auth';

// --- START: Register Chart.js Components ---
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    TimeScale,
    Filler
);
// --- END: Register Chart.js Components ---


// --- ⭐️ START: THEME & API ⭐️ ---
const OLIVE_THEME = {
  main: '#7A8450',
  dark: '#5F673C',
  light: '#F0F2E9',
  text: '#333333',
};

const DESIGN_COLORS = {
    bgHeader: '#606c38', 
    cardDark: '#22331D', 
    buttonGold: '#D89F66', 
    textLight: '#FDFCF5', 
};

const CHART_COLORS = ['#7A8450', '#5F673C', '#A9B47C', '#BFBFA9', '#8A8A7B'];

const API = import.meta.env.VITE_API_URL;
const DASHBOARD_URL = `${API}/vendor/dashboard/`; 
const VENDOR_ANALYTICS_URL = `${API}/vendor/analytics/`; 
// --- ⭐️ END: THEME & API ⭐️ ---


// --- ⭐️ START: Reusable Styled Components ⭐️ ---

const ThemeButton = ({ onClick, disabled = false, className = '', children, type = 'button', variant = 'primary' }) => {
    const variants = {
        primary: { bg: OLIVE_THEME.main, hover: OLIVE_THEME.dark, text: 'white' },
        secondary: { bg: '#6B7280', hover: '#4B5563', text: 'white' }, 
        outline: { bg: 'white', hover: OLIVE_THEME.light, text: OLIVE_THEME.dark, border: `1px solid ${OLIVE_THEME.main}` }
    };
    const v = variants[variant] || variants.primary;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full sm:w-auto flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-200 ease-in-out text-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            style={{ 
                backgroundColor: v.bg, 
                color: v.text,
                border: v.border || 'none'
            }}
            onMouseOver={e => !disabled && (e.currentTarget.style.backgroundColor = v.hover)}
            onMouseOut={e => !disabled && (e.currentTarget.style.backgroundColor = v.bg)}
        >
            {children}
        </button>
    );
};

const StatCard = ({ title, value, icon, note }) => (
    <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 flex flex-col justify-between border border-gray-100 h-full relative z-10">
        <div>
            <div className="flex items-center text-gray-500 mb-2">
                <FontAwesomeIcon icon={icon} className="mr-2 text-lg md:text-xl" style={{ color: OLIVE_THEME.main }} />
                <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">{title}</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">{note}</p>
    </div>
);
// --- ⭐️ END: Reusable Styled Components ⭐️ ---


// --- START: SalesTrendChart Component ---
const SalesTrendChart = ({ dailyData, monthlyData }) => {
    const [range, setRange] = useState('month');
    const unit = range === 'year' ? 'month' : 'day';

    const chartData = useMemo(() => {
        let labels = [];
        let dataPoints = [];
        
        if (range === 'year') {
            const salesMap = new Map(monthlyData.map(item => [item.month.substring(0, 7), item.total_sales]));
            const today = new Date();
            for (let i = 11; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthKey = d.toISOString().substring(0, 7);
                labels.push(d);
                dataPoints.push(salesMap.get(monthKey) || 0);
            }
        } else {
            const daysToShow = range === 'week' ? 7 : 30;
            const salesMap = new Map(dailyData.map(item => [item.date, item.total_sales]));
            const today = new Date();
            for (let i = daysToShow - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateKey = d.toISOString().substring(0, 10);
                labels.push(d);
                dataPoints.push(salesMap.get(dateKey) || 0);
            }
        }
        return {
            labels,
            datasets: [{
                label: 'Total Sales',
                data: dataPoints,
                fill: true,
                backgroundColor: 'rgba(122, 132, 80, 0.1)', 
                borderColor: OLIVE_THEME.main,
                tension: 0.3,
                pointBackgroundColor: OLIVE_THEME.main,
            }],
        };
    }, [range, dailyData, monthlyData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (context) => `Sales: ₹${context.parsed.y.toFixed(2)}` } },
        },
        scales: {
            y: { beginAtZero: true, ticks: { callback: (value) => `₹${value}` } },
            x: {
                type: 'time',
                time: {
                    unit: unit,
                    tooltipFormat: 'MMM d, yyyy',
                    displayFormats: { day: 'MMM d', month: 'MMM yyyy' }
                },
                grid: { display: false },
            },
        },
    };

    const getButtonClass = (buttonRange) => (
        range === buttonRange 
            ? "text-white shadow-sm" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    );

    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-2" style={{ color: OLIVE_THEME.main }} />
                    Sales Trend
                </h3>
                <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto bg-gray-50 p-1 rounded-lg">
                    <button 
                        onClick={() => setRange('week')} 
                        className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs md:text-sm font-medium transition ${getButtonClass('week')}`}
                        style={{ backgroundColor: range === 'week' ? OLIVE_THEME.main : undefined }}
                    >1W</button>
                    <button 
                        onClick={() => setRange('month')} 
                        className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs md:text-sm font-medium transition ${getButtonClass('month')}`}
                        style={{ backgroundColor: range === 'month' ? OLIVE_THEME.main : undefined }}
                    >1M</button>
                    <button 
                        onClick={() => setRange('year')} 
                        className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs md:text-sm font-medium transition ${getButtonClass('year')}`}
                        style={{ backgroundColor: range === 'year' ? OLIVE_THEME.main : undefined }}
                    >1Y</button>
                </div>
            </div>
            <div className="h-60 md:h-72">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};


// --- CategorySalesChart Component ---
const CategorySalesChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;
        const labels = data.map(item => item.product__category__name);
        const revenue = data.map(item => item.total_revenue);
        return {
            labels,
            datasets: [{
                label: 'Total Revenue',
                data: revenue,
                backgroundColor: CHART_COLORS,
                borderColor: OLIVE_THEME.dark,
                borderWidth: 1,
                borderRadius: 4,
            }],
        };
    }, [data]);
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (value) => `₹${value}` } }, x: { grid: { display: false } } }
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                <FontAwesomeIcon icon={faTag} className="mr-2" style={{ color: OLIVE_THEME.main }} />Sales by Category
            </h3>
            <div className="h-60 md:h-64">
                {chartData ? <Bar options={options} data={chartData} /> : <div className="h-full flex items-center justify-center text-gray-500"><p>No category sales data yet.</p></div>}
            </div>
        </div>
    );
};


// --- ReviewDistributionChart Component ---
const ReviewDistributionChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;
        const labels = ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"];
        const apiDataMap = new Map(data.map(item => [item.rating, item.count]));
        const chartCounts = [
            apiDataMap.get(5) || 0,
            apiDataMap.get(4) || 0,
            apiDataMap.get(3) || 0,
            apiDataMap.get(2) || 0,
            apiDataMap.get(1) || 0,
        ];
        const filteredLabels = [];
        const filteredData = [];
        const filteredBgColors = [];
        chartCounts.forEach((count, index) => {
            if (count > 0) {
                filteredLabels.push(labels[index]);
                filteredData.push(count);
                filteredBgColors.push(CHART_COLORS[index]); 
            }
        });
        if (filteredData.length === 0) return null;
        return {
            labels: filteredLabels,
            datasets: [{
                label: 'Reviews',
                data: filteredData,
                backgroundColor: filteredBgColors,
                borderColor: '#ffffff',
                borderWidth: 2,
            }],
        };
    }, [data]);
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%', 
        plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } },
            title: { display: false },
            tooltip: { callbacks: { label: (context) => ` ${context.label}: ${context.parsed} reviews` } }
        },
    };
    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                <FontAwesomeIcon icon={faStarHalfAlt} className="mr-2" style={{ color: OLIVE_THEME.main }} />Review Distribution
            </h3>
            <div className="h-60 md:h-64">
                {chartData ? <Doughnut options={options} data={chartData} /> : <div className="h-full flex items-center justify-center text-gray-500"><p>No review data found.</p></div>}
            </div>
        </div>
    );
};

// --- ProductPerformanceTable Component ---
const ProductPerformanceTable = ({ data }) => (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon icon={faTruckFast} className="mr-2" style={{ color: OLIVE_THEME.main }} />Fast Moving
            </h3>
            <Link to="/my-page?view=vendor-products" className="hover:underline text-xs font-semibold" style={{ color: OLIVE_THEME.main }}>
                View All <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
            </Link>
        </div>
        
        {data && data.length > 0 ? (
            <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.slice(0, 5).map(product => (
                                <tr key={product.product__id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-xs">
                                        {product.product__name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right font-bold">
                                        {product.units_sold}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">No product performance data yet.</div>
        )}
    </div>
);


// --- LatestOrderCountChart Component ---
const LatestOrderCountChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data) return null;
        
        const daysToShow = 7;
        const labels = [];
        const dataPoints = [];
        const salesMap = new Map(data.map(item => [item.date, item.order_count]));
        const today = new Date();

        for (let i = daysToShow - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateKey = d.toISOString().substring(0, 10);
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            dataPoints.push(salesMap.get(dateKey) || 0);
        }

        return {
            labels,
            datasets: [{
                label: 'New Orders',
                data: dataPoints,
                backgroundColor: OLIVE_THEME.dark, 
                borderColor: OLIVE_THEME.dark,
                borderWidth: 1,
                borderRadius: 4,
            }]
        };
    }, [data]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: { callbacks: { label: (context) => `${context.parsed.y} orders` } },
        },
        scales: {
            y: { 
                beginAtZero: true, 
                ticks: { 
                    stepSize: 1,
                    callback: (value) => (Number.isInteger(value) ? value : null)
                } 
            },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" style={{ color: OLIVE_THEME.dark }} />
                New Orders <span className="text-gray-400 text-sm ml-2 font-normal">(Last 7 Days)</span>
            </h3>
            <div className="h-60 md:h-64">
                {chartData ? <Bar options={options} data={chartData} /> : <div className="h-full flex items-center justify-center text-gray-500"><p>No order data yet.</p></div>}
            </div>
        </div>
    );
};


// --- Main VendorDashboard Component ---
function VendorDashboard() {
    const navigate = useNavigate();
    const user = useMemo(() => getCachedUser(), []);

    const [dashboardMetrics, setDashboardMetrics] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        categorySales: null,
        productPerformance: null,
        latestOrders: null,
        ratingDistribution: null,
        salesDaily: null,
        salesMonthly: null,
        orderCountDaily: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'VENDOR') {
            navigate('/');
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const authToken = getAuthToken();
                const headers = {
                    'Authorization': `JWT ${authToken}`,
                    'Content-Type': 'application/json'
                };

                const dashboardRes = await fetch(DASHBOARD_URL, { headers });
                if (!dashboardRes.ok) throw new Error(`Failed to load dashboard data: ${dashboardRes.status}`);
                const dashboardResult = await dashboardRes.json();
                
                setDashboardMetrics({
                    total_earnings: dashboardResult.lifetime_net_earnings || 0, 
                    total_orders: dashboardResult.total_orders || 0,
                    active_products: dashboardResult.active_products || 0,
                    unique_customers: dashboardResult.unique_customers || 0,
                    available_for_payout: dashboardResult.available_for_payout || 0 
                });

                const analyticsRes = await fetch(VENDOR_ANALYTICS_URL, { headers });
                if (!analyticsRes.ok) throw new Error(`Failed to load analytics data: ${analyticsRes.status}`);
                const analyticsResult = await analyticsRes.json();
                
                setAnalyticsData({
                    categorySales: analyticsResult.category_sales || [],
                    productPerformance: analyticsResult.product_performance || [],
                    latestOrders: analyticsResult.latest_orders || [],
                    ratingDistribution: analyticsResult.rating_distribution || [],
                    salesDaily: analyticsResult.sales_daily || [],
                    salesMonthly: analyticsResult.sales_monthly || [],
                    orderCountDaily: analyticsResult.order_count_daily || [],
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user, navigate]);


    const metrics = dashboardMetrics || { 
        total_earnings: 0, 
        total_orders: 0, 
        active_products: 0, 
        unique_customers: 0, 
        available_for_payout: 0 
    };

    if (loading) {
        return (
            <div className="p-8 bg-[#fdfcf5] min-h-screen flex flex-col justify-center items-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-6xl mb-4" style={{ color: OLIVE_THEME.main }} />
                <p className="text-xl text-gray-700 font-semibold">Loading your Vendor Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col justify-center items-center">
                <div className="bg-red-500 text-white p-4 rounded-lg mb-4 text-2xl font-bold">Error!</div>
                <p className="text-red-700 text-lg">{error}</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                    Go to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfcf5]">
            
            {/* --- START: HEADER --- */}
            <div className="relative pt-8 pb-20 md:pb-24 px-4 md:px-12 shadow-lg" style={{ backgroundColor: DESIGN_COLORS.bgHeader }}>
                
                {/* Header Top Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 tracking-tight break-words">
                            {user.store_name || user.username}
                        </h1>
                        <p className="text-sm md:text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            Vendor Dashboard & Analytics
                        </p>
                    </div>
                    
                    <div className="px-3 py-1 md:px-4 md:py-2 rounded-lg border border-white/30 text-white font-medium bg-white/10 backdrop-blur-sm text-sm md:text-base self-start md:self-center">
                         Status: <span className="font-bold text-[#D8E2C3]">Active</span>
                    </div>
                </div>

                {/* Workflow Box */}
                <div 
                    className="w-full max-w-2xl p-4 md:p-5 rounded-lg backdrop-blur-md border-l-4"
                    style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                        borderColor: DESIGN_COLORS.buttonGold,
                        color: 'white' 
                    }}
                >
                    <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider mb-1 text-[#D8E2C3]">Approval Workflow</h4>
                    <p className="text-xs md:text-sm leading-relaxed opacity-90">
                        New listings begin as <span className="font-bold text-white">PENDING</span> and require admin approval before appearing on the marketplace.
                    </p>
                </div>
            </div>
            {/* --- END: HEADER --- */}


            {/* --- OVERLAPPING CONTENT SECTION --- */}
            {/* ⭐️ FIX: Added 'relative z-10' to force this container ON TOP of the header ⭐️ */}
            <div className="px-4 md:px-12 -mt-10 md:-mt-16 pb-12 relative z-10">
                
                {/* Balance Card & Quick Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
                    
                    {/* 1. The Dark Balance Card */}
                    <div 
                        className="lg:col-span-1 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col justify-between transform transition hover:-translate-y-1"
                        style={{ backgroundColor: DESIGN_COLORS.cardDark, color: 'white' }}
                    >
                        <div>
                            <div className="flex items-center opacity-80 mb-3 text-xs md:text-sm font-bold tracking-widest uppercase">
                                <FontAwesomeIcon icon={faWallet} className="mr-2" /> Available Balance
                            </div>
                            <p className="text-3xl md:text-5xl font-bold mb-2 tracking-tight break-all">
                                ₹{metrics.available_for_payout.toFixed(2)}
                            </p>
                            <p className="text-xs opacity-60 mb-6 md:mb-8">
                                Ready for withdrawal request
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/my-page?view=vendor-payouts')}
                            className="w-full py-3 md:py-4 rounded-lg font-bold text-base md:text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center group"
                            style={{ backgroundColor: DESIGN_COLORS.buttonGold, color: '#3d2b1f' }}
                        >
                            Request Payout <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* 2. The KPI Stats Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-0 lg:pt-16">
                        <StatCard 
                            title="All-Time Earnings"
                            value={`₹${metrics.total_earnings.toFixed(2)}`}
                            icon={faRupeeSign}
                            note="Lifetime net earnings"
                        />
                        <StatCard 
                            title="Total Orders"
                            value={metrics.total_orders}
                            icon={faClipboardList}
                            note="Completed orders"
                        />
                        <StatCard 
                            title="Active Products"
                            value={metrics.active_products}
                            icon={faBoxOpen}
                            note="Live on store"
                        />
                    </div>
                </div>

                {/* --- Charts & Analytics Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="md:col-span-2">
                        <SalesTrendChart dailyData={analyticsData.salesDaily} monthlyData={analyticsData.salesMonthly} />
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <ReviewDistributionChart data={analyticsData.ratingDistribution} />
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                         <CategorySalesChart data={analyticsData.categorySales} />
                    </div>
                    <div className="md:col-span-2">
                        <ProductPerformanceTable data={analyticsData.productPerformance} />
                    </div>
                </div>
                
                {/* --- Quick Actions Section --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0 self-start md:self-auto">Store Management</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white" style={{ backgroundColor: OLIVE_THEME.main }}>
                                    <FontAwesomeIcon icon={faBoxOpen} />
                                </div>
                                <h5 className="font-semibold text-gray-800">Products</h5>
                            </div>
                             <div className="flex flex-col sm:flex-row gap-3">
                                <ThemeButton onClick={() => navigate('/vendor/products/new')} className="text-sm py-2">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add New
                                </ThemeButton>
                                <ThemeButton onClick={() => navigate('/my-page?view=vendor-products')} variant="outline" className="text-sm py-2">
                                    View All
                                </ThemeButton>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white" style={{ backgroundColor: OLIVE_THEME.dark }}>
                                    <FontAwesomeIcon icon={faClipboardList} />
                                </div>
                                <h5 className="font-semibold text-gray-800">Orders</h5>
                            </div>
                             <div className="flex flex-col sm:flex-row gap-3">
                                <ThemeButton onClick={() => navigate('/my-page?view=vendor-orders')} className="text-sm py-2" style={{ backgroundColor: '#4B5563' }}>
                                    Manage Orders
                                </ThemeButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VendorDashboard;