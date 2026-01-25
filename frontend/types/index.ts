/**
 * Type Exports for Beautique Store
 */

// Product types
export type {
  Product,
  ProductCategory,
  ProductSize,
  ProductCreate,
  ProductUpdate,
  ProductListParams,
  ProductListResponse,
  ProductCardProps,
  ProductGridProps,
  ProductFilterProps,
  ProductFilterState,
  ImageGalleryProps,
} from './product'

// Order types
export type {
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  DeliveryStatus,
  OrderItem,
  OrderCreate,
  OrderResponse,
  OrderTracking,
  OrderDetail,
  OrderListItem,
  OrderListParams,
  OrderListResponse,
  OrderStatusUpdate,
  CheckoutFormData,
  TrackOrderFormData,
} from './order'

// Admin types
export type {
  Admin,
  AdminLogin,
  AdminLoginResponse,
  DashboardAnalytics,
  RecentOrder,
  AuthState,
  AuthContextType,
} from './admin'

// Cart types
export type {
  CartItem,
  CartState,
  CartAction,
  CartContextType,
  AddToCartParams,
} from './cart'

// Wishlist types
export type {
  WishlistItem,
  WishlistState,
  WishlistAction,
  WishlistContextType,
} from './wishlist'

// API types
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  ValidationError,
  CategoriesResponse,
  CategoryInfo,
  ApiRequestOptions,
} from './api'

export { API_ERROR_MESSAGES } from './api'
