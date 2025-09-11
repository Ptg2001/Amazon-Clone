import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiStar, FiThumbsUp, FiUser } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import productAPI from '../../services/productAPI';

const ProductReviews = ({ product, onReviewSubmitted }: { product: any; onReviewSubmitted?: () => void }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const reviews = product.reviews || [];
  const [ratingFilter, setRatingFilter] = useState(null as number | null);
  const [search, setSearch] = useState('');

  const filteredReviews = useMemo(() => {
    let list = reviews;
    if (ratingFilter) list = list.filter((r) => Math.round(r.rating) === ratingFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        (r.title || '').toLowerCase().includes(q) || (r.comment || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [reviews, ratingFilter, search]);

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to write a review');
      return;
    }

    try {
      const payload = {
        rating: parseInt(data.rating, 10),
        title: data.title,
        comment: data.comment,
      };
      await productAPI.addReview(product._id, payload);
      toast.success('Review submitted successfully!');
      reset();
      setShowReviewForm(false);
      onReviewSubmitted && onReviewSubmitted();
    } catch (error) {
      const msg = (error as any)?.response?.data?.message || 'Failed to submit review. Please try again.';
      toast.error(msg);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    const valid = d instanceof Date && !isNaN(d.getTime());
    const toShow = valid ? d : new Date();
    return toShow.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Customer Reviews ({filteredReviews.length})
        </h3>
        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-amazon-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
          >
            Write a Review
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[5,4,3,2,1].map((r) => (
          <button
            key={r}
            onClick={() => setRatingFilter((prev) => (prev === r ? null : r))}
            className={`text-sm rounded-full border px-3 py-1 ${ratingFilter === r ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {r} star
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
          />
          {(ratingFilter || search) && (
            <button onClick={() => { setRatingFilter(null); setSearch(''); }} className="text-sm text-blue-700 underline">Clear</button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                {...register('rating', { required: 'Please select a rating' })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
              >
                <option value="">Select rating</option>
                <option value="5">5 stars - Excellent</option>
                <option value="4">4 stars - Very Good</option>
                <option value="3">3 stars - Good</option>
                <option value="2">2 stars - Fair</option>
                <option value="1">1 star - Poor</option>
              </select>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                {...register('title', { required: 'Review title is required' })}
                type="text"
                placeholder="Summarize your review"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                {...register('comment', { required: 'Review comment is required' })}
                rows={4}
                placeholder="Tell us about your experience with this product"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {review.user?.firstName} {review.user?.lastName}
                    </span>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-gray-600 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-amazon-orange transition-colors">
                      <FiThumbsUp className="h-4 w-4" />
                      <span>Helpful ({review.helpful || 0})</span>
                    </button>
                    {review.verified && (
                      <span className="text-green-600 font-medium">Verified Purchase</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
