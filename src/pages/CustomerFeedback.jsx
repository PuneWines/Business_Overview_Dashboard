import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, X, ChevronLeft, ChevronRight, Loader2, RotateCw, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STORES = [
  { id: 'madhura', label: 'Madhura Snack', color: 'from-purple-500 to-purple-700', light: 'bg-purple-50 border-purple-200 text-purple-700', icon: '🍷' },
  { id: 'balaji',  label: 'Balaji Sack',   color: 'from-blue-500 to-blue-700',   light: 'bg-blue-50 border-blue-200 text-blue-700',   icon: '🍾' },
  { id: 'vishal',  label: 'Vishal Snack',  color: 'from-green-500 to-green-700', light: 'bg-green-50 border-green-200 text-green-700', icon: '🥂' },
  { id: 'kunal',   label: 'Kunal Ulwe',    color: 'from-orange-500 to-orange-700', light: 'bg-orange-50 border-orange-200 text-orange-700', icon: '🍻' },
  { id: 'friends', label: 'Friends Snack', color: 'from-pink-500 to-pink-700',   light: 'bg-pink-50 border-pink-200 text-pink-700',   icon: '🥃' },
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

const BRANDS = ['Yes / हाँ', 'No / नहीं'];
const CHILLED   = ['Yes / हाँ', 'No / नहीं'];

const TABLE_HEADERS = [
  { key: 'feedbackDate',   label: 'Feedback Date' },
  { key: 'complaintId',    label: 'Complaint ID' },
  { key: 'storeName',      label: 'Store Name' },
  { key: 'customerName',   label: 'Customer Name / ग्राहक नाम' },
  { key: 'contactNo',      label: 'Contact No / मोबाइल नंबर' },
  { key: 'preferredBrand', label: 'Preferred Brand? (पसंद के अनुसार ब्रांड?)' },
  { key: 'beerChilled',    label: 'Beer Chilled? (बीयर पर्याप्त ठंडी थी?)' },
  { key: 'staffBehaviour', label: 'Staff Behaviour / स्टाफ का व्यवहार' },
  { key: 'suggestion',     label: 'Suggestion / Improvement (सुझाव / सुधार)' },
];

const RATING_OPTIONS = ['Excellent', 'Good', 'Average', 'Poor'];

function FeedbackForm({ onSave, onCancel, defaultStoreId }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    storeId: defaultStoreId || '',
    customerName: '', contactNo: '',
    preferredBrand: '',
    feedbackDate: new Date().toISOString().split('T')[0],
    beerChilled: '', staffBehaviour: '', suggestion: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const storeName = STORES.find(s => s.id === form.storeId)?.label || '';

  const handleSave = () => {
    onSave({ ...form, storeName });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1,2,3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
            {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-sky-500' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">Step 1: Store & Customer Info</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Store</label>
            <select value={form.storeId} onChange={e => set('storeId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
              <option value="">-- Select Store --</option>
              {STORES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name / ग्राहक नाम</label>
            <input value={form.customerName} onChange={e => set('customerName', e.target.value)}
              placeholder="Enter customer name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contact No / मोबाइल नंबर</label>
            <input value={form.contactNo} onChange={e => set('contactNo', e.target.value)}
              placeholder="Enter mobile number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Feedback Date</label>
            <input type="date" value={form.feedbackDate} onChange={e => set('feedbackDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">Step 2: Feedback Questions</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Did You Receive Your Preferred Brand? (क्या आपको आपकी पसंद के अनुसार ब्रांड दिया गया?)</label>
            <div className="flex gap-2">
              {['Yes / हाँ', 'No / नहीं'].map(opt => (
                <button key={opt} type="button" onClick={() => set('preferredBrand', opt)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.preferredBrand === opt ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Was the beer chilled enough for you? (क्या बीयर आपके लिए पर्याप्त ठंडी थी?)</label>
            <div className="flex gap-2">
              {['Yes / हाँ', 'No / नहीं'].map(opt => (
                <button key={opt} type="button" onClick={() => set('beerChilled', opt)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.beerChilled === opt ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">Step 3: Staff & Suggestions</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Staff Behaviour / स्टाफ का व्यवहार</label>
            <div className="grid grid-cols-2 gap-2">
              {RATING_OPTIONS.map(opt => (
                <button key={opt} type="button" onClick={() => set('staffBehaviour', opt)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${form.staffBehaviour === opt ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Suggestion / Improvement (सुझाव / सुधार)</label>
            <textarea value={form.suggestion} onChange={e => set('suggestion', e.target.value)} rows={3}
              placeholder="Enter your suggestion..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t">
        <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">Cancel</button>
        {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1"><ChevronLeft size={14} />Back</button>}
        {step < 3
          ? <button onClick={() => setStep(s => s + 1)} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1">Next<ChevronRight size={14} /></button>
          : <button onClick={handleSave} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg">Save Feedback</button>
        }
      </div>
    </div>
  );
}

export default function CustomerFeedback() {
  const [allData, setAllData] = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [search, setSearch]           = useState('');
  const [filterDate, setFilterDate]   = useState('');
  const [filterStore, setFilterStore] = useState('');
  const [loading, setLoading]         = useState(false);

  const sheetUrl = import.meta.env.VITE_FEEDBACK_GOOGLE_SHEET_URL;

  const fetchData = useCallback(async () => {
    if (!sheetUrl) {
      console.warn("Feedback Sheet URL is missing in .env");
      return;
    }
    setLoading(true);
    try {
      const url = `${sheetUrl}?sheet=Feedback`;
      console.log("Fetching feedback from:", url);
      const resp = await fetch(url);
      
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      
      const result = await resp.json();
      console.log("Feedback fetch result:", result);

      if (result.success && result.data) {
        // Headers are on Row 6 (Index 5). Data starts Row 7 (Index 6).
        const rawRows = result.data.slice(6);
        const mapped = rawRows
          .filter(row => row[0] || row[3]) // Timestamp or Customer Name must exist
          .map((row, idx) => ({
            id: `FB-${idx}`,
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
          }));
        setAllData(mapped.reverse());
      } else {
        console.warn("Fetch succeeded but returned no data or success:false", result);
        if (result.error) toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Detailed fetch error:", err);
      toast.error("Failed to fetch feedback. Check console for details.");
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (entry) => {
    if (!sheetUrl) {
      toast.error("Feedback URL not configured");
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      
      // Column Mapping for A-J (10 columns)
      // A: Timestamp, B: Complaint ID (backend generated), C: Store Name, D: Customer Name, E: Contact No, 
      // F: Feedback Date, G: Preferred Brand, H: Beer Chilled, I: Staff Behaviour, J: Suggestion
      const rowData = [
        timestamp,
        "", // Placeholder for Complaint ID (Backend generates this)
        entry.storeName,
        entry.customerName,
        entry.contactNo,
        entry.feedbackDate,
        entry.preferredBrand,
        entry.beerChilled,
        entry.staffBehaviour,
        entry.suggestion
      ];

      const params = new URLSearchParams({
        action: 'insert',
        sheetName: 'Feedback',
        rowData: JSON.stringify(rowData)
      });

      await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: params });
      toast.success("Feedback submitted successfully");
      setShowModal(false);
      setTimeout(fetchData, 1500);
    } catch (err) {
      toast.error("Failed to save feedback");
    } finally {
      setLoading(false);
    }
  };

  const tableData = useMemo(() => {
    let data = allData;
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
  }, [allData, search, filterDate, filterStore]);

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
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
          <option value="">All Stores</option>
          {STORES.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
        </select>

        <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />}
          Refresh
        </button>

        <span className="text-xs text-gray-400 whitespace-nowrap">{tableData.length} records</span>
        <button onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1.5 bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow hover:shadow-md transition-all whitespace-nowrap">
          <Plus size={13} /> Add Feedback
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-col" style={{ maxHeight: '530px' }}>
        <div className="overflow-auto flex-1">
          <table className="text-xs border-separate" style={{ borderSpacing: 0, minWidth: '1400px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky z-20 bg-gray-50 px-3 py-2 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 border-r border-gray-200 whitespace-nowrap" style={{ left: 0, top: 0, width: 36, minWidth: 36 }}>#</th>
                {TABLE_HEADERS.map(h => (
                  <th key={h.key} className="sticky top-0 z-10 bg-gray-50 px-3 py-2 text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap border-b border-gray-200 min-w-[140px]">{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={30} className="animate-spin text-sky-500" />
                      <p className="text-gray-500 text-sm animate-pulse">Syncing with Google Sheets...</p>
                    </div>
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr><td colSpan={TABLE_HEADERS.length + 1} className="text-center py-8 text-gray-400">No feedback records found</td></tr>
              ) : tableData.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="sticky bg-white px-3 py-1.5 text-gray-400 border-r border-gray-100" style={{ left: 0 }}>{idx + 1}</td>
                  {TABLE_HEADERS.map(h => {
                    let val = row[h.key];
                    if (h.key === 'feedbackDate') val = formatDate(val);
                    return (
                      <td key={h.key} className="px-3 py-1.5 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-sky-500" /></div>}
        {!loading && tableData.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No feedback records found</p>}
        {!loading && tableData.map((row, idx) => (
          <div key={row.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">#{idx + 1} · {row.complaintId}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.staffBehaviour === 'Excellent' ? 'bg-green-100 text-green-700' : row.staffBehaviour === 'Poor' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{row.staffBehaviour || 'N/A'}</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{row.customerName || '-'}</p>
            <p className="text-xs text-gray-500">{row.contactNo || '-'} · {row.storeName || '-'}</p>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
              <div><p className="text-[10px] text-gray-400 uppercase">Date</p><p className="text-xs font-medium text-gray-700">{formatDate(row.feedbackDate)}</p></div>
              <div><p className="text-[10px] text-gray-400 uppercase">Beer Chilled</p><p className="text-xs font-medium text-gray-700">{row.beerChilled || '-'}</p></div>
              <div><p className="text-[10px] text-gray-400 uppercase">Brand OK</p><p className="text-xs font-medium text-gray-700">{row.preferredBrand || '-'}</p></div>
              <div><p className="text-[10px] text-gray-400 uppercase">Suggestion</p><p className="text-xs font-medium text-gray-700 truncate">{row.suggestion || '-'}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-sky-500 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-white font-bold text-base">Add Customer Feedback</h2>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white" disabled={loading}><X size={20} /></button>
            </div>
            <div className={loading ? "opacity-50 pointer-events-none" : ""}>
              <FeedbackForm onSave={handleSave} onCancel={() => setShowModal(false)} defaultStoreId="" />
            </div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                  <Loader2 className="animate-spin text-sky-500" />
                  <span className="text-sm font-medium">Submitting...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
