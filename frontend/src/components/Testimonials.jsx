import React from 'react';
import { Star, ChevronUp } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      rating: 5,
      title: "Quality Of Clothing!",
      text: "Anvouge's fashion collection is a game-changer! Their unique and trendy pieces have completely transformed my style. It's comfortable, stylish, and always on-trend.",
      author: "Elizabeth A.",
      date: "August 13, 2024"
    },
    {
      id: 2,
      rating: 5,
      title: "Customer Service!",
      text: "I absolutely love this shop! The products are high-quality and the customer service is excellent. I always leave with exactly what I need and a smile on my face.",
      author: "Christin H.",
      date: "August 13, 2024"
    },
    {
      id: 3,
      rating: 5,
      title: "Quality Of Clothing!",
      text: "I can't get enough of Anvouge's high-quality clothing. It's comfortable, stylish, and always on-trend. The products are high-quality and the customer service is excellent.",
      author: "Emily G.",
      date: "August 13, 2024"
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          What People Are Saying
        </h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, index) => (
                  <Star 
                    key={index} 
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-4">
                {testimonial.title}
              </h3>

              {/* Review Text */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author and Date */}
              <div>
                <p className="font-semibold text-gray-900">
                  {testimonial.author}
                </p>
                <p className="text-gray-400 text-sm">
                  {testimonial.date}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll to Top Button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};

export default Testimonials;