import React from 'react';
import StoreInventoryPage from './StoreInventoryPage';

export default function VishalSnack() {
  const sheetUrl = import.meta.env.VITE_VISHAL_GOOGLE_SHEET_URL;

  return (
    <StoreInventoryPage 
      storeId="vishal" 
      storeName="Vishal Wines Inventory" 
      sheetUrl={sheetUrl}
    />
  );
}
