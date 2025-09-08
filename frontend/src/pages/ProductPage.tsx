import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import productAPI from '../services/productAPI';
import ProductDetails from '../components/products/ProductDetails';
import ProductReviews from '../components/products/ProductReviews';
import RelatedProducts from '../components/products/RelatedProducts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductSpecs from '../components/products/ProductSpecs';
import ProductAPlus from '../components/products/ProductAPlus';
import ProductVideo from '../components/products/ProductVideo';
import ProductQnA from '../components/products/ProductQnA';
import ComparisonTable from '../components/products/ComparisonTable';
import Breadcrumbs from '../components/products/Breadcrumbs';
import ReviewSummary from '../components/products/ReviewSummary';
import FrequentlyBoughtTogether from '../components/products/FrequentlyBoughtTogether';
import SponsoredCarousel from '../components/products/SponsoredCarousel';
import RecentlyViewed from '../components/products/RecentlyViewed';
import CustomersAlsoBought from '../components/products/CustomersAlsoBought';
import FromTheBrand from '../components/products/FromTheBrand';
import StickySubnav from '../components/products/StickySubnav';

const ProductPage = () => {
  const { id } = useParams();

  const { data: productData, isLoading, error } = useQuery(
    ['product', id],
    () => productAPI.getProduct(id),
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <a href="/" className="text-amazon-orange hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const product = productData?.data?.data?.product || productData?.data?.product;
  const relatedProducts = productData?.data?.data?.relatedProducts || productData?.data?.relatedProducts || [];

  // Persist recently viewed
  if (product?._id) {
    try {
      const key = 'recently_viewed';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const next = [product, ...existing.filter((p: any) => p._id !== product._id)].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(next));
    } catch (_) {}
  }

  const recentlyViewed = (() => {
    try {
      return JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    } catch {
      return [];
    }
  })();

  return (
    <>
      <Helmet>
        <title>{`${product?.title || 'Product'} - Amazon Clone`}</title>
        <meta name="description" content={product?.description || ''} />
        <meta name="keywords" content={(product?.tags || []).join(', ')} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 font-amazon">
        <StickySubnav
          items={[
            { id: 'details', label: 'About' },
            { id: 'specs', label: 'Technical details' },
            { id: 'video', label: 'Videos' },
            { id: 'aplus', label: 'From the manufacturer' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'qna', label: 'Q&A' },
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {product && (
            <>
              <Breadcrumbs items={product.breadcrumbs || []} />
              <section id="details" className="scroll-mt-36">
                <ProductDetails product={product} />
              </section>
              <ReviewSummary
                average={product.ratings?.average || 0}
                total={product.ratings?.count || 0}
                histogram={product.ratings?.histogram || []}
              />
              <FrequentlyBoughtTogether main={product} items={relatedProducts} />
              <section id="specs" className="scroll-mt-36">
                <ProductSpecs specs={product.specs || product.specifications || {}} />
              </section>
              <section id="video" className="scroll-mt-36">
                <ProductVideo youtubeId={product.youtubeId || product.videoId} />
              </section>
              <section id="aplus" className="scroll-mt-36">
                <ProductAPlus blocks={product.aplus || []} />
              </section>
              <section id="qna" className="scroll-mt-36">
                <ProductQnA qna={product.qna || []} />
              </section>
              <section id="reviews" className="scroll-mt-36">
                <ProductReviews product={product} />
              </section>
              {relatedProducts.length > 0 && (
                <RelatedProducts products={relatedProducts} />
              )}
              <ComparisonTable products={relatedProducts} />
              <SponsoredCarousel items={relatedProducts} />
              <CustomersAlsoBought items={product.alsoBought || relatedProducts} />
              <FromTheBrand brand={product.brand} blocks={product.fromBrand || []} />
              <RecentlyViewed items={recentlyViewed} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductPage;
