"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking";

interface CartItem {
  _id: string; // Package ID
  name: string;
  price: number;
  type: 'package';
  image?: string;
  duration?: number; // Added for duration selection
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem, openDrawer?: boolean) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  coupon: any;
  applyCoupon: (coupon: any) => void;
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  updateDuration: (id: string, months: number) => void; // Added
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
    // Recalculate discount if items change
    if (coupon) {
       calculateDiscount(items, coupon);
    }
  }, [items]);

  const addToCart = (item: CartItem, openDrawer: boolean = true) => {
    trackEvent('add_to_cart', {
      value: item.price,
      currency: 'USD',
      items: [{
        item_id: item._id,
        item_name: item.name,
        price: item.price
      }]
    });

    const existingIndex = items.findIndex((i) => i._id === item._id);
    
    if (existingIndex > -1) {
      setItems((prev) => prev.map((i, idx) => 
        idx === existingIndex ? { ...i, duration: (i.duration || 1) + 1 } : i
      ));
      toast.success(`Extended ${item.name} duration`);
      if (openDrawer && !isCartOpen) setIsCartOpen(true);
      return;
    }
    
    setItems((prev) => [...prev, { ...item, duration: 1 }]); // Default to 1 month
    toast.success("Added to cart");
    if (openDrawer && !isCartOpen) setIsCartOpen(true);
  };

  const updateDuration = (id: string, months: number) => {
    setItems((prev) => prev.map(item => 
        item._id === id ? { ...item, duration: months } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setDiscountAmount(0);
  };

  const applyCoupon = (newCoupon: any) => {
    setCoupon(newCoupon);
    calculateDiscount(items, newCoupon);
    toast.success("Coupon applied!");
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
    toast.info("Coupon removed");
  };

  const calculateDiscount = (currentItems: CartItem[], currentCoupon: any) => {
      if (!currentCoupon) {
          setDiscountAmount(0);
          return;
      }
      const total = currentItems.reduce((sum, item) => sum + item.price, 0);
      let discount = 0;
      if (currentCoupon.discountType === 'flat') {
          discount = currentCoupon.discountAmount;
      } else {
          discount = (total * currentCoupon.discountAmount) / 100;
      }
      if (discount > total) discount = total;
      setDiscountAmount(discount);
  };

  const cartTotal = items.reduce((sum, item) => sum + (item.price * (item.duration || 1)), 0);
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        itemCount: items.length,
        coupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        finalTotal,
        isCartOpen,
        setIsCartOpen,
        updateDuration,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
