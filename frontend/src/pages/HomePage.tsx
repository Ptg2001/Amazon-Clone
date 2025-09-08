import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import productAPI from '../services/productAPI';
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategorySection from '../components/home/CategorySection';
import DealsSection from '../components/home/DealsSection';
import HomeGrid from '../components/home/HomeGrid';
import NewsletterSection from '../components/home/NewsletterSection';
import HorizontalProductCarousel from '../components/home/HorizontalProductCarousel';
import PromoRowGrid from '../components/home/PromoRowGrid';

const HomePage = () => {
  // Fetch featured products
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery(
    'featured-products',
    () => productAPI.getProducts({ featured: true, limit: 8 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'home-categories',
    () => productAPI.getCategories({ limit: 6 }),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch deals and extra products for rows
  const { data: deals, isLoading: dealsLoading } = useQuery(
    'home-deals',
    () => productAPI.getProducts({ limit: 24, sort: '-discount' }),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  return (
    <>
      <Helmet>
        <title>Amazon Clone - Shop Online for Electronics, Books, Clothing & More</title>
        <meta
          name="description"
          content="Free shipping on millions of items. Get the best of Shopping and Entertainment with Prime. Enjoy low prices and great deals on the largest selection of everyday essentials and other products."
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Amazon-like Grid */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HomeGrid
              featured={featuredProducts?.data?.data?.products || []}
              categories={categories?.data?.data?.categories || []}
            />
          </div>
        </section>

        {/* First promo row */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PromoRowGrid
              cards={[
                { title: 'Revamp your home in style', image: '/images/hero-1.jpg', cta: { label: 'Explore all', to: '/search?q=home' } },
                { title: 'Appliances for your home | Up to 55% off', image: '/images/hero-2.jpg', cta: { label: 'Shop now', to: '/search?q=appliances' } },
                { title: 'Starting ₹149 | Headphones', image: '/images/hero-3.jpg', cta: { label: 'See more', to: '/search?q=headphones' } },
                { title: 'Sign in for your best experience', subtitle: 'Personalized recommendations', image: '/images/hero-1.jpg', cta: { label: 'Sign in securely', to: '/login' } },
              ]}
            />
          </div>
        </div>

        {/* Horizontal product rows */}
        <section className="py-2 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HorizontalProductCarousel
              title="Related to items you've viewed"
              products={(featuredProducts?.data?.data?.products || []).slice(0, 10)}
              viewAllLink="/products"
            />
            <HorizontalProductCarousel
              title="Up to 60% off | Trending products from Emerging Businesses"
              products={(deals?.data?.data?.products || []).slice(0, 10)}
              viewAllLink="/deals"
            />
            <HorizontalProductCarousel
              title="Keep shopping for"
              products={(featuredProducts?.data?.data?.products || []).slice(10, 18)}
              viewAllLink="/products"
            />
            <HorizontalProductCarousel
              title="Pick up where you left off"
              products={(deals?.data?.data?.products || []).slice(10, 18)}
              viewAllLink="/products"
            />
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Shop by Category
            </h2>
            <CategorySection
              categories={categories?.data?.data?.categories || []}
              isLoading={categoriesLoading}
            />
          </div>
        </section>

        {/* Deals Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Today's Deals
            </h2>
            <DealsSection
              products={(deals?.data?.data?.products || []).filter(product => 
                product.originalPrice && product.originalPrice > product.price
              )}
              isLoading={dealsLoading}
            />
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection />
      </div>
    </>
  );
};

export default HomePage;
