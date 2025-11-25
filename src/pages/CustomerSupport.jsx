// src/pages/CustomerSupport.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faClock, faHeadset } from "@fortawesome/free-solid-svg-icons";
import bgImage from "../assets/E2.jpg"; // ✅ Your background image

// Theme Constants
const THEME_COLOR = "#7A8450"; // Olive Green
const THEME_DARK = "#3E4B26";  // Dark Olive
const THEME_LIGHT = "#F3F4ED"; // Light Beige

function CustomerSupport() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* --- Background Overlay for readability --- */}
      <div className="absolute inset-0 bg-[#3E4B26]/70 backdrop-blur-sm"></div>

      {/* --- Main Card Container --- */}
      <div className="relative z-10 bg-white/95 rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">
        
        {/* --- LEFT COLUMN: Image / Visual --- */}
        <div className="md:w-1/2 relative min-h-[300px] md:min-h-full">
          <img 
            src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=1000&auto=format&fit=crop" 
            alt="Customer Support Team" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Olive Tint Overlay on Image */}
          <div className="absolute inset-0 bg-[#7A8450]/30 mix-blend-multiply"></div>
          
          <div className="absolute bottom-0 left-0 p-8 text-white bg-gradient-to-t from-black/80 to-transparent w-full">
            <h3 className="text-2xl font-bold mb-1">We're here to help</h3>
            <p className="text-white/90 text-sm">Dedicated support for your organic lifestyle.</p>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Content --- */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: THEME_COLOR }}>
                <FontAwesomeIcon icon={faHeadset} className="text-xl" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: THEME_DARK }}>
                Customer Support
            </h1>
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Have a question about your order, our products, or shipping? 
            Our team is ready to assist you. Reach out to us via the channels below.
          </p>

          {/* --- Contact Details Grid --- */}
          <div className="space-y-4">
            
            {/* Email Item */}
            <div className="flex items-start p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow" style={{ backgroundColor: THEME_LIGHT }}>
              <div className="mt-1 bg-white p-2 rounded-full text-lg shadow-sm" style={{ color: THEME_COLOR }}>
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Email Us</h3>
                <a
                  href="mailto:support@megacart.com"
                  className="text-lg font-medium hover:underline block break-all"
                  style={{ color: THEME_COLOR }}
                >
                  support@vetricart.com
                </a>
                <p className="text-xs text-gray-500 mt-1">Response time: Within 24 hours</p>
              </div>
            </div>

            {/* Phone Item */}
            <div className="flex items-start p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow" style={{ backgroundColor: THEME_LIGHT }}>
              <div className="mt-1 bg-white p-2 rounded-full text-lg shadow-sm" style={{ color: THEME_COLOR }}>
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Call Us</h3>
                <a
                  href="tel:+911234567890"
                  className="text-lg font-medium hover:underline block"
                  style={{ color: THEME_COLOR }}
                >
                  +91-1234567890
                </a>
                <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9AM - 6PM</p>
              </div>
            </div>

            {/* Hours Item */}
            <div className="flex items-start p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow" style={{ backgroundColor: THEME_LIGHT }}>
              <div className="mt-1 bg-white p-2 rounded-full text-lg shadow-sm" style={{ color: THEME_COLOR }}>
                <FontAwesomeIcon icon={faClock} />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Working Hours</h3>
                <p className="text-gray-700 font-medium">Monday – Friday</p>
                <p className="text-sm text-gray-500">09:00 AM – 06:00 PM</p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center md:text-left">
             <p className="text-gray-500 text-sm italic">
                "Our goal is to provide the freshest products with the warmest service."
             </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default CustomerSupport;