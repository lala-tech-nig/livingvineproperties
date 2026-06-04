'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import {
    BarChart3, Users, Bell, LogOut, Globe
} from 'lucide-react';

const MGT_NAV = [
    { name: 'Dashboard', href: '/management', icon: BarChart3 },
    { name: 'Users', href: '/management/users', icon: Users },
    { name: 'CRM', href: '/management/crm', icon: Users },
    { name: 'Notifications', href: '/management/notifications', icon: Bell },
    { name: 'Website Editor', href: '/management/website-content', icon: Globe },
];

export default function ManagementLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, initializeAuth, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    const isLoginPage = pathname === '/management/login';

    useEffect(() => {
        initializeAuth();
        setMounted(true);
    }, [initializeAuth]);

    useEffect(() => {
        if (!mounted) return;
        if (isLoginPage) return;
        if (!isAuthenticated) {
            router.push('/management/login');
            return;
        }
        if (user && user.role !== 'management') {
            router.push('/management/login');
        }
    }, [mounted, isAuthenticated, user, router, pathname, isLoginPage]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!mounted || !isAuthenticated || (user && user.role !== 'management')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading Management Terminal...</p>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.push('/management/login');
    };

    return (
        <div className="min-h-screen bg-gray-950 flex text-white">
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 bg-gray-900 border-r border-gray-800 lg:static w-72 flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-800 flex-shrink-0 gap-3">
                        <Link href="/" className="text-xl font-bold text-white font-serif hover:text-amber-500 transition-colors">
                            Living Vine
                        </Link>
                        <span className="text-xs bg-amber-500/20 text-amber-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Mgt</span>
                    </div>

                    <div className="px-4 py-4 border-b border-gray-800">
                        <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1">Access Level</p>
                        <p className="text-sm font-semibold text-amber-500">Operations Manager</p>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-1">
                        {MGT_NAV.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-amber-500/15 text-amber-500 font-semibold border border-amber-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <item.icon size={18} className={isActive ? 'text-amber-500' : 'text-gray-600'} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-gray-800 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold shrink-0 border border-amber-500/30">
                                {user?.firstName?.charAt(0)}{user?.surname?.charAt(0)}
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-medium text-white">{user?.firstName} {user?.surname}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                        >
                            <LogOut size={18} />
                            Sign out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pb-16 lg:pb-0">
                    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-10 hidden lg:flex">
                        <h1 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
                            Management Portal / {pathname.split('/')[2] ? pathname.split('/')[2].replace('-', ' ') : 'Dashboard'}
                        </h1>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-500 hover:text-amber-500 transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-950">
                        <div className="max-w-7xl mx-auto">
                            {/* Mobile Header */}
                            <div className="lg:hidden flex items-center justify-between mb-6">
                                <Link href="/" className="text-xl font-bold text-white font-serif">Living Vine <span className="text-amber-500 text-sm">Mgt</span></Link>
                                <div className="flex items-center gap-3">
                                    <button className="relative p-2 text-gray-500 hover:text-amber-500 transition-colors">
                                        <Bell size={20} />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold"
                                    >
                                        {user?.firstName?.charAt(0)}
                                    </button>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 flex items-center justify-around w-full h-16 bg-gray-900 border-t border-gray-800 z-50 px-2">
                {MGT_NAV.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-amber-500' : 'text-gray-600 hover:text-gray-400'}`}>
                            <item.icon size={20} />
                            <span className="text-[10px] font-medium truncate max-w-[60px] text-center">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
