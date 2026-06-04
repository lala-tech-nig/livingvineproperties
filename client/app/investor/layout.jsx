'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Home, PlusCircle, History, MessageSquare, LogOut, Bell, BarChart3 } from 'lucide-react';

const INVESTOR_NAV = [
    { name: 'Overview', href: '/investor', icon: Home },
    { name: 'New Investment', href: '/investor/new-investment', icon: PlusCircle },
    { name: 'History', href: '/investor/history', icon: History },
    { name: 'Messages', href: '/investor/messages', icon: MessageSquare },
];

export default function InvestorLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, initializeAuth, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    const isPublicPage = pathname === '/investor/login' || pathname === '/investor/register';

    useEffect(() => {
        initializeAuth();
        setMounted(true);
    }, [initializeAuth]);

    useEffect(() => {
        if (!mounted) return;
        if (isPublicPage) return;
        if (!isAuthenticated) {
            router.push('/investor/login');
            return;
        }
        // Block non-investors from this portal
        if (user && user.role !== 'investor') {
            router.push('/investor/login');
        }
    }, [mounted, isAuthenticated, user, router, pathname, isPublicPage]);

    if (isPublicPage) {
        return <>{children}</>;
    }

    if (!mounted || !isAuthenticated || (user && user.role !== 'investor')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#de1f25] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading investor portal...</p>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.push('/investor/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar (Desktop Only) */}
                <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 lg:static w-72 flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
                        <Link href="/" className="text-xl font-bold text-orange-900 font-serif hover:text-primary transition-colors">
                            Living Vine
                        </Link>
                        <span className="ml-2 text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Investor</span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                        {INVESTOR_NAV.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#de1f25]/10 text-[#b0181d] font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <item.icon size={20} className={isActive ? 'text-[#de1f25]' : 'text-gray-400'} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#b0181d] font-bold shrink-0">
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
                <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pb-16 lg:pb-0">
                    {/* Top Header */}
                    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-10 hidden lg:flex">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-semibold text-gray-900 capitalize">
                                {pathname.split('/')[2] || 'Overview'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-400 hover:text-[#de1f25] transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Mobile Header */}
                            <div className="lg:hidden flex items-center justify-between mb-6">
                                <Link href="/" className="text-xl font-bold text-orange-900 font-serif">Living Vine</Link>
                                <div className="flex items-center gap-3">
                                    <button className="relative p-2 text-gray-400 hover:text-[#de1f25] transition-colors">
                                        <Bell size={20} />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#b0181d] font-bold">
                                        {user?.firstName?.charAt(0)}
                                    </div>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 flex items-center justify-around w-full h-16 bg-white border-t border-gray-200 z-50 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {INVESTOR_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-[#de1f25]' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <item.icon size={20} className={isActive ? 'text-[#de1f25]' : 'text-gray-500'} />
                            <span className="text-[10px] font-medium truncate max-w-[70px] text-center">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
