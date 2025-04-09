import React from 'react';

export default function ServicesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our AI Consulting Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* AI Strategy Development */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Strategy Development</h3>
            <p className="text-gray-600">We help you create a comprehensive AI roadmap aligned with your business objectives.</p>
          </div>
          
          {/* Process Automation */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Process Automation</h3>
            <p className="text-gray-600">Identify and automate repetitive tasks to boost efficiency and reduce operational costs.</p>
          </div>
          
          {/* Custom AI Solutions */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom AI Solutions</h3>
            <p className="text-gray-600">Tailored AI implementations designed specifically for your unique business needs.</p>
          </div>
        </div>
      </div>
    </section>
  );
}