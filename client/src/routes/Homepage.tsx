import React from 'react';
import { Link } from "react-router-dom";
import { theme } from '../utils/theme';
import EventSlideshow from '../components/EventSlideshow';

const Homepage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden" style={{ 
        background: `linear-gradient(to bottom, ${theme.colors.accent.yellow}20, ${theme.colors.background.default})` 
      }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold">
                Welcome to{' '}
                <span style={{ 
                  background: `linear-gradient(to right, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  UniBeez
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Empowering university entrepreneurs through digital marketplace solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/learn" 
                  className="px-6 py-3 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: theme.colors.secondary.main }}
                >
                  Get Started
                </Link>
                <Link 
                  to="/about" 
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="w-full max-w-xl mx-auto">
                <EventSlideshow />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose UniBeez?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive platform for university entrepreneurs to showcase their products and services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Connect with Customers",
                description: "Reach potential customers within and beyond your university community.",
                color: theme.colors.primary.main
              },
              {
                title: "Grow Your Business",
                description: "Access tools and resources to help scale your entrepreneurial venture.",
                color: theme.colors.secondary.main
              },
              {
                title: "Build Your Network",
                description: "Connect with like-minded entrepreneurs and potential collaborators.",
                color: theme.colors.accent.green
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}30` }}>
                  <span className="text-2xl" style={{ color: feature.color }}>✓</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: `${theme.colors.accent.green}20` }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join UniBeez today and take your university business to the next level.
          </p>
          <Link 
            to="/register" 
            className="px-8 py-4 text-white rounded-lg font-medium transition-colors inline-block"
            style={{ backgroundColor: theme.colors.secondary.main }}
          >
            Join UniBeez
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Homepage; 