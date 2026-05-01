import React from 'react';
import StoreInventoryPage from './StoreInventoryPage';

export default function FriendsSnack() {
  const sheetUrl = import.meta.env.VITE_FRIENDS_GOOGLE_SHEET_URL;

  return (
    <StoreInventoryPage 
      storeId="friends" 
      storeName="Friends Wines Inventory" 
      sheetUrl={sheetUrl}
    />
  );
}
