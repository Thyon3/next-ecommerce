"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProductComparisonProps {
  productIds: string[];
  onCompare?: (products: any[]) => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({ 
  productIds, 
  onCompare 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    if (productIds.length > 0) {
      fetchProducts();
    }
  }, [productIds]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        extractFeatures(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products for comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractFeatures = (products: any[]) => {
    const allFeatures = new Set();
    products.forEach(product => {
      if (product.features) {
        product.features.forEach((feature: any) => {
          allFeatures.add(feature.name);
        });
      }
    });
    setFeatures(Array.from(allFeatures));
  };

  const getFeatureValue = (product: any, featureName: string) => {
    const feature = product.features?.find((f: any) => f.name === featureName);
    return feature ? feature.value : 'N/A';
  };

  const removeProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    onCompare?.(updatedProducts);
  };

  const clearComparison = () => {
    setProducts([]);
    onCompare?.([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products selected for comparison</p>
        <p className="text-sm text-gray-400 mt-2">
          Add products to compare their features side by side
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Comparison</h2>
        <button
          onClick={clearComparison}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                Feature
              </th>
              {products.map((product: any) => (
                <th key={product.id} className="border border-gray-200 px-4 py-3 text-center">
                  <div>
                    <img
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded mx-auto mb-2"
                    />
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-green-600 font-bold">${product.price}</p>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Basic Info Row */}
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 font-medium">
                Price
              </td>
              {products.map((product: any) => (
                <td key={product.id} className="border border-gray-200 px-4 py-3 text-center">
                  <span className="font-bold text-green-600">${product.price}</span>
                </td>
              ))}
            </tr>

            {/* Stock Row */}
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 font-medium">
                Stock
              </td>
              {products.map((product: any) => (
                <td key={product.id} className="border border-gray-200 px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Category Row */}
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 font-medium">
                Category
              </td>
              {products.map((product: any) => (
                <td key={product.id} className="border border-gray-200 px-4 py-3 text-center">
                  {product.category || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Features Rows */}
            {features.map((feature: string) => (
              <tr key={feature} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium">
                  {feature}
                </td>
                {products.map((product: any) => (
                  <td key={product.id} className="border border-gray-200 px-4 py-3 text-center">
                    {getFeatureValue(product, feature)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Action Row */}
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 font-medium">
                Actions
              </td>
              {products.map((product: any) => (
                <td key={product.id} className="border border-gray-200 px-4 py-3 text-center">
                  <div className="space-y-2">
                    <button
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      onClick={() => window.open(`/product/${product.id}`, '_blank')}
                    >
                      View Details
                    </button>
                    <button
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      disabled={product.stock <= 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Compare up to 4 products side by side to make the best choice
        </p>
      </div>
    </div>
  );
};

export default ProductComparison;
