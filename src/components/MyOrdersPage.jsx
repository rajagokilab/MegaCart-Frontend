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
const THEME_BG_LIGHT = "#F7F8F2"; // Very light olive/beige for backgrounds
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
// ⭐️ OrderTracker Component (Themed)
// --------------------------------------------------
const OrderTracker = ({ currentStatus, history }) => {
  const steps = ["Paid", "Shipped", "Delivered"];
  const currentStatusIndex = steps.indexOf(currentStatus);

  const getStepVisuals = (step) => {
    switch (step) {
      case "Paid": return { icon: faShoppingBasket, label: "Order Placed" };
      case "Shipped": return { icon: faTruckMoving, label: "In Transit" };
      case "Delivered": return { icon: faCircleCheck, label: "Completed" };
      default: return { icon: faClock, label: "Pending" };
    }
  };

  return (
    <div className="flex items-start justify-between px-2 md:px-10 w-full max-w-4xl mx-auto">
      {steps.map((step, index) => {
        const isCompleted = currentStatusIndex > index;
        const isCurrent = currentStatusIndex === index;
        const isFuture = currentStatusIndex < index;
        const { icon, label } = getStepVisuals(step);
        const historyRecord = history.find((h) => h.status === step);

        return (
          <React.Fragment key={step}>
            {/* Step Node */}
            <div className="flex flex-col items-center flex-shrink-0 relative z-10">
              <div
                className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isCurrent || isCompleted
                    ? `bg-[${THEME_COLOR}] text-white border-[${THEME_COLOR}]`
                    : "bg-gray-100 text-gray-400 border-gray-300"
                }`}
                style={isCurrent || isCompleted ? { backgroundColor: THEME_COLOR, borderColor: THEME_COLOR } : {}}
              >
                <FontAwesomeIcon icon={icon} className="text-sm md:text-xl" />
              </div>
              <p className={`mt-2 text-xs md:text-sm font-bold ${isFuture ? "text-gray-400" : "text-gray-800"}`}>
                {label}
              </p>
              {historyRecord && (
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                  {new Date(historyRecord.timestamp).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mt-5 md:mt-7 mx-2 h-1 rounded bg-gray-200 relative">
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
      <div className="flex flex-col items-center justify-center h-screen text-center space-y-4 p-4">
        <div className="bg-yellow-50 text-yellow-800 p-8 rounded-xl shadow-lg max-w-md border border-yellow-200">
          <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
          <p className="text-sm mb-6">You must be logged in to view your order history.</p>
          <button
            onClick={onLoginClick}
            className="text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
            style={{ backgroundColor: THEME_COLOR }}
          >
            <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
            Log In / Register
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 lg:px-12 font-sans bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8" style={{ color: THEME_COLOR }}>
          My Orders
        </h2>

        {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6 border border-red-200">{error}</div>}

        {orders.length === 0 ? (
          <div className="text-center p-10 rounded-xl shadow-sm border border-dashed border-gray-300 bg-white">
            <p className="text-gray-500 text-lg">You haven’t placed any orders yet.</p>
          </div>
        ) : (
          <>
            {/* ---------------------------------------------
                DESKTOP VIEW: TABLE LAYOUT
               --------------------------------------------- */}
            <div className="hidden md:block overflow-hidden rounded-xl shadow-md border border-gray-200 bg-white">
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
                            className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}
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
                              onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
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
                MOBILE VIEW: CARD LAYOUT
               --------------------------------------------- */}
            <div className="md:hidden space-y-4">
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
                        className="p-4 flex justify-between items-start cursor-pointer"
                        onClick={() => toggleExpand(order.id)}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800">#{order.razorpay_order_id?.slice(-8) || order.id}</h4>
                            <span className="text-xs text-gray-500">• {placedDate}</span>
                        </div>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${statusData.bg} ${statusData.color}`}>
                          {statusData.label}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 flex items-center justify-end">
                          <FontAwesomeIcon icon={faRupeeSign} className="mr-1 text-xs" />
                          {parseFloat(order.total_amount).toFixed(2)}
                        </p>
                        <FontAwesomeIcon 
                            icon={isExpanded ? faChevronUp : faChevronDown} 
                            className="text-gray-400 mt-2"
                        />
                      </div>
                    </div>
                    
                    {/* Tracking Number Row (Mobile) */}
                    <div className="px-4 pb-3 flex items-center justify-between text-sm text-gray-600 border-b border-gray-50">
                        <span>Tracking ID:</span>
                        {order.tracking_number ? (
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs text-black">
                                {order.tracking_number}
                            </span>
                        ) : (
                            <span className="italic text-gray-400 text-xs">Pending</span>
                        )}
                    </div>

                    {/* Mobile Expanded Details */}
                    {isExpanded && (
                      <div className="bg-gray-50 p-4 border-t border-gray-100">
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
  return (
    <div className="animate-fadeIn">
      {/* 1. Tracker */}
      <div className="mb-8 pt-2">
        <OrderTracker currentStatus={order.status} history={order.history || []} />
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        
        {/* 2. Items List */}
        <div className="col-span-2">
          <h5 className="font-bold mb-3 text-gray-700 border-b pb-2" style={{ borderColor: THEME_COLOR }}>
            Items Purchased
          </h5>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.product?.image_url || "https://placehold.co/60x60?text=Img"}
                    alt={item.product?.name}
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-800 line-clamp-1">
                      {item.product?.name || "Product Unavailable"}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.price}</p>
                  </div>
                </div>
                <p className="font-medium text-sm text-gray-700">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Shipping Info */}
        <div className="col-span-1 bg-white p-4 rounded-lg border border-gray-200 h-fit">
          <h5 className="font-bold mb-3 text-gray-700 flex items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" style={{ color: THEME_COLOR }} />
            Shipping Address
          </h5>
          <div className="text-sm text-gray-600 space-y-1">
            {order.shipping_address && typeof order.shipping_address === "object" ? (
              <>
                <p className="font-bold text-gray-800">{order.shipping_address.name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.zip}</p>
                <p className="mt-2 text-xs text-gray-400">Phone: {order.shipping_address.phone}</p>
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