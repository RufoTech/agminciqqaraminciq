import React from 'react';

const Shipping = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Free Shipping */}
          <div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-blue-600 bg-blue-50 p-4 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="w-10 h-10"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M3.75 5.25h16.5m-16.5 0a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 003.75 20.25h16.5a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25m-16.5 0L6 3.75m0 0h12l2.25 1.5" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">100% Free Shipping</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We ship all our products for free as long as you buying within the USA.
            </p>
          </div>

          {/* 24/7 Support */}
          <div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-green-600 bg-green-50 p-4 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="w-10 h-10"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M12 6v6l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our support team is extremely active, you will get response within 2 minutes.
            </p>
          </div>

          {/* 30 Day Return */}
          <div className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-purple-600 bg-purple-50 p-4 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="w-10 h-10"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M10.125 6.75h3.75m-3.75 4.5h3.75m-7.5 4.5h11.25m-11.25 0a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 018.25 3h7.5A2.25 2.25 0 0118 5.25v8.25m-11.25 4.5v3m11.25-3v3" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">30 Day Return</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our 30 day return program is open from customers, just fill up a simple form.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shipping;