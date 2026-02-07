"use client";

import React, { useState } from 'react';
import Button from '@/shared/components/UI/button';

interface ReviewFormProps {
    productId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to submit review");
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border rounded-lg p-2 min-h-[100px] text-sm focus:ring-1 focus:ring-black outline-none"
                    placeholder="Share your experience with this product..."
                />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex justify-end gap-3 mt-4">
                <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" isLoading={isLoading}>Submit Review</Button>
            </div>
        </form>
    );
};

export default ReviewForm;
