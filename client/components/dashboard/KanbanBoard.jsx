'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Clock, AlertCircle, ChevronRight, X, Loader2, ArrowRight } from 'lucide-react';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400', border: 'border-slate-200' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    { id: 'review', title: 'Review', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    { id: 'done', title: 'Done', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
];

const PRIORITY_STYLES = {
    high:   'bg-red-100 text-red-600',
    urgent: 'bg-purple-100 text-purple-600',
    medium: 'bg-orange-100 text-orange-600',
    low:    'bg-blue-100 text-blue-600',
};

const STATUS_ORDER = ['todo', 'in-progress', 'review', 'done'];

function NewTaskModal({ onClose, onCreate }) {
    const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error('Task title is required'); return; }
        setLoading(true);
        try {
            const payload = { title: form.title, description: form.description, priority: form.priority, status: 'todo' };
            if (form.dueDate) payload.dueDate = form.dueDate;
            const { data } = await api.post('/tasks', payload);
            onCreate(data);
            toast.success('Task created!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Create New Task</h2>
                        <p className="text-xs text-gray-500">Assigned to your account</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Follow up with client"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#de1f25]/30 focus:border-[#de1f25] outline-none transition-colors placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Add context or instructions..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#de1f25]/30 focus:border-[#de1f25] outline-none transition-colors resize-none placeholder-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                            <select
                                value={form.priority}
                                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#de1f25]/30 focus:border-[#de1f25] outline-none transition-colors cursor-pointer"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#de1f25]/30 focus:border-[#de1f25] outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-[#de1f25] text-white text-sm font-bold hover:bg-[#b0181d] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

export default function KanbanBoard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [movingTask, setMovingTask] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (err) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

    const moveTask = async (task, direction) => {
        const currentIdx = STATUS_ORDER.indexOf(task.status);
        const newIdx = currentIdx + direction;
        if (newIdx < 0 || newIdx >= STATUS_ORDER.length) return;
        const newStatus = STATUS_ORDER[newIdx];

        setMovingTask(task._id);
        try {
            const { data } = await api.put(`/tasks/${task._id}`, { status: newStatus });
            setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: data.status } : t));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update task');
        } finally {
            setMovingTask(null);
        }
    };

    const deleteTask = async (taskId) => {
        setOpenMenu(null);
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t._id !== taskId));
            toast.success('Task removed');
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

    return (
        <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-3 text-xs text-gray-600">
                    <span>{tasks.length} total tasks</span>
                    <span className="text-emerald-600">{getTasksByStatus('done').length} done</span>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#de1f25] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#b0181d] transition-colors shadow-md shadow-red-100/30"
                >
                    <Plus size={16} />
                    New Task
                </button>
            </div>

            {loading ? (
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="flex-shrink-0 w-72 animate-pulse">
                            <div className={`p-3 rounded-t-2xl ${col.color} h-12`} />
                            <div className="bg-gray-50 p-3 rounded-b-2xl border-x border-b border-gray-100 min-h-[400px] flex flex-col gap-3">
                                {[1, 2].map(i => <div key={i} className="bg-white rounded-xl h-24 shadow-sm" />)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide min-h-[500px]">
                    {COLUMNS.map((column, colIdx) => {
                        const colTasks = getTasksByStatus(column.id);
                        return (
                            <div key={column.id} className="flex-shrink-0 w-72 flex flex-col">
                                {/* Column Header */}
                                <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl border ${column.border} ${column.color}`}>
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${column.dot}`} />
                                        {column.title}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 font-semibold">
                                            {colTasks.length}
                                        </span>
                                    </h3>
                                </div>

                                {/* Cards */}
                                <div className="flex-1 bg-gray-50/50 p-3 rounded-b-2xl border-x border-b border-gray-200 flex flex-col gap-3 min-h-[400px]">
                                    <AnimatePresence>
                                        {colTasks.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                                                <AlertCircle size={28} className="opacity-30 mb-2" />
                                                <p className="text-xs">No tasks here</p>
                                            </div>
                                        ) : (
                                            colTasks.map(task => (
                                                <motion.div
                                                    key={task._id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className={`bg-white p-4 rounded-xl shadow-sm border transition-shadow hover:shadow-md cursor-default group relative ${
                                                        isOverdue(task) ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                                                    } ${movingTask === task._id ? 'opacity-50 pointer-events-none' : ''}`}
                                                >
                                                    {/* Menu Button */}
                                                    <div className="absolute top-3 right-3">
                                                        <button
                                                            onClick={() => setOpenMenu(openMenu === task._id ? null : task._id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all"
                                                        >
                                                            <MoreVertical size={14} className="text-gray-400" />
                                                        </button>
                                                        <AnimatePresence>
                                                            {openMenu === task._id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                                                    className="absolute right-0 top-6 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden min-w-[130px]"
                                                                >
                                                                    <button
                                                                        onClick={() => { deleteTask(task._id); }}
                                                                        className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        Delete Task
                                                                    </button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    {/* Priority */}
                                                    <div className="flex items-center justify-between mb-2 pr-6">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${PRIORITY_STYLES[task.priority] || 'bg-gray-100 text-gray-500'}`}>
                                                            {task.priority}
                                                        </span>
                                                        {isOverdue(task) && (
                                                            <span className="text-[10px] text-red-500 font-bold">OVERDUE</span>
                                                        )}
                                                    </div>

                                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-snug">{task.title}</h4>
                                                    {task.description && (
                                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                                                    )}

                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <Clock size={11} />
                                                            <span className="text-[10px]">
                                                                {task.dueDate
                                                                    ? new Date(task.dueDate).toLocaleDateString()
                                                                    : new Date(task.createdAt).toLocaleDateString()
                                                                }
                                                            </span>
                                                        </div>

                                                        {/* Move Buttons */}
                                                        <div className="flex gap-1">
                                                            {colIdx > 0 && (
                                                                <button
                                                                    onClick={() => moveTask(task, -1)}
                                                                    disabled={movingTask === task._id}
                                                                    title="Move backward"
                                                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors rotate-180"
                                                                >
                                                                    <ArrowRight size={13} />
                                                                </button>
                                                            )}
                                                            {colIdx < COLUMNS.length - 1 && (
                                                                <button
                                                                    onClick={() => moveTask(task, 1)}
                                                                    disabled={movingTask === task._id}
                                                                    title="Move forward"
                                                                    className="p-1 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-700 transition-colors"
                                                                >
                                                                    <ArrowRight size={13} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New Task Modal */}
            <AnimatePresence>
                {showModal && (
                    <NewTaskModal
                        onClose={() => setShowModal(false)}
                        onCreate={(task) => setTasks(prev => [task, ...prev])}
                    />
                )}
            </AnimatePresence>

            {/* Close menus on outside click */}
            {(openMenu) && (
                <div className="fixed inset-0 z-20" onClick={() => { setOpenMenu(null); }} />
            )}
        </div>
    );
}
