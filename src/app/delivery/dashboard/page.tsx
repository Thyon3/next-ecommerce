"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DeliveryPersonDashboard: React.FC = () => {
  const [deliveryData, setDeliveryData] = useState({
    assignments: [],
    earnings: 0,
    todayDeliveries: 0,
    rating: 0,
    profile: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    fetchDeliveryData();
    getCurrentLocation();
    
    // Update location every 5 minutes
    const locationInterval = setInterval(getCurrentLocation, 5 * 60 * 1000);
    
    return () => clearInterval(locationInterval);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          updateLocation(latitude, longitude);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    try {
      // This would need the delivery person ID from auth
      await fetch('/api/delivery/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryPersonId: 'current-user-id', // Would come from auth
          latitude: lat,
          longitude: lng,
          accuracy: 10
        }),
      });
    } catch (error) {
      console.error('Location update error:', error);
    }
  };

  const fetchDeliveryData = async () => {
    try {
      // This would need the delivery person ID from auth
      const [assignmentsRes, profileRes] = await Promise.all([
        fetch('/api/delivery/assignments?deliveryPersonId=current-user-id'),
        fetch('/api/delivery/persons/delivery-person-id=current-user-id')
      ]);

      const assignmentsData = await assignmentsRes.json();
      const profileData = await profileRes.json();

      const todayAssignments = assignmentsData.assignments?.filter((a: any) => 
        new Date(a.assignedAt).toDateString() === new Date().toDateString()
      ) || [];

      setDeliveryData({
        assignments: assignmentsData.assignments || [],
        earnings: profileData.deliveryPerson?.totalEarnings || 0,
        todayDeliveries: todayAssignments.filter((a: any) => a.status === 'COMPLETED').length,
        rating: profileData.deliveryPerson?.rating || 0,
        profile: profileData.deliveryPerson
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-purple-600 bg-purple-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const updateAssignmentStatus = async (assignmentId: string, status: string) => {
    try {
      await fetch('/api/delivery/assignments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          status,
          actualTime: status === 'COMPLETED' ? new Date().toISOString() : null
        }),
      });
      
      fetchDeliveryData(); // Refresh data
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { assignments, earnings, todayDeliveries, rating, profile } = deliveryData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {profile?.name || 'Driver'}!
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Location</p>
              <p className="text-sm font-medium">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{todayDeliveries}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {assignments.filter((a: any) => a.status === 'ASSIGNED').length} pending
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings)}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-green-600">
                This week: {formatCurrency(earnings * 0.3)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{rating.toFixed(1)}</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {profile?.totalDeliveries || 0} total deliveries
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.isAvailable ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className="text-3xl">
                {profile?.isAvailable ? '🟢' : '🔴'}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {/* Toggle availability */}}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile?.isAvailable 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {profile?.isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['today', 'upcoming', 'completed'].map((tab) => (
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
          {activeTab === 'today' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Today's Deliveries</h2>
              <div className="space-y-4">
                {assignments
                  .filter((a: any) => new Date(a.assignedAt).toDateString() === new Date().toDateString())
                  .map((assignment: any) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">Delivery #{assignment.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {assignment.deliveryRequest?.deliveryAddress?.street}
                          </p>
                          <p className="text-sm text-gray-600">
                            {assignment.deliveryRequest?.deliveryAddress?.city}, {assignment.deliveryRequest?.deliveryAddress?.state}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm text-gray-600">
                          <p>Customer: {assignment.deliveryRequest?.contactName}</p>
                          <p>Phone: {assignment.deliveryRequest?.contactPhone}</p>
                          <p>Est. Time: {new Date(assignment.estimatedTime).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(assignment.deliveryRequest?.order?.totalAmount || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {assignment.status === 'ASSIGNED' && (
                          <button
                            onClick={() => updateAssignmentStatus(assignment.id, 'IN_PROGRESS')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            Start Delivery
                          </button>
                        )}
                        {assignment.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateAssignmentStatus(assignment.id, 'COMPLETED')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            Mark Delivered
                          </button>
                        )}
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                          View Details
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                          Call Customer
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Deliveries</h2>
              <div className="space-y-4">
                {assignments
                  .filter((a: any) => a.status === 'ASSIGNED' && new Date(a.assignedAt) > new Date())
                  .map((assignment: any) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Delivery #{assignment.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {assignment.deliveryRequest?.deliveryAddress?.city}
                          </p>
                          <p className="text-sm text-gray-600">
                            Scheduled: {new Date(assignment.estimatedTime).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          Scheduled
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'completed' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Deliveries</h2>
              <div className="space-y-4">
                {assignments
                  .filter((a: any) => a.status === 'COMPLETED')
                  .slice(0, 10)
                  .map((assignment: any) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Delivery #{assignment.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {assignment.deliveryRequest?.deliveryAddress?.city}
                          </p>
                          <p className="text-sm text-gray-600">
                            Completed: {new Date(assignment.actualTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(assignment.deliveryRequest?.order?.totalAmount || 0)}
                          </p>
                          <p className="text-sm text-green-600">Completed</p>
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

export default DeliveryPersonDashboard;
