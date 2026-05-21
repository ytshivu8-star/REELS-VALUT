export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  deliveryLink: string;
  previews: string[];
  tags: string[];
  details: string[];
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  razorpayOrderId: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin?: boolean;
  purchasedProductIds?: string[];
}
