"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  venueId: string;
}

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (token: string, customer: CustomerProfile) => void;
  logout: () => void;
  updateCustomerProfile: (data: Partial<CustomerProfile>) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("zogui_customer_token");
      const storedCustomer = localStorage.getItem("zogui_customer_profile");
      if (storedToken && storedCustomer) {
        setToken(storedToken);
        setCustomer(JSON.parse(storedCustomer));
      }
    } catch (err) {
      console.warn("Could not load customer auth from storage");
    }
  }, []);

  const login = (newToken: string, newCustomer: CustomerProfile) => {
    setToken(newToken);
    setCustomer(newCustomer);
    try {
      localStorage.setItem("zogui_customer_token", newToken);
      localStorage.setItem("zogui_customer_profile", JSON.stringify(newCustomer));
    } catch (e) {
      console.warn("Failed to persist customer auth");
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
    try {
      localStorage.removeItem("zogui_customer_token");
      localStorage.removeItem("zogui_customer_profile");
    } catch (e) {
      console.warn("Failed to clear customer auth");
    }
  };

  const updateCustomerProfile = (data: Partial<CustomerProfile>) => {
    if (!customer) return;
    const updated = { ...customer, ...data };
    setCustomer(updated);
    try {
      localStorage.setItem("zogui_customer_profile", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: Boolean(customer && token),
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        logout,
        updateCustomerProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};
