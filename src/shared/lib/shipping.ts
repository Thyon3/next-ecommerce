export interface ShippingRate {
  id: string;
  name: string;
  description: string;
  rate: number;
  estimatedDays: number;
  type: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT';
}

export interface ShippingAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ShippingCalculation {
  rates: ShippingRate[];
  selectedRate?: ShippingRate;
}

// Calculate shipping rates based on address and order total
export const calculateShippingRates = async (
  address: ShippingAddress,
  orderTotal: number
): Promise<ShippingRate[]> => {
  // Basic shipping logic - in production, this would integrate with carriers like UPS, FedEx, etc.
  const baseRates: ShippingRate[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      rate: orderTotal > 50 ? 0 : 9.99, // Free shipping over $50
      estimatedDays: 6,
      type: 'STANDARD'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      rate: 14.99,
      estimatedDays: 3,
      type: 'EXPRESS'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day',
      rate: 24.99,
      estimatedDays: 1,
      type: 'OVERNIGHT'
    }
  ];

  // Add international shipping logic
  if (address.country !== 'US') {
    baseRates.forEach(rate => {
      rate.rate *= 2.5; // International shipping multiplier
      rate.estimatedDays += 2; // Extra days for international
    });
  }

  // Add distance-based calculation (simplified)
  const distanceMultiplier = getDistanceMultiplier(address.state || '');
  baseRates.forEach(rate => {
    rate.rate *= distanceMultiplier;
  });

  return baseRates.map(rate => ({
    ...rate,
    rate: Math.round(rate.rate * 100) / 100 // Round to 2 decimal places
  }));
};

// Simple distance multiplier based on US states (simplified for demo)
const getDistanceMultiplier = (state: string): number => {
  // In production, this would use actual distance calculation
  const eastCoast = ['NY', 'FL', 'GA', 'NC', 'SC', 'VA', 'MD', 'DE', 'NJ', 'CT', 'RI', 'MA', 'NH', 'ME', 'VT', 'PA'];
  const westCoast = ['CA', 'OR', 'WA', 'NV', 'AZ'];
  const midwest = ['IL', 'IN', 'OH', 'MI', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE', 'SD', 'ND'];
  
  if (eastCoast.includes(state)) return 1.0;
  if (westCoast.includes(state)) return 1.2;
  if (midwest.includes(state)) return 1.1;
  return 1.15; // Default for other states
};

// Generate tracking number
export const generateTrackingNumber = (): string => {
  const prefix = 'BTX'; // Bitex Tracking
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${random}`;
};

// Get tracking status based on order status and timeline
export const getTrackingStatus = (order: any) => {
  const created = new Date(order.createdAt);
  const estimatedDelivery = new Date(order.estimatedDelivery);
  const now = new Date();
  
  const statuses = {
    PROCESSING: {
      status: 'Order Processing',
      description: 'Your order is being prepared for shipment',
      progress: 20
    },
    SHIPPED: {
      status: 'Shipped',
      description: 'Your order has been shipped and is on its way',
      progress: 60
    },
    DELIVERED: {
      status: 'Delivered',
      description: 'Your order has been delivered',
      progress: 100
    }
  };

  return statuses[order.status as keyof typeof statuses] || statuses.PROCESSING;
};
