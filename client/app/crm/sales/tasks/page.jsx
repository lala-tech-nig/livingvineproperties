'use client';

import KanbanBoard from '@/components/dashboard/KanbanBoard';

export default function SalesTasks() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Tasks & Kanban Board</h2>
                <p className="text-gray-400 mt-1">Manage your daily sales activities and move cards as they progress.</p>
            </div>
            <KanbanBoard />
        </div>
    );
}
