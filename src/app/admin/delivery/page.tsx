"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DeliveryDashboard: React.FC = () => {
  const [deliveryData, setDeliveryData] = useState({
    requests: [],
    assignments: [],
    persons: [],
    analytics: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '7',
    deliveryPerson: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      const [requestsRes, assignmentsRes, personsRes, analyticsRes] = await Promise.all([
        fetch(`/api/delivery/requests?limit=50`),
        fetch(`/api/delivery/assignments?limit=50`),
        fetch(`/api/delivery/persons?limit=50`),
        fetch(`/api/admin/delivery/analytics?period=${filters.dateRange}`)
      ]);

      const [requestsData, assignmentsData, personsData, analyticsData] = await Promise.all([
        requestsRes.json(),
        assignmentsRes.json(),
        personsRes.json(),
        analyticsRes.json()
      ]);

      setDeliveryData({
        requests: requestsData.deliveryRequests || [],
        assignments: assignmentsData.assignments || [],
        persons: personsData.deliveryPersons || [],
        analytics: analyticsData
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { requests, assignments, persons, analytics } = deliveryData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all delivery operations</p>
        </div>

        {/* Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalDeliveries}</p>
                </div>
                <div className="text-3xl">📦</div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-green-600">
                  {analytics.overview.successRate.toFixed(1)}% success rate
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  +{formatCurrency(analytics.overview.totalTips)} in tips
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {persons.filter(p => p.isAvailable).length}
                  </p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  {persons.length - persons.filter(p => p.isAvailable).length} offline
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.averageRating.toFixed(1)}
                  </p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  {analytics.overview.avgDeliveryTime.toFixed(0)} min avg time
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'requests', 'assignments', 'drivers'].map((tab) => (
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
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {requests.slice(0, 5).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </div>
                      <div>
                        <p className="font-medium">Delivery #{request.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {request.deliveryAddress.street}, {request.deliveryAddress.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(request.order?.totalAmount || 0)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Delivery Requests</h2>
                <div className="flex gap-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request: any) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{request.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.user?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {request.deliveryAddress.city}, {request.deliveryAddress.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Delivery Assignments</h2>
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Assignment #{assignment.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          Driver: {assignment.deliveryPerson?.name || 'Unassigned'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Est. Time: {new Date(assignment.estimatedTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Delivery Drivers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {persons.map((person: any) => (
                  <div key={person.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-gray-600">{person.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        person.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {person.isAvailable ? 'Available' : 'Offline'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">⭐ {person.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deliveries:</span>
                        <span className="font-medium">{person.totalDeliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium">{person.vehicle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{person.phone}</span>
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

export default DeliveryDashboard;
