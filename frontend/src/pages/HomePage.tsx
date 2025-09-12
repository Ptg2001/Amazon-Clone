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

const ensureProductImage = (product) => {
  const hasImage = Array.isArray(product.images) && product.images.length > 0 && product.images[0]?.url;
  return {
    ...product,
    images: hasImage ? product.images : [{ url: '/images/placeholder.jpg', alt: product.title }],
    price: typeof product.price === 'number' ? product.price : 0,
    originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
    ratings: product.ratings || { average: 0, count: 0 },
  };
};

const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(ensureProductImage);
};

const getCategoryImage = (category, products, usedProductIds: Set<string>) => {
  if (category?.image?.url) return { url: category.image.url };
  const prod = products.find((p) => {
    const matches = p?.category?._id === category?._id || p?.category === category?._id || p?.category?.slug === category?.slug;
    return matches && p?._id && !usedProductIds.has(p._id);
  });
  if (prod && prod._id) {
    usedProductIds.add(prod._id);
  }
  return { url: prod?.images?.[0]?.url || '/images/category-placeholder.jpg' };
};

const buildUniqueCategoryCards = (categories, products, count = 4) => {
  const used = new Set<string>();
  const seenSlugs = new Set<string>();
  const cards = [] as any[];
  for (const c of categories) {
    const slug = c?.slug || c?._id;
    if (!slug || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    const img = getCategoryImage(c, products, used);
    cards.push({
      title: c.name,
      subtitle: 'Explore top picks in this category',
      image: img.url,
      to: `/category/${c.slug}`,
      cta: { label: 'Shop now', to: `/category/${c.slug}` },
    });
    if (cards.length >= count) break;
  }
  return cards;
};

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
    () => productAPI.getCategories({}),
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

  const featuredList = normalizeProducts(featuredProducts?.data?.data?.products || []);
  const dealsList = normalizeProducts(deals?.data?.data?.products || []);
  const categoriesList = categories?.data?.data?.categories || [];

  // Combined list increases chance of finding category preview images
  const productsForCategoryImages = [...featuredList, ...dealsList];

  // Compute deals with an actual discount
  const discountedProducts = dealsList.filter((p) =>
    (typeof p.originalPrice === 'number' && p.originalPrice > p.price) || (typeof p.discount === 'number' && p.discount > 0)
  );

  return (
    <>
      <Helmet>
        <title>NexaCart - Shop Online for Electronics, Books, Clothing & More</title>
        <meta
          name="description"
          content="NexaCart offers free shipping on millions of items. Enjoy low prices and great deals across electronics, fashion, home and more."
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Amazon-like Grid */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HomeGrid
              featured={productsForCategoryImages}
              categories={categoriesList}
            />
          </div>
        </section>

        {/* First promo row */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PromoRowGrid
              cards={buildUniqueCategoryCards(categoriesList, productsForCategoryImages, 4)}
            />
          </div>
        </div>

        {/* Horizontal product rows */}
        <section className="py-2 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HorizontalProductCarousel
              title="Related to items you've viewed"
              products={featuredList.slice(0, 10)}
              viewAllLink="/products"
            />
            <HorizontalProductCarousel
              title="Up to 60% off | Trending products from Emerging Businesses"
              products={dealsList.slice(0, 10)}
              viewAllLink="/deals"
            />
            <HorizontalProductCarousel
              title="Keep shopping for"
              products={featuredList.slice(10, 18)}
              viewAllLink="/products"
            />
            <HorizontalProductCarousel
              title="Pick up where you left off"
              products={dealsList.slice(10, 18)}
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
              categories={categoriesList}
              isLoading={categoriesLoading}
              productsForImages={productsForCategoryImages}
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
              products={discountedProducts}
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
