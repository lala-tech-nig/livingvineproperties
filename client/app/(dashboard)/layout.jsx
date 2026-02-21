'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, PlusCircle, History, MessageSquare, LogOut, Menu, X, Bell, Users, ShieldAlert, BarChart3 } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, initializeAuth, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        initializeAuth();
        setMounted(true);
    }, [initializeAuth]);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isAuthenticated, router]);

    if (!mounted || !isAuthenticated) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const getNavigation = (role) => {
        switch (role) {
            case 'ceo':
                return [
                    { name: 'Dashboard', href: '/ceo', icon: BarChart3 },
                    { name: 'Team Management', href: '/ceo/team', icon: ShieldAlert },
                    { name: 'Notifications', href: '/ceo/notifications', icon: Bell },
                ];
            case 'management':
                return [
                    { name: 'Dashboard', href: '/management', icon: BarChart3 },
                    { name: 'Users', href: '/management/users', icon: Users },
                    { name: 'Notifications', href: '/management/notifications', icon: Bell },
                ];
            case 'investor':
            default:
                return [
                    { name: 'Overview', href: '/investor', icon: Home },
                    { name: 'New Investment', href: '/investor/new-investment', icon: PlusCircle },
                    { name: 'History', href: '/investor/history', icon: History },
                    { name: 'Messages', href: '/investor/messages', icon: MessageSquare },
                ];
        }
    };

    const navigation = getNavigation(user?.role);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 transform lg:translate-x-0 lg:static lg:w-72 transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0 justify-between">
                    <span className="text-xl font-bold text-blue-900 font-serif">Living Vine</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                            {user?.firstName?.charAt(0)}{user?.surname?.charAt(0)}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.surname}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-700 lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900 capitalize hidden sm:block">
                            {pathname.split('/')[1] || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
