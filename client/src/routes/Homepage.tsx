import React from 'react';
import { Link } from "react-router-dom";
import { theme } from '../utils/theme';
import EventSlideshow from '../components/EventSlideshow';

const Homepage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Event Slideshow */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <h1 className="text-5xl font-bold leading-tight">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                  UniBeez
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Empowering university entrepreneurs through digital marketplace solutions. 
                Connect, grow, and succeed in the university business ecosystem.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/register"
                  className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
                <Link 
                  to="/about"
                  className="px-8 py-3 bg-white text-blue-600 rounded-full font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            {/* Right Column - Event Slideshow */}
            <div className="relative">
              <div className="w-full">
                <EventSlideshow />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-100 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-purple-100 rounded-full filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose UniBeez?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your one-stop platform for university entrepreneurship and marketplace solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Connect with Customers",
                description: "Reach potential customers within and beyond your university community.",
                icon: "🤝",
                color: "bg-blue-50 text-blue-600"
              },
              {
                title: "Grow Your Business",
                description: "Access tools and resources to help scale your entrepreneurial venture.",
                icon: "📈",
                color: "bg-green-50 text-green-600"
              },
              {
                title: "Build Your Network",
                description: "Connect with like-minded entrepreneurs and potential collaborators.",
                icon: "🌐",
                color: "bg-purple-50 text-purple-600"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="relative group p-8 rounded-2xl transition-all duration-300 hover:shadow-xl bg-white border border-gray-100 hover:border-transparent"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join UniBeez today and become part of a thriving university business community.
          </p>
          <Link 
            to="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-full font-medium hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Homepage; 