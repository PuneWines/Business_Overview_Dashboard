import React from 'react';
import StoreInventoryPage from './StoreInventoryPage';

export default function BalajiSack() {
  const sheetUrl = import.meta.env.VITE_BALAJI_GOOGLE_SHEET_URL;

  return (
    <StoreInventoryPage 
      storeId="balaji" 
      storeName="Balaji Wines Inventory" 
      sheetUrl={sheetUrl}
    />
  );
}
