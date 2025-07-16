import React from 'react';

const Testimonial = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      rating: 5,
      comment: "Absolutely fantastic service! The team went above and beyond to meet our needs. Will definitely recommend to others.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Michael Chen",
      role: "Small Business Owner",
      rating: 4,
      comment: "Great product overall. Had a minor issue but customer support resolved it quickly. Very satisfied!",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "David Wilson",
      role: "Freelance Designer",
      rating: 3,
      comment: "Good basic service. Does what it promises, though I expected a few more features at this price point.",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  return (
    <div className="py-12 px-4 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-12">Customer Testimonials</h2>
      
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 lg:w-1/4"
          >
            <img 
              className="h-20 w-20 rounded-full object-cover mb-4"
              src={testimonial.avatar}
              alt={testimonial.name}
            />
            
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            <p className="text-gray-600 italic text-center mb-4">"{testimonial.comment}"</p>
            
            <div className="text-center">
              <p className="font-semibold text-lg">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;