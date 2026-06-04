'use client';

import { useState, useEffect } from 'react';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import { Plus } from 'lucide-react';

export default function SalesTasks() {
    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Tasks & Kanban</h2>
                    <p className="text-gray-400">Manage your daily sales activities and follow-ups.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#de1f25] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#b0181d] transition-colors shadow-lg shadow-red-100/10">
                    <Plus size={20} />
                    New Task
                </button>
            </header>

            <div className="text-gray-900">
                <KanbanBoard />
            </div>
        </div>
    );
}
