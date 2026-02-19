"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PaymentSuccess: React.FC = () => {
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
      setError('No session ID found');
      setLoading(false);
    }
  }, []);

  const fetchSessionData = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/checkout?session_id=${sessionId}`);
      const data = await response.json();

      if (data.session) {
        setSessionData(data);
      } else {
        setError('Session not found');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your order. Your payment has been processed successfully.</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{sessionData?.session?.metadata?.orderId || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-medium">{sessionData?.session?.payment_intent?.slice(-8) || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Date:</span>
              <span className="font-medium">
                {sessionData?.session?.created ? formatDate(sessionData.session.created) : 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {sessionData?.paymentStatus || 'Paid'}
              </span>
            </div>
            
            <div className="flex justify-between text-lg font-bold border-t pt-4">
              <span>Total Amount:</span>
              <span className="text-green-600">
                {sessionData?.totalAmount ? formatCurrency(sessionData.totalAmount) : '$0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Items Purchased */}
        {sessionData?.lineItems?.data && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Items Purchased</h2>
            <div className="space-y-3">
              {sessionData.lineItems.data.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {item.description ? (
                        <div className="text-gray-400 text-sm">📦</div>
                      ) : (
                        <div className="text-gray-400">📦</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.description}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.amount_total / 100)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.amount_subtotal / 100)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Information */}
        {sessionData?.customer && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{sessionData.customer.email}</span>
              </div>
              {sessionData.customer.name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{sessionData.customer.name}</span>
                </div>
              )}
              {sessionData.customer.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{sessionData.customer.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">📧</div>
              <div>
                <h3 className="font-medium text-gray-900">Confirmation Email</h3>
                <p className="text-sm text-gray-600">
                  You'll receive a confirmation email with your order details shortly.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">📦</div>
              <div>
                <h3 className="font-medium text-gray-900">Order Processing</h3>
                <p className="text-sm text-gray-600">
                  Your order will be processed within 1-2 business days.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">🚚</div>
              <div>
                <h3 className="font-medium text-gray-900">Shipping</h3>
                <p className="text-sm text-gray-600">
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/orders')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Orders
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
