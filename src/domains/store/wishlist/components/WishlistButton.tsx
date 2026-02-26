"use client";

import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../store/wishlistSlice";
import { cn } from "@/shared/utils/styling";

type WishlistButtonProps = {
  productId: string;
  size?: "sm" | "md" | "lg";
};

export const WishlistButton = ({ productId, size = "md" }: WishlistButtonProps) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: any) => state.wishlist?.items || []);
  const isInWishlist = wishlistItems.some((item: any) => item.productId === productId);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const handleToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(productId));
    } else {
      dispatch(addToWishlist(productId));
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        isInWishlist ? "text-red-500" : "text-gray-400 hover:text-red-500",
        sizeClasses[size]
      )}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className="w-full h-full"
        fill={isInWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};
