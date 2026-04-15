import React, { createContext, useContext } from "react";
import { useStore, Store } from "./store";
import { useClinicalStore, ClinicalStore } from "./clinicalStore";

interface AppStoreValue extends Store {
  clinical: ClinicalStore;
}

const StoreContext = createContext<AppStoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const clinical = useClinicalStore();
  const value: AppStoreValue = { ...store, clinical };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within StoreProvider");
  return ctx;
}
