import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null, // Holds the logged-in user details
    token: null, // Holds the JWT token
    isAuthenticated: false,

    setUser: (userData, token) => set({
        user: userData,
        token: token,
        isAuthenticated: true
    }),

    logout: () => {
        // Need to clear token from localStorage in component or here if we access window
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },

    initializeAuth: () => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                set({
                    token: storedToken,
                    user: JSON.parse(storedUser),
                    isAuthenticated: true
                });
            }
        }
    }
}));
