"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PaymentCancel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      fetchSessionData(sessionId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSessionData = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/checkout?session_id=${sessionId}`);
      const data = await response.json();

      if (data.session) {
        setSessionData(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    if (sessionData?.lineItems?.data) {
      // Convert line items back to cart format
      const items = sessionData.lineItems.data.map((item: any) => ({
        name: item.description,
        price: item.amount_unit_amount / 100,
        quantity: item.quantity,
        description: item.description,
      }));

      // Redirect to checkout with retry
      router.push('/checkout');
    } else {
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>

        {/* Cancellation Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">What Happened?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-1">💳</div>
              <div>
                <h3 className="font-medium text-gray-900">Payment Cancelled</h3>
                <p className="text-sm text-gray-600">
                  You cancelled the payment process. This could be intentional or due to a technical issue.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-1">✅</div>
              <div>
                <h3 className="font-medium text-gray-900">No Charges Made</h3>
                <p className="text-sm text-gray-600">
                  Your payment method was not charged. You can try again or use a different payment method.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">🛒</div>
              <div>
                <h3 className="font-medium text-gray-900">Cart Preserved</h3>
                <p className="text-sm text-gray-600">
                  Your items are still in your cart and you can complete your purchase anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Session Info (if available) */}
        {sessionData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Session ID:</span>
                <span className="font-medium text-sm">
                  {sessionData.session?.id?.slice(-8) || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Cancelled
                </span>
              </div>
              
              {sessionData.totalAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Total:</span>
                  <span className="font-medium">
                    ${sessionData.totalAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Items Summary */}
            {sessionData.lineItems?.data && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium mb-2">Items in Cart</h3>
                <div className="space-y-2">
                  {sessionData.lineItems.data.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.description}</span>
                      <span className="font-medium">
                        ${(item.amount_unit_amount / 100).toFixed(2)} × {item.quantity}
                      </span>
                    </div>
                  ))}
                  {sessionData.lineItems.data.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{sessionData.lineItems.data.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Common Reasons */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Common Reasons for Cancellation</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">🔒</div>
              <div>
                <h3 className="font-medium text-gray-900">Security Concerns</h3>
                <p className="text-sm text-gray-600">
                  Your bank may have blocked the transaction for security reasons.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">💳</div>
              <div>
                <h3 className="font-medium text-gray-900">Insufficient Funds</h3>
                <p className="text-sm text-gray-600">
                  Your card may not have sufficient funds for this purchase.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">🌐</div>
              <div>
                <h3 className="font-medium text-gray-900">Network Issues</h3>
                <p className="text-sm text-gray-600">
                  Temporary network connectivity problems may have interrupted the process.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">📱</div>
              <div>
                <h3 className="font-medium text-gray-900">3D Secure</h3>
                <p className="text-sm text-gray-600">
                  Additional verification may have been required but not completed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleRetryPayment}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            View Cart
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you continue to experience issues, our customer support team is here to help.
          </p>
          <div className="flex justify-center gap-4">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Contact Support
            </button>
            <span className="text-gray-400">|</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Payment FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
