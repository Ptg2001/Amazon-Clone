import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useQuery } from 'react-query';
import contentAPI from '../../services/contentAPI';
import 'react-lazy-load-image-component/src/effects/blur.css';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const fallbackSlides = [
    {
      id: 1,
      title: 'New Arrivals',
      subtitle: 'Discover the latest products',
      description: 'Shop the newest collection of electronics, fashion, and home goods',
      image: 'https://www.crazydomains.com/learn/wp-content/uploads/2021/04/5-eCommerce-Products-To-Sell-in-2021-main-image_728x365.jpg',
      link: '/search?q=new+arrivals',
      buttonText: 'Shop Now',
    },
    {
      id: 2,
      title: 'Electronics Sale',
      subtitle: 'Up to 50% off',
      description: 'Get amazing deals on smartphones, laptops, and gadgets',
      image: 'https://img.freepik.com/premium-photo/headphones_920207-9739.jpg',
      link: '/category/electronics',
      buttonText: 'View Deals',
    },
    {
      id: 3,
      title: 'Free Shipping',
      subtitle: 'On orders over $50',
      description: 'Enjoy free shipping on millions of items',
      image: 'https://www.geeky-gadgets.com/wp-content/uploads/2024/06/iPhone-16-Pro-Max-1.jpg',
      link: '/search?q=free+shipping',
      buttonText: 'Learn More',
    },
  ];

  const { data: slidesRes } = (useQuery as any)(
    'hero-slides',
    () => contentAPI.getHeroSlides(),
    { staleTime: 10 * 60 * 1000 }
  );
  const heroSlides = slidesRes?.data?.data?.slides || fallbackSlides;

  const timerRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);

  // Auto-advance slides, pause on hover
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [heroSlides.length, paused]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    <div
      className="relative h-[360px] sm:h-[420px] md:h-[520px] overflow-hidden rounded-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
              {/* Background Image (ensures full cover) */}
              <div
                className="absolute inset-0 bg-center bg-no-repeat bg-cover"
                style={{ backgroundImage: `url(${slide.image})` }}
                aria-hidden
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/40 pointer-events-none" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 md:mb-4 drop-shadow">
                      {slide.title}
                    </h1>
                    <h2 className="text-lg sm:text-xl md:text-2xl text-yellow-400 mb-3 md:mb-4">
                      {slide.subtitle}
                    </h2>
                    <p className="text-base md:text-lg text-gray-200 mb-6 md:mb-8 max-w-xl">
                      {slide.description}
                    </p>
                    <Link
                      to={slide.link || '/'}
                      className="inline-block bg-amazon-orange text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md text-base md:text-lg font-semibold hover:bg-orange-600 transition-colors duration-200 shadow relative z-10"
                    >
                      {slide.buttonText || 'Shop Now'}
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
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
      >
        <FiChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
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
