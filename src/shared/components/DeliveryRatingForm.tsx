"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DeliveryRatingFormProps {
  deliveryRequestId?: string;
  onSuccess?: (rating: any) => void;
  onCancel?: () => void;
}

const DeliveryRatingForm: React.FC<DeliveryRatingFormProps> = ({
  deliveryRequestId,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [tipAmount, setTipAmount] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const handleStarHover = (starValue: number) => {
    setHoveredStar(starValue);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) newErrors.rating = 'Please select a rating';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Convert photos to base64 or upload to storage
      const photoData = await Promise.all(
        photos.map(async (photo) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(photo);
          });
        })
      );

      const response = await fetch('/api/delivery/customer-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryRequestId,
          rating,
          feedback,
          wouldRecommend,
          tipAmount: tipAmount ? parseFloat(tipAmount) : 0,
          photos: photoData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess?.(data.deliveryRating);
      } else {
        throw new Error(data.error || 'Failed to submit rating');
      }

    } catch (error: any) {
      console.error('Rating submission error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const tipSuggestions = [0, 2, 5, 10, 15, 20];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Rate Your Delivery</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How was your delivery? *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                className="text-4xl transition-colors focus:outline-none"
              >
                <span className={`${(hoveredStar >= star || rating >= star) ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Good'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Poor'}
              {rating === 1 && 'Very Poor'}
            </p>
          )}
          {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell us more about your experience
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about the delivery service..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Would Recommend */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Would you recommend this delivery service?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="recommend"
                value="yes"
                checked={wouldRecommend === true}
                onChange={() => setWouldRecommend(true)}
                className="mr-2"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="recommend"
                value="no"
                checked={wouldRecommend === false}
                onChange={() => setWouldRecommend(false)}
                className="mr-2"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Tip Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tip Amount (Optional)
          </label>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {tipSuggestions.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTipAmount(amount.toString())}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    tipAmount === amount.toString()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="Custom amount"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <div className="space-y-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Privacy Note */}
        <div className="text-xs text-gray-500 text-center">
          <p>Your feedback helps us improve our delivery service.</p>
          <p>Photos and feedback may be shared with the delivery person.</p>
        </div>
      </form>
    </div>
  );
};

export default DeliveryRatingForm;
