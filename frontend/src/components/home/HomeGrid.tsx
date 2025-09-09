import React from 'react';
import HomeGridCard from './HomeGridCard';

const pickTitle = (fallback: string, options: Array<string | undefined>) => {
  for (const v of options) {
    if (v && v.trim().length > 0) return v;
  }
  return fallback;
};

const findImageForCategory = (category, products) => {
  if (category?.image?.url) return category.image.url;
  const prod = products.find((p) => p?.category?._id === category?._id || p?.category === category?._id || p?.category?.slug === category?.slug);
  return prod?.images?.[0]?.url || '/images/category-placeholder.jpg';
};

const HomeGrid = ({ featured = [], categories = [] }) => {
  const categoryItemsTop = categories.slice(0, 4).map((c) => ({
    label: c.name,
    image: findImageForCategory(c, featured),
    link: `/category/${c.slug}`,
  }));

  const categoryItemsBottom = categories.slice(4, 8).map((c) => ({
    label: c.name,
    image: findImageForCategory(c, featured),
    link: `/category/${c.slug}`,
  }));

  const firstFeatured = featured[0];
  const secondFeatured = featured[1];

  const firstFeaturedImage = firstFeatured?.images?.[0]?.url || '/images/placeholder.jpg';
  const secondFeaturedImage = secondFeatured?.images?.[0]?.url || '/images/placeholder.jpg';

  const topTitle = pickTitle('Top picks for you', [categories[0]?.name]);
  const leftMidTitle = pickTitle('From ' + (firstFeatured?.brand || 'our store'), [firstFeatured?.brand, firstFeatured?.title]);
  const rightMidTitle = pickTitle('Discover ' + (secondFeatured?.brand || 'more'), [secondFeatured?.brand, secondFeatured?.title]);
  const bottomTitle = pickTitle('More to explore', [categories[4]?.name]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <HomeGridCard
        title={topTitle}
        items={categoryItemsTop}
        cta={{ label: 'See more', link: '/categories' }}
      />

      <HomeGridCard
        title={leftMidTitle}
        image={firstFeaturedImage}
        imageAlt={firstFeatured?.title || leftMidTitle}
        imageLink={firstFeatured?._id ? `/product/${firstFeatured._id}` : '/products'}
        cta={{ label: 'Shop now', link: firstFeatured?._id ? `/product/${firstFeatured._id}` : '/products' }}
      />

      <HomeGridCard
        title={rightMidTitle}
        image={secondFeaturedImage}
        imageAlt={secondFeatured?.title || rightMidTitle}
        imageLink={secondFeatured?._id ? `/product/${secondFeatured._id}` : '/products'}
        cta={{ label: 'Discover', link: secondFeatured?._id ? `/product/${secondFeatured._id}` : '/products' }}
      />

      <HomeGridCard
        title={bottomTitle}
        items={categoryItemsBottom}
        cta={{ label: 'See all deals', link: '/deals' }}
      />
    </div>
  );
};

export default HomeGrid;


