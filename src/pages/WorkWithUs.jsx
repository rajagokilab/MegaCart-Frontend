import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBriefcase, faCode, faHandshake, faLaptopHouse, faRocket } from '@fortawesome/free-solid-svg-icons';

// --- THEME CONSTANTS ---
const THEME_COLOR = '#7A8450'; // Olive Green
const THEME_HOVER = '#697240'; // Darker Olive
const THEME_BG_LIGHT = '#F7F8F2'; // Light Beige
const THEME_DARK = '#3E4B26'; // Dark Olive
// --- THEME CONSTANTS ---

const jobs = [
    { 
        title: 'Frontend Developer (React)', 
        location: 'Stockholm, Sweden', 
        icon: faCode,
        description: 'Design, develop, and maintain our customer-facing platform using React and modern component libraries. Requires 2+ years of hands-on experience.',
        type: 'Full-Time'
    },
    { 
        title: 'Customer Support Representative', 
        location: 'Remote (EU Time Zone)', 
        icon: faHandshake,
        description: 'Serve as the first point of contact for customer inquiries, providing friendly and effective support via chat and email. Excellent communication skills are essential.',
        type: 'Part-Time'
    },
    { 
        title: 'Digital Marketing Specialist', 
        location: 'Stockholm, Sweden', 
        icon: faRocket,
        description: 'Develop and execute data-driven digital campaigns across social media and search engines to drive growth and brand awareness.',
        type: 'Full-Time'
    }
];

function WorkWithUs() {
    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="text-center mb-10 sm:mb-12">
                    {/* Responsive Text Size: 4xl on mobile, 5xl on medium screens and up */}
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ color: THEME_COLOR }}>
                        Join the VetriCart Team 🤝
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                        We are a growing e-commerce platform dedicated to sustainability and quality. Join us in building a greener future!
                    </p>
                </div>

                {/* --- JOB LISTING --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job, idx) => (
                        <div key={idx} className="flex flex-col">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                
                                {/* Header / Icon */}
                                <div className="mb-4 flex items-center gap-4 border-b pb-3" style={{ borderColor: THEME_COLOR }}>
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0" style={{ backgroundColor: THEME_COLOR }}>
                                        <FontAwesomeIcon icon={job.icon} />
                                    </div>
                                    <h2 className="text-xl font-bold" style={{ color: THEME_DARK }}>{job.title}</h2>
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{job.description}</p>
                                
                                {/* Details */}
                                <div className="space-y-2 mb-6 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                                        <span className="font-semibold">{job.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-gray-400" />
                                        <span>{job.type}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FontAwesomeIcon icon={job.location.includes('Remote') ? faLaptopHouse : faBriefcase} className="mr-2 text-gray-400" />
                                        <span>{job.location.includes('Remote') ? 'Flexible Work' : 'In Office'}</span>
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <button 
                                    className="w-full py-3 rounded-lg text-white font-bold transition-colors shadow-md"
                                    style={{ backgroundColor: THEME_COLOR }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = THEME_HOVER}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* --- FOOTER CTA / CULTURE SECTION --- */}
                <div className="mt-12 sm:mt-16 text-center bg-[#fcfcfc] rounded-xl p-6 sm:p-8 shadow-inner border border-gray-100">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: THEME_DARK }}>
                        Our Culture & Benefits
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto mb-6">
                        We offer competitive salaries, flexible working hours, and a focus on professional development. Join a team where your contributions make a real difference!
                    </p>
                    <button 
                        className="py-3 px-8 rounded-full text-white font-bold text-lg shadow-lg transition transform hover:scale-105"
                        style={{ backgroundColor: THEME_COLOR }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = THEME_HOVER}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
                    >
                        Learn More
                    </button>
                </div>

            </div>
        </div>
    );
}

export default WorkWithUs;