import React from 'react';
import StoreInventoryPage from './StoreInventoryPage';

export default function MadhuraSnack() {
  const sheetUrl = import.meta.env.VITE_MADHURA_GOOGLE_SHEET_URL || import.meta.env.MADHURA_GOOGLE_SHEET_URL;
  
  return (
    <StoreInventoryPage 
      storeId="madhura" 
      storeName="Madhura Wines Inventory" 
      sheetUrl={sheetUrl}
    />
  );
}
