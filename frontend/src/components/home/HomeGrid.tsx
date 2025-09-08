import React from 'react';
import HomeGridCard from './HomeGridCard';

const HomeGrid = ({ featured = [], categories = [] }) => {
  // Compose cards similar to Amazon layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <HomeGridCard
        title="Refresh your space"
        items={categories.slice(0, 4).map((c) => ({
          label: c.name,
          image: c.image?.url || '/images/category-placeholder.jpg',
          link: `/category/${c.slug}`,
        }))}
        cta={{ label: 'See more', link: '/categories' }}
      />

      <HomeGridCard
        title="Get your game on"
        image={featured[0]?.images?.[0]?.url || '/images/hero-2.jpg'}
        imageAlt={featured[0]?.title}
        imageLink={featured[0]?._id ? `/product/${featured[0]._id}` : '/products'}
        cta={{ label: 'Shop gaming', link: '/search?q=gaming' }}
      />

      <HomeGridCard
        title="9.9 Super Shopping Day"
        image={'/images/hero-3.jpg'}
        imageAlt={'Deals'}
        imageLink={'/deals'}
        cta={{ label: 'Explore deals', link: '/deals' }}
      />

      <HomeGridCard
        title="Shop Fashion for less"
        items={categories.slice(4, 8).map((c) => ({
          label: c.name,
          image: c.image?.url || '/images/category-placeholder.jpg',
          link: `/category/${c.slug}`,
        }))}
        cta={{ label: 'See all deals', link: '/deals' }}
      />
    </div>
  );
};

export default HomeGrid;


