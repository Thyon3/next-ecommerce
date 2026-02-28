export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: '/api/products',
    SEARCH: '/api/products/search',
    COMPARE: '/api/products/compare',
    RECOMMENDATIONS: '/api/products/recommendations',
    REVIEWS: '/api/reviews',
  },
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders',
    DETAIL: '/api/orders',
    UPDATE: '/api/orders',
    CANCEL: '/api/orders',
    TRACKING: '/api/orders/tracking',
  },
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart/add',
    UPDATE: '/api/cart/update',
    REMOVE: '/api/cart/remove',
    CLEAR: '/api/cart/clear',
  },
  WISHLIST: {
    GET: '/api/wishlist',
    ADD: '/api/wishlist',
    REMOVE: '/api/wishlist',
    CLEAR: '/api/wishlist/clear',
  },
  DELIVERY: {
    REQUESTS: '/api/delivery/requests',
    PERSONS: '/api/delivery/persons',
    ASSIGNMENTS: '/api/delivery/assignments',
    LOCATION: '/api/delivery/location',
    RATINGS: '/api/delivery/ratings',
    REPORTS: '/api/delivery/reports',
    SUPPORT: '/api/delivery/support',
    PAYOUTS: '/api/delivery/payouts',
    EXPENSES: '/api/delivery/expenses',
    ZONES: '/api/delivery/zones',
    COMMISSION: '/api/delivery/commission',
  },
  SUBSCRIPTIONS: {
    LIST: '/api/subscriptions',
    CREATE: '/api/subscriptions',
    UPDATE: '/api/subscriptions',
    CANCEL: '/api/subscriptions',
  },
  PAYMENTS: {
    INTENT: '/api/stripe/payment',
    METHODS: '/api/stripe/payment-methods',
    CHECKOUT: '/api/stripe/checkout',
    WEBHOOK: '/api/stripe/webhook',
    CUSTOMERS: '/api/stripe/customers',
    REFUNDS: '/api/stripe/refunds',
    BALANCE: '/api/stripe/balance',
    TRANSFERS: '/api/stripe/transfers',
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    ANALYTICS: '/api/admin/analytics',
    USERS: '/api/admin/users',
    PRODUCTS: '/api/admin/products',
    ORDERS: '/api/admin/orders',
    DELIVERY_ANALYTICS: '/api/admin/delivery/analytics',
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  DELIVERY_PERSON: 'DELIVERY_PERSON',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  HOME: 'home',
  BEAUTY: 'beauty',
  SPORTS: 'sports',
  BOOKS: 'books',
  TOYS: 'toys',
  FOOD: 'food',
  HEALTH: 'health',
  AUTOMOTIVE: 'automotive',
} as const;

export const DELIVERY_TYPES = {
  STANDARD: 'STANDARD',
  EXPRESS: 'EXPRESS',
  SAME_DAY: 'SAME_DAY',
  OVERNIGHT: 'OVERNIGHT',
  INTERNATIONAL: 'INTERNATIONAL',
} as const;
