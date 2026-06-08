'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { Briefcase, Plus, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';

export default function InvestmentProductsDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        durationInMonths: '',
        roiPercent: '',
        description: '',
        principalOptions: ['rollover_all', 'withdraw_roi', 'liquidate_all'],
        isActive: true
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/investment-products/admin');
            setProducts(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load investment products');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (option) => {
        setFormData(prev => {
            const current = [...prev.principalOptions];
            if (current.includes(option)) {
                return { ...prev, principalOptions: current.filter(o => o !== option) };
            } else {
                return { ...prev, principalOptions: [...current, option] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.principalOptions.length === 0) {
            toast.error('Please select at least one maturity action option');
            return;
        }

        try {
            if (formData.id) {
                const { data } = await api.put(`/investment-products/${formData.id}`, formData);
                setProducts(products.map(p => p._id === formData.id ? data : p));
                toast.success('Product updated successfully!');
            } else {
                const { data } = await api.post('/investment-products', formData);
                setProducts([...products, data]);
                toast.success('Product created successfully!');
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this investment product?')) return;
        try {
            await api.delete(`/investment-products/${id}`);
            setProducts(products.filter(p => p._id !== id));
            toast.success('Product deleted');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            name: '',
            durationInMonths: '',
            roiPercent: '',
            description: '',
            principalOptions: ['rollover_all', 'withdraw_roi', 'liquidate_all'],
            isActive: true
        });
    };

    const handleEdit = (product) => {
        setFormData({
            id: product._id,
            name: product.name,
            durationInMonths: product.durationInMonths,
            roiPercent: product.roiPercent,
            description: product.description,
            principalOptions: product.principalOptions || [],
            isActive: product.isActive
        });
        setShowModal(true);
    };

    if (loading) return <div className="p-10 text-center text-white">Loading investment products...</div>;

    return (
        <div className="space-y-6 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Briefcase className="text-amber-500" />
                        Investment Products Console
                    </h2>
                    <p className="text-gray-400">Configure public packages, maturity actions, duration periods, and ROI rates.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg text-sm"
                >
                    <Plus size={18} /> New Product
                </button>
            </header>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-white">
                    <thead>
                        <tr className="bg-gray-950 border-b border-gray-800 text-sm text-gray-400">
                            <th className="px-6 py-4 font-semibold">Product Name</th>
                            <th className="px-6 py-4 font-semibold">Duration</th>
                            <th className="px-6 py-4 font-semibold">ROI Rate</th>
                            <th className="px-6 py-4 font-semibold">Maturity Actions</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                    No investment products found. Create one to get started.
                                </td>
                            </tr>
                        ) : products.map(product => (
                            <tr key={product._id} className="border-b border-gray-850 hover:bg-gray-850/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white text-base">{product.name}</div>
                                    <div className="text-gray-400 text-xs mt-1 max-w-xs truncate">{product.description}</div>
                                </td>
                                <td className="px-6 py-4 font-medium">{product.durationInMonths} Months</td>
                                <td className="px-6 py-4 text-green-400 font-bold text-lg">{product.roiPercent}%</td>
                                <td className="px-6 py-4 text-xs space-y-1">
                                    {product.principalOptions?.map(opt => {
                                        let label = '';
                                        if (opt === 'rollover_all') label = 'Rollover Capital+ROI';
                                        if (opt === 'withdraw_roi') label = 'Withdraw ROI, Rollover Cap';
                                        if (opt === 'liquidate_all') label = 'Liquidate All';
                                        return (
                                            <div key={opt} className="bg-gray-950 px-2 py-0.5 rounded border border-gray-800 inline-block mr-1">
                                                {label}
                                            </div>
                                        );
                                    })}
                                </td>
                                <td className="px-6 py-4">
                                    {product.isActive ? (
                                        <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                                            <CheckCircle2 size={16} /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-400 text-sm font-semibold">
                                            <XCircle size={16} /> Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-lg space-y-4 text-white">
                        <h3 className="text-xl font-bold">{formData.id ? 'Edit Investment Product' : 'Create Investment Product'}</h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Product Display Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                                placeholder="e.g. Wealth Builder Plus"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Duration (Months)</label>
                                <input
                                    type="number"
                                    value={formData.durationInMonths}
                                    onChange={e => setFormData({ ...formData, durationInMonths: parseInt(e.target.value) || '' })}
                                    required
                                    min="1"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                                    placeholder="e.g. 12"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-450 uppercase mb-2">ROI Percent (%)</label>
                                <input
                                    type="number"
                                    value={formData.roiPercent}
                                    onChange={e => setFormData({ ...formData, roiPercent: parseInt(e.target.value) || '' })}
                                    required
                                    min="1"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                                    placeholder="e.g. 24"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Detailed Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={3}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-white"
                                placeholder="Details about this investment package..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Principal Actions After Maturity</label>
                            <div className="space-y-2 bg-gray-950 p-3 rounded-xl border border-gray-850">
                                {[
                                    { value: 'rollover_all', label: 'Rollover Capital + ROI' },
                                    { value: 'withdraw_roi', label: 'Withdraw ROI, Rollover Capital' },
                                    { value: 'liquidate_all', label: 'Liquidate Completely' }
                                ].map(opt => (
                                    <label key={opt.value} className="flex items-center gap-2.5 text-sm cursor-pointer hover:text-white text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={formData.principalOptions.includes(opt.value)}
                                            onChange={() => handleCheckboxChange(opt.value)}
                                            className="rounded border-gray-800 text-amber-500 focus:ring-amber-500 bg-gray-950"
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 pt-2">
                            <input
                                id="isActive"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="rounded border-gray-800 text-amber-500 focus:ring-amber-500 bg-gray-950"
                            />
                            <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">Active and selectable by investors</label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-850">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 bg-gray-850 hover:bg-gray-800 rounded-xl text-gray-300 font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-semibold transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
