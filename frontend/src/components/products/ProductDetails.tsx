import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiStar, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import toast from 'react-hot-toast';
import ProductImageGallery from './ProductImageGallery';
import BuyBox from './BuyBox';
import Variations from './Variations';
import countryService from '../../services/countryService';

const ProductDetails = ({ product }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);
  const wishlist = useSelector((state: any) => state.wishlist?.wishlist ?? []);
  const [selectedVariations, setSelectedVariations] = React.useState<Record<string, string>>({});

  const isInWishlist = wishlist.some((item) => item._id === product._id);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FiStar key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="bg-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left: Image Gallery (thumbnails + main) */}
        <div className="lg:col-span-3">
          <ProductImageGallery images={product.images || []} title={product.title} />
        </div>

        {/* Middle: Product Info */}
        <div className="lg:col-span-6 space-y-4">
          {/** Title and pricing cluster to mimic Amazon spacing */}
          {/* Title and Brand */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 leading-snug">
              {product.title}
            </h1>
            {product.brand && (
              <p className="text-sm lg:text-base text-gray-600 mt-1">by {product.brand}</p>
            )}
          </div>

          {/* Rating */}
          {product.ratings?.average > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(product.ratings.average)}
              </div>
              <span className="text-sm text-gray-600">
                {product.ratings.average} ({product.ratings.count} ratings)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="space-y-3">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-semibold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-green-700 text-sm">
                You save {formatPrice(product.originalPrice - product.price)} ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
              </p>
            )}
            {/* Shipping & Import Fees line (visual parity) */}
            <div className="text-sm text-gray-700">
              <span className="text-gray-700">$0.00 </span>
              <span className="text-gray-600">Shipping & Import Fees Deposit to {countryService.getCurrentCountry()?.name || 'your location'}</span>
              <button type="button" className="ml-1 text-gray-500 hover:text-gray-700 align-middle">Details ▾</button>
            </div>

            {/* Variants directly below price */}
            <div className="pt-2">
              {(() => {
                const rawList: any[] = (Array.isArray(product.variations) && product.variations.length
                  ? product.variations
                  : (Array.isArray(product.variants) ? product.variants : [])) as any[];
                const normalized = (rawList || []).map((v: any) => {
                  const name = (v?.name || '').toString();
                  let options: any = v?.options;
                  if (typeof options === 'string') {
                    options = options.split(',').map((s: string) => s.trim()).filter(Boolean);
                  }
                  if (!Array.isArray(options)) options = [];
                  return { name, options };
                }).filter((v) => v.name && v.options.length > 0);
                if (!normalized.length) return null;
                return (
                  <Variations
                    variations={normalized}
                    selected={selectedVariations}
                    onChange={(name, value) => setSelectedVariations((p) => ({ ...p, [name]: value }))}
                  />
                );
              })()}
            </div>
          </div>

          {/* Key Features / Bullets */}
          {/* Compact product info (left column) */}
          <div className="text-sm max-w-md">
            <div className="grid grid-cols-5 gap-y-2">
              {(
                [
                  ['Brand', product.brand],
                  ['Model', product.model || product?.specs?.model || product?.specifications?.model],
                  ['Screen Size', product.screenSize],
                  ['Resolution', product.resolution],
                  ['Refresh Rate', product.refreshRate],
                  ['Aspect Ratio', product.aspectRatio],
                  ['Panel Type', product.panelType],
                  ['Screen Surface', product.screenSurface],
                  [
                    'Item Dimensions',
                    (product?.dimensions && (product?.dimensions?.length || product?.dimensions?.width || product?.dimensions?.height))
                      ? `${product.dimensions.length ?? ''}${product.dimensions.length ? ' x ' : ''}${product.dimensions.width ?? ''}${product.dimensions.width ? ' x ' : ''}${product.dimensions.height ?? ''} ${product.dimensions.unit || ''}`
                      : product?.specs?.dimensions || product?.specifications?.dimensions,
                  ],
                  ['Item Weight', product?.dimensions?.weight ? `${product.dimensions.weight} ${product?.dimensions?.unit || ''}` : (product?.specs?.weight || product?.specifications?.weight)],
                  // Apparel attributes
                  ['Fabric type', product?.attributes?.get?.('fabricType') || product?.attributes?.fabricType],
                  ['Origin', product?.attributes?.get?.('origin') || product?.attributes?.origin],
                  ['Closure type', product?.attributes?.get?.('closureType') || product?.attributes?.closureType],
                  ['Neck style', product?.attributes?.get?.('neckStyle') || product?.attributes?.neckStyle],
                ] as Array<[string, any]>
              ).map(([label, value]) =>
                value ? (
                  <React.Fragment key={label}>
                    <span className="col-span-2 text-gray-700">{label}</span>
                    <span className="col-span-3 text-gray-900">{value}</span>
                  </React.Fragment>
                ) : null
              )}

              {/* Render any remaining attributes from map not already displayed */}
              {(() => {
                const shown = new Set([
                  'brand','model','screen size','resolution','refresh rate','aspect ratio','panel type','screen surface','item dimensions','item weight','fabric type','origin','closure type','neck style'
                ]);
                const attrs = product?.attributes;
                const entries: Array<[string,string]> = [];
                if (attrs?.forEach) {
                  attrs.forEach((v: string, k: string) => {
                    if (!shown.has(k.toLowerCase())) entries.push([k, v]);
                  });
                } else if (attrs && typeof attrs === 'object') {
                  Object.entries(attrs).forEach(([k, v]) => {
                    if (typeof v === 'string' && !shown.has(k.toLowerCase())) entries.push([k, v]);
                  });
                }
                return entries.map(([k, v]) => (
                  <React.Fragment key={`attr-${k}`}>
                    <span className="col-span-2 text-gray-700">{k}</span>
                    <span className="col-span-3 text-gray-900">{v}</span>
                  </React.Fragment>
                ));
              })()}
            </div>
          </div>

          {/* Key Features / Bullets */}
          {product.features && product.features.length > 0 && (
            <div className="text-sm">
              <ul className="list-disc pl-5 space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Variations section kept above; extra section removed */}

          {/* Wishlist & Info */}
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <button
              onClick={handleWishlistToggle}
              className={`px-4 py-3 rounded-md border transition-colors duration-200 inline-flex items-center justify-center gap-2 ${
                isInWishlist
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiHeart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              <span>{isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-700">
              <FiTruck className="h-5 w-5 text-amazon-orange" />
                <span>Free delivery on eligible orders</span>
            </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
              <FiShield className="h-5 w-5 text-amazon-orange" />
                <span>Secure transaction</span>
            </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
              <FiRotateCcw className="h-5 w-5 text-amazon-orange" />
                <span>30-day returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Buy Box */}
        <div className="lg:col-span-3">
          <BuyBox product={product} selectedVariant={selectedVariations} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
