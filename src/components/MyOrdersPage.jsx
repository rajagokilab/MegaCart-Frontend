// src/pages/MyOrdersPage.jsx
import React, { useState, useEffect } from "react";
import {
  faSignInAlt,
  faHistory,
  faClock,
  faCircleCheck,
  faTruckMoving,
  faBoxOpen,
  faRupeeSign,
  faChevronDown,
  faChevronUp,
  faMapMarkerAlt,
  faShoppingBasket,
  faBarcode,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuthToken } from "../components/auth";
import { useUser } from "../context/UserContext.jsx";

// --- THEME CONSTANTS ---
const THEME_COLOR = "#7A8450"; // Olive Green
const API = import.meta.env.VITE_API_URL;
const MY_ORDERS_URL = `${API}/orders/my-orders/`;

// Helper for Status Badges
const getStatusBadgeData = (status) => {
  switch (status) {
    case "Paid":
      return { icon: faCircleCheck, color: "text-olive-600", bg: "bg-green-100", label: "Processing" };
    case "Shipped":
      return { icon: faTruckMoving, color: "text-blue-600", bg: "bg-blue-100", label: "Shipped" };
    case "Delivered":
      return { icon: faBoxOpen, color: "text-olive-700", bg: "bg-[#E8EAD6]", label: "Delivered" };
    case "Failed":
      return { icon: faSignInAlt, color: "text-red-500", bg: "bg-red-100", label: "Failed" };
    case "Pending":
    default:
      return { icon: faClock, color: "text-yellow-600", bg: "bg-yellow-100", label: "Pending" };
  }
};

// --------------------------------------------------
// ⭐️ OrderTracker Component (Themed & Responsive)
// --------------------------------------------------
const OrderTracker = ({ currentStatus, history }) => {
  const steps = ["Paid", "Shipped", "Delivered"];
  const currentStatusIndex = steps.indexOf(currentStatus);

  const getStepVisuals = (step) => {
    switch (step) {
      case "Paid": return { icon: faShoppingBasket, label: "Placed" }; // Shortened label for mobile
      case "Shipped": return { icon: faTruckMoving, label: "Transit" };
      case "Delivered": return { icon: faCircleCheck, label: "Done" };
      default: return { icon: faClock, label: "Pending" };
    }
  };

  return (
    <div className="w-full px-1 sm:px-4 py-4">
      <div className="flex items-start justify-between w-full max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStatusIndex > index;
          const isCurrent = currentStatusIndex === index;
          const isFuture = currentStatusIndex < index;
          const { icon, label } = getStepVisuals(step);
          const historyRecord = history.find((h) => h.status === step);

          return (
            <React.Fragment key={step}>
              {/* Step Node */}
              <div className="flex flex-col items-center flex-shrink-0 relative z-10 w-16 sm:w-24">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isCurrent || isCompleted
                      ? `bg-[${THEME_COLOR}] text-white border-[${THEME_COLOR}]`
                      : "bg-gray-100 text-gray-400 border-gray-300"
                  }`}
                  style={isCurrent || isCompleted ? { backgroundColor: THEME_COLOR, borderColor: THEME_COLOR } : {}}
                >
                  <FontAwesomeIcon icon={icon} className="text-xs sm:text-sm md:text-xl" />
                </div>
                <p className={`mt-2 text-[10px] sm:text-xs md:text-sm font-bold text-center ${isFuture ? "text-gray-400" : "text-gray-800"}`}>
                  {label}
                </p>
                {historyRecord && (
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5 text-center hidden sm:block">
                    {new Date(historyRecord.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mt-4 sm:mt-5 md:mt-7 mx-1 h-0.5 sm:h-1 rounded bg-gray-200 relative">
                  <div
                    className="absolute top-0 left-0 h-full rounded transition-all duration-500"
                    style={{
                      width: isCompleted ? "100%" : "0%",
                      backgroundColor: THEME_COLOR,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// --------------------------------------------------
// ⭐️ Main Page Component
// --------------------------------------------------
function MyOrdersPage({ onLoginClick }) {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const res = await fetch(MY_ORDERS_URL, {
          headers: { "Content-Type": "application/json", Authorization: `JWT ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4" style={{ borderColor: THEME_COLOR }}></div>
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center space-y-4 p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <FontAwesomeIcon icon={faSignInAlt} className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Please Log In</h2>
          <p className="text-sm text-gray-500 mb-6">You must be logged in to view your order history.</p>
          <button
            onClick={onLoginClick}
            className="w-full text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition transform active:scale-95"
            style={{ backgroundColor: THEME_COLOR }}
          >
            Log In / Register
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: THEME_COLOR }}>
            My Orders
            </h2>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                {orders.length} Order{orders.length !== 1 && 's'}
            </span>
        </div>

        {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6 border border-red-200 text-sm">{error}</div>}

        {orders.length === 0 ? (
          <div className="text-center p-12 rounded-xl shadow-sm border border-dashed border-gray-300 bg-white">
            <div className="text-gray-300 mb-4">
                <FontAwesomeIcon icon={faBoxOpen} size="3x" />
            </div>
            <p className="text-gray-500 text-lg">You haven’t placed any orders yet.</p>
          </div>
        ) : (
          <>
            {/* ---------------------------------------------
                LARGE SCREENS (LG+): TABLE LAYOUT
                --------------------------------------------- */}
            <div className="hidden lg:block overflow-hidden rounded-xl shadow-md border border-gray-200 bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-white text-sm uppercase tracking-wider" style={{ backgroundColor: THEME_COLOR }}>
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold">Date Placed</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Tracking #</th>
                    <th className="p-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const statusData = getStatusBadgeData(order.status);
                    const isExpanded = expandedOrder === order.id;
                    const placedDate = new Date(order.created_at).toLocaleDateString();

                    return (
                      <React.Fragment key={order.id}>
                        <tr 
                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                            onClick={() => toggleExpand(order.id)}
                        >
                          <td className="p-4 font-medium text-gray-700">#{order.razorpay_order_id?.slice(-8) || order.id}</td>
                          <td className="p-4 text-gray-600">{placedDate}</td>
                          <td className="p-4 font-bold text-gray-800">
                            <FontAwesomeIcon icon={faRupeeSign} className="mr-1 text-xs" />
                            {parseFloat(order.total_amount).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit ${statusData.bg} ${statusData.color}`}>
                              <FontAwesomeIcon icon={statusData.icon} className="mr-2" />
                              {statusData.label}
                            </span>
                          </td>
                          <td className="p-4">
                            {order.tracking_number ? (
                                <div className="flex items-center gap-2 text-gray-700 font-mono text-sm bg-gray-100 px-2 py-1 rounded w-fit">
                                    <FontAwesomeIcon icon={faBarcode} className="text-gray-400"/>
                                    {order.tracking_number}
                                </div>
                            ) : (
                                <span className="text-gray-400 text-sm italic">Pending</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-500"
                            >
                              <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                            </button>
                          </td>
                        </tr>

                        {/* Desktop Expanded Details */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="6" className="p-0">
                              <div className="bg-[#FDFDFD] p-6 border-b border-gray-200 shadow-inner">
                                <ExpandedOrderDetails order={order} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ---------------------------------------------
                MOBILE & TABLET VIEW (< LG): CARD LAYOUT
                --------------------------------------------- */}
            <div className="lg:hidden space-y-4">
              {orders.map((order) => {
                const statusData = getStatusBadgeData(order.status);
                const isExpanded = expandedOrder === order.id;
                const placedDate = new Date(order.created_at).toLocaleDateString();

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div 
                        className="p-4 flex justify-between items-start cursor-pointer active:bg-gray-50 transition-colors"
                        onClick={() => toggleExpand(order.id)}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-sm sm:text-base">#{order.razorpay_order_id?.slice(-8) || order.id}</h4>
                        </div>
                        <span className="text-xs text-gray-500">{placedDate}</span>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold w-fit mt-1 ${statusData.bg} ${statusData.color}`}>
                          {statusData.label}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-800 flex items-center justify-end text-sm sm:text-base">
                          <FontAwesomeIcon icon={faRupeeSign} className="mr-1 text-xs" />
                          {parseFloat(order.total_amount).toFixed(2)}
                        </p>
                        <FontAwesomeIcon 
                            icon={isExpanded ? faChevronUp : faChevronDown} 
                            className="text-gray-400 mt-3 p-1"
                        />
                      </div>
                    </div>
                    
                    {/* Tracking Number Row (Mobile) */}
                    <div className="px-4 pb-3 flex items-center justify-between text-xs sm:text-sm text-gray-600 border-b border-gray-50">
                        <span>Tracking:</span>
                        {order.tracking_number ? (
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-black">
                                {order.tracking_number}
                            </span>
                        ) : (
                            <span className="italic text-gray-400">Pending</span>
                        )}
                    </div>

                    {/* Mobile Expanded Details */}
                    {isExpanded && (
                      <div className="bg-gray-50 p-3 sm:p-4 border-t border-gray-100">
                        <ExpandedOrderDetails order={order} isMobile={true} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------
// ⭐️ Sub-Component: Expanded Details (Items + Address + Tracker)
// --------------------------------------------------
function ExpandedOrderDetails({ order, isMobile }) {
  // Determine grid columns: 1 column for mobile/tablet, 3 columns for Desktop
  const gridClass = "grid grid-cols-1 lg:grid-cols-3 gap-6";

  return (
    <div className="animate-fadeIn">
      {/* 1. Tracker */}
      <div className="mb-6 sm:mb-8 pt-2">
        <OrderTracker currentStatus={order.status} history={order.history || []} />
      </div>

      <div className={gridClass}>
        
        {/* 2. Items List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <h5 className="font-bold mb-3 text-gray-700 border-b pb-2 text-sm sm:text-base" style={{ borderColor: THEME_COLOR }}>
            Items Purchased
          </h5>
          <div className="space-y-4">
            {order.items.map((item) => {
                // --- PRICE & DISCOUNT LOGIC ---
                const paidPrice = parseFloat(item.price);
                // Assumption: item.product.price is current/original MRP
                const originalPrice = parseFloat(item.product?.price || 0);
                const hasDiscount = originalPrice > paidPrice;
                const discountPercent = hasDiscount ? Math.round(((originalPrice - paidPrice) / originalPrice) * 100) : 0;

                return (
                  <div key={item.id} className="flex justify-between items-start group">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.product?.image_url || "https://placehold.co/60x60?text=Img"}
                          alt={item.product?.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-gray-200"
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base text-gray-800 line-clamp-2">
                          {item.product?.name || "Product Unavailable"}
                        </p>
                        
                        {/* --- PRICE BREAKDOWN --- */}
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            Qty: {item.quantity} x 
                            {hasDiscount ? (
                                <span className="ml-1">
                                    <span className="line-through text-gray-400 mr-1">₹{originalPrice.toFixed(2)}</span>
                                    <span className="font-bold text-gray-700">₹{paidPrice.toFixed(2)}</span>
                                    <span className="ml-2 text-[10px] text-green-600 bg-green-50 px-1 rounded border border-green-100 font-bold">{discountPercent}% OFF</span>
                                </span>
                            ) : (
                                <span className="ml-1 font-medium">₹{paidPrice.toFixed(2)}</span>
                            )}
                        </div>
                      </div>
                    </div>
                    <p className="font-medium text-sm sm:text-base text-gray-700 whitespace-nowrap ml-2">
                      ₹{(paidPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
            })}
          </div>
        </div>

        {/* 3. Shipping Info */}
        <div className="lg:col-span-1 order-1 lg:order-2 bg-white p-4 rounded-lg border border-gray-200 h-fit shadow-sm">
          <h5 className="font-bold mb-3 text-gray-700 flex items-center text-sm sm:text-base">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" style={{ color: THEME_COLOR }} />
            Shipping Address
          </h5>
          <div className="text-sm text-gray-600 space-y-1">
            {order.shipping_address && typeof order.shipping_address === "object" ? (
              <>
                <p className="font-bold text-gray-800">{order.shipping_address.name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.zip}</p>
                <p className="mt-2 text-xs text-gray-400 border-t pt-2">Phone: {order.shipping_address.phone}</p>
              </>
            ) : (
              <p>{order.shipping_address || "No address details available."}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default MyOrdersPage;