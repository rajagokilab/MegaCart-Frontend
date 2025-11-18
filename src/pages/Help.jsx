// src/pages/Help.jsx
import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faMinus, faQuestionCircle, faHeadset } from "@fortawesome/free-solid-svg-icons";

// ✅ make sure path is correct for your specific project
import bgImage from "../assets/E2.jpg"; 
import faqHeaderImage from "../assets/FAQ-Header.jpg"; // Placeholder for an image at the top of the FAQ section
import contactSupportImage from "../assets/headphones.jpg"; // Placeholder for an image in the contact section


const API_BASE = import.meta.env.VITE_API_URL;

// --- THEME CONSTANTS ---
const THEME_COLOR = "#7A8450"; // Olive Green
const THEME_DARK = "#3E4B26";  // Dark Olive
const THEME_LIGHT = "#F3F4ED"; // Light Beige for backgrounds/accents

const faqs = [
  {
    category: "Orders",
    icon: "📦", // Emoji for category icon
    items: [
      { question: "How do I track my order?", answer: "You can easily track your order by visiting the 'My Orders' page in your account or by using the dedicated 'Track Order' link in the footer. Simply enter your order ID to see the real-time status and estimated delivery." },
      { question: "Can I modify or cancel my order?", answer: "Orders can typically be modified or cancelled within 24 hours of purchase, provided they have not yet been shipped. Please contact our support team immediately with your order details for assistance." },
      { question: "What if my order is delayed?", answer: "While we strive for timely deliveries, unforeseen circumstances can cause delays. If your order is significantly delayed, please check your tracking information first. If there's no update, contact our support team for further investigation." },
    ],
  },
  {
    category: "Returns & Refunds",
    icon: "↩️",
    items: [
      { question: "How do I return a product?", answer: "You can initiate a return for most products within 30 days of delivery. Please visit our 'Returns Portal' linked in the footer, or go to your 'My Orders' page and select the item you wish to return. Follow the on-screen instructions." },
      { question: "When will I receive my refund?", answer: "Refunds are processed promptly upon receiving and inspecting the returned product. This usually takes 5-7 business days to reflect in your original payment method. You will receive an email notification once your refund is issued." },
      { question: "What if I received a damaged or incorrect item?", answer: "We apologize for any inconvenience! Please contact our customer support within 48 hours of delivery with photos of the damaged or incorrect item. We will arrange for a replacement or a full refund immediately." },
    ],
  },
  {
    category: "Payments & Security",
    icon: "💳",
    items: [
      { question: "What payment methods do you accept?", answer: "We accept a wide range of payment options including all major credit and debit cards (Visa, MasterCard, American Express), PayPal, and popular UPI services." },
      { question: "Is my payment information secure?", answer: "Absolutely. We prioritize your security. All transactions are processed through secure, encrypted payment gateways using industry-standard SSL technology to protect your personal and financial data." },
      { question: "Why was my payment declined?", answer: "Payment declines can occur for various reasons. Please check your card details, ensure sufficient funds, and verify any billing address information. If the issue persists, contact your bank or try an alternative payment method." },
    ],
  },
  {
    category: "Account & Technical",
    icon: "👤",
    items: [
      { question: "How do I create an account?", answer: "Click on the 'Sign Up' or 'Register' link in the top navigation bar. You'll be prompted to enter your email, create a password, and provide some basic information." },
      { question: "I forgot my password, what do I do?", answer: "On the login page, click 'Forgot Password'. Enter your registered email address, and we'll send you a link to reset your password." },
      { question: "Having trouble with the website?", answer: "Try clearing your browser's cache and cookies or using a different browser. If the problem continues, please provide details to our support team so we can investigate." },
    ],
  },
];

function Help() {
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null); // State to manage open/close of FAQ details

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/support/create/`, formData);
      setSuccess(true);
      setError("");
      setFormData({ name: "", email: "", message: "" }); // Reset form after success
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSuccess(false);
    }
  };

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed flex justify-center items-start py-8 sm:py-16 px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl bg-white/90 rounded-2xl shadow-2xl p-6 md:p-10 lg:p-14 mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-16 bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="md:w-1/2 lg:w-2/3 text-left">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3" style={{ color: THEME_DARK }}>
              How Can We Help You?
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed max-w-xl">
              Find instant answers to your questions, or reach out to our dedicated support team.
            </p>
          </div>
          <div className="md:w-1/2 lg:w-1/3 flex justify-center">
            {/* You can replace faqHeaderImage with a more relevant one */}
            <img src={faqHeaderImage || "https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=2670&auto=format&fit=crop"} alt="Help & Support" className="max-h-48 md:max-h-64 rounded-lg shadow-md object-cover" />
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="mb-12 bg-white rounded-xl shadow-inner p-5 border border-gray-100">
          <label htmlFor="faq-search" className="block text-center text-lg font-semibold text-gray-700 mb-3">
            <FontAwesomeIcon icon={faSearch} className="mr-2" style={{ color: THEME_COLOR }} />
            Search for an answer:
          </label>
          <input
            id="faq-search"
            type="text"
            placeholder="e.g., 'track order', 'return policy', 'payment methods'..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-offset-1 focus:outline-none text-lg text-gray-700"
            style={{ borderColor: THEME_COLOR, "--tw-ring-color": THEME_COLOR }}
          />
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: THEME_DARK }}>
            <FontAwesomeIcon icon={faQuestionCircle} className="mr-3" style={{ color: THEME_COLOR }} />
            Frequently Asked Questions
          </h2>
          {filteredFaqs.length === 0 && (
            <div className="text-center text-gray-500 text-lg py-8">
              No FAQs found matching your search.
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaqs.map((category, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-bold mb-5 flex items-center" style={{ color: THEME_COLOR }}>
                  <span className="text-2xl mr-3">{category.icon}</span>
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.items.map((item, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-100 last:border-b-0 pb-3"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === `${idx}-${i}` ? null : `${idx}-${i}`)}
                        className="w-full text-left flex justify-between items-center text-lg font-semibold text-gray-800 hover:text-gray-900 transition-colors duration-200"
                      >
                        {item.question}
                        <FontAwesomeIcon
                          icon={openFaq === `${idx}-${i}` ? faMinus : faPlus}
                          className="text-lg ml-3 flex-shrink-0"
                          style={{ color: THEME_COLOR }}
                        />
                      </button>
                      {openFaq === `${idx}-${i}` && (
                        <p className="text-gray-600 mt-2 pl-1 leading-relaxed animate-fadeIn text-sm">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 flex flex-col lg:flex-row gap-10 items-center justify-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h3 className="text-3xl font-bold mb-4" style={{ color: THEME_DARK }}>
              <FontAwesomeIcon icon={faHeadset} className="mr-3" style={{ color: THEME_COLOR }} />
              Can't find your answer?
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md lg:max-w-none mx-auto lg:mx-0">
              Our friendly support team is here to help! Fill out the form below, and we'll get back to you as soon as possible.
            </p>
            <img 
                src={contactSupportImage || "https://images.unsplash.com/photo-1596526131083-e8c782266d2a?q=80&w=2670&auto=format&fit=crop"} 
                alt="Contact Support" 
                className="w-full max-w-sm mx-auto lg:mx-0 rounded-lg shadow-md border border-gray-100"
            />
          </div>

          <div className="lg:w-1/2 w-full max-w-md">
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg mb-6 text-center">
                Message sent successfully! We'll be in touch shortly.
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6 text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:outline-none text-gray-800"
                  style={{ "--tw-ring-color": THEME_COLOR, borderColor: THEME_COLOR }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:outline-none text-gray-800"
                  style={{ "--tw-ring-color": THEME_COLOR, borderColor: THEME_COLOR }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  name="message"
                  rows="5"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:outline-none text-gray-800 resize-y"
                  style={{ "--tw-ring-color": THEME_COLOR, borderColor: THEME_COLOR }}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full text-white py-3 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                style={{ backgroundColor: THEME_COLOR }}
              >
                Submit Your Request
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>© 2025 VetriCart. All rights reserved.</p>
          <p className="mt-1">Organisation number: 123456-7890</p>
        </div>
      </div>
    </div>
  );
}

export default Help;
