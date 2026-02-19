"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DeliveryTrackingProps {
  deliveryRequestId?: string;
  orderId?: string;
  compact?: boolean;
  showOrderDetails?: boolean;
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  deliveryRequestId,
  orderId,
  compact = false,
  showOrderDetails = true
}) => {
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDeliveryData();
    
    // Set up auto-refresh for active deliveries
    const interval = setInterval(() => {
      if (deliveryData?.status === 'IN_PROGRESS' || deliveryData?.status === 'ASSIGNED') {
        fetchDeliveryData();
      }
    }, 30000); // Refresh every 30 seconds

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [deliveryRequestId, orderId]);

  const fetchDeliveryData = async () => {
    try {
      const params = new URLSearchParams();
      if (deliveryRequestId) params.append('deliveryRequestId', deliveryRequestId);
      if (orderId) params.append('orderId', orderId);

      const response = await fetch(`/api/delivery/requests?${params}`);
      const data = await response.json();

      if (response.ok && data.deliveryRequests.length > 0) {
        setDeliveryData(data.deliveryRequests[0]);
      } else {
        setError('Delivery not found');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'PENDING': return 20;
      case 'ASSIGNED': return 40;
      case 'IN_PROGRESS': return 70;
      case 'DELIVERED': return 100;
      case 'FAILED': return 0;
      default: return 0;
    }
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!deliveryData) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 text-4xl mb-4">📦</div>
        <p className="text-gray-600">No delivery information available</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStatusIcon(deliveryData.status)}</span>
            <div>
              <p className="font-medium">Delivery #{deliveryData.id.slice(-8)}</p>
              <p className="text-sm text-gray-600">{deliveryData.status.replace('_', ' ')}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deliveryData.status)}`}>
            {deliveryData.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage(deliveryData.status)}%` }}
          ></div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Est. Delivery: {formatTime(deliveryData.estimatedDeliveryTime)}</p>
          {deliveryData.deliveryPerson && (
            <p>Driver: {deliveryData.deliveryPerson.name}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Delivery Tracking</h2>
        <div className="flex items-center gap-4">
          <span className="text-3xl">{getStatusIcon(deliveryData.status)}</span>
          <div>
            <p className="text-lg font-medium">Delivery #{deliveryData.id.slice(-8)}</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deliveryData.status)}`}>
              {deliveryData.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage(deliveryData.status)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Ordered</span>
          <span>Assigned</span>
          <span>In Transit</span>
          <span>Delivered</span>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Delivery Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
              ✓
            </div>
            <div className="flex-1">
              <p className="font-medium">Order Placed</p>
              <p className="text-sm text-gray-600">{formatTime(deliveryData.createdAt)}</p>
            </div>
          </div>

          {deliveryData.assignedAt && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                👤
              </div>
              <div className="flex-1">
                <p className="font-medium">Driver Assigned</p>
                <p className="text-sm text-gray-600">{formatTime(deliveryData.assignedAt)}</p>
                {deliveryData.deliveryPerson && (
                  <p className="text-sm text-gray-600">
                    Driver: {deliveryData.deliveryPerson.name} ({deliveryData.deliveryPerson.vehicle})
                  </p>
                )}
              </div>
            </div>
          )}

          {deliveryData.startedAt && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                🚚
              </div>
              <div className="flex-1">
                <p className="font-medium">Out for Delivery</p>
                <p className="text-sm text-gray-600">{formatTime(deliveryData.startedAt)}</p>
              </div>
            </div>
          )}

          {deliveryData.deliveredAt && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <div className="flex-1">
                <p className="font-medium">Delivered</p>
                <p className="text-sm text-gray-600">{formatTime(deliveryData.deliveredAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{deliveryData.deliveryAddress.street}</p>
            <p>
              {deliveryData.deliveryAddress.city}, {deliveryData.deliveryAddress.state} {deliveryData.deliveryAddress.postalCode}
            </p>
            <p>{deliveryData.deliveryAddress.country}</p>
            {deliveryData.instructions && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">Instructions:</p>
                <p className="text-gray-600">{deliveryData.instructions}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Delivery Type</p>
              <p className="font-medium">{deliveryData.deliveryType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Delivery</p>
              <p className="font-medium">{formatTime(deliveryData.estimatedDeliveryTime)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{deliveryData.contactName}</p>
              <p className="font-medium">{deliveryData.contactPhone}</p>
            </div>
            {deliveryData.deliveryPerson && (
              <div>
                <p className="text-sm text-gray-600">Delivery Person</p>
                <p className="font-medium">{deliveryData.deliveryPerson.name}</p>
                <p className="font-medium">{deliveryData.deliveryPerson.phone}</p>
                <p className="text-sm text-gray-600">{deliveryData.deliveryPerson.vehicle}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details */}
      {showOrderDetails && deliveryData.order && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">Order #{deliveryData.order.id.slice(-8)}</span>
              <span className="font-bold text-lg">${deliveryData.order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              {deliveryData.order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={fetchDeliveryData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Status
        </button>
        {deliveryData.deliveryPerson && (
          <button
            onClick={() => window.open(`tel:${deliveryData.deliveryPerson.phone}`)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Call Driver
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
