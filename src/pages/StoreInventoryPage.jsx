import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, Download, ChevronUp, ChevronDown, X, Loader2, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Normal: 'bg-green-100 text-green-700',
  Low: 'bg-yellow-100 text-yellow-700',
  Critical: 'bg-red-100 text-red-700',
  Overstock: 'bg-blue-100 text-blue-700',
  Same: 'bg-emerald-100 text-emerald-700',
  Loss: 'bg-rose-100 text-rose-700',
};

const ITEM_NAMES = [
  'Kingfisher Strong 650ml', 'Kingfisher Premium 650ml', 'Budweiser 650ml', 'Tuborg Strong 650ml',
  'Carlsberg 650ml', 'Heineken 650ml', 'Corona 330ml', 'Bira White 330ml',
  'McDowell No.1 Whisky 750ml', 'Royal Stag 750ml', 'Imperial Blue 750ml', 'Officer\'s Choice 750ml',
  'Old Monk 750ml', 'Magic Moments Vodka 750ml', 'Sula Shiraz 750ml', 'Fratelli Red Wine 750ml',
  'Blenders Pride 750ml', 'Johnnie Walker Red 750ml', 'Jack Daniel\'s 750ml', 'Absolut Vodka 750ml',
];

function generateDummyData(storeId) {
  const key = `ms_inventory_${storeId}`;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);

  const data = ITEM_NAMES.map((name, i) => {
    const mrp = [120, 180, 220, 90, 60, 150, 200, 750, 450, 320][i % 10] * (Math.floor(i / 10) + 1);
    const purchaseRate = Math.round(mrp * 0.75);
    const openingQty = Math.floor(Math.random() * 50) + 5;
    const purchaseQty = Math.floor(Math.random() * 30);
    const closingQtyGod = Math.floor(Math.random() * 20);
    const closingCounter = Math.floor(Math.random() * 15);
    const totalClose = closingQtyGod + closingCounter;
    const sale = openingQty + purchaseQty - totalClose;
    const saleValueMrp = sale * mrp;
    const saleValuePurchase = sale * purchaseRate;
    const profit = saleValueMrp - saleValuePurchase;
    const status = totalClose < 5 ? 'Critical' : totalClose < 15 ? 'Low' : totalClose > 40 ? 'Overstock' : 'Normal';
    return {
      id: `${storeId}-${i + 1}`,
      item: name,
      mrp,
      purchaseRate,
      openingQty,
      purchaseQty,
      closingQtyGod,
      closingCounter,
      totalClose,
      sale: Math.max(0, sale),
      saleValueMrp: Math.max(0, saleValueMrp),
      saleValuePurchase: Math.max(0, saleValuePurchase),
      profit: Math.max(0, profit),
      status,
      date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split('T')[0],
    };
  });

  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

const COL_HEADERS = [
  { key: 'item', label: 'Item' },
  { key: 'mrp', label: 'MRP' },
  { key: 'purchaseRate', label: 'Purchase Rate' },
  { key: 'openingQty', label: 'Opening Qty' },
  { key: 'purchaseQty', label: 'Purchase Qty' },
  { key: 'closingQtyGod', label: 'Closing Qty God' },
  { key: 'closingCounter', label: 'Closing Counter' },
  { key: 'totalClose', label: 'Total Close' },
  { key: 'sale', label: 'Sale' },
  { key: 'saleValueMrp', label: 'Sale Value (MRP)' },
  { key: 'saleValuePurchase', label: 'Sale Value (Purchase)' },
  { key: 'profit', label: 'Profit' },
  { key: 'status', label: 'Status' },
];

export default function StoreInventoryPage({ storeId, storeName, sheetUrl }) {
  const color = 'from-sky-400 to-sky-600';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({});

  const uniqueItems = useMemo(() => [...new Set(data.map((d) => d.item))], [data]);

  const filtered = useMemo(() => {
    let arr = [...data];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (startDate) arr = arr.filter((r) => r.date >= startDate);
    if (endDate) arr = arr.filter((r) => r.date <= endDate);
    if (selectedItem) arr = arr.filter((r) => r.item === selectedItem);
    if (stockFilter === 'high') arr = arr.filter((r) => r.totalClose >= 20);
    if (stockFilter === 'low') arr = arr.filter((r) => r.totalClose < 20);
    if (sortKey) {
      arr.sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey];
        if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
        return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return arr;
  }, [data, search, startDate, endDate, selectedItem, stockFilter, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const openAdd = () => {
    setEditRow(null);
    setForm({ item: '', mrp: '', purchaseRate: '', openingQty: '', purchaseQty: '', closingQtyGod: '', closingCounter: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditRow(row.id);
    setForm({ ...row });
    setShowModal(true);
  };

  const calcDerived = (f) => {
    const totalClose = (parseInt(f.closingQtyGod) || 0) + (parseInt(f.closingCounter) || 0);
    const sale = Math.max(0, (parseInt(f.openingQty) || 0) + (parseInt(f.purchaseQty) || 0) - totalClose);
    const saleValueMrp = sale * (parseFloat(f.mrp) || 0);
    const saleValuePurchase = sale * (parseFloat(f.purchaseRate) || 0);
    const profit = saleValueMrp - saleValuePurchase;
    
    // Preserve sheet-specific statuses if they exist
    let status = f.status;
    if (status !== 'Same' && status !== 'Loss') {
      status = totalClose < 5 ? 'Critical' : totalClose < 15 ? 'Low' : totalClose > 40 ? 'Overstock' : 'Normal';
    }
    
    return { ...f, totalClose, sale, saleValueMrp, saleValuePurchase, profit, status };
  };

  const fetchData = useCallback(async () => {
    if (!sheetUrl) {
      setData(generateDummyData(storeId));
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${sheetUrl}?sheet=Dashboard`);
      const result = await resp.json();

      if (result.success && result.data) {
        // Find column indices from headers (Row 3 / Index 2)
        const headers = result.data[2] || [];
        const profitIdx = headers.findIndex(h => String(h).toLowerCase().includes('profit')) !== -1 
          ? headers.findIndex(h => String(h).toLowerCase().includes('profit')) 
          : 12;
        const statusIdx = headers.findIndex(h => String(h).toLowerCase().includes('status')) !== -1 
          ? headers.findIndex(h => String(h).toLowerCase().includes('status')) 
          : 13;

        // Data starts from index 3 (Row 4)
        const rawRows = result.data.slice(3);
        const mappedData = rawRows
          .filter(row => row[0] && String(row[0]).trim() !== '')
          .map((row, idx) => ({
            id: `${storeId}-${idx + 4}`,
            rowIndex: idx + 4,
            item: String(row[0]),
            mrp: parseFloat(row[1]) || 0,
            purchaseRate: parseFloat(row[2]) || 0,
            openingQty: parseInt(row[3]) || 0,
            purchaseQty: parseInt(row[4]) || 0,
            closingQtyGod: parseInt(row[5]) || 0,
            closingCounter: parseInt(row[6]) || 0,
            totalClose: parseInt(row[7]) || 0,
            sale: parseInt(row[8]) || 0,
            saleValueMrp: parseFloat(row[9]) || 0,
            saleValuePurchase: parseFloat(row[10]) || 0,
            profit: parseFloat(row[profitIdx]) || 0,
            status: String(row[statusIdx] || 'Normal').trim(),
            date: new Date().toISOString().split('T')[0],
          }));
        setData(mappedData);
      } else {
        toast.error(result.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Network error while fetching data");
    } finally {
      setLoading(false);
    }
  }, [sheetUrl, storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    const row = calcDerived(form);
    
    if (sheetUrl) {
      setLoading(true);
      try {
        const action = editRow ? 'update' : 'insert';
        const rowIndex = editRow ? data.find(r => r.id === editRow)?.rowIndex : null;
        
        // Map back to sheet columns for update/insert
        // A=item, B=mrp, C=purchaseRate, D=openingQty, E=purchaseQty, F=closingQtyGod, G=closingCounter, H=totalClose, I=sale, J=saleValueMrp, K=saleValuePurchase, L='', M=profit, N=status
        const rowData = [
          row.item, row.mrp, row.purchaseRate, row.openingQty, row.purchaseQty, 
          row.closingQtyGod, row.closingCounter, row.totalClose, row.sale, 
          row.saleValueMrp, row.saleValuePurchase, '', row.profit, row.status
        ];

        const params = new URLSearchParams({
          action: action,
          sheetName: 'Dashboard',
          rowData: JSON.stringify(rowData)
        });
        
        if (editRow && rowIndex) {
          params.append('rowIndex', rowIndex.toString());
        }

        const resp = await fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors', // GAS web apps often require no-cors or redirect handling
          body: params
        });

        // Since no-cors doesn't allow reading response, we assume success or fetch again
        toast.success(editRow ? "Updated successfully" : "Added successfully");
        setShowModal(false);
        setTimeout(fetchData, 1500); // Re-fetch to get latest state
      } catch (err) {
        toast.error("Failed to save to sheet");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Local state fallback for non-sheet stores
    let newData;
    if (editRow) {
      newData = data.map((r) => (r.id === editRow ? { ...row, id: editRow } : r));
    } else {
      newData = [...data, { ...row, id: `${storeId}-${Date.now()}` }];
    }
    setData(newData);
    localStorage.setItem(`ms_inventory_${storeId}`, JSON.stringify(newData));
    setShowModal(false);
    toast.success("Saved to local storage");
  };

  const handleDelete = async (id) => {
    if (sheetUrl) {
      const rowIndex = data.find(r => r.id === id)?.rowIndex;
      if (!rowIndex) return;

      if (!window.confirm("Are you sure you want to delete this row?")) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          action: 'delete',
          sheetName: 'Dashboard',
          rowIndex: rowIndex.toString()
        });

        await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: params });
        toast.success("Deleted from sheet");
        setTimeout(fetchData, 1000);
      } catch (err) {
        toast.error("Delete failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    const newData = data.filter((r) => r.id !== id);
    setData(newData);
    localStorage.setItem(`ms_inventory_${storeId}`, JSON.stringify(newData));
    toast.success("Deleted from local storage");
  };

  const exportCSV = () => {
    const headers = COL_HEADERS.map((c) => c.label).join(',');
    const rows = filtered.map((r) => COL_HEADERS.map((c) => `"${r[c.key]}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storeId}-inventory.csv`;
    a.click();
  };

  const totals = useMemo(() => ({
    saleValueMrp: filtered.reduce((s, r) => s + r.saleValueMrp, 0),
    saleValuePurchase: filtered.reduce((s, r) => s + r.saleValuePurchase, 0),
    profit: filtered.reduce((s, r) => s + r.profit, 0),
    sale: filtered.reduce((s, r) => s + r.sale, 0),
  }), [filtered]);

  return (
    <div className="p-3 flex flex-col gap-3 h-full overflow-hidden">
      {/* Toolbar: all filters + Export + Add Item in one flat row */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[140px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all columns..."
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
          />
        </div>
        {/* Start Date */}
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
        {/* End Date */}
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
        {/* Item Filter */}
        <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
          <option value="">All Items</option>
          {uniqueItems.map((it) => <option key={it} value={it}>{it}</option>)}
        </select>
        {/* Stock Filter */}
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
          <option value="">All Stock Levels</option>
          <option value="high">High Stock (≥20)</option>
          <option value="low">Low Stock (&lt;20)</option>
        </select>
        {/* Clear (conditional) */}
        {(search || startDate || endDate || selectedItem || stockFilter) && (
          <button onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setSelectedItem(''); setStockFilter(''); }}
            className="flex items-center gap-1 border border-red-300 text-red-600 px-2 py-1.5 rounded-lg text-xs hover:bg-red-50 transition-colors whitespace-nowrap">
            <X size={12} /> Clear
          </button>
        )}
        {/* Refresh */}
        {sheetUrl && (
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />}
            Refresh
          </button>
        )}
        {/* Export */}
        <button onClick={exportCSV} className="ml-auto flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
          <Download size={13} /> Export
        </button>
        {/* Add Item */}
        <button 
          onClick={openAdd} 
          disabled
          title="Temporarily disabled"
          className="flex items-center gap-1.5 bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md transition-all whitespace-nowrap opacity-50 cursor-not-allowed"
        >
          <Plus size={13} /> Add Item
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Sale Units', val: totals.sale.toLocaleString(), color: 'text-blue-600' },
          { label: 'Sale Value (MRP)', val: `₹${totals.saleValueMrp.toLocaleString()}`, color: 'text-green-600' },
          { label: 'Sale Value (Purchase)', val: `₹${totals.saleValuePurchase.toLocaleString()}`, color: 'text-orange-600' },
          { label: 'Total Profit', val: `₹${totals.profit.toLocaleString()}`, color: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Table — fixed height, only tbody scrolls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '470px' }}>
        <div className="overflow-auto flex-1">
          <table className="text-xs border-separate" style={{ borderSpacing: 0 }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky z-30 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider border-r border-gray-200 border-b border-gray-200" style={{ left: 0, top: 0, width: 44, minWidth: 44 }}>#</th>
                <th
                  onClick={() => handleSort('item')}
                  className="sticky z-30 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none border-r border-gray-200 border-b border-gray-200 shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
                  style={{ left: 44, top: 0, width: 190, minWidth: 190 }}
                >
                  <span className="flex items-center gap-1">
                    Item
                    {sortKey === 'item' ? (
                      sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                    ) : <ChevronUp size={11} className="opacity-20" />}
                  </span>
                </th>
                {COL_HEADERS.filter(c => c.key !== 'item').map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none border-b border-gray-200"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                      ) : <ChevronUp size={11} className="opacity-20" />}
                    </span>
                  </th>
                ))}
                <th className="sticky top-0 right-0 z-30 bg-gray-50 px-3 py-2 text-center text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 shadow-[-2px_0_4px_rgba(0,0,0,0.06)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={14} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={30} className="animate-spin text-sky-500" />
                      <p className="text-gray-500 text-sm animate-pulse">Syncing with Google Sheets...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={14} className="text-center py-8 text-gray-400">No records found</td></tr>
              ) : null}
              {!loading && filtered.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="sticky z-20 bg-white px-3 py-1.5 text-gray-400 border-r border-gray-200" style={{ left: 0, width: 44, minWidth: 44 }}>{idx + 1}</td>
                  <td className="sticky z-20 bg-white px-3 py-1.5 font-medium text-gray-800 whitespace-nowrap border-r border-gray-200 shadow-[2px_0_4px_rgba(0,0,0,0.06)]" style={{ left: 44, width: 190, minWidth: 190 }}>{row.item}</td>
                  <td className="px-3 py-1.5 text-gray-700">₹{row.mrp}</td>
                  <td className="px-3 py-1.5 text-gray-700">₹{row.purchaseRate}</td>
                  <td className="px-3 py-1.5 text-gray-700">{row.openingQty}</td>
                  <td className="px-3 py-1.5 text-gray-700">{row.purchaseQty}</td>
                  <td className="px-3 py-1.5 text-gray-700">{row.closingQtyGod}</td>
                  <td className="px-3 py-1.5 text-gray-700">{row.closingCounter}</td>
                  <td className="px-3 py-1.5 font-semibold text-gray-800">{row.totalClose}</td>
                  <td className="px-3 py-1.5 text-blue-600 font-semibold">{row.sale}</td>
                  <td className="px-3 py-1.5 text-green-600">₹{row.saleValueMrp.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-orange-600">₹{row.saleValuePurchase.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-purple-600 font-bold">₹{row.profit.toLocaleString()}</td>
                  <td className="px-3 py-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-600'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="sticky right-0 z-20 bg-white px-3 py-1.5 text-center border-l border-gray-200 shadow-[-2px_0_4px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openEdit(row)} 
                        disabled
                        title="Temporarily disabled"
                        className="p-1 text-sky-600 hover:bg-sky-50 rounded-md transition-colors opacity-50 cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(row.id)} 
                        disabled
                        title="Temporarily disabled"
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-50 cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-sky-500 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">{editRow ? 'Edit Item' : 'Add New Item'}</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { key: 'item', label: 'Item Name', type: 'text', full: true },
                { key: 'date', label: 'Date', type: 'date' },
                { key: 'mrp', label: 'MRP (₹)', type: 'number' },
                { key: 'purchaseRate', label: 'Purchase Rate (₹)', type: 'number' },
                { key: 'openingQty', label: 'Opening Qty', type: 'number' },
                { key: 'purchaseQty', label: 'Purchase Qty', type: 'number' },
                { key: 'closingQtyGod', label: 'Closing Qty God', type: 'number' },
                { key: 'closingCounter', label: 'Closing Counter', type: 'number' },
              ].map((field) => (
                <div key={field.key} className={field.full ? 'col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              ))}
              {/* Auto-calculated fields */}
              {form.closingQtyGod !== undefined && (
                <div className="col-span-2 bg-gray-50 rounded-lg p-3 grid grid-cols-4 gap-3 text-xs">
                  {(() => {
                    const d = calcDerived(form);
                    return [
                      { label: 'Total Close', val: d.totalClose },
                      { label: 'Sale Units', val: d.sale },
                      { label: 'Sale Val (MRP)', val: `₹${d.saleValueMrp.toLocaleString()}` },
                      { label: 'Profit', val: `₹${d.profit.toLocaleString()}` },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-gray-400">{s.label}</p>
                        <p className="font-bold text-gray-800">{s.val}</p>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-sky-500 hover:bg-sky-500 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
