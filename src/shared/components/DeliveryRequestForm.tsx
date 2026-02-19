"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DeliveryRequestFormProps {
  orderId?: string;
  onSuccess?: (deliveryRequest: any) => void;
  onCancel?: () => void;
}

const DeliveryRequestForm: React.FC<DeliveryRequestFormProps> = ({
  orderId,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [deliveryTypes, setDeliveryTypes] = useState([
    { id: 'STANDARD', name: 'Standard Delivery', description: '2-3 business days', price: 9.99 },
    { id: 'EXPRESS', name: 'Express Delivery', description: 'Same day delivery', price: 19.99 },
    { id: 'NEXT_DAY', name: 'Next Day Delivery', description: 'Next business day', price: 14.99 },
    { id: 'SAME_DAY', name: 'Same Day Delivery', description: 'Within 4 hours', price: 24.99 }
  ]);
  
  const [selectedType, setSelectedType] = useState('STANDARD');
  const [scheduledTime, setScheduledTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    instructions: '',
    contactName: '',
    contactPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!deliveryAddress.street) newErrors.street = 'Street address is required';
    if (!deliveryAddress.city) newErrors.city = 'City is required';
    if (!deliveryAddress.state) newErrors.state = 'State is required';
    if (!deliveryAddress.postalCode) newErrors.postalCode = 'Postal code is required';
    if (!deliveryAddress.contactName) newErrors.contactName = 'Contact name is required';
    if (!deliveryAddress.contactPhone) newErrors.contactPhone = 'Contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/delivery/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          deliveryType: selectedType,
          deliveryAddress,
          scheduledTime: scheduledTime || null,
          instructions: deliveryAddress.instructions,
          contactPhone: deliveryAddress.contactPhone,
          contactName: deliveryAddress.contactName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess?.(data.deliveryRequest);
      } else {
        throw new Error(data.error || 'Failed to create delivery request');
      }

    } catch (error: any) {
      console.error('Delivery request error:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  const selectedDeliveryType = deliveryTypes.find(type => type.id === selectedType);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Request Delivery</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Type Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Delivery Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryTypes.map((type) => (
              <div
                key={type.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{type.name}</h4>
                  <span className="text-lg font-bold text-green-600">${type.price}</span>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Delivery */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Schedule Delivery</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time (Optional)
              </label>
              <input
                type="datetime-local"
                name="scheduledTime"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty for ASAP delivery
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={deliveryAddress.street}
                onChange={handleInputChange}
                placeholder="123 Main St"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={deliveryAddress.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={deliveryAddress.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  maxLength={2}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={deliveryAddress.postalCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  name="country"
                  value={deliveryAddress.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                name="contactName"
                value={deliveryAddress.contactName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactName ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={deliveryAddress.contactPhone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
            </div>
          </div>
        </div>

        {/* Delivery Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Instructions
          </label>
          <textarea
            name="instructions"
            value={deliveryAddress.instructions}
            onChange={handleInputChange}
            placeholder="Leave at front door, ring doorbell, etc."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Delivery Cost:</span>
            <span className="text-2xl font-bold text-green-600">
              ${selectedDeliveryType?.price || '0.00'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Processing...' : 'Request Delivery'}
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
      </form>
    </div>
  );
};

export default DeliveryRequestForm;
