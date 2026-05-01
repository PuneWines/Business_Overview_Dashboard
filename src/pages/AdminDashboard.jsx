import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ClipboardCheck, MessageSquare, ClipboardList,
  CheckSquare, Ticket, TrendingUp, AlertTriangle, Store,
  ThumbsUp, ArrowRight, Activity,
} from 'lucide-react';

const STORES = [
  { id: 'madhura', name: 'Madhura Wines', path: '/inventory/madhura', color: 'sky' },
  { id: 'balaji',  name: 'Balaji Wines',  path: '/inventory/balaji',  color: 'indigo' },
  { id: 'vishal',  name: 'Vishal Wines',  path: '/inventory/vishal',  color: 'violet' },
  { id: 'kunal',   name: 'Kunal Ulwe',    path: '/inventory/kunal',   color: 'purple' },
  { id: 'friends', name: 'Friends Wines', path: '/inventory/friends', color: 'fuchsia' },
];

const COLOR = {
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     badge: 'bg-sky-500' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  badge: 'bg-indigo-500' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  badge: 'bg-violet-500' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  badge: 'bg-purple-500' },
  fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', badge: 'bg-fuchsia-500' },
};

function getLS(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── Data from all modules ────────────────────────────────────────────────
  const storeStats = useMemo(() =>
    STORES.map(s => {
      const data = getLS(`ms_inventory_${s.id}`);
      const totalItems   = data.length;
      const lowStock     = data.filter(r => (r.closingQtyGod + r.closingCounter) < 10).length;
      const critical     = data.filter(r => r.status === 'Critical').length;
      const totalSale    = data.reduce((a, r) => a + (parseFloat(r.sale) || 0), 0);
      const totalProfit  = data.reduce((a, r) => a + (parseFloat(r.profit) || 0), 0);
      return { ...s, totalItems, lowStock, critical, totalSale, totalProfit };
    }), []);

  const shopVisits     = useMemo(() => getLS('ms_shop_visits'), []);
  const feedback       = useMemo(() => getLS('ms_customer_feedback'), []);
  const complaints     = useMemo(() => getLS('ms_complaints'), []);
  const helpTickets    = useMemo(() => getLS('ms_help_tickets'), []);

  // ── Aggregate KPIs ───────────────────────────────────────────────────────
  const totalInventoryItems = storeStats.reduce((a, s) => a + s.totalItems, 0);
  const totalLowStock       = storeStats.reduce((a, s) => a + s.lowStock, 0);
  const totalCritical       = storeStats.reduce((a, s) => a + s.critical, 0);
  const totalSaleAll        = storeStats.reduce((a, s) => a + s.totalSale, 0);
  const totalProfitAll      = storeStats.reduce((a, s) => a + s.totalProfit, 0);

  const pendingVisits       = shopVisits.filter(v => v.status === 'Pending' || !v.status).length;
  const positiveFeedback    = feedback.filter(f => f.rating >= 4).length;
  const openComplaints      = complaints.filter(c => c.status !== 'Resolved').length;
  const openTickets         = helpTickets.filter(t => t.status !== 'Closed' && t.status !== 'Done').length;

  const KPI_CARDS = [
    { label: 'Total SKUs',      value: totalInventoryItems, icon: Package,        color: 'bg-sky-500',    sub: `${totalLowStock} low stock` },
    { label: 'Critical Stock',  value: totalCritical,       icon: AlertTriangle,  color: 'bg-red-500',    sub: 'items need restock' },
    { label: 'Total Sale Units',value: totalSaleAll.toLocaleString(), icon: TrendingUp, color: 'bg-green-500', sub: 'across all stores' },
    { label: 'Total Profit',    value: `₹${totalProfitAll.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-500', sub: 'combined stores' },
    { label: 'Shop Visits',     value: shopVisits.length,   icon: ClipboardCheck, color: 'bg-indigo-500', sub: `${pendingVisits} pending` },
    { label: 'Feedback',        value: feedback.length,     icon: ThumbsUp,       color: 'bg-purple-500', sub: `${positiveFeedback} positive` },
    { label: 'Complaints',      value: complaints.length,   icon: ClipboardList,  color: 'bg-orange-500', sub: `${openComplaints} open` },
    { label: 'Help Tickets',    value: helpTickets.length,  icon: Ticket,         color: 'bg-rose-500',   sub: `${openTickets} open` },
  ];

  const MODULE_SHORTCUTS = [
    { label: 'Shop Visit',          path: '/shop-visit',           icon: ClipboardCheck, count: shopVisits.length,  badge: pendingVisits,   badgeColor: 'bg-orange-400' },
    { label: 'Customer Feedback',   path: '/customer-feedback',    icon: MessageSquare,  count: feedback.length,    badge: positiveFeedback, badgeColor: 'bg-green-400' },
    { label: 'Assign Complaint',    path: '/assigned-complain',    icon: ClipboardList,  count: complaints.length,  badge: openComplaints,  badgeColor: 'bg-red-400' },
    { label: 'Complaint Resolution',path: '/complain-resolution',  icon: CheckSquare,    count: complaints.filter(c => c.status === 'Resolved').length, badge: null },
    { label: 'Help Ticket',         path: '/help-ticket',          icon: Ticket,         count: helpTickets.length, badge: openTickets,     badgeColor: 'bg-rose-400' },
  ];

  return (
    <div className="p-4 space-y-5">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {KPI_CARDS.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col gap-1">
            <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center mb-1`}>
              <card.icon size={15} className="text-white" />
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-tight">{card.label}</p>
            <p className="text-lg font-bold text-gray-800 leading-none">{card.value}</p>
            <p className="text-[10px] text-gray-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Store Inventory Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center">
              <Store size={14} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-gray-800">Store Inventory Overview</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {storeStats.map(store => {
            const c = COLOR[store.color];
            return (
              <div key={store.id}
                onClick={() => navigate(store.path)}
                className={`${c.bg} border ${c.border} rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 ${c.badge} rounded-lg flex items-center justify-center`}>
                    <Store size={14} className="text-white" />
                  </div>
                  <ArrowRight size={13} className={`${c.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <p className={`text-xs font-bold ${c.text} leading-tight mb-3`}>{store.name}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Total SKUs</span>
                    <span className="font-semibold text-gray-700">{store.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Low Stock</span>
                    <span className={`font-semibold ${store.lowStock > 0 ? 'text-red-500' : 'text-green-500'}`}>{store.lowStock}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Sale Units</span>
                    <span className="font-semibold text-gray-700">{store.totalSale}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Profit</span>
                    <span className="font-semibold text-emerald-600">₹{store.totalProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Shortcuts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <h2 className="text-sm font-bold text-gray-800">Operations Modules</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODULE_SHORTCUTS.map(mod => (
            <button key={mod.path}
              onClick={() => navigate(mod.path)}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-indigo-300 transition-all group flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                  <mod.icon size={14} className="text-indigo-500 group-hover:text-white transition-colors" />
                </div>
                {mod.badge > 0 && (
                  <span className={`${mod.badgeColor} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full`}>
                    {mod.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{mod.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{mod.count} records</p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
