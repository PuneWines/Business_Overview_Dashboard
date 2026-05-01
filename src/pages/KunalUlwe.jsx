import React from 'react';
import StoreInventoryPage from './StoreInventoryPage';

export default function KunalUlwe() {
  const sheetUrl = import.meta.env.VITE_KUNAL_GOOGLE_SHEET_URL;

  return (
    <StoreInventoryPage 
      storeId="kunal" 
      storeName="Kunal Ulwe Inventory" 
      sheetUrl={sheetUrl}
    />
  );
}
