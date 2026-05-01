import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardCheck, MessageSquare,
  ClipboardList, CheckSquare, Ticket, X, Wine, LogOut, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MENU = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  {
    icon: Package, label: 'Inventory', children: [
      { path: '/inventory/madhura', label: 'Madhura Wines' },
      { path: '/inventory/balaji', label: 'Balaji Wines' },
      { path: '/inventory/vishal', label: 'Vishal Wines' },
      { path: '/inventory/kunal', label: 'Kunal Ulwe' },
      { path: '/inventory/friends', label: 'Friends Wines' },
    ],
  },
  { path: '/shop-visit', icon: ClipboardCheck, label: 'Shop Visit' },
  {
    icon: MessageSquare, label: 'Feedback', children: [
      { path: '/customer-feedback', label: 'Customer Feedback' },
      { path: '/assigned-complain', label: 'Assign Complaint' },
      { path: '/complain-resolution', label: 'Complaint Resolution' },
    ],
  },
  { path: '/help-ticket', icon: Ticket, label: 'Help Ticket' },
  { path: '/trader-invoices', icon: ClipboardList, label: 'Trader Invoices' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  const toggleGroup = (label) => setOpenGroups((g) => ({ ...g, [label]: !g[label] }));

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-[55] lg:hidden" onClick={onClose} />
      )}

      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-sky-200 z-[60] transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col shadow-lg 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isHovered ? 'w-60' : 'lg:w-20 w-64'}`}
      >

        {/* Logo */}
        <div className="h-16 border-b border-sky-100 flex items-center flex-shrink-0 bg-sky-50 overflow-hidden transition-all duration-300">
          <div className={`flex items-center gap-3 min-w-max transition-all duration-300 ${isHovered ? 'px-5' : 'lg:px-[21px] px-5'}`}>
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <Wine size={18} className="text-white" />
            </div>
            <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 lg:hidden'}`}>
              <span className="text-sm font-bold text-sky-700 leading-tight block">Business Overview<br/>Dashboard</span>
              <span className="text-[10px] text-sky-400 font-medium">Pune Wine</span>
            </div>
          </div>
          {isHovered && (
            <button onClick={onClose} className="lg:hidden ml-auto mr-4 p-1.5 hover:bg-sky-100 rounded-lg text-sky-400 hover:text-sky-600">
              <X size={16} />
            </button>
          )}
          {!isHovered && (
             <button onClick={onClose} className="lg:hidden absolute right-4 p-1.5 hover:bg-sky-100 rounded-lg text-sky-400 hover:text-sky-600">
                <X size={16} />
             </button>
          )}
        </div>



        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-hide overflow-x-hidden">
          {MENU.map((item) => {
            if (item.children) {
              const isGroupOpen = openGroups[item.label];
              return (
                <div key={item.label} className="px-3">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-all text-sm font-medium group border-l-4 border-transparent ${isHovered ? 'px-3' : 'lg:px-0 lg:justify-center px-3'}`}
                  >
                    <div className="w-6 flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-gray-400 group-hover:text-sky-500" />
                    </div>
                    <span className={`flex-1 text-left transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 lg:hidden'}`}>
                      {item.label}
                    </span>
                    {isHovered && (isGroupOpen ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />)}
                  </button>
                  {isGroupOpen && isHovered && (
                    <div className="ml-9 mt-0.5 space-y-0.5">
                      {item.children.map((child) => (
                        <NavLink key={child.path} to={child.path} onClick={onClose}
                          className={({ isActive }) => `block px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-sky-100 text-sky-700 font-semibold' : 'text-gray-500 hover:bg-sky-50 hover:text-sky-600'}`}>
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={item.path} className="px-3">
                <NavLink to={item.path} onClick={onClose}
                  className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all group border-l-4 ${
                    isActive
                      ? 'bg-sky-100 text-sky-700 border-sky-500'
                      : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600 border-transparent'
                  } ${isHovered ? 'px-3' : 'lg:px-0 lg:justify-center px-3'}`}>
                  {({ isActive }) => (
                    <>
                      <div className="w-6 flex items-center justify-center flex-shrink-0">
                        <item.icon size={18} className={`${isActive ? 'text-sky-500' : 'text-gray-400 group-hover:text-sky-500'}`} />
                      </div>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 lg:hidden'}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sky-100 flex-shrink-0 bg-white overflow-hidden">
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium border-l-4 border-transparent ${isHovered ? 'px-3' : 'lg:px-0 lg:justify-center px-3'}`}>
            <div className="w-6 flex items-center justify-center flex-shrink-0">
              <LogOut size={18} />
            </div>
            <span className={`transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 lg:hidden'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;