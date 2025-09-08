import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { addToCart, setCartFromServer } from '../../store/slices/cartSlice';
import cartAPI from '../../services/cartAPI';
import { useNavigate } from 'react-router-dom';

const BuyBox = ({ product, selectedVariant }: { product: any; selectedVariant?: Record<string, string> }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const [quantity, setQuantity] = useState(1);

  const availableQty = (product?.inventory?.quantity ?? product?.countInStock ?? product?.stock ?? 0) as number;
  const isActive = product?.isActive !== false;
  const isInStock = isActive && availableQty > 0;
  const coupon = product?.coupon; // { label: string, discount: number }
  const deliveryDays = product?.deliveryDays ?? 3;
  const arrival = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + deliveryDays);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, [deliveryDays]);

  const handleAddToCart = async (goCheckout?: boolean) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    try {
      const variant = selectedVariant && Object.keys(selectedVariant).length > 0 ? selectedVariant : ((product as any).selectedVariations || null);

      // Require choosing all options if the product has variants
      const rawList: any[] = (Array.isArray(product.variations) && product.variations.length
        ? product.variations
        : (Array.isArray(product.variants) ? product.variants : [])) as any[];
      const requiredNames = (rawList || []).map((v) => (v?.name || '').toString()).filter(Boolean);
      if (requiredNames.length > 0) {
        const chosen = variant || {};
        const missing = requiredNames.filter((n) => !(n in chosen));
        if (missing.length > 0) {
          toast.error(`Please select: ${missing.join(', ')}`);
          return;
        }
      }
      await cartAPI.addItem(product._id, quantity, variant);
      const res = await cartAPI.getCart();
      dispatch(setCartFromServer(res?.data?.data?.cart));
      toast.success('Added to cart');
      if (goCheckout) {
        navigate('/checkout');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to add to cart';
      toast.error(msg);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price || 0);

  return (
    <aside className="w-full lg:w-auto">
      <div className="sticky top-24">
        <div className="bg-white border border-gray-300 rounded-md p-5 space-y-4 shadow-sm">
          {/* Price */}
          <div className="text-2xl font-semibold text-gray-900">{formatPrice(product?.price)}</div>

          {coupon && (
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Coupon</span>
              <span className="text-gray-700">{coupon.label}</span>
            </div>
          )}

          {product?.originalPrice && product.originalPrice > product.price && (
            <div className="text-sm text-green-700">Save {formatPrice(product.originalPrice - product.price)}</div>
          )}

          {/* Shipping & delivery */}
          <div className="text-sm text-gray-700">
            <span className="text-gray-700">$0.00 </span>
            <span className="text-gray-600">Shipping & Import Fees Deposit to {typeof window !== 'undefined' ? 'your location' : ''}</span>
            <button type="button" className="ml-1 text-gray-500 hover:text-gray-700 align-middle">Details ▾</button>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <FiMapPin className="mr-2" />
            <span>FREE delivery <span className="font-medium text-gray-800">{arrival}</span></span>
          </div>

          <div className="text-sm">
            <span className={isInStock ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
              {isInStock ? 'In Stock' : 'Currently unavailable'}
            </span>
          </div>

          {/* Quantity dropdown styled like Amazon */}
          <div className="text-sm">
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              disabled={!isInStock}
              className="w-full h-10 border border-gray-300 rounded-md px-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange"
            >
              {/* Collapsed label mimic */}
              <option value={quantity}>{`Quantity: ${quantity}`}</option>
              {Array.from({ length: Math.min(10, Math.max(1, availableQty)) }, (_, i) => i + 1)
                .filter((n) => n !== quantity)
                .map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
            </select>
          </div>

          <button
            disabled={!isInStock}
            onClick={() => handleAddToCart(false)}
            className={`w-full flex items-center justify-center space-x-2 rounded-md py-3 ${
              isInStock ? 'bg-amazon-orange text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-500'
            }`}
          >
            <FiShoppingCart />
            <span>Add to Cart</span>
          </button>

          <button
            disabled={!isInStock}
            onClick={() => handleAddToCart(true)}
            className={`w-full rounded-md py-3 text-white ${
              isInStock ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300'
            }`}
          >
            Buy Now
          </button>

          {/* Info rows */}
          <div className="text-xs text-gray-700 space-y-2 pt-1">
            <div className="grid grid-cols-5 gap-2">
              <span className="col-span-2 text-gray-500">Ships from</span>
              <span className="col-span-3">Amazon.com</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <span className="col-span-2 text-gray-500">Sold by</span>
              <span className="col-span-3">Amazon.com</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <span className="col-span-2 text-gray-500">Returns</span>
              <span className="col-span-3">30-day refund / replacement</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <span className="col-span-2 text-gray-500">Support</span>
              <span className="col-span-3">Product support included</span>
            </div>
            <button type="button" className="text-gray-600 hover:text-gray-800">See more ▾</button>
          </div>

          {/* Gift receipt */}
          <label className="flex items-start gap-2 text-sm text-gray-700 pt-1">
            <input type="checkbox" className="mt-1" />
            <span>Add a gift receipt for easy returns</span>
          </label>

          {/* Add to list */}
          <button
            type="button"
            className="w-full h-10 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Add to List
          </button>
        </div>
      </div>
    </aside>
  );
};

export default BuyBox;


