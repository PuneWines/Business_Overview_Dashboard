import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, X, CheckCircle, Clock, Loader2, RotateCw, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Dynamic Stores will be fetched from Master sheet


const FB_COLS = [
  { key: 'feedbackDate',   label: 'Feedback Date' },
  { key: 'complaintId',    label: 'Complaint ID' },
  { key: 'storeName',      label: 'Store Name' },
  { key: 'customerName',   label: 'Customer Name / ग्राहक नाम' },
  { key: 'contactNo',      label: 'Contact No / मोबाइल नंबर' },
  { key: 'preferredBrand', label: 'Preferred Brand?' },
  { key: 'beerChilled',    label: 'Beer Chilled?' },
  { key: 'staffBehaviour', label: 'Staff Behaviour' },
  { key: 'suggestion',     label: 'Suggestion' },
  { key: 'planned',        label: 'Planned Date' },
];

const HISTORY_COLS = [
  ...FB_COLS,
  { key: 'actual',     label: 'Actual Date' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'assignDate', label: 'Assign Date' },
  { key: 'remarks',    label: 'Remarks' },
];

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

function AssignModal({ row, onSave, onClose, loading, masterData }) {
  const [form, setForm] = useState({ 
    assignedTo: row.assignedTo || '', 
    assignDate: row.assignDate || new Date().toISOString().split('T')[0], 
    remarks: row.remarks || '' 
  });
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  // Get assignee options for this store
  const assigneeOptions = useMemo(() => {
    if (!masterData || !row.storeName) return [];
    const target = row.storeName.trim().toLowerCase();
    
    // 1. Exact match
    if (masterData[target]) return masterData[target].assignees || [];
    
    // 2. Fuzzy match: Find key that contains target or is contained by target
    const fuzzyKey = Object.keys(masterData).find(key => 
      key.includes(target) || target.includes(key)
    );
    
    return fuzzyKey ? masterData[fuzzyKey].assignees || [] : [];
  }, [masterData, row.storeName]);
  
  const handleSave = () => {
    if (!form.assignedTo) {
      toast.error("Please select an assignee");
      return;
    }
    // Current date/time for 'Actual' field in YYYY-MM-DD HH:mm:ss format
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const actual = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    onSave({ ...row, ...form, actual });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center rounded-2xl">
            <Loader2 size={30} className="animate-spin text-sky-500" />
          </div>
        )}
        <div className="px-6 py-4 bg-sky-500 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white font-bold text-base">Complete Task</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white" disabled={loading}><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 rounded-lg p-3 text-sm">
            <p className="font-semibold text-amber-800">{row.complaintId}</p>
            <p className="text-amber-600 text-xs">{row.customerName} | {row.contactNo}</p>
            <p className="text-amber-500 text-[10px] mt-1">Store: {row.storeName} | Planned: {row.planned || '-'}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned To</label>
            <select 
              value={form.assignedTo} 
              onChange={e => set('assignedTo', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">Select Assignee</option>
              {assigneeOptions.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Assign Date</label>
            <input type="date" value={form.assignDate} onChange={e => set('assignDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={3}
              placeholder="Enter resolution remarks..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}

function DataTable({ cols, rows, actionCol, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '530px' }}>
      <div className="overflow-auto flex-1">
        <table className="text-xs border-separate" style={{ borderSpacing: 0, minWidth: `${(cols.length + (actionCol ? 1 : 0)) * 140}px` }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky z-20 bg-gray-50 px-3 py-2 text-gray-500 font-semibold uppercase border-b border-gray-200 border-r border-gray-200 whitespace-nowrap" style={{ left: 0, top: 0, width: 36, minWidth: 36 }}>#</th>
              {actionCol && <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-gray-500 font-semibold uppercase border-b border-gray-200 whitespace-nowrap" style={{left: 36}}>Action</th>}
              {cols.map(c => <th key={c.key} className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-gray-500 font-semibold uppercase border-b border-gray-200 whitespace-nowrap">{c.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={cols.length + 2} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={30} className="animate-spin text-sky-500" />
                    <p className="text-gray-500 text-sm animate-pulse">Fetching from Google Sheets...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={cols.length + 2} className="text-center py-12 text-gray-400">No records found</td></tr>
            ) : rows.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="sticky bg-white px-3 py-1.5 text-gray-400 border-r border-gray-100" style={{ left: 0 }}>{idx + 1}</td>
                {actionCol && <td className="sticky bg-white px-3 py-1.5 border-r border-gray-50" style={{left: 36}}>{actionCol(row)}</td>}
                {cols.map(c => {
                  let val = row[c.key];
                  if (c.key === 'feedbackDate') val = formatDate(val);
                  return (
                    <td key={c.key} className="px-3 py-1.5 text-gray-700 whitespace-nowrap max-w-[180px] truncate">
                      {val || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AssignedComplain() {
  const [allData, setAllData] = useState([]);
  const [masterData, setMasterData] = useState({});
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [tab, setTab]               = useState('pending');
  const [search, setSearch]         = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStore, setFilterStore] = useState('');

  const sheetUrl = import.meta.env.VITE_FEEDBACK_GOOGLE_SHEET_URL;

  const fetchData = useCallback(async () => {
    if (!sheetUrl) return;
    setLoading(true);
    try {
      // Fetch Feedback and Master data in parallel
      const [resp, masterResp] = await Promise.all([
        fetch(`${sheetUrl}?sheet=Feedback`),
        fetch(`${sheetUrl}?sheet=Master`)
      ]);

      const [result, masterResult] = await Promise.all([
        resp.json(),
        masterResp.json()
      ]);

      if (masterResult.success && masterResult.data) {
        // Master Sheet: A=Store, B=Assignee, C=Resolver
        // Data starts from index 1 (Row 2)
        const mappings = {};
        masterResult.data.slice(1).forEach(row => {
          const store = row[0]?.toString().trim().toLowerCase();
          const assigneesRaw = row[1]?.toString().trim();
          const resolversRaw = row[2]?.toString().trim();

          if (store) {
            if (!mappings[store]) mappings[store] = { assignees: new Set(), resolvers: new Set() };
            
            if (assigneesRaw) {
              assigneesRaw.split(',').forEach(name => {
                const trimmedName = name.trim();
                if (trimmedName) mappings[store].assignees.add(trimmedName);
              });
            }
            
            if (resolversRaw) {
              resolversRaw.split(',').forEach(name => {
                const trimmedName = name.trim();
                if (trimmedName) mappings[store].resolvers.add(trimmedName);
              });
            }
          }
        });

        // Convert Sets back to sorted Arrays
        const processed = {};
        Object.keys(mappings).forEach(store => {
          processed[store] = {
            assignees: Array.from(mappings[store].assignees).sort(),
            resolvers: Array.from(mappings[store].resolvers).sort()
          };
        });
        setMasterData(processed);
      }

      if (result.success && result.data) {
        // Headers are on Row 6 (Index 5). Data starts Row 7 (Index 6).
        const rawRows = result.data.slice(6);
        const mapped = rawRows
          .filter(row => row[1]) // Complaint ID must exist
          .map((row, i) => ({
            rowIndex: i + 7,
            timestamp: row[0],
            complaintId: row[1],
            storeName: row[2],
            customerName: row[3],
            contactNo: row[4],
            feedbackDate: row[5],
            preferredBrand: row[6],
            beerChilled: row[7],
            staffBehaviour: row[8],
            suggestion: row[9],
            planned: row[10],
            actual: row[11],
            delay: row[12],
            assignedTo: row[13],
            assignDate: row[14],
            remarks: row[15],
            id: `FB-${i}-${row[1]}`
          }));
        setAllData(mapped);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch assigned complaints");
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    fetchData().then(() => {
      // Handle ID parameter from URL
      const urlParams = new URLSearchParams(window.location.search);
      const idParam = urlParams.get('id');
      if (idParam) {
        setAllData(currentData => {
          const match = currentData.find(d => d.complaintId === idParam);
          if (match) setAssignModal(match);
          return currentData;
        });
      }
    });
  }, [fetchData]);

  const pending = useMemo(() => allData.filter(d => d.planned && !d.actual), [allData]);
  const history = useMemo(() => allData.filter(d => d.planned && d.actual), [allData]);

  const applyFilters = useCallback((list) => {
    let data = list;
    if (filterDate) data = data.filter(d => d.feedbackDate === filterDate);
    if (filterStore) data = data.filter(d => d.storeName === filterStore);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(d => 
        d.customerName?.toLowerCase().includes(q) ||
        d.contactNo?.toString().includes(q) ||
        d.complaintId?.toLowerCase().includes(q) ||
        d.storeName?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, filterDate, filterStore]);

  const filteredPending = useMemo(() => applyFilters(pending), [pending, applyFilters]);
  const filteredHistory = useMemo(() => applyFilters(history), [history, applyFilters]);

  const handleUpdate = async (entry) => {
    if (!sheetUrl) return;
    setLoading(true);
    try {
      const updates = [
        { col: 12, val: entry.actual },
        { col: 14, val: entry.assignedTo },
        { col: 15, val: entry.assignDate },
        { col: 16, val: entry.remarks }
      ];

      const promises = updates.map(u => {
        const params = new URLSearchParams({
          action: 'updateCell',
          sheetName: 'Feedback',
          rowIndex: entry.rowIndex.toString(),
          columnIndex: u.col.toString(),
          value: u.val || ''
        });
        return fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: params });
      });

      await Promise.all(promises);
      
      toast.success("Task updated successfully");

      // Post Resolve Complaint link to Column Y (25)
      const reactBaseUrl = window.location.origin;
      const resolveComplaintLink = `${reactBaseUrl}/complain-resolution?id=${entry.complaintId}`;
      const linkParams = new URLSearchParams({
        action: 'updateCell',
        sheetName: 'Feedback',
        rowIndex: entry.rowIndex.toString(),
        columnIndex: '26',
        value: resolveComplaintLink
      });
      await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: linkParams });

      setAssignModal(null);
      setTimeout(fetchData, 1500);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, contact, ID..."
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
        </div>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 min-w-[120px]">
          <option value="">All Stores</option>
          {Object.keys(masterData).sort().map((s, i) => (
            <option key={i} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />}
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Clock size={14} /> Pending ({filteredPending.length})
        </button>
        <button onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'history' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <CheckCircle size={14} /> History ({filteredHistory.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'pending' ? (
          <>
            <div className="hidden md:block">
              <DataTable cols={FB_COLS} rows={filteredPending} loading={loading}
                actionCol={row => (
                  <button onClick={() => setAssignModal(row)}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap">
                    Complete
                  </button>
                )}
              />
            </div>
            <div className="md:hidden space-y-3 pb-20">
              {!loading && filteredPending.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">✅ No pending complaints</p>}
              {filteredPending.map((row, idx) => (
                <div key={row.id || idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{row.complaintId}</span>
                    <button onClick={() => setAssignModal(row)} className="bg-sky-500 text-white px-3 py-1 rounded-lg text-[11px] font-semibold">Complete</button>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{row.customerName || '-'}</p>
                  <p className="text-xs text-gray-500">{row.contactNo || '-'}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                    <div><p className="text-[10px] text-gray-400 uppercase">Feedback Date</p><p className="text-xs font-medium text-gray-700">{formatDate(row.feedbackDate)}</p></div>
                    <div><p className="text-[10px] text-gray-400 uppercase">Planned</p><p className="text-xs font-medium text-amber-600 font-bold">{row.planned || '-'}</p></div>
                    <div className="col-span-2"><p className="text-[10px] text-gray-400 uppercase">Staff Behaviour</p><p className="text-xs font-medium text-gray-700">{row.staffBehaviour || '-'}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable cols={HISTORY_COLS} rows={filteredHistory} loading={loading} />
            </div>
            <div className="md:hidden space-y-3 pb-20">
              {!loading && filteredHistory.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No history yet</p>}
              {filteredHistory.map((row, idx) => (
                <div key={row.id || idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{row.complaintId}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Resolved</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{row.customerName || '-'}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                    <div><p className="text-[10px] text-gray-400 uppercase">Actual Date</p><p className="text-xs font-medium text-sky-600">{row.actual || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400 uppercase">Assigned To</p><p className="text-xs font-medium text-gray-700">{row.assignedTo || '-'}</p></div>
                    <div className="col-span-2"><p className="text-[10px] text-gray-400 uppercase">Remarks</p><p className="text-xs font-medium text-gray-700 italic">"{row.remarks || 'No remarks'}"</p></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {assignModal && <AssignModal row={assignModal} loading={loading} masterData={masterData} onSave={handleUpdate} onClose={() => setAssignModal(null)} />}
    </div>
  );
}
