import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      title: 'New Arrivals',
      subtitle: 'Discover the latest products',
      description: 'Shop the newest collection of electronics, fashion, and home goods',
      image: '/images/hero-1.jpg',
      link: '/search?q=new+arrivals',
      buttonText: 'Shop Now',
    },
    {
      id: 2,
      title: 'Electronics Sale',
      subtitle: 'Up to 50% off',
      description: 'Get amazing deals on smartphones, laptops, and gadgets',
      image: '/images/hero-2.jpg',
      link: '/category/electronics',
      buttonText: 'View Deals',
    },
    {
      id: 3,
      title: 'Free Shipping',
      subtitle: 'On orders over $50',
      description: 'Enjoy free shipping on millions of items',
      image: '/images/hero-3.jpg',
      link: '/search?q=free+shipping',
      buttonText: 'Learn More',
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative h-full">
              {/* Background Image */}
              <LazyLoadImage
                src={slide.image}
                alt={slide.title}
                effect="blur"
                className="w-full h-full object-cover"
                placeholderSrc="/images/hero-placeholder.jpg"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                      {slide.title}
                    </h1>
                    <h2 className="text-xl md:text-2xl text-yellow-400 mb-4">
                      {slide.subtitle}
                    </h2>
                    <p className="text-lg text-gray-200 mb-8">
                      {slide.description}
                    </p>
                    <Link
                      to={slide.link}
                      className="inline-block bg-amazon-orange text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
      >
        <FiChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
      >
        <FiChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? 'bg-amazon-orange'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
