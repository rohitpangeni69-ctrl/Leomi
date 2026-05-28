import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/firebase';
import { addReview, subscribeToReviews } from '../lib/api';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export const Reviews = ({ productId }: { productId: string }) => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToReviews(productId, setReviews);
    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    
    setSubmitting(true);
    try {
      await addReview(productId, user.uid, user.displayName || user.email?.split('@')[0] || 'User', rating, comment);
      setComment('');
      setRating(5);
      toast.success('Review submitted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold font-serif mb-8 text-gray-900 border-b pb-4">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 border-r pr-8">
          <h3 className="text-lg font-bold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
                rows={4}
                placeholder="Share your thoughts about this product..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-gray-500 italic text-center py-8">Be the first to review this product!</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{review.userName}</div>
                  <div className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
