'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Home, PlusCircle, History, MessageSquare, LogOut, Bell, Building2, Headphones, Settings } from 'lucide-react';
import api from '@/lib/axios';
import SurveyModal from '@/components/ui/SurveyModal';

const INVESTOR_NAV = [
    { name: 'Overview',         href: '/investor',                  icon: Home },
    { name: 'New Investment',   href: '/investor/new-investment',   icon: PlusCircle },
    { name: 'History',          href: '/investor/history',          icon: History },
    { name: 'Messages',         href: '/investor/messages',         icon: MessageSquare },
    { name: 'Account Settings', href: '/investor/account-settings', icon: Settings },
];

export default function InvestorLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, initializeAuth, logout, setUser } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Survey state
    const [activeSurvey, setActiveSurvey] = useState(null);
    const [showSurvey, setShowSurvey] = useState(false);

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
        
        // Allow management/ceo to access investment detail review pages
        const adminRoles = ['management', 'ceo', 'superadmin'];
        const isReviewPage = pathname.startsWith('/investor/investment/');
        if (user && user.role !== 'investor' && !adminRoles.includes(user.role)) {
            router.push('/investor/login');
        }
        
        // Redirect admin roles away from investor-only pages (not detail pages)
        if (user && adminRoles.includes(user.role) && !isReviewPage) {
            router.back();
        }
    }, [mounted, isAuthenticated, user, router, pathname, isPublicPage]);

    // Check active survey on mount
    useEffect(() => {
        const checkSurvey = async () => {
            try {
                const { data } = await api.get('/surveys/active');
                if (data && data.survey && !data.alreadyAnswered) {
                    setActiveSurvey(data.survey);
                    setShowSurvey(true);
                }
            } catch (error) {
                console.error('Error checking active surveys:', error);
            }
        };

        if (isAuthenticated && mounted && !isPublicPage) {
            // Delay slightly to improve feel
            const timer = setTimeout(checkSurvey, 2000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, mounted, pathname, isPublicPage]);

    // Poll unread investor notifications every 60s
    useEffect(() => {
        if (!isAuthenticated || !mounted || isPublicPage || user?.role !== 'investor') return;
        const fetchUnread = async () => {
            try {
                const { data } = await api.get('/notifications');
                setUnreadCount(Array.isArray(data) ? data.filter(n => !n.isRead).length : 0);
            } catch { /* silent */ }
        };
        fetchUnread();
        const id = setInterval(fetchUnread, 60000);
        return () => clearInterval(id);
    }, [isAuthenticated, mounted, isPublicPage, user?.role]);

    // Sync latest profile (including accountOfficer) from server on mount
    useEffect(() => {
        const syncProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                // Merge the fresh server data into the auth store (and localStorage)
                const merged = {
                    id: data._id,
                    email: data.email,
                    role: data.role,
                    firstName: data.firstName,
                    surname: data.surname,
                    accountOfficer: data.accountOfficer || null,
                };
                const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (storedToken) {
                    localStorage.setItem('user', JSON.stringify(merged));
                    setUser(merged, storedToken);
                }
            } catch (err) {
                // Silently fail — user will still see their cached data
            }
        };

        if (isAuthenticated && mounted && !isPublicPage && user?.role === 'investor') {
            syncProfile();
        }
    }, [isAuthenticated, mounted, isPublicPage, user?.role, setUser]);

    if (isPublicPage) {
        return <>{children}</>;
    }

    const adminRoles = ['management', 'ceo', 'superadmin'];
    const isReviewPage = pathname.startsWith('/investor/investment/');

    if (!mounted || !isAuthenticated || (user && user.role !== 'investor' && !adminRoles.includes(user.role))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#de1f25] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Management/CEO viewing a review page — render children directly without investor shell
    if (user && adminRoles.includes(user.role) && isReviewPage) {
        return <>{children}</>;
    }

    const handleLogout = () => {
        logout();
        router.push('/investor/login');
    };

    // Mobile Navigation items styled matching mockup
    const MOBILE_NAV_ITEMS = [
        { name: 'Home',    href: '/investor',                  icon: Home },
        { name: 'Invest',  href: '/investor/new-investment',   icon: PlusCircle },
        { name: 'History', href: '/investor/history',          icon: History },
        { name: 'Account', href: '/investor/account-settings', icon: Settings },
        { name: 'Support', href: '/investor/messages',         icon: Headphones },
    ];

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
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#b0181d] font-bold shrink-0 overflow-hidden border border-orange-200">
                                {user?.profileImage
                                    ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
                                    : <>{user?.firstName?.charAt(0)}{user?.surname?.charAt(0)}</>}
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
                    {/* Top Header (Desktop Only) */}
                    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-10 hidden lg:flex">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-semibold text-gray-900 capitalize">
                                {pathname.split('/')[2] || 'Overview'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/investor/notifications" className="relative p-2 text-gray-400 hover:text-[#de1f25] transition-colors">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-[#de1f25] rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Mobile Header (re-styled to match mockup header, hidden on desktop) */}
                            <div className="lg:hidden bg-white -mx-4 -mt-4 px-4 py-3.5 flex items-center justify-between border-b border-gray-100 mb-6 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                        {user?.firstName?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-gray-400 leading-none">Hello, {user?.firstName} 👋</div>
                                        <div className="text-[11px] font-bold text-gray-800 leading-tight">Welcome back to<br/><span className="text-primary font-serif">Living Vine Properties</span></div>
                                    </div>
                                </div>
                                <Link href="/investor/notifications" className="relative p-1">
                                    <Bell size={18} className="text-gray-650" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 min-w-[14px] h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center px-0.5">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar (styled to match mockup footer) */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 flex flex-col shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <nav className="flex justify-around items-center py-2.5 px-2">
                    {MOBILE_NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 transition-all w-16 ${
                                    isActive ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <item.icon size={16} className={isActive ? 'text-primary scale-110' : 'text-gray-450'} />
                                <span className="text-[8px] font-semibold tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                {/* Home indicator bar (iPhone style) */}
                <div className="flex justify-center pb-1.5 bg-white shrink-0">
                    <div className="w-20 h-[3px] bg-gray-300 rounded-full" />
                </div>
            </div>

            {/* Survey Modal Popup */}
            {showSurvey && activeSurvey && (
                <SurveyModal 
                    survey={activeSurvey} 
                    onClose={() => setShowSurvey(false)} 
                />
            )}
        </div>
    );
}
