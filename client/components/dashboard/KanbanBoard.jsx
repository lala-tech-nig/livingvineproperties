'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, MoreVertical, Clock, AlertCircle } from 'lucide-react';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100 text-slate-700' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 text-blue-700' },
    { id: 'review', title: 'Review', color: 'bg-amber-50 text-amber-700' },
    { id: 'done', title: 'Done', color: 'bg-emerald-50 text-emerald-700' },
];

export default function KanbanBoard({ initialTasks = [] }) {
    const [tasks, setTasks] = useState(initialTasks);

    const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide min-h-[600px]">
            {COLUMNS.map(column => (
                <div key={column.id} className="flex-shrink-0 w-80 flex flex-col">
                    <div className={`flex items-center justify-between p-3 rounded-t-2xl ${column.color}`}>
                        <h3 className="font-bold flex items-center gap-2">
                            {column.title}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                                {getTasksByStatus(column.id).length}
                            </span>
                        </h3>
                        <button className="hover:bg-black/5 p-1 rounded-md transition-colors">
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="flex-1 bg-gray-50/50 p-3 rounded-b-2xl border-x border-b border-gray-100 flex flex-col gap-3">
                        {getTasksByStatus(column.id).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                                <AlertCircle size={32} className="opacity-20 mb-2" />
                                <p className="text-sm">No tasks</p>
                            </div>
                        ) : (
                            getTasksByStatus(column.id).map(task => (
                                <motion.div
                                    key={task._id}
                                    layoutId={task._id}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                                            task.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100">
                                            <MoreVertical size={14} className="text-gray-400" />
                                        </button>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{task.title}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                                    
                                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Clock size={12} />
                                            <span className="text-[10px]">{new Date(task.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                            UN
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
