import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
    discount?: {
      isActive: boolean;
      type: string;
      value: number;
    };
  };
  quantity: number;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  discountType?: string;
  hasVoucher?: boolean;
  voucherApplied?: boolean;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalAmount: number;
  totalDiscount?: number;
  finalAmount?: number;
  voucherApplied?: string;
  user: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number, voucherCode?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyVoucher: (voucherCode: string) => Promise<void>;
  checkout: (shippingAddress: any, paymentMethod: string, voucherCode?: string) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { API_URL, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart whenever user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/cart`, {
          withCredentials: true
        });
        setCart(response.data.cart);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to fetch cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, API_URL]);

  const addToCart = async (productId: string, quantity: number = 1, voucherCode?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload: any = { productId, quantity };
      
      // If voucher code is provided, add it to the payload
      if (voucherCode) {
        payload.voucherCode = voucherCode;
      }
      
      const response = await axios.post(
        `${API_URL}/api/cart/add`, 
        payload,
        { withCredentials: true }
      );
      
      setCart(response.data.cart);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(
        `${API_URL}/api/cart/update`, 
        { itemId, quantity },
        { withCredentials: true }
      );
      
      setCart(response.data.cart);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(
        `${API_URL}/api/cart/remove/${itemId}`,
        { withCredentials: true }
      );
      
      setCart(response.data.cart);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(
        `${API_URL}/api/cart/clear`,
        { withCredentials: true }
      );
      
      setCart(response.data.cart);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyVoucher = async (voucherCode: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${API_URL}/api/cart/apply-voucher`,
        { voucherCode },
        { withCredentials: true }
      );
      
      setCart(response.data.cart);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to apply voucher';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (shippingAddress: any, paymentMethod: string, voucherCode?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload: any = { shippingAddress, paymentMethod };
      
      // If voucher code is provided, add it to the payload
      if (voucherCode) {
        payload.voucherCode = voucherCode;
      }
      
      const response = await axios.post(
        `${API_URL}/api/cart/checkout`,
        payload,
        { withCredentials: true }
      );
      
      // Properly reset the cart state
      setCart({
        _id: cart?._id || '',
        user: cart?.user || '',
        items: [],
        totalAmount: 0
      } as Cart);
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Checkout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      applyVoucher,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};