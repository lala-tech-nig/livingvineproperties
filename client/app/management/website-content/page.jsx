'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { 
    Globe, Image as ImageIcon, Briefcase, Mail, Settings as SettingsIcon, Plus, Trash2, Edit2, CheckCircle2, Archive
} from 'lucide-react';

export default function WebsiteContentEditor() {
    const [activeTab, setActiveTab] = useState('hero');
    const [loading, setLoading] = useState(true);

    // Dynamic Database States
    const [heroSlides, setHeroSlides] = useState([]);
    const [services, setServices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [settings, setSettings] = useState({
        address: '', phone: '', email: '', whatsapp: '',
        facebook: '', twitter: '', instagram: '', linkedin: ''
    });
    const [inquiries, setInquiries] = useState([]);

    // Modals / Form States
    const [heroForm, setHeroForm] = useState({ id: null, title: '', subtitle: '', image: '' });
    const [serviceForm, setServiceForm] = useState({ id: null, title: '', description: '', icon: '', href: '' });
    const [projectForm, setProjectForm] = useState({ id: null, title: '', location: '', status: 'Selling Fast', image: '' });
    const [showModal, setShowModal] = useState(null); // 'hero', 'service', 'project'

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [
                { data: heroRes },
                { data: serviceRes },
                { data: projectRes },
                { data: settingsRes },
                { data: inquiriesRes }
            ] = await Promise.all([
                api.get('/website/hero'),
                api.get('/website/services'),
                api.get('/website/projects'),
                api.get('/website/settings'),
                api.get('/website/inquiries')
            ]);

            setHeroSlides(heroRes);
            setServices(serviceRes);
            setProjects(projectRes);
            if (settingsRes) setSettings(settingsRes);
            setInquiries(inquiriesRes);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load website content details');
        } finally {
            setLoading(false);
        }
    };

    // --- Hero Slider Operations ---
    const handleHeroSubmit = async (e) => {
        e.preventDefault();
        try {
            if (heroForm.id) {
                const { data } = await api.put(`/website/hero/${heroForm.id}`, heroForm);
                setHeroSlides(heroSlides.map(s => s._id === heroForm.id ? data : s));
                toast.success('Hero slide updated successfully!');
            } else {
                const { data } = await api.post('/website/hero', heroForm);
                setHeroSlides([...heroSlides, data]);
                toast.success('Hero slide added successfully!');
            }
            setShowModal(null);
            setHeroForm({ id: null, title: '', subtitle: '', image: '' });
        } catch (e) {
            toast.error('Hero operation failed');
        }
    };

    const deleteHeroSlide = async (id) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;
        try {
            await api.delete(`/website/hero/${id}`);
            setHeroSlides(heroSlides.filter(s => s._id !== id));
            toast.success('Slide deleted');
        } catch (e) {
            toast.error('Failed to delete slide');
        }
    };

    // --- Services Operations ---
    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            if (serviceForm.id) {
                const { data } = await api.put(`/website/services/${serviceForm.id}`, serviceForm);
                setServices(services.map(s => s._id === serviceForm.id ? data : s));
                toast.success('Service updated successfully!');
            } else {
                const { data } = await api.post('/website/services', serviceForm);
                setServices([...services, data]);
                toast.success('Service added successfully!');
            }
            setShowModal(null);
            setServiceForm({ id: null, title: '', description: '', icon: '', href: '' });
        } catch (e) {
            toast.error('Service operation failed');
        }
    };

    const deleteService = async (id) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await api.delete(`/website/services/${id}`);
            setServices(services.filter(s => s._id !== id));
            toast.success('Service deleted');
        } catch (e) {
            toast.error('Failed to delete service');
        }
    };

    // --- Projects Operations ---
    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        try {
            if (projectForm.id) {
                const { data } = await api.put(`/website/projects/${projectForm.id}`, projectForm);
                setProjects(projects.map(p => p._id === projectForm.id ? data : p));
                toast.success('Project updated successfully!');
            } else {
                const { data } = await api.post('/website/projects', projectForm);
                setProjects([...projects, data]);
                toast.success('Project added successfully!');
            }
            setShowModal(null);
            setProjectForm({ id: null, title: '', location: '', status: 'Selling Fast', image: '' });
        } catch (e) {
            toast.error('Project operation failed');
        }
    };

    const deleteProject = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/website/projects/${id}`);
            setProjects(projects.filter(p => p._id !== id));
            toast.success('Project deleted');
        } catch (e) {
            toast.error('Failed to delete project');
        }
    };

    // --- Settings Operations ---
    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/website/settings', settings);
            setSettings(data);
            toast.success('Global website settings updated!');
        } catch (e) {
            toast.error('Failed to update settings');
        }
    };

    // --- Inquiries Operations ---
    const updateInquiryStatus = async (id, status) => {
        try {
            const { data } = await api.put(`/website/inquiries/${id}`, { status });
            setInquiries(inquiries.map(i => i._id === id ? data : i));
            toast.success(`Inquiry marked as ${status}`);
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="p-10 text-center text-white">Loading website editor console...</div>;

    return (
        <div className="space-y-6 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Globe className="text-amber-500" />
                        Website Content Management Console
                    </h2>
                    <p className="text-gray-400">Direct control over the dynamic homepage elements, services, portfolios, and incoming contact form inquiries.</p>
                </div>
            </header>

            {/* Tab selector */}
            <div className="flex border-b border-gray-800 gap-1 bg-gray-900 p-1.5 rounded-xl">
                <button onClick={() => setActiveTab('hero')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'hero' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                    <ImageIcon size={16} /> Hero Carousel
                </button>
                <button onClick={() => setActiveTab('services')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'services' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                    <Briefcase size={16} /> Services
                </button>
                <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'projects' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                    <Globe size={16} /> Projects
                </button>
                <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                    <SettingsIcon size={16} /> Contact Settings
                </button>
                <button onClick={() => setActiveTab('inquiries')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'inquiries' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                    <Mail size={16} /> Enquiries ({inquiries.filter(i => i.status === 'new').length})
                </button>
            </div>

            {/* TAB PANELS */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                
                {/* 1. HERO SLIDES TAB */}
                {activeTab === 'hero' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Homepage Carousel Slides</h3>
                            <button onClick={() => { setHeroForm({ id: null, title: '', subtitle: '', image: '' }); setShowModal('hero'); }} className="bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-700 font-bold transition-all text-sm">
                                <Plus size={16} /> Add Carousel Frame
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {heroSlides.map((slide) => (
                                <div key={slide._id} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-sm relative flex flex-col justify-between">
                                    <div className="h-44 w-full bg-cover bg-center" style={{ backgroundImage: `url('${slide.image}')` }} />
                                    <div className="p-4">
                                        <h4 className="font-bold text-lg text-white">{slide.title}</h4>
                                        <p className="text-gray-400 text-xs mt-1">{slide.subtitle}</p>
                                    </div>
                                    <div className="p-4 border-t border-gray-850 flex justify-end gap-2 bg-gray-900/50">
                                        <button onClick={() => { setHeroForm({ id: slide._id, title: slide.title, subtitle: slide.subtitle, image: slide.image }); setShowModal('hero'); }} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-gray-850 rounded-lg">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteHeroSlide(slide._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-850 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. SERVICES TAB */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Company Services Grid</h3>
                            <button onClick={() => { setServiceForm({ id: null, title: '', description: '', icon: 'Briefcase', href: '' }); setShowModal('service'); }} className="bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-700 font-bold transition-all text-sm">
                                <Plus size={16} /> Add Service Item
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {services.map((svc) => (
                                <div key={svc._id} className="bg-gray-950 border border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="bg-amber-500/10 text-amber-500 w-10 h-10 rounded-lg flex items-center justify-center mb-3 font-bold">
                                            {svc.icon[0]}
                                        </div>
                                        <h4 className="font-bold text-white text-base">{svc.title}</h4>
                                        <p className="text-gray-400 text-xs mt-2 leading-relaxed">{svc.description}</p>
                                        <p className="text-amber-500 text-xs mt-3 font-mono">Icon: {svc.icon}</p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-850">
                                        <button onClick={() => { setServiceForm({ id: svc._id, title: svc.title, description: svc.description, icon: svc.icon, href: svc.href || '' }); setShowModal('service'); }} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-gray-850 rounded-lg">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteService(svc._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-850 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. PROJECTS TAB */}
                {activeTab === 'projects' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Portfolio Developments</h3>
                            <button onClick={() => { setProjectForm({ id: null, title: '', location: '', status: 'Selling Fast', image: '' }); setShowModal('project'); }} className="bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-700 font-bold transition-all text-sm">
                                <Plus size={16} /> Add Development Structure
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {projects.map((proj) => (
                                <div key={proj._id} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                                    <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url('${proj.image}')` }}>
                                        <span className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md shadow-sm ${
                                            proj.status === 'Selling Fast' ? 'bg-green-600 text-white' :
                                            proj.status === 'Sold Out' ? 'bg-red-600 text-white' :
                                            'bg-yellow-600 text-white'
                                        }`}>{proj.status}</span>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-white text-base">{proj.title}</h4>
                                        <p className="text-gray-400 text-xs mt-1">{proj.location}</p>
                                    </div>
                                    <div className="p-4 border-t border-gray-850 flex justify-end gap-2 bg-gray-900/50">
                                        <button onClick={() => { setProjectForm({ id: proj._id, title: proj.title, location: proj.location, status: proj.status, image: proj.image }); setShowModal('project'); }} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-gray-850 rounded-lg">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteProject(proj._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-850 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. CONTACT SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-2xl">
                        <h3 className="text-lg font-bold">Global Contact Details & Social Handles</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Office Address</label>
                                <input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Contact Phone Numbers</label>
                                <input type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Social Email Addresses</label>
                                <input type="text" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">WhatsApp Direct Link/Number</label>
                                <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Facebook URL</label>
                                <input type="text" value={settings.facebook} onChange={e => setSettings({...settings, facebook: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Twitter/X URL</label>
                                <input type="text" value={settings.twitter} onChange={e => setSettings({...settings, twitter: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Instagram URL</label>
                                <input type="text" value={settings.instagram} onChange={e => setSettings({...settings, instagram: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">LinkedIn URL</label>
                                <input type="text" value={settings.linkedin} onChange={e => setSettings({...settings, linkedin: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none" />
                            </div>
                        </div>

                        <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-all">
                            Save Global Configuration
                        </button>
                    </form>
                )}

                {/* 5. INQUIRIES TAB */}
                {activeTab === 'inquiries' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold">Contact Form Queries</h3>
                        
                        <div className="space-y-4">
                            {inquiries.length === 0 ? (
                                <p className="text-gray-500 text-center py-10">No inquiries received yet.</p>
                            ) : inquiries.map((inq) => (
                                <div key={inq._id} className={`p-5 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 transition-colors ${
                                    inq.status === 'new' ? 'bg-amber-500/5 border-amber-500/20' :
                                    inq.status === 'archived' ? 'bg-gray-950/20 border-gray-850 opacity-50' :
                                    'bg-gray-950 border-gray-800'
                                }`}>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-white">{inq.name}</span>
                                            <span className="text-gray-400 text-xs font-mono">{inq.email}</span>
                                            {inq.phone && <span className="text-gray-400 text-xs font-mono">{inq.phone}</span>}
                                        </div>
                                        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Interest: {inq.interest}</p>
                                        <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-850 mt-2 max-w-3xl leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                                        <p className="text-[10px] text-gray-500">{new Date(inq.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                                        {inq.status === 'new' && (
                                            <button onClick={() => updateInquiryStatus(inq._id, 'read')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-600/20 text-emerald-500 text-xs font-bold rounded-lg transition-colors">
                                                <CheckCircle2 size={14} /> Mark Read
                                            </button>
                                        )}
                                        {inq.status !== 'archived' && (
                                            <button onClick={() => updateInquiryStatus(inq._id, 'archived')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-gray-400 text-xs font-bold rounded-lg transition-colors">
                                                <Archive size={14} /> Archive
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* MODALS */}
            {showModal === 'hero' && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleHeroSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-lg space-y-4 text-white">
                        <h3 className="text-xl font-bold">{heroForm.id ? 'Edit Slide Frame' : 'Create Slide Frame'}</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Slide Main Title</label>
                            <input type="text" value={heroForm.title} onChange={e => setHeroForm({...heroForm, title: e.target.value})} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Slide Subtitle / Description</label>
                            <input type="text" value={heroForm.subtitle} onChange={e => setHeroForm({...heroForm, subtitle: e.target.value})} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Slide Image URL</label>
                            <input type="text" value={heroForm.image} onChange={e => setHeroForm({...heroForm, image: e.target.value})} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(null)} className="px-5 py-2.5 bg-gray-850 hover:bg-gray-800 rounded-xl text-gray-300 font-semibold transition-all">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-semibold transition-all">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}

            {showModal === 'service' && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleServiceSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-lg space-y-4 text-white">
                        <h3 className="text-xl font-bold">{serviceForm.id ? 'Edit Service Details' : 'Create Service Details'}</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Service Title</label>
                            <input type="text" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Service Description</label>
                            <textarea value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} required rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Lucide Icon Name (e.g. Briefcase, Award, Users)</label>
                            <input type="text" value={serviceForm.icon} onChange={e => setServiceForm({...serviceForm, icon: e.target.value})} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Redirect Href Link (Optional)</label>
                            <input type="text" value={serviceForm.href} onChange={e => setServiceForm({...serviceForm, href: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(null)} className="px-5 py-2.5 bg-gray-850 hover:bg-gray-800 rounded-xl text-gray-300 font-semibold transition-all">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-semibold transition-all">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}

            {showModal === 'project' && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleProjectSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-lg space-y-4 text-white">
                        <h3 className="text-xl font-bold">{projectForm.id ? 'Edit Development Project' : 'Create Development Project'}</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Development Project Name</label>
                            <input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Development Location</label>
                            <input type="text" value={projectForm.location} onChange={e => setProjectForm({...projectForm, location: e.target.value})} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Selling Status</label>
                            <select value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-white">
                                <option value="Selling Fast">Selling Fast</option>
                                <option value="Sold Out">Sold Out</option>
                                <option value="Launching Soon">Launching Soon</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Project Image URL</label>
                            <input type="text" value={projectForm.image} onChange={e => setProjectForm({...projectForm, image: e.target.value})} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(null)} className="px-5 py-2.5 bg-gray-850 hover:bg-gray-800 rounded-xl text-gray-300 font-semibold transition-all">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-semibold transition-all">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
