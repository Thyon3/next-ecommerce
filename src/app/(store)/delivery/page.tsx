"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CustomerDeliveryPage: React.FC = () => {
  const [deliveryData, setDeliveryData] = useState({
    requests: [],
    tracking: null
  });
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    fetchDeliveryRequests();
  }, []);

  const fetchDeliveryRequests = async () => {
    try {
      // This would need the user ID from auth
      const response = await fetch('/api/delivery/requests?userId=current-user-id');
      const data = await response.json();

      setDeliveryData({
        requests: data.deliveryRequests || [],
        tracking: null
      });
    } catch (error) {
      console.error('Delivery requests fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackDelivery = async () => {
    if (!trackingNumber.trim()) return;

    try {
      const response = await fetch(`/api/delivery/requests?deliveryRequestId=${trackingNumber}`);
      const data = await response.json();

      if (response.ok && data.deliveryRequests.length > 0) {
        setDeliveryData(prev => ({
          ...prev,
          tracking: data.deliveryRequests[0]
        }));
      } else {
        alert('Delivery not found');
      }
    } catch (error) {
      console.error('Tracking error:', error);
      alert('Error tracking delivery');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ASSIGNED': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-purple-600 bg-purple-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'ASSIGNED': return '👤';
      case 'IN_PROGRESS': return '🚚';
      case 'DELIVERED': return '✅';
      case 'FAILED': return '❌';
      default: return '📦';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { requests, tracking } = deliveryData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Center</h1>
          <p className="text-gray-600 mt-2">Track your deliveries and manage delivery requests</p>
        </div>

        {/* Tracking Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Track Delivery</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter delivery tracking number"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={trackDelivery}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Track
            </button>
          </div>
        </div>

        {/* Tracking Results */}
        {tracking && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{getStatusIcon(tracking.status)}</span>
                <div>
                  <p className="text-lg font-medium">Delivery #{tracking.id.slice(-8)}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tracking.status)}`}>
                    {tracking.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDeliveryData(prev => ({ ...prev, tracking: null }))}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Delivery Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{tracking.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{tracking.deliveryType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Delivery:</span>
                    <span className="font-medium">{formatTime(tracking.estimatedDeliveryTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{tracking.contactName}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Delivery Address</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{tracking.deliveryAddress.street}</p>
                  <p>
                    {tracking.deliveryAddress.city}, {tracking.deliveryAddress.state} {tracking.deliveryAddress.postalCode}
                  </p>
                  <p>{tracking.deliveryAddress.country}</p>
                </div>
              </div>
            </div>

            {tracking.deliveryPerson && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Delivery Person</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{tracking.deliveryPerson.name}</p>
                    <p className="text-sm text-gray-600">{tracking.deliveryPerson.vehicle}</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Call Driver
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['requests', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Delivery Requests</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  New Delivery Request
                </button>
              </div>
              
              <div className="space-y-4">
                {requests.map((request: any) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium">Delivery #{request.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {request.deliveryAddress.street}, {request.deliveryAddress.city}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {request.deliveryType}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">
                        <p>Est. Delivery: {formatTime(request.estimatedDeliveryTime)}</p>
                        <p>Contact: {request.contactName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(request.order?.totalAmount || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Track Delivery
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                        View Details
                      </button>
                      {request.status === 'DELIVERED' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                          Rate Delivery
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Delivery History</h2>
              <div className="space-y-4">
                {requests
                  .filter((request: any) => request.status === 'DELIVERED')
                  .map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Delivery #{request.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {request.deliveryAddress.city}, {request.deliveryAddress.state}
                          </p>
                          <p className="text-sm text-gray-600">
                            Delivered: {formatTime(request.deliveredAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(request.order?.totalAmount || 0)}
                          </p>
                          <p className="text-sm text-green-600">Delivered</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDeliveryPage;
