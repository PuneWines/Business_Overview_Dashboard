import React, { useState } from 'react';
import { Menu, LogOut, Wine } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import QRCodeModal from './QRCodeModal';

const Header = ({ onMenuClick, user }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-sky-200 shadow-sm shadow-sky-100">
        <div className="flex justify-between items-center h-14 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center">
                <Wine size={14} className="text-white" />
              </div>
              <span className="font-bold text-sky-700 text-sm">Business Overview Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ── QR Code Button ─────────────────────────────────── */}
            <button
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <span>📱</span>
              <span className="hidden sm:inline">Show QR Code</span>
            </button>

            {/* ── User Info ──────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-sky-800">{user?.name || 'Admin'}</p>
                <p className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">{user?.role || 'ADMIN'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {(user?.name || 'A')[0].toUpperCase()}
              </div>
            </div>

            {/* ── Logout ─────────────────────────────────────────── */}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* QR Code Modal */}
      <QRCodeModal isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
};

export default Header;