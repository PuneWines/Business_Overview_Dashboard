import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, Search, Loader2, RotateCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'traderName', label: 'TRADER NAME / AREA' },
  { key: 'invoiceDate', label: 'INVOICE DATE' },
  { key: 'tpDate', label: 'TP DATE' },
  { key: 'salesmanName', label: 'SALESMAN NAME' },
  { key: 'invoiceSubmittedDate', label: 'INVOICE SUBMITTED DATE' },
  { key: 'shopName', label: 'SHOP NAME' },
  { key: 'invoiceNumber', label: 'INVOICE NUMBER' },
  { key: 'tpNumber', label: 'TP NUMBER' },
  { key: 'deliveredAt', label: 'DELIVERED AT' },
  { key: 'receiverSign', label: 'RECEIVER SIGN' },
  { key: 'photo', label: 'PHOTO' },
  { key: 'billAmount', label: 'BILL AMOUNT' },
];

export default function TraderInvoices() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTrader, setFilterTrader] = useState('');

  const sheetUrl = import.meta.env['VITE_TRADER-INVOICES_GOOGLE_SHEET_URL'];

  const fetchData = useCallback(async () => {
    if (!sheetUrl) {
      toast.error("Google Sheet URL is not defined in .env");
      return;
    }
    
    setLoading(true);
    try {
      const resp = await fetch(`${sheetUrl}?sheet=Form%20responses%201`);
      const result = await resp.json();
      
      if (result.success && result.data) {
        // Assuming row 0 contains headers, so we slice from index 1.
        const rawRows = result.data.slice(1);
        const mapped = rawRows.map((row, i) => ({
          id: `TI-${i}`,
          timestamp: row[0],
          traderName: row[1],
          invoiceDate: row[2],
          tpDate: row[3],
          salesmanName: row[4],
          invoiceSubmittedDate: row[5],
          shopName: row[6],
          invoiceNumber: row[7],
          tpNumber: row[8],
          deliveredAt: row[9],
          receiverSign: row[10],
          photo: row[11],
          billAmount: row[12],
        }));
        // Filter out empty rows if timestamp and trader name are blank
        setAllData(mapped.filter(r => r.timestamp || r.traderName || r.shopName));
      } else {
        toast.error(result.error || "Failed to fetch data from sheet");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract unique traders for dropdown
  const uniqueTraders = useMemo(() => {
    const traders = new Set(allData.map(d => d.traderName).filter(Boolean));
    return Array.from(traders).sort();
  }, [allData]);

  const filtered = useMemo(() => {
    let data = allData;
    
    if (filterTrader) {
      data = data.filter(d => d.traderName === filterTrader);
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(d => 
        d.traderName?.toLowerCase().includes(q) ||
        d.salesmanName?.toLowerCase().includes(q) ||
        d.shopName?.toLowerCase().includes(q) ||
        d.invoiceNumber?.toString().toLowerCase().includes(q)
      );
    }
    return data;
  }, [allData, search, filterTrader]);

  const formatUrl = (val) => {
    if (typeof val === 'string' && val.startsWith('http')) {
      return <a href={val} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">View Link</a>;
    }
    return val || '-';
  };

  return (
    <div className="p-4 h-full flex flex-col gap-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Trader Invoices</h1>
            <p className="text-xs text-gray-500">{allData.length} invoices</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trader, salesman, shop, invoice..."
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white min-w-[240px]" />
          </div>
          <select value={filterTrader} onChange={e => setFilterTrader(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[120px] bg-white">
            <option value="">All Traders</option>
            {uniqueTraders.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />}
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mb-4" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        <div className="overflow-auto flex-1">
          <table className="text-xs border-separate w-full" style={{ borderSpacing: 0, minWidth: '1600px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky top-0 z-20 bg-gray-50 px-3 py-2 text-gray-500 font-semibold uppercase border-b border-gray-200 border-r border-gray-200 whitespace-nowrap" style={{ left: 0, width: 36, minWidth: 36 }}>#</th>
                {COLS.map(c => <th key={c.key} className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-gray-500 font-semibold uppercase border-b border-gray-200 whitespace-nowrap">{c.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={COLS.length + 1} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={30} className="animate-spin text-indigo-500" />
                      <p className="text-gray-500 text-sm animate-pulse">Fetching from Google Sheets...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={COLS.length + 1} className="text-center py-12 text-gray-400">No records found</td></tr>
              ) : filtered.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="sticky bg-white px-3 py-1.5 text-gray-400 border-r border-gray-100" style={{ left: 0 }}>{idx + 1}</td>
                  {COLS.map(c => {
                    let val = row[c.key];
                    if ((c.key === 'timestamp' || c.key.toLowerCase().includes('date')) && val) {
                      try {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) {
                          const pad = n => String(n).padStart(2, '0');
                          val = `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`;
                        }
                      } catch (e) {}
                    }
                    return (
                      <td key={c.key} className="px-3 py-1.5 text-gray-700 max-w-[250px] truncate" title={typeof val === 'string' ? val : ''}>
                        {(c.key === 'photo' || c.key === 'receiverSign') ? formatUrl(val) : (val || '-')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
