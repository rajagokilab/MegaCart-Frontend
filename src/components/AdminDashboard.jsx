import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCircle, faTachometerAlt, faUsersCog, faBoxOpen, 
    faListCheck, faTasks, faDollarSign, faShoppingCart, faUsers, faHourglassHalf,
    faStar, faCommentDots, faFilePdf, faFileExcel, faChartLine, faArrowRight
} from '@fortawesome/free-solid-svg-icons';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement, 
    LineElement, 
    PointElement, 
    Filler 
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { getAuthToken } from './auth'; 
import { useUser } from '../context/UserContext.jsx'; 

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
    Filler
);

const API = import.meta.env.VITE_API_URL;
const ADMIN_DASHBOARD_URL_BASE = `${API}/admin/dashboard/`;
const ADMIN_EXPORT_URL = `${API}/admin/export-all/`;

// --- ⭐️ START: THEME & COLORS ⭐️ ---
const OLIVE_THEME = {
  main: '#7A8450',
  dark: '#5F673C', // Dark Olive Green
  light: '#F0F2E9',
  text: '#333333',
};

const DESIGN_COLORS = {
    bgHeader: '#606c38', 
    cardDark: '#22331D', 
    buttonGold: '#D89F66', 
    textLight: '#FDFCF5', 
};

// Colors for Charts
const CHART_COLORS = ['#7A8450', '#5F673C', '#A9B47C', '#BFBFA9', '#8A8A7B'];
// --- ⭐️ END: THEME ⭐️ ---


// --- ⭐️ START: Reusable Components ⭐️ ---

const ThemeButton = ({ onClick, disabled = false, className = '', children, type = 'button', variant = 'primary' }) => {
    const variants = {
        primary: { bg: DESIGN_COLORS.buttonGold, hover: '#c58e58', text: '#3d2b1f' },
        secondary: { bg: 'rgba(255,255,255,0.2)', hover: 'rgba(255,255,255,0.3)', text: 'white' }, 
        outline: { bg: 'white', hover: OLIVE_THEME.light, text: OLIVE_THEME.dark, border: `1px solid ${OLIVE_THEME.main}` }
    };
    const v = variants[variant] || variants.primary;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center px-4 py-2 rounded-lg font-bold transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${className}`}
            style={{ 
                backgroundColor: v.bg, 
                color: v.text,
                border: v.border || 'none',
                backdropFilter: variant === 'secondary' ? 'blur(5px)' : 'none'
            }}
            onMouseOver={e => !disabled && (e.currentTarget.style.backgroundColor = v.hover)}
            onMouseOut={e => !disabled && (e.currentTarget.style.backgroundColor = v.bg)}
        >
            {children}
        </button>
    );
};

const StatCard = ({ title, value, icon, note, linkTo, iconColor }) => {
    // Use provided iconColor or default to main theme
    const activeIconColor = iconColor || OLIVE_THEME.main;

    const CardContent = (
        <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 flex flex-col justify-between border border-gray-100 h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div>
                <div className="flex items-center text-gray-500 mb-2">
                    <FontAwesomeIcon icon={icon} className="mr-2 text-lg md:text-xl" style={{ color: activeIconColor }} />
                    <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">{title}</span>
                </div>
                {/* !text-gray-900 overrides default link blue */}
                <p className="text-2xl md:text-3xl font-bold !text-gray-900">{value}</p>
            </div>
            {/* !text-gray-500 overrides default link color */}
            {note && <p className="text-xs !text-gray-500 mt-3 pt-3 border-t border-gray-50">{note}</p>}
        </div>
    );

    return linkTo ? (
        // !no-underline and !text-inherit remove browser default link styles
        <Link to={linkTo} className="block h-full !no-underline !text-inherit hover:!no-underline focus:!no-underline">
            {CardContent}
        </Link>
    ) : (
        CardContent
    );
};

// --- ⭐️ END: Reusable Components ⭐️ ---


// --- CHART COMPONENTS ---

const SalesByCategoryChart = ({ data }) => {
    const chartData = {
        labels: data.map(c => c.name),
        datasets: [ {
            label: 'Total Sales',
            data: data.map(c => c.total_sales),
            backgroundColor: CHART_COLORS,
            borderColor: OLIVE_THEME.dark,
            borderWidth: 1,
            borderRadius: 4,
        }, ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: { 
            y: { beginAtZero: true, ticks: { callback: (value) => `₹${value}` } },
            x: { grid: { display: false } }
        }
    };
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                <FontAwesomeIcon icon={faChartLine} className="mr-2" style={{ color: OLIVE_THEME.main }} />
                Sales by Category
            </h3>
            <div className="h-64">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

const VendorSalesChart = ({ data }) => {
    const chartData = {
        labels: data.map(v => v.store_name),
        datasets: [{
            label: 'Total Earnings',
            data: data.map(v => v.total_earnings),
            backgroundColor: OLIVE_THEME.main,
            borderRadius: 4,
        }]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
            y: { beginAtZero: true, ticks: { callback: (value) => `₹${value}` } },
            x: { grid: { display: false } }
        }
    };
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                <FontAwesomeIcon icon={faUsersCog} className="mr-2" style={{ color: OLIVE_THEME.main }} />
                Top Vendors by Earnings
            </h3>
            <div className="h-64">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

const FastMovingProductsChart = ({ data }) => {
    const chartData = {
        labels: data.map(p => p.name),
        datasets: [{
            label: 'Units Sold',
            data: data.map(p => p.total_sold),
            backgroundColor: '#D2B48C',
            borderWidth: 0,
            borderRadius: 4,
        }]
    };
    const options = {
        indexAxis: 'y', 
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
            x: { beginAtZero: true, grid: { display: false } },
            y: { grid: { display: false } }
        }
    };
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                <FontAwesomeIcon icon={faBoxOpen} className="mr-2" style={{ color: OLIVE_THEME.main }} />
                Fast Moving Products
            </h3>
            <div className="h-64">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

const OrderStatusPieChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => d.status),
        datasets: [{
            data: data.map(d => d.count),
            backgroundColor: [OLIVE_THEME.main, '#D2B48C', OLIVE_THEME.dark, '#E5E7EB'],
            borderColor: '#fff',
            borderWidth: 2,
        }],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: { position: 'right', labels: { boxWidth: 15, usePointStyle: true } },
        },
    };
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                <FontAwesomeIcon icon={faShoppingCart} className="mr-2" style={{ color: OLIVE_THEME.main }} />
                Order Status
            </h3>
            <div className="h-64">
                <Pie options={options} data={chartData} />
            </div>
        </div>
    );
};

const SalesTrendChart = ({ data }) => {
    const hasData = data && data.length > 0;
    const demoData = [
        { date: 'Mon', total_sales: 500, total_commission: 50 },
        { date: 'Tue', total_sales: 1200, total_commission: 120 },
        { date: 'Wed', total_sales: 800, total_commission: 80 },
        { date: 'Thu', total_sales: 2200, total_commission: 220 },
        { date: 'Fri', total_sales: 1500, total_commission: 150 },
        { date: 'Sat', total_sales: 2900, total_commission: 290 },
        { date: 'Sun', total_sales: 2000, total_commission: 200 },
    ];
    const displayData = hasData ? data : demoData;

    const chartData = {
        labels: displayData.map(d => d.date),
        datasets: [
            {
                label: 'Sales',
                data: displayData.map(d => Number(d.total_sales)),
                borderColor: OLIVE_THEME.main, 
                backgroundColor: 'rgba(122, 132, 80, 0.1)', 
                borderWidth: 2,
                fill: true, 
                tension: 0.4, 
                pointBackgroundColor: OLIVE_THEME.main,
            },
            {
                label: 'Commission',
                data: displayData.map(d => Number(d.total_commission)),
                borderColor: OLIVE_THEME.dark, // Using Dark Olive Green
                backgroundColor: 'transparent', 
                borderWidth: 2,
                tension: 0.4,
                borderDash: [5, 5],
                pointBackgroundColor: OLIVE_THEME.dark, // Using Dark Olive Green
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', align: 'end', labels: { usePointStyle: true } },
            tooltip: { 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#333',
                borderColor: '#ddd',
                borderWidth: 1,
                callbacks: { label: (c) => `${c.dataset.label}: ₹${c.parsed.y.toFixed(2)}` }
            }
        },
        scales: { 
            y: { beginAtZero: true, grid: { display: false }, ticks: { callback: (value) => `₹${value}` } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="h-72 w-full">
            <Line options={options} data={chartData} />
        </div>
    );
};


// --- MAIN COMPONENT ---
function AdminDashboard() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [adminLoading, setAdminLoading] = useState(true);
    const [adminError, setAdminError] = useState(null);
    const [timeRange, setTimeRange] = useState('1M'); 
    const [isExporting, setIsExporting] = useState(false);
    const dashboardRef = useRef(null);

    const handlePdfDownload = () => {
        const buttons = document.getElementById('download-buttons');
        if (buttons) buttons.style.display = 'none';
        html2canvas(dashboardRef.current, { scale: 2, backgroundColor: '#fdfcf5' }).then((canvas) => {
            if (buttons) buttons.style.display = 'flex'; 
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`admin-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
        });
    };

    const handleExcelDownload = async () => {
        setIsExporting(true);
        setAdminError(null); 
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");
            const response = await fetch(ADMIN_EXPORT_URL, { headers: { "Authorization": `JWT ${token}` } });
            if (!response.ok) throw new Error('Export failed on server.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `full_website_export-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click(); 
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            setAdminError(`Failed to download report: ${err.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            setAdminLoading(true);
            const url = `${ADMIN_DASHBOARD_URL_BASE}?range=${timeRange}`;
            const token = getAuthToken();
            fetch(url, { headers: { "Authorization": `JWT ${token}` } })
                .then(res => {
                    if (!res.ok) throw new Error('Could not fetch admin dashboard stats');
                    return res.json();
                })
                .then(data => { setDashboardData(data); })
                .catch(err => { setAdminError(err.message || "Failed to load admin resources."); })
                .finally(() => setAdminLoading(false));
        }
    }, [user, timeRange]); 

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfcf5]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    if (adminLoading) {
        return (
            <div className="min-h-screen bg-[#fdfcf5] flex flex-col justify-center items-center">
                <div className="animate-spin text-4xl mb-4" style={{ color: OLIVE_THEME.main }}>
                    <FontAwesomeIcon icon={faChartLine} />
                </div>
                <p className="text-lg font-semibold text-gray-700">Loading Admin Portal...</p>
            </div>
        );
    }
    
    const stats = dashboardData?.stat_cards || {};
    const charts = dashboardData?.charts || {};
    
    // Safe access to charts
    const finalCharts = {
        sales_over_time: charts.sales_over_time || [],
        sales_by_category: charts.sales_by_category || [],
        sales_by_vendor: charts.sales_by_vendor || [],
        fast_moving_products: charts.fast_moving_products || [],
        order_status: charts.order_status || [],
        top_reviewed_vendors: charts.top_reviewed_vendors || [],
    };

    return (
        <div className="min-h-screen bg-[#fdfcf5]" ref={dashboardRef}>
            
            {/* --- START: GREEN HEADER --- */}
            <div className="relative pt-8 pb-20 md:pb-24 px-4 md:px-12 shadow-lg" style={{ backgroundColor: DESIGN_COLORS.bgHeader }}>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
                    {/* Title Section */}
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm md:text-lg opacity-80 text-white">
                            Overview for <span className="font-bold text-[#D8E2C3]">{user.username}</span>
                        </p>
                    </div>
                    
                    {/* Actions Section */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto" id="download-buttons">
                         <ThemeButton onClick={handlePdfDownload} variant="secondary" disabled={isExporting} className="border border-white/30">
                             <FontAwesomeIcon icon={faFilePdf} className="mr-2" /> PDF Report
                         </ThemeButton>
                         <ThemeButton onClick={handleExcelDownload} variant="primary" disabled={isExporting}>
                             <FontAwesomeIcon icon={faFileExcel} className="mr-2" /> {isExporting ? 'Exporting...' : 'Excel Export'}
                         </ThemeButton>
                    </div>
                </div>

                {/* Error Message Overlay */}
                {adminError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-md mb-4">
                        <div className="flex justify-between">
                             <span>{adminError}</span>
                             <button onClick={() => setAdminError(null)}>✕</button>
                        </div>
                    </div>
                )}
            </div>
            {/* --- END: HEADER --- */}


            {/* --- OVERLAPPING CONTENT SECTION --- */}
            <div className="px-4 md:px-12 -mt-12 md:-mt-16 pb-12 relative z-10">
                
                {/* Stats Grid (6 Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <StatCard 
                        title="Total Revenue" 
                        value={`₹${stats.total_sales?.toFixed(2) || '0.00'}`} 
                        icon={faDollarSign} 
                        note="Across all vendors"
                        linkTo="/my-account?view=admin-orders"
                    />
                    <StatCard 
                        title="Total Commission" 
                        value={`₹${stats.total_commission?.toFixed(2) || '0.00'}`} 
                        icon={faTachometerAlt} 
                        note="Platform earnings"
                        iconColor={OLIVE_THEME.dark} // Applied Dark Olive Green Here
                    />
                    <StatCard 
                        title="New Orders" 
                        value={stats.new_orders || 0} 
                        icon={faShoppingCart} 
                        note="Pending processing"
                        linkTo="/my-account?view=admin-orders"
                    />
                    <StatCard 
                        title="Total Customers" 
                        value={stats.total_customers || 0} 
                        icon={faUsers} 
                        note="Registered accounts"
                    />
                    <StatCard 
                        title="Active Vendors" 
                        value={stats.total_approved_vendors || 0} 
                        icon={faUsersCog} 
                        note="Selling on platform"
                        linkTo="/my-account?view=admin-vendors"
                    />
                    <StatCard 
                        title="Pending Vendors" 
                        value={stats.pending_vendors || 0} 
                        icon={faHourglassHalf} 
                        note="Awaiting approval"
                        linkTo="/my-account?view=admin-vendors"
                    />
                </div>

                {/* Main Chart Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4 md:mb-0">
                             <FontAwesomeIcon icon={faChartLine} className="mr-2" style={{ color: OLIVE_THEME.main }} />
                             Revenue & Commission Trend
                        </h3>
                        
                        {/* Time Range Selector */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {['1W', '1M', '1Y'].map(range => (
                                <button 
                                    key={range}
                                    onClick={() => setTimeRange(range)} 
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${timeRange === range ? 'bg-[#7A8450] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SalesTrendChart data={finalCharts.sales_over_time} />
                </div>

                {/* Secondary Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <SalesByCategoryChart data={finalCharts.sales_by_category} />
                    <VendorSalesChart data={finalCharts.sales_by_vendor} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2">
                        <FastMovingProductsChart data={finalCharts.fast_moving_products} />
                    </div>
                    <div className="lg:col-span-1">
                        <OrderStatusPieChart data={finalCharts.order_status} />
                    </div>
                </div>

                {/* Top Reviewed Vendors List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FontAwesomeIcon icon={faStar} className="mr-2" style={{ color: OLIVE_THEME.main }} />
                            Top Rated Vendors
                        </h3>
                        <Link to="/my-account?view=admin-vendors" className="text-sm hover:underline" style={{ color: OLIVE_THEME.main }}>
                            View All Vendors <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                    </div>

                    {finalCharts.top_reviewed_vendors && finalCharts.top_reviewed_vendors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {finalCharts.top_reviewed_vendors.map(vendor => (
                                <div key={vendor.id} className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-[#7A8450] transition bg-gray-50">
                                    <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center text-xl font-bold text-gray-400 mr-4">
                                        {vendor.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-800">{vendor.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center mt-1">
                                            <FontAwesomeIcon icon={faCommentDots} className="mr-1" />
                                            {vendor.reviews} Reviews
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs mr-1" />
                                        <span className="font-bold text-sm text-gray-700">{vendor.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 px-4 py-6 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faStar} className="mr-3 text-xl opacity-50" />
                            <div>
                                <p className="font-bold">Review System Pending</p>
                                <p className="text-sm opacity-80">Vendor ratings will appear here once customer reviews are submitted.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;