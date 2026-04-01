import React from 'react';

const History = () => {
  return (
    <section className="relative bg-white py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Dekorativ xətt */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gray-200 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        {/* Məzmun hissəsi */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Our History
          </h2>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Sed id interdum urna. Nam ac elit a ante commodo tristique, condimentum vehicula a hendrerit ac nisi. hendrerit ac nisi Lorem ipsum dolor sit amet Vestibulum imperdiet nibh vel magna lacinia ultrices. Sed id interdum urna.
          </p>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Nullam lacinia faucibus risus, a euismod lorem tincidunt id. Donec maximus placerat tempor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse faucibus sed dolor eget posuere. Sed id interdum urna. Nam ac elit a ante commodo tristique. Duis lacus eros, condimentum a vehicula, a hendrerit ac nisi Lorem ipsum dolor sit amet.
          </p>

          {/* Mobil: tam genişlik düyməsi */}
          <button
            type="button"
            className="w-full sm:w-auto inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            START NOW
          </button>
        </div>

        {/* Şəkil hissəsi */}
        <div className="flex items-center justify-center relative mt-4 md:mt-0">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl blur-lg opacity-50"></div>
          <img
            src="https://res.cloudinary.com/dwdvr0oxa/image/upload/v1740241625/1_xxbets.jpg"
            alt="Tarihçemizi anlatan görsel"
            className="w-full h-auto object-cover rounded-xl shadow-2xl relative z-10"
          />
        </div>
      </div>
    </section>
  );
};

export default History;