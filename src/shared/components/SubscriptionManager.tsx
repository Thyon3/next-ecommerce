"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionManagerProps {
  userId: string;
  onSubscriptionUpdate?: (subscription: any) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ 
  userId, 
  onSubscriptionUpdate 
}) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    price: 0,
    autoRenew: true,
    deliveryType: 'STANDARD',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    specialInstructions: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`/api/subscriptions-premium?userId=${userId}`);
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/subscriptions-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...formData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(prev => [data.subscription, ...prev]);
        setFormData({
          productId: '',
          quantity: 1,
          price: 0,
          autoRenew: true,
          deliveryType: 'STANDARD',
          deliveryAddress: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          specialInstructions: ''
        });
        setShowForm(false);
        onSubscriptionUpdate?.(data.subscription);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscriptions-premium?subscriptionId=${subscriptionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(prev => prev.map(sub => 
          sub.id === subscriptionId ? data.subscription : sub
        ));
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Subscription Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          New Subscription
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Subscription</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID
                </label>
                <input
                  type="text"
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Type
                </label>
                <select
                  value={formData.deliveryType}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="EXPRESS">Express</option>
                  <option value="SAME_DAY">Same Day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Street"
                  value={formData.deliveryAddress.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deliveryAddress: { ...prev.deliveryAddress, street: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.deliveryAddress.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deliveryAddress: { ...prev.deliveryAddress, city: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.deliveryAddress.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deliveryAddress: { ...prev.deliveryAddress, state: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={formData.deliveryAddress.postalCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deliveryAddress: { ...prev.deliveryAddress, postalCode: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special delivery instructions..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRenew"
                checked={formData.autoRenew}
                onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="autoRenew" className="text-sm text-gray-700">
                Auto-renew subscription
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Subscription'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {subscriptions.map((subscription: any) => (
          <div key={subscription.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium">{subscription.product?.name}</h3>
                <p className="text-gray-600">Quantity: {subscription.quantity}</p>
                <p className="text-gray-600">Price: ${subscription.price}</p>
                <p className="text-gray-600">
                  Total: ${(subscription.price * subscription.quantity).toFixed(2)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Delivery: {subscription.deliveryType}</p>
                <p>Auto-renew: {subscription.autoRenew ? 'Yes' : 'No'}</p>
                <p>Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCancel(subscription.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No subscriptions yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Create your first subscription to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
