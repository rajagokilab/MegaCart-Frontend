import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import shopBanner1 from '../assets/shopBanner1.jpg';
import shopBanner2 from '../assets/shopBanner2.jpg';
import shopBanner3 from '../assets/shopBanner3.jpg';
import shopBanner4 from '../assets/banner4.gif';
import shopBanner5 from '../assets/banner2.jpg';
import shopBanner6 from '../assets/banner3.jpg';

const CATEGORY_API_URL = `${import.meta.env.VITE_API_URL}/categories/`;
const THEME_COLOR = '#7A8450';

// --- NEW BANNER DATA ARRAY ---
// We create an array of objects to hold the image and its text
const bannerData = [
  {
    src: shopBanner1,
    alt: 'Seasonal sale advertisement',
    title: 'Spring Collection is Here!',
    text: 'Discover fresh styles and vibrant colors for the new season.'
  },
  {
    src: shopBanner2,
    alt: 'Artisanal goods display',
    title: 'Handcrafted with Care',
    text: 'Explore unique, artisanal products made by skilled craftsmen.'
  },
  {
    src: shopBanner3,
    alt: 'New arrivals promotion',
    title: 'New Arrivals Daily',
    text: 'Check out the latest trends and must-have items.'
  },
  {
    src: shopBanner4,
    alt: 'Limited time offer promotion',
    title: 'Limited Time Offer!',
    text: 'Get 50% off select items. Shop now before it\'s gone!'
  },
  {
    src: shopBanner5,
    alt: 'Sustainable products showcase',
    title: 'Shop Sustainable',
    text: 'Find eco-friendly and sustainable choices for your home.'
  },
  {
    src: shopBanner6,
    alt: 'Gift ideas',
    title: 'Find the Perfect Gift',
    text: 'Browse our curated gift guides for every occasion.'
  }
];

function ShopPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(CATEGORY_API_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setCategories(data.results || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <p className="text-center py-5">Loading categories...</p>;
  if (error) return <p className="text-center py-5 text-danger">Error: {error}</p>;
  if (categories.length === 0) return <p className="text-center py-5">No categories found.</p>;

  return (
    <div className="container py-4">

      {/* Banner Carousel - UPDATED */}
      <div className="row mb-5">
        <div className="col-12">
          <div id="bannerCarousel" className="carousel slide carousel-fade rounded-lg shadow-lg overflow-hidden" data-bs-ride="carousel" data-bs-interval="1000">
            <div className="carousel-inner">
              
              {/* We now map over the bannerData array */}
              {bannerData.map((banner, index) => (
                <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                  <img src={banner.src} alt={banner.alt} className="d-block w-100" style={{ height: '300px', objectFit: 'cover' }} />
                  
                  {/* --- ADDED CAPTION --- */}
                  <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
                    <h5 className="fw-bold">{banner.title}</h5>
                    <p>{banner.text}</p>
                  </div>
                  {/* --- END ADDED CAPTION --- */}

                </div>
              ))}

            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon bg-dark rounded-circle"></span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon bg-dark rounded-circle"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <h2 className="fw-bold mb-2">Browse by Category</h2>
          <div className="mx-auto mb-3" style={{ height: '3px', width: '100px', backgroundColor: THEME_COLOR }}></div>
        </div>

        {categories.map(category => (
          <div key={category.id} className="col-6 col-md-3 col-lg-2 mb-3">
            <Link
              to={`/category/${category.id}`} // Pass category ID
              className="text-decoration-none"
            >
              <div className="card h-100 shadow-sm border-0 rounded-lg text-center transition-all hover:shadow-lg">
                <img
                  src={category.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={category.name}
                  className="card-img-top"
                  style={{ height: '120px', objectFit: 'cover' }}
                />
                <div className="card-body p-2">
                  <h6 className="card-title fw-bold text-truncate" style={{ color: THEME_COLOR }}>
                    {category.name}
                  </h6>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .transition-all { transition: all 0.3s ease-in-out; }
        .hover\\:shadow-lg:hover { box-shadow: 0 1rem 3rem rgba(0,0,0,0.175); transform: translateY(-3px); }
      `}</style>
    </div>
  );
}

export default ShopPage;