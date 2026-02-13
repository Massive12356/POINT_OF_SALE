import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '../types/product';
import { StoreService } from '../services/localStorageService';

/**
 * Store Context Type
 */
interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  switchStore: (storeId: string) => void;
  refreshStores: () => void;
  isLoading: boolean;
}

/**
 * Store Context
 */
const StoreContext = createContext<StoreContextType | undefined>(undefined);

/**
 * Store Provider Props
 */
interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Store Provider Component
 * Manages global store state across the application
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load stores and current store on mount
   */
  const loadStores = useCallback(() => {
    setIsLoading(true);
    const allStores = StoreService.getAll();
    const activeStore = StoreService.getCurrentStore();
    
    setStores(allStores);
    setCurrentStore(activeStore || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  /**
   * Switch to a different store
   */
  const switchStore = useCallback((storeId: string) => {
    StoreService.setCurrentStore(storeId);
    const store = StoreService.findById(storeId);
    setCurrentStore(store || null);
    
    // Small delay to ensure localStorage is updated before components read
    setTimeout(() => {
      // Dispatch event to notify components of store change
      window.dispatchEvent(new CustomEvent('storeChanged', { detail: { storeId } }));
    }, 0);
  }, []);

  /**
   * Refresh stores list
   */
  const refreshStores = useCallback(() => {
    loadStores();
  }, [loadStores]);

  const value: StoreContextType = {
    currentStore,
    stores,
    switchStore,
    refreshStores,
    isLoading,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * Hook to use Store Context
 */
export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

/**
 * Hook to get current store ID
 */
export function useCurrentStoreId(): string | null {
  const { currentStore } = useStore();
  return currentStore?.id || null;
}
