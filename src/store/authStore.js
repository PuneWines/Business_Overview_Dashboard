import { create } from 'zustand';

const DUMMY_USERS = [
  { id: 'admin', username: 'Admin', password: 'Admin123..', name: 'Admin User', role: 'ADMIN' },
  { id: 'user1', username: 'User', password: 'User123....', name: 'Store User', role: 'USER' },
];

const storedUser = localStorage.getItem('ms_user');
let parsedUser = null;
try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch (e) {
  parsedUser = null;
}

const useAuthStore = create((set) => ({
  user: parsedUser,
  isAuthenticated: !!parsedUser,

  login: (username, password) => {
    const found = DUMMY_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      const userData = { id: found.id, name: found.name, role: found.role, username: found.username };
      set({ user: userData, isAuthenticated: true });
      localStorage.setItem('ms_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid username or password' };
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('ms_user');
  },

  initializeAuth: () => {
    const stored = localStorage.getItem('ms_user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        set({ user: userData, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('ms_user');
      }
    }
  },
}));

export { useAuthStore };
