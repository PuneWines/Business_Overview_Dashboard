import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ClipboardCheck, Plus, X, Eye, Loader2, RotateCw, Search, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SHOP_NAMES = ['Friends Wines', 'Vishal Wines', 'Madhura Wines', 'Balaji Wines', 'Kunal Wines'];

const CHECKBOX_FIELDS = [
  'Cash-Counter', 'Barcode-Scanner', 'Offer-Board',
  'Card Swipe Machine + Charger & UPI Sound Box + Charger',
  'Sale Point 1', 'Sale Point 2', 'Sale Point 3',
  'Main Server Computer', 'Billing Printer', 'Excise Printer',
  'CCTV Camera TV Remote', 'Alarm System 1', 'Alarm System 2', 'Fire Cylinder',
  'Fridge Steel', 'Fridge Budwiser', 'Fridge Kingfisher',
  'Water Jar', 'Cleaning Item (Mop, Bucket & Cleaning Liquids)',
  'Main Wine Shop Brand', 'Window Display',
  'Display Stand', 'Chair & Tables', 'Sutter & Door',
  'Sutter Sensor Remote', 'Wifi/Networking', 'Mobile Phone + Charger',
  'Inverter', 'Main Sutter & Central Luck Key',
  'Cash Counter & Drawer Key', 'Godown/Store Room Key',
  'Showcase/Display Case Key', 'Bike Available (Activa)',
  'Bike Available (Electric)', 'Bike Charge (Electric)', 'Helmet',
  'TRO Penalty Cleared', 'Shop Licence', 'FSSAI Food Licence',
  'Shop Act', 'Shop Map', 'VAT Certificate',
  'TP File (IMFL+CL+MML)',
  'Excise Register & Printout & Monthly (IMFL+CL+MML)',
  'Attendance Book', 'Nokarnama & ID Proof', 'Visit Book',
  'Expence Book', 'Shop Rent', 'License Rent',
  'Excise & Police Monthly', 'Opening Cash',
];

const CHECKBOX_OPTIONS = ['OK', 'Not Ok', 'Missing'];

function getDefaultForm() {
  const form = {
    visitDate: new Date().toISOString().split('T')[0],
    visitorName: '',
    shopName: '',
    handoverByName: '',
    takeoverByName: '',
    lightingDamage: '',
    wholesalePartyAmount: '',
    wholesaleImageLink: '',
  };
  CHECKBOX_FIELDS.forEach((f) => { form[f] = ''; });
  return form;
}

const STORAGE_KEY = 'ms_shop_visits';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
};

export default function ShopVisit() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(getDefaultForm);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  const sheetUrl = import.meta.env.VITE_SHOP_VISIT_GOOGLE_SHEET_URL;

  const fetchData = useCallback(async () => {
    if (!sheetUrl) return;
    setLoading(true);
    try {
      const resp = await fetch(`${sheetUrl}?sheet=Shop-Visit`);
      const result = await resp.json();
      if (result.success && result.data) {
        // Headers are in Row 3 (Index 2). Data starts Row 4 (Index 3).
        const rawRows = result.data.slice(3); 
        const mapped = rawRows
          .filter(row => row[1] || row[2]) // Filter empty rows (must have date or visitor)
          .map((row, idx) => {
            const v = {
              id: `SV-${idx}`,
              timestamp: row[0],
              visitDate: row[1],
              visitorName: row[2],
              shopName: row[3],
              handoverByName: row[4],
              takeoverByName: row[5],
              lightingDamage: row[58],
              wholesalePartyAmount: row[59],
              wholesaleImageLink: row[60],
            };
            CHECKBOX_FIELDS.forEach((f, fi) => {
              v[f] = row[6 + fi];
            });
            return v;
          });
        setVisits(mapped.reverse()); // Latest first
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch shop visits");
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!sheetUrl) {
      toast.error("Google Sheet URL not configured");
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      // Format as YYYY-MM-DD HH:mm:ss for Google Sheets auto-detection
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      // Map form to BI (61 columns)
      const rowData = [
        timestamp,
        form.visitDate,
        form.visitorName,
        form.shopName,
        form.handoverByName,
        form.takeoverByName,
        ...CHECKBOX_FIELDS.map(f => form[f]),
        form.lightingDamage,
        form.wholesalePartyAmount,
        form.wholesaleImageLink
      ];

      const params = new URLSearchParams({
        action: 'insert',
        sheetName: 'Shop-Visit',
        rowData: JSON.stringify(rowData)
      });

      await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: params });
      toast.success("Visit recorded successfully");
      setShowModal(false);
      setForm(getDefaultForm());
      setTimeout(fetchData, 1500);
    } catch (err) {
      toast.error("Failed to save visit");
    } finally {
      setLoading(false);
    }
  };

  const allCols = [
    'Visit Date', 'Visitor Name', 'Shop Name',
    'Handover By', 'Takeover By',
    ...CHECKBOX_FIELDS,
    'Lighting Damage', 'Wholesale Image Link', 'Wholesale Party Amount',
  ];

  const [search, setSearch] = useState('');
  const [shopFilter, setShopFilter] = useState('');
  const [visitorFilter, setVisitorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const hasFilter = search || shopFilter || visitorFilter || dateFrom || dateTo;

  const filtered = useMemo(() => visits.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.visitorName?.toLowerCase().includes(q) || v.shopName?.toLowerCase().includes(q) || v.visitDate?.includes(q);
    const matchShop = !shopFilter || v.shopName === shopFilter;
    const matchVisitor = !visitorFilter || v.visitorName?.toLowerCase().includes(visitorFilter.toLowerCase());
    const matchFrom = !dateFrom || v.visitDate >= dateFrom;
    const matchTo = !dateTo || v.visitDate <= dateTo;
    return matchSearch && matchShop && matchVisitor && matchFrom && matchTo;
  }), [visits, search, shopFilter, visitorFilter, dateFrom, dateTo]);

  return (
    <div className="p-3 flex flex-col gap-3 h-full overflow-hidden">

      {/* Toolbar Row 1: Search + Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[140px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visits..."
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
        </div>
        {/* Shop Filter */}
        <select value={shopFilter} onChange={e => setShopFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
          <option value="">All Shops</option>
          {SHOP_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* Visitor Filter */}
        <input value={visitorFilter} onChange={e => setVisitorFilter(e.target.value)} placeholder="Visitor name..."
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white min-w-[130px]" />
        {/* Date From */}
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
        {/* Date To */}
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
        {/* Clear */}
        {hasFilter && (
          <button onClick={() => { setSearch(''); setShopFilter(''); setVisitorFilter(''); setDateFrom(''); setDateTo(''); }}
            className="flex items-center gap-1 border border-red-300 text-red-600 px-2 py-1.5 rounded-lg text-xs hover:bg-red-50 transition-colors whitespace-nowrap">
            <X size={12} /> Clear
          </button>
        )}
        {/* Refresh */}
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />}
          Refresh
        </button>
        {/* New Visit */}
        <button onClick={() => { setForm(getDefaultForm()); setShowModal(true); }}
          className="ml-auto flex items-center gap-1.5 bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all whitespace-nowrap">
          <Plus size={13} /> New Visit
        </button>
      </div>

      {/* Table — fills remaining height */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '530px' }}>
        <div className="overflow-auto flex-1">
          <table className="text-xs border-separate" style={{ minWidth: '1600px', borderSpacing: 0 }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky z-30 bg-gray-50 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider border-r border-gray-100 border-b border-gray-200 whitespace-nowrap" style={{ left: 0, top: 0, width: 36, minWidth: 36 }}>#</th>
                <th className="sticky z-30 bg-gray-50 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-r border-gray-100 border-b border-gray-200" style={{ left: 36, top: 0, width: 100, minWidth: 100 }}>Visit Date</th>
                <th className="sticky z-30 bg-gray-50 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-r border-gray-100 border-b border-gray-200" style={{ left: 136, top: 0, width: 120, minWidth: 120 }}>Visitor</th>
                <th className="sticky z-30 bg-gray-50 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-r border-gray-200 border-b border-gray-200 shadow-[2px_0_6px_rgba(0,0,0,0.08)]" style={{ left: 256, top: 0, width: 140, minWidth: 140 }}>Shop</th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Handover By</th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Takeover By</th>
                {CHECKBOX_FIELDS.map(f => (
                  <th key={f} className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap min-w-[90px] border-b border-gray-200">{f}</th>
                ))}
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Lighting Damage</th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Party Amount</th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Wholesale Image</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={61} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={30} className="animate-spin text-sky-500" />
                      <p className="text-gray-500 text-sm animate-pulse">Syncing with Google Sheets...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={61} className="text-center py-8 text-gray-400">No visit records found</td></tr>
              ) : filtered.map((v, idx) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="sticky z-10 bg-white px-2 py-1.5 text-gray-400 border-r border-gray-100" style={{ left: 0, width: 36, minWidth: 36 }}>{idx + 1}</td>
                  <td className="sticky z-10 bg-white px-2 py-1.5 text-gray-700 whitespace-nowrap border-r border-gray-100" style={{ left: 36, width: 100, minWidth: 100 }}>{formatDate(v.visitDate)}</td>
                  <td className="sticky z-10 bg-white px-2 py-1.5 text-gray-700 whitespace-nowrap border-r border-gray-100" style={{ left: 136, width: 120, minWidth: 120 }}>{v.visitorName}</td>
                  <td className="sticky z-10 bg-white px-2 py-1.5 text-gray-800 font-medium whitespace-nowrap border-r border-gray-200 shadow-[2px_0_6px_rgba(0,0,0,0.08)]" style={{ left: 256, width: 140, minWidth: 140 }}>{v.shopName}</td>
                  <td className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{v.handoverByName || '-'}</td>
                  <td className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{v.takeoverByName || '-'}</td>
                  {CHECKBOX_FIELDS.map(f => (
                    <td key={f} className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${v[f] === 'OK' ? 'bg-green-100 text-green-700' : v[f] === 'Not Ok' ? 'bg-red-100 text-red-700' : v[f] === 'Missing' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-400'}`}>
                        {v[f] || '-'}
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{v.lightingDamage || '-'}</td>
                  <td className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{v.wholesalePartyAmount ? `₹${v.wholesalePartyAmount}` : '-'}</td>
                  <td className="px-3 py-1.5">
                    {v.wholesaleImageLink
                      ? <a href={v.wholesaleImageLink} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline text-[10px]">View</a>
                      : <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewRow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-400 to-sky-600 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Visit Details</h2>
              <button onClick={() => setViewRow(null)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400 font-semibold uppercase">Visit Date</p><p className="font-medium text-gray-800">{formatDate(viewRow.visitDate)}</p></div>
                <div><p className="text-xs text-gray-400 font-semibold uppercase">Visitor Name</p><p className="font-medium text-gray-800">{viewRow.visitorName}</p></div>
                <div><p className="text-xs text-gray-400 font-semibold uppercase">Shop Name</p><p className="font-medium text-gray-800">{viewRow.shopName}</p></div>
                <div><p className="text-xs text-gray-400 font-semibold uppercase">Handover By</p><p className="font-medium text-gray-800">{viewRow.handoverByName || '-'}</p></div>
                <div><p className="text-xs text-gray-400 font-semibold uppercase">Takeover By</p><p className="font-medium text-gray-800">{viewRow.takeoverByName || '-'}</p></div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Checklist</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {CHECKBOX_FIELDS.map((f) => (
                    <div key={f} className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded">
                      <span className="text-gray-600 flex-1 mr-2">{f}</span>
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${viewRow[f] === 'OK' ? 'bg-green-100 text-green-700' : viewRow[f] === 'Not Ok' ? 'bg-red-100 text-red-700' : viewRow[f] === 'Missing' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-400'}`}>
                        {viewRow[f] || '-'}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded">
                    <span className="text-gray-600">Lighting Damage</span>
                    <span className="text-gray-800 font-medium">{viewRow.lightingDamage || '-'}</span>
                  </div>
                </div>
              </div>
              {viewRow.wholesaleImageLink && (
                <div><p className="text-xs text-gray-400 font-semibold uppercase">Wholesale Image</p>
                  <a href={viewRow.wholesaleImageLink} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline text-sm">View Image</a>
                </div>
              )}
              {viewRow.wholesalePartyAmount && (
                <div><p className="text-xs text-gray-400 font-semibold uppercase">Party Outstanding Amount</p>
                  <p className="font-bold text-gray-800 text-lg">₹{viewRow.wholesalePartyAmount}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-400 to-sky-600 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-white font-bold text-lg">New Shop Visit Form</h2>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Visit Date</label>
                  <input type="date" value={form.visitDate} onChange={(e) => handleField('visitDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Visitor Name</label>
                  <input type="text" value={form.visitorName} onChange={(e) => handleField('visitorName', e.target.value)}
                    placeholder="Enter visitor name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Shop Name</label>
                  <select value={form.shopName} onChange={(e) => handleField('shopName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    <option value="">Select Shop</option>
                    {SHOP_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Handover By (Name)</label>
                  <input type="text" value={form.handoverByName} onChange={(e) => handleField('handoverByName', e.target.value)}
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Takeover By (Name)</label>
                  <input type="text" value={form.takeoverByName} onChange={(e) => handleField('takeoverByName', e.target.value)}
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>

              {/* Checklist */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Checklist Items</h3>
                <div className="space-y-2">
                  {CHECKBOX_FIELDS.map((field) => (
                    <div key={field} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-700 flex-1 mr-4">{field.replace(' 1', '').replace(' 2', '')}</span>
                      <div className="flex gap-1">
                        {CHECKBOX_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleField(field, form[field] === opt ? '' : opt)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                              form[field] === opt
                                ? opt === 'OK' ? 'bg-green-500 text-white border-green-500'
                                  : opt === 'Not Ok' ? 'bg-red-500 text-white border-red-500'
                                  : 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Lighting - input */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-700 flex-1 mr-4">Lighting (Board, Rack, Counter) - Damage Details</span>
                    <input
                      type="text"
                      value={form.lightingDamage}
                      onChange={(e) => handleField('lightingDamage', e.target.value)}
                      placeholder="Damage details..."
                      className="border border-gray-300 rounded px-2 py-1 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Wholesale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Wholesale Outstanding - Image Link (Google Drive)</label>
                  <input type="url" value={form.wholesaleImageLink} onChange={(e) => handleField('wholesaleImageLink', e.target.value)}
                    placeholder="Paste Google Drive image link"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Wholesale Party Outstanding Amount (₹)</label>
                  <input type="number" value={form.wholesalePartyAmount} onChange={(e) => handleField('wholesalePartyAmount', e.target.value)}
                    placeholder="Enter amount"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 sticky bottom-0 bg-white pt-4 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 bg-gradient-to-r from-sky-400 to-sky-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Saving...' : 'Save Visit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
