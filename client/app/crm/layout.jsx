'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import {
    BarChart3, Users, ShieldAlert, History, Bell, LogOut,
    PlusCircle, MessageSquare, Briefcase
} from 'lucide-react';

const CRM_ROLES = ['sales', 'marketing', 'hr', 'ceo', 'superadmin'];

const getNavigation = (role) => {
    switch (role) {
        case 'superadmin':
            return [
                { name: 'Admin Dashboard', href: '/crm/superadmin', icon: BarChart3 },
                { name: 'User Management', href: '/crm/superadmin/users', icon: ShieldAlert },
                { name: 'CRM Overview', href: '/crm/superadmin/crm', icon: Users },
                { name: 'Payroll & HR', href: '/crm/superadmin/hr', icon: History },
                { name: 'WhatsApp Hub', href: '/crm/superadmin/whatsapp', icon: MessageSquare },
            ];
        case 'ceo':
            return [
                { name: 'Dashboard', href: '/crm/ceo', icon: BarChart3 },
                { name: 'Team Management', href: '/crm/ceo/team', icon: ShieldAlert },
                { name: 'Company CRM', href: '/crm/ceo/crm', icon: Users },
                { name: 'Notifications', href: '/crm/ceo/notifications', icon: Bell },
                { name: 'WhatsApp Hub', href: '/crm/superadmin/whatsapp', icon: MessageSquare },
            ];
        case 'sales':
            return [
                { name: 'Sales Dashboard', href: '/crm/sales', icon: BarChart3 },
                { name: 'Customers', href: '/crm/sales/customers', icon: Users },
                { name: 'Leads', href: '/crm/sales/leads', icon: PlusCircle },
                { name: 'Tasks', href: '/crm/sales/tasks', icon: History },
                { name: 'WhatsApp Contacts', href: '/crm/whatsapp', icon: MessageSquare },
            ];
        case 'marketing':
            return [
                { name: 'Marketing Dashboard', href: '/crm/marketing', icon: BarChart3 },
                { name: 'Lead Gen', href: '/crm/marketing/leads', icon: PlusCircle },
                { name: 'Surveys', href: '/crm/marketing/surveys', icon: MessageSquare },
                { name: 'WhatsApp Contacts', href: '/crm/whatsapp', icon: MessageSquare },
            ];
        case 'hr':
            return [
                { name: 'HR Dashboard', href: '/crm/hr', icon: BarChart3 },
                { name: 'Attendance', href: '/crm/hr/attendance', icon: History },
                { name: 'Payroll', href: '/crm/hr/payroll', icon: Briefcase },
                { name: 'Staff', href: '/crm/hr/staff', icon: Users },
                { name: 'WhatsApp Contacts', href: '/crm/whatsapp', icon: MessageSquare },
            ];
        default:
            return [
                { name: 'Dashboard', href: '/crm', icon: BarChart3 },
                { name: 'WhatsApp Contacts', href: '/crm/whatsapp', icon: MessageSquare },
            ];
    }
};

const ROLE_LABEL = {
    sales: 'Sales', marketing: 'Marketing', hr: 'Human Resources',
    ceo: 'CEO Office', superadmin: 'Super Admin',
};

export default function CRMLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, initializeAuth, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    const isLoginPage = pathname === '/crm/login';

    useEffect(() => {
        initializeAuth();
        setMounted(true);
    }, [initializeAuth]);

    useEffect(() => {
        if (!mounted) return;
        if (isLoginPage) return;
        if (!isAuthenticated) { router.push('/crm/login'); return; }
        if (user && !CRM_ROLES.includes(user.role)) { router.push('/crm/login'); }
    }, [mounted, isAuthenticated, user, router, pathname, isLoginPage]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!mounted || !isAuthenticated || (user && !CRM_ROLES.includes(user.role))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#de1f25] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading CRM...</p>
                </div>
            </div>
        );
    }

    const navigation = getNavigation(user?.role);
    const handleLogout = () => { logout(); router.push('/crm/login'); };

    return (
        <div className="min-h-screen bg-gray-950 flex text-white">
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 bg-gray-900 border-r border-gray-800 lg:static w-72 flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-800 flex-shrink-0 gap-3">
                        <Link href="/" className="text-xl font-bold text-white font-serif hover:text-[#de1f25] transition-colors">
                            Living Vine
                        </Link>
                        <span className="text-xs bg-[#de1f25]/20 text-[#de1f25] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">CRM</span>
                    </div>

                    <div className="px-4 py-4 border-b border-gray-800">
                        <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1">Role</p>
                        <p className="text-sm font-semibold text-[#de1f25]">{ROLE_LABEL[user?.role] || user?.role}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#de1f25]/15 text-[#de1f25] font-semibold border border-[#de1f25]/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <item.icon size={18} className={isActive ? 'text-[#de1f25]' : 'text-gray-600'} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-gray-800 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-[#de1f25]/20 flex items-center justify-center text-[#de1f25] font-bold shrink-0 border border-[#de1f25]/30">
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
                            {ROLE_LABEL[user?.role]} / {pathname.split('/')[3] || 'Dashboard'}
                        </h1>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-500 hover:text-[#de1f25] transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-950">
                        <div className="max-w-7xl mx-auto">
                            {/* Mobile Header */}
                            <div className="lg:hidden flex items-center justify-between mb-6">
                                <Link href="/" className="text-xl font-bold text-white font-serif">Living Vine <span className="text-[#de1f25] text-sm">CRM</span></Link>
                                <div className="flex items-center gap-3">
                                    <button className="relative p-2 text-gray-500 hover:text-[#de1f25] transition-colors">
                                        <Bell size={20} />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-8 h-8 rounded-full bg-[#de1f25]/20 flex items-center justify-center text-[#de1f25] font-bold"
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
                {navigation.slice(0, 4).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-[#de1f25]' : 'text-gray-600 hover:text-gray-400'}`}>
                            <item.icon size={20} />
                            <span className="text-[10px] font-medium truncate max-w-[60px] text-center">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
