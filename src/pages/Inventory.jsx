import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package } from 'lucide-react';

const STORES = [
  { id: 'madhura', name: 'Madhura Wines', label: 'Madhura Snack', icon: '🍷', path: '/inventory/madhura' },
  { id: 'balaji',  name: 'Balaji Wines',  label: 'Balaji Sack',   icon: '🍾', path: '/inventory/balaji' },
  { id: 'vishal',  name: 'Vishal Wines',  label: 'Vishal Snack',  icon: '🥂', path: '/inventory/vishal' },
  { id: 'kunal',   name: 'Kunal Ulwe',    label: 'Kunal Ulwe',    icon: '🍻', path: '/inventory/kunal' },
  { id: 'friends', name: 'Friends Wines', label: 'Friends Snack', icon: '🥃', path: '/inventory/friends' },
];

export default function Inventory() {
  const navigate = useNavigate();

  const storeStats = useMemo(() => STORES.map((store) => {
    const data = JSON.parse(localStorage.getItem(`ms_inventory_${store.id}`) || '[]');
    const lowStock = data.filter((r) => (r.closingQtyGod + r.closingCounter) < 10).length;
    const totalSale = data.reduce((s, r) => s + (parseFloat(r.sale) || 0), 0);
    return { ...store, totalItems: data.length, lowStock, totalSale };
  }), []);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-md">
          <Package size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-sky-800">Store Inventory</h1>
          <p className="text-sm text-sky-400">Select a store to manage inventory</p>
        </div>
      </div>

      {/* Store Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STORES.map((store) => (
          <button key={store.id} onClick={() => navigate(store.path)}
            className="group relative overflow-hidden rounded-2xl border-2 border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 p-5 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 shadow-sm">
            <div className="text-3xl mb-3">{store.icon}</div>
            <div className="font-bold text-sm text-sky-700 leading-tight">{store.label}</div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {storeStats.map((store) => (
          <div key={store.id} onClick={() => navigate(store.path)}
            className="bg-white rounded-2xl border border-sky-200 shadow-sm hover:shadow-md hover:border-sky-400 transition-all duration-300 cursor-pointer p-4 group">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
              <Store size={18} className="text-white" />
            </div>
            <h3 className="font-bold text-sky-800 text-sm">{store.name}</h3>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-sky-400">Items</span>
                <span className="font-semibold text-sky-700">{store.totalItems}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sky-400">Low Stock</span>
                <span className={`font-semibold ${store.lowStock > 0 ? 'text-red-500' : 'text-green-500'}`}>{store.lowStock}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sky-400">Total Sale</span>
                <span className="font-semibold text-sky-700">₹{store.totalSale.toLocaleString()}</span>
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold text-sky-500">View Details →</p>
          </div>
        ))}
      </div>
    </div>
  );
}
