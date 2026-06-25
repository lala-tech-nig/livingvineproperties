'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { 
    Globe, Image as ImageIcon, Briefcase, Mail, Settings as SettingsIcon, Plus, Trash2, Edit2, 
    CheckCircle2, Archive, UploadCloud, Users, Target, Award, ShieldCheck, FileText, 
    Info, PhoneCall, MapPin, Clock, ChevronRight, Save, Trash, AlertCircle
} from 'lucide-react';

export default function WebsiteContentEditor() {
    const [activeTab, setActiveTab] = useState('global');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Dynamic Database States (from DB)
    const [heroSlides, setHeroSlides] = useState([]);
    const [services, setServices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [inquiries, setInquiries] = useState([]);

    const [settings, setSettings] = useState({
        address: '', phone: '', email: '', whatsapp: '',
        facebook: '', twitter: '', instagram: '', linkedin: '',
        marqueeTitle: '', marqueeTagline: '', marqueeEmail: '', marqueePhone: '',
        
        // Homepage snippet
        aboutTitle: '', aboutSubtitle: '', aboutDescription1: '', aboutDescription2: '',
        aboutImage: '', aboutFeature1: '', aboutFeature2: '', aboutFeature3: '',

        // Homepage extended
        homeStats: [],
        homeServicesBadge: '', homeServicesTitle: '', homeServicesDesc: '',
        homeProjectsBadge: '', homeProjectsTitle: '',
        homeAppTeaserBadge: '', homeAppTeaserTitle: '', homeAppTeaserDesc: '', homeAppTeaserFeatures: [],
        homeCTATitle: '', homeCTADesc: '', homeCTABtnText: '', homeCTAAltBtnText: '',

        // About page extended
        aboutPageHeroTitle: '', aboutPageHeroSubtitle: '', aboutPageEstablishedText: '',
        aboutPageMissionTitle: '', aboutPageMissionDesc: '',
        aboutPageVisionTitle: '', aboutPageVisionDesc: '',
        aboutPageCoreValuesTitle: '', aboutPageCoreValuesSubtitle: '',
        aboutPageCoreValues: [],
        aboutPageTeamTitle: '', aboutPageTeamSubtitle: '',
        aboutPageTeam: [],
        aboutPageCertificationsTitle: '', aboutPageCertifications: [],

        // Investments page extended
        investmentsPageHeroTitle: '', investmentsPageHeroSubtitle: '', investmentsPageHeroBtnText: '',
        investmentsPageLandBankingBadge: '', investmentsPageLandBankingTitle: '', investmentsPageLandBankingDesc: '',
        investmentsPageLandBankingBenefits: [], investmentsPageLandBankingImage: '', investmentsPageLandBankingBtnText: '',
        investmentsPageDevBadge: '', investmentsPageDevTitle: '', investmentsPageDevDesc: '',
        investmentsPageDevBenefits: [], investmentsPageDevImage: '', investmentsPageDevBtnText: '',
        investmentsPageAppreciationTitle: '', investmentsPageAppreciationNote: '',
        investmentsPageAppreciationYears: [],
        investmentsPageProcessTitle: '', investmentsPageProcessBtnText: '',
        investmentsPageProcessSteps: [],

        // Contact page extended
        contactPageHeroTitle: '', contactPageHeroSubtitle: '',
        contactPageOfficeHours: '', contactPageMapImage: '', contactPageMapLink: '',

        // Projects page
        projectsPageHeroTitle: '', projectsPageHeroSubtitle: '',

        // Policies
        privacyPageTitle: '', privacyPageEffectiveDate: '', privacyPageContent: '',
        termsPageTitle: '', termsPageEffectiveDate: '', termsPageContent: ''
    });

    // Modals / Form States
    const [heroForm, setHeroForm] = useState({ id: null, title: '', subtitle: '', image: '' });
    const [serviceForm, setServiceForm] = useState({ id: null, title: '', description: '', icon: '', href: '' });
    const [projectForm, setProjectForm] = useState({ id: null, title: '', location: '', status: 'Selling Fast', image: '', category: 'Ongoing', description: '' });
    const [showModal, setShowModal] = useState(null); // 'hero', 'service', 'project'

    // Form editing sub-objects states
    const [newVal, setNewVal] = useState({ title: '', desc: '', iconName: 'CheckCircle' });
    const [newTeam, setNewTeam] = useState({ name: '', role: '', img: '' });

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

            setHeroSlides(heroRes || []);
            setServices(serviceRes || []);
            setProjects(projectRes || []);
            setInquiries(inquiriesRes || []);

            if (settingsRes) {
                setSettings({
                    address: settingsRes.address || '',
                    phone: settingsRes.phone || '',
                    email: settingsRes.email || '',
                    whatsapp: settingsRes.whatsapp || '',
                    facebook: settingsRes.facebook || '',
                    twitter: settingsRes.twitter || '',
                    instagram: settingsRes.instagram || '',
                    linkedin: settingsRes.linkedin || '',
                    marqueeTitle: settingsRes.marqueeTitle || '',
                    marqueeTagline: settingsRes.marqueeTagline || '',
                    marqueeEmail: settingsRes.marqueeEmail || '',
                    marqueePhone: settingsRes.marqueePhone || '',
                    aboutTitle: settingsRes.aboutTitle || '',
                    aboutSubtitle: settingsRes.aboutSubtitle || '',
                    aboutDescription1: settingsRes.aboutDescription1 || '',
                    aboutDescription2: settingsRes.aboutDescription2 || '',
                    aboutImage: settingsRes.aboutImage || '',
                    aboutFeature1: settingsRes.aboutFeature1 || '',
                    aboutFeature2: settingsRes.aboutFeature2 || '',
                    aboutFeature3: settingsRes.aboutFeature3 || '',
                    
                    homeStats: settingsRes.homeStats || [],
                    homeServicesBadge: settingsRes.homeServicesBadge || '',
                    homeServicesTitle: settingsRes.homeServicesTitle || '',
                    homeServicesDesc: settingsRes.homeServicesDesc || '',
                    homeProjectsBadge: settingsRes.homeProjectsBadge || '',
                    homeProjectsTitle: settingsRes.homeProjectsTitle || '',
                    homeAppTeaserBadge: settingsRes.homeAppTeaserBadge || '',
                    homeAppTeaserTitle: settingsRes.homeAppTeaserTitle || '',
                    homeAppTeaserDesc: settingsRes.homeAppTeaserDesc || '',
                    homeAppTeaserFeatures: settingsRes.homeAppTeaserFeatures || [],
                    homeCTATitle: settingsRes.homeCTATitle || '',
                    homeCTADesc: settingsRes.homeCTADesc || '',
                    homeCTABtnText: settingsRes.homeCTABtnText || '',
                    homeCTAAltBtnText: settingsRes.homeCTAAltBtnText || '',

                    aboutPageHeroTitle: settingsRes.aboutPageHeroTitle || '',
                    aboutPageHeroSubtitle: settingsRes.aboutPageHeroSubtitle || '',
                    aboutPageEstablishedText: settingsRes.aboutPageEstablishedText || '',
                    aboutPageMissionTitle: settingsRes.aboutPageMissionTitle || '',
                    aboutPageMissionDesc: settingsRes.aboutPageMissionDesc || '',
                    aboutPageVisionTitle: settingsRes.aboutPageVisionTitle || '',
                    aboutPageVisionDesc: settingsRes.aboutPageVisionDesc || '',
                    aboutPageCoreValuesTitle: settingsRes.aboutPageCoreValuesTitle || '',
                    aboutPageCoreValuesSubtitle: settingsRes.aboutPageCoreValuesSubtitle || '',
                    aboutPageCoreValues: settingsRes.aboutPageCoreValues || [],
                    aboutPageTeamTitle: settingsRes.aboutPageTeamTitle || '',
                    aboutPageTeamSubtitle: settingsRes.aboutPageTeamSubtitle || '',
                    aboutPageTeam: settingsRes.aboutPageTeam || [],
                    aboutPageCertificationsTitle: settingsRes.aboutPageCertificationsTitle || '',
                    aboutPageCertifications: settingsRes.aboutPageCertifications || [],

                    investmentsPageHeroTitle: settingsRes.investmentsPageHeroTitle || '',
                    investmentsPageHeroSubtitle: settingsRes.investmentsPageHeroSubtitle || '',
                    investmentsPageHeroBtnText: settingsRes.investmentsPageHeroBtnText || '',
                    investmentsPageLandBankingBadge: settingsRes.investmentsPageLandBankingBadge || '',
                    investmentsPageLandBankingTitle: settingsRes.investmentsPageLandBankingTitle || '',
                    investmentsPageLandBankingDesc: settingsRes.investmentsPageLandBankingDesc || '',
                    investmentsPageLandBankingBenefits: settingsRes.investmentsPageLandBankingBenefits || [],
                    investmentsPageLandBankingImage: settingsRes.investmentsPageLandBankingImage || '',
                    investmentsPageLandBankingBtnText: settingsRes.investmentsPageLandBankingBtnText || '',
                    investmentsPageDevBadge: settingsRes.investmentsPageDevBadge || '',
                    investmentsPageDevTitle: settingsRes.investmentsPageDevTitle || '',
                    investmentsPageDevDesc: settingsRes.investmentsPageDevDesc || '',
                    investmentsPageDevBenefits: settingsRes.investmentsPageDevBenefits || [],
                    investmentsPageDevImage: settingsRes.investmentsPageDevImage || '',
                    investmentsPageDevBtnText: settingsRes.investmentsPageDevBtnText || '',
                    investmentsPageAppreciationTitle: settingsRes.investmentsPageAppreciationTitle || '',
                    investmentsPageAppreciationNote: settingsRes.investmentsPageAppreciationNote || '',
                    investmentsPageAppreciationYears: settingsRes.investmentsPageAppreciationYears || [],
                    investmentsPageProcessTitle: settingsRes.investmentsPageProcessTitle || '',
                    investmentsPageProcessBtnText: settingsRes.investmentsPageProcessBtnText || '',
                    investmentsPageProcessSteps: settingsRes.investmentsPageProcessSteps || [],

                    contactPageHeroTitle: settingsRes.contactPageHeroTitle || '',
                    contactPageHeroSubtitle: settingsRes.contactPageHeroSubtitle || '',
                    contactPageOfficeHours: settingsRes.contactPageOfficeHours || '',
                    contactPageMapImage: settingsRes.contactPageMapImage || '',
                    contactPageMapLink: settingsRes.contactPageMapLink || '',

                    projectsPageHeroTitle: settingsRes.projectsPageHeroTitle || '',
                    projectsPageHeroSubtitle: settingsRes.projectsPageHeroSubtitle || '',

                    privacyPageTitle: settingsRes.privacyPageTitle || '',
                    privacyPageEffectiveDate: settingsRes.privacyPageEffectiveDate || '',
                    privacyPageContent: settingsRes.privacyPageContent || '',
                    termsPageTitle: settingsRes.termsPageTitle || '',
                    termsPageEffectiveDate: settingsRes.termsPageEffectiveDate || '',
                    termsPageContent: settingsRes.termsPageContent || ''
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load website content details');
        } finally {
            setLoading(false);
        }
    };

    // --- Image Upload Handler ---
    const handleImageUpload = async (e, targetPath) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        const toastId = toast.loading('Uploading image to Cloudinary...');
        try {
            const { data } = await api.post('/website/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (targetPath === 'hero') {
                setHeroForm(prev => ({ ...prev, image: data.url }));
            } else if (targetPath === 'project') {
                setProjectForm(prev => ({ ...prev, image: data.url }));
            } else if (targetPath === 'newTeamPhoto') {
                setNewTeam(prev => ({ ...prev, img: data.url }));
            } else {
                setSettings(prev => ({ ...prev, [targetPath]: data.url }));
            }
            
            toast.success('Image uploaded successfully!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploading(false);
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
            setProjectForm({ id: null, title: '', location: '', status: 'Selling Fast', image: '', category: 'Ongoing', description: '' });
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

    // --- Settings / Global Save ---
    const handleSettingsSubmit = async (e) => {
        if (e) e.preventDefault();
        const saveToast = toast.loading('Saving website content database...');
        try {
            const { data } = await api.put('/website/settings', settings);
            setSettings(data);
            toast.success('Website page settings successfully saved & published!', { id: saveToast });
        } catch (e) {
            console.error(e);
            toast.error('Failed to update website content details', { id: saveToast });
        }
    };

    // --- Inquiries Operations ---
    const updateInquiryStatus = async (id, status) => {
        try {
            const { data } = await api.patch(`/website/inquiries/${id}`, { status });
            setInquiries(inquiries.map(i => i._id === id ? data : i));
            toast.success(`Inquiry marked as ${status}`);
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    // --- Helper array update handlers ---
    const updateListItem = (field, index, value) => {
        const updatedList = [...settings[field]];
        updatedList[index] = value;
        setSettings({ ...settings, [field]: updatedList });
    };

    const addListItem = (field, defaultValue = '') => {
        setSettings({ ...settings, [field]: [...settings[field], defaultValue] });
    };

    const removeListItem = (field, index) => {
        const updatedList = settings[field].filter((_, idx) => idx !== index);
        setSettings({ ...settings, [field]: updatedList });
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-gray-400 font-semibold">Loading Website Page-by-Page Editor console...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-serif">
                        <Globe className="text-amber-500 animate-pulse" />
                        Website Content Editor
                    </h2>
                    <p className="text-gray-400 text-sm">Redesigned dashboard to control page-by-page website sections, texts, images, and variables.</p>
                </div>
                <button 
                    onClick={() => handleSettingsSubmit()}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/10 active:scale-95"
                >
                    <Save size={18} /> Publish Live Site Updates
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left sidebar nav */}
                <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-1.5 self-start">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-3 mb-2">Select Page/Layout</p>
                    {[
                        { id: 'global', name: 'Global Layout', icon: SettingsIcon, info: 'Marquee, Social, Header' },
                        { id: 'home', name: 'Homepage Content', icon: Globe, info: 'Sliders, Stats, Teaser, CTA' },
                        { id: 'about', name: 'About Us Page', icon: Users, info: 'Mission, Values, Team List' },
                        { id: 'investments', name: 'Investments Page', icon: Briefcase, info: 'Land, Duplexes, Steps' },
                        { id: 'contact', name: 'Contact Page', icon: PhoneCall, info: 'Hours, Map coordinates' },
                        { id: 'projects', name: 'Portfolio Page', icon: ImageIcon, info: 'Header title and items' },
                        { id: 'policies', name: 'Privacy & Terms', icon: ShieldCheck, info: 'Legal contents editor' },
                        { id: 'inquiries', name: 'Inquiries Logs', icon: Mail, info: `Client inquiries (${inquiries.filter(i => i.status === 'new').length})` }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all text-left ${
                                    isActive 
                                        ? 'bg-amber-600 text-white font-semibold shadow-md' 
                                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                                }`}
                            >
                                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                                <div className="leading-tight">
                                    <div className="text-sm font-bold">{tab.name}</div>
                                    <div className={`text-[10px] ${isActive ? 'text-orange-200' : 'text-gray-500'}`}>{tab.info}</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto opacity-50 shrink-0" />
                            </button>
                        );
                    })}
                </div>

                {/* Right content editor panel */}
                <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
                    
                    {/* 1. GLOBAL LAYOUT TAB */}
                    {activeTab === 'global' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                                    <SettingsIcon className="text-amber-500" size={20} />
                                    Global Layout, Header & Footer Settings
                                </h3>
                                <p className="text-xs text-gray-500 mb-6">These parameters apply globally to header components, marquee bars, and footer contacts.</p>
                            </div>

                            {/* Top Marquee Announcement */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Scrolling Top Announcement Marquee</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Announcement Bar Brand Name</label>
                                        <input type="text" value={settings.marqueeTitle} onChange={e => setSettings({...settings, marqueeTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Scrolling Slogan / Tagline Text</label>
                                        <input type="text" value={settings.marqueeTagline} onChange={e => setSettings({...settings, marqueeTagline: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Scrolling Support Email</label>
                                        <input type="email" value={settings.marqueeEmail} onChange={e => setSettings({...settings, marqueeEmail: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Scrolling Support Phone</label>
                                        <input type="text" value={settings.marqueePhone} onChange={e => setSettings({...settings, marqueePhone: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Footer & Support Contacts</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Office Address</label>
                                        <input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Contact Phone Numbers</label>
                                        <input type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Main Email Addresses</label>
                                        <input type="text" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">WhatsApp Direct Number (e.g., https://wa.me/234...)</label>
                                        <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Social Handles */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Social Media Handles</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Instagram Link</label>
                                        <input type="text" value={settings.instagram} onChange={e => setSettings({...settings, instagram: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">LinkedIn Link</label>
                                        <input type="text" value={settings.linkedin} onChange={e => setSettings({...settings, linkedin: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Twitter / X Link</label>
                                        <input type="text" value={settings.twitter} onChange={e => setSettings({...settings, twitter: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Facebook Link</label>
                                        <input type="text" value={settings.facebook} onChange={e => setSettings({...settings, facebook: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 text-white outline-none text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. HOMEPAGE TAB */}
                    {activeTab === 'home' && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                                <Globe className="text-amber-500" size={20} />
                                Homepage Content Editor
                            </h3>

                            {/* Hero carousel list */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">1. Slider Carousel Frames</h4>
                                    <button onClick={() => { setHeroForm({ id: null, title: '', subtitle: '', image: '' }); setShowModal('hero'); }} className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all text-xs">
                                        <Plus size={14} /> Add Frame
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {heroSlides.map((slide) => (
                                        <div key={slide._id} className="bg-gray-900 border border-gray-850 rounded-xl overflow-hidden shadow-sm relative flex flex-col justify-between">
                                            <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url('${slide.image}')` }} />
                                            <div className="p-3">
                                                <h5 className="font-bold text-sm text-white truncate">{slide.title}</h5>
                                                <p className="text-gray-400 text-[11px] truncate mt-0.5">{slide.subtitle}</p>
                                            </div>
                                            <div className="p-3 border-t border-gray-850 flex justify-end gap-1.5 bg-gray-950/20">
                                                <button onClick={() => { setHeroForm({ id: slide._id, title: slide.title, subtitle: slide.subtitle, image: slide.image }); setShowModal('hero'); }} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-gray-850 rounded">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => deleteHeroSlide(slide._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-850 rounded">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trust strip statistics */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-6">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">2. Trust Strip Statistics (Stats Strip)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {settings.homeStats.map((stat, idx) => (
                                        <div key={idx} className="bg-gray-900 border border-gray-800 p-4 rounded-xl relative space-y-2">
                                            <button 
                                                type="button" 
                                                onClick={() => removeListItem('homeStats', idx)}
                                                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash size={14} />
                                            </button>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Label</label>
                                                <input 
                                                    type="text" 
                                                    value={stat.label} 
                                                    onChange={e => {
                                                        const updated = [...settings.homeStats];
                                                        updated[idx] = { ...stat, label: e.target.value };
                                                        setSettings({ ...settings, homeStats: updated });
                                                    }}
                                                    className="w-full bg-gray-950 border border-gray-855 rounded-lg px-2.5 py-1 text-xs text-white outline-none" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Value</label>
                                                <input 
                                                    type="text" 
                                                    value={stat.value} 
                                                    onChange={e => {
                                                        const updated = [...settings.homeStats];
                                                        updated[idx] = { ...stat, value: e.target.value };
                                                        setSettings({ ...settings, homeStats: updated });
                                                    }}
                                                    className="w-full bg-gray-950 border border-gray-855 rounded-lg px-2.5 py-1 text-xs text-white outline-none" 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setSettings({ ...settings, homeStats: [...settings.homeStats, { label: 'New Stat', value: '100+' }] })}
                                    className="text-xs bg-gray-850 border border-gray-800 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-bold"
                                >
                                    <Plus size={12} /> Add Statistic Card
                                </button>
                            </div>

                            {/* Who We Are Snippet */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">3. Homepage About Us Snippet</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Badge Text</label>
                                        <input type="text" value={settings.aboutSubtitle} onChange={e => setSettings({...settings, aboutSubtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Title Text (Use \n for newlines)</label>
                                        <input type="text" value={settings.aboutTitle} onChange={e => setSettings({...settings, aboutTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Paragraph 1 Description</label>
                                        <textarea value={settings.aboutDescription1} onChange={e => setSettings({...settings, aboutDescription1: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Paragraph 2 Description</label>
                                        <textarea value={settings.aboutDescription2} onChange={e => setSettings({...settings, aboutDescription2: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Highlight Image Upload</label>
                                        <div className="flex gap-3 items-center">
                                            <input type="text" value={settings.aboutImage} onChange={e => setSettings({...settings, aboutImage: e.target.value})} className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                            <label className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors shrink-0">
                                                {uploading ? 'Uploading...' : 'Upload File'}
                                                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'aboutImage')} disabled={uploading} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Feature Tag 1</label>
                                        <input type="text" value={settings.aboutFeature1} onChange={e => setSettings({...settings, aboutFeature1: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Feature Tag 2</label>
                                        <input type="text" value={settings.aboutFeature2} onChange={e => setSettings({...settings, aboutFeature2: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Feature Tag 3</label>
                                        <input type="text" value={settings.aboutFeature3} onChange={e => setSettings({...settings, aboutFeature3: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Wealth Creation Headers */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">4. Homepage Services Intro Text</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2">Badge Text</label>
                                            <input type="text" value={settings.homeServicesBadge} onChange={e => setSettings({...settings, homeServicesBadge: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2">Title Text</label>
                                            <input type="text" value={settings.homeServicesTitle} onChange={e => setSettings({...settings, homeServicesTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Description Ticker</label>
                                        <textarea value={settings.homeServicesDesc} onChange={e => setSettings({...settings, homeServicesDesc: e.target.value})} rows={2} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                    <div className="border-t border-gray-855 pt-4 flex justify-between items-center">
                                        <h5 className="text-xs font-bold text-gray-400">Available services items list</h5>
                                        <button onClick={() => { setServiceForm({ id: null, title: '', description: '', icon: 'LandPlot', href: '' }); setShowModal('service'); }} className="bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 transition-all text-xs font-bold flex items-center gap-1">
                                            <Plus size={12} /> Add Service
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {services.map((svc) => (
                                            <div key={svc._id} className="bg-gray-900 border border-gray-850 p-3 rounded-lg flex justify-between items-start">
                                                <div>
                                                    <h6 className="font-bold text-white text-xs">{svc.title}</h6>
                                                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{svc.description}</p>
                                                    <p className="text-[10px] text-amber-500 font-mono mt-1">Icon: {svc.icon}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => { setServiceForm({ id: svc._id, title: svc.title, description: svc.description, icon: svc.icon, href: svc.href || '' }); setShowModal('service'); }} className="p-1 text-gray-400 hover:text-amber-500 rounded">
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button onClick={() => deleteService(svc._id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* App Teaser Area */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">5. Mobile App Teaser Section</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Badge Text</label>
                                        <input type="text" value={settings.homeAppTeaserBadge} onChange={e => setSettings({...settings, homeAppTeaserBadge: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Title Text</label>
                                        <input type="text" value={settings.homeAppTeaserTitle} onChange={e => setSettings({...settings, homeAppTeaserTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-405 mb-2">App Description</label>
                                        <textarea value={settings.homeAppTeaserDesc} onChange={e => setSettings({...settings, homeAppTeaserDesc: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="block text-xs font-bold text-gray-450">Circular App Features (Repeating Array)</label>
                                        <div className="space-y-2">
                                            {settings.homeAppTeaserFeatures.map((feat, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={feat} 
                                                        onChange={e => updateListItem('homeAppTeaserFeatures', idx, e.target.value)}
                                                        className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none" 
                                                    />
                                                    <button type="button" onClick={() => removeListItem('homeAppTeaserFeatures', idx)} className="text-gray-500 hover:text-red-500 p-1.5"><Trash size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addListItem('homeAppTeaserFeatures', 'New app feature item')} className="text-xs text-amber-500 font-bold flex items-center gap-1"><Plus size={12} /> Add Feature Line</button>
                                    </div>
                                </div>
                            </div>

                            {/* Call to Action Banner */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">6. Call to Action Banner</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">CTA Slogan Header</label>
                                        <input type="text" value={settings.homeCTATitle} onChange={e => setSettings({...settings, homeCTATitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">CTA Body Paragraph</label>
                                        <textarea value={settings.homeCTADesc} onChange={e => setSettings({...settings, homeCTADesc: e.target.value})} rows={2} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Main Button Text</label>
                                        <input type="text" value={settings.homeCTABtnText} onChange={e => setSettings({...settings, homeCTABtnText: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Alternative Action Button Text</label>
                                        <input type="text" value={settings.homeCTAAltBtnText} onChange={e => setSettings({...settings, homeCTAAltBtnText: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. ABOUT US TAB */}
                    {activeTab === 'about' && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                                <Users className="text-amber-500" size={20} />
                                About Us Page Editor
                            </h3>

                            {/* About Hero Info */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Hero Intro Banner</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Established Text Badge</label>
                                        <input type="text" value={settings.aboutPageEstablishedText} onChange={e => setSettings({...settings, aboutPageEstablishedText: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Hero Main Title (Use \n for newlines)</label>
                                        <input type="text" value={settings.aboutPageHeroTitle} onChange={e => setSettings({...settings, aboutPageHeroTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Hero Subtitle / Mission Statement</label>
                                        <textarea value={settings.aboutPageHeroSubtitle} onChange={e => setSettings({...settings, aboutPageHeroSubtitle: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Mission & Vision */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Mission & Vision Definitions</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-850 space-y-2">
                                        <h5 className="text-xs font-bold text-white uppercase">Corporate Mission</h5>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Title</label>
                                                <input type="text" value={settings.aboutPageMissionTitle} onChange={e => setSettings({...settings, aboutPageMissionTitle: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Description Statement</label>
                                                <textarea value={settings.aboutPageMissionDesc} onChange={e => setSettings({...settings, aboutPageMissionDesc: e.target.value})} rows={2} className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs text-white resize-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-855 space-y-2">
                                        <h5 className="text-xs font-bold text-white uppercase">Corporate Vision</h5>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Title</label>
                                                <input type="text" value={settings.aboutPageVisionTitle} onChange={e => setSettings({...settings, aboutPageVisionTitle: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Description Statement</label>
                                                <textarea value={settings.aboutPageVisionDesc} onChange={e => setSettings({...settings, aboutPageVisionDesc: e.target.value})} rows={2} className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs text-white resize-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Core Values Repeater */}
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Our DNA (Core Values Cards)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Section Main Title</label>
                                        <input type="text" value={settings.aboutPageCoreValuesTitle} onChange={e => setSettings({...settings, aboutPageCoreValuesTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Section Tagline Description</label>
                                        <input type="text" value={settings.aboutPageCoreValuesSubtitle} onChange={e => setSettings({...settings, aboutPageCoreValuesSubtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-850">
                                    {settings.aboutPageCoreValues.map((val, idx) => (
                                        <div key={idx} className="bg-gray-900 p-4 rounded-xl relative space-y-2 border border-gray-850">
                                            <button type="button" onClick={() => removeListItem('aboutPageCoreValues', idx)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500"><Trash size={14} /></button>
                                            <span className="text-xs bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full inline-block mb-1">{val.iconName}</span>
                                            <div>
                                                <label className="block text-[10px] text-gray-505 uppercase font-bold mb-1">Value Title</label>
                                                <input type="text" value={val.title} onChange={e => {
                                                    const updated = [...settings.aboutPageCoreValues];
                                                    updated[idx] = { ...val, title: e.target.value };
                                                    setSettings({ ...settings, aboutPageCoreValues: updated });
                                                }} className="w-full bg-gray-955 border border-gray-800 rounded px-2 py-1 text-xs text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-505 uppercase font-bold mb-1">Value Description</label>
                                                <textarea value={val.desc} onChange={e => {
                                                    const updated = [...settings.aboutPageCoreValues];
                                                    updated[idx] = { ...val, desc: e.target.value };
                                                    setSettings({ ...settings, aboutPageCoreValues: updated });
                                                }} rows={3} className="w-full bg-gray-955 border border-gray-800 rounded px-2 py-1 text-xs text-white resize-none" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-900/50 p-4 rounded-xl border border-dashed border-gray-800 flex flex-wrap items-end gap-4">
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Add title</label>
                                        <input type="text" placeholder="e.g. Innovation" value={newVal.title} onChange={e => setNewVal({...newVal, title: e.target.value})} className="w-full bg-gray-950 border border-gray-850 rounded px-2.5 py-1 text-xs text-white" />
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Add details</label>
                                        <input type="text" placeholder="We push modern limits..." value={newVal.desc} onChange={e => setNewVal({...newVal, desc: e.target.value})} className="w-full bg-gray-955 border border-gray-850 rounded px-2.5 py-1 text-xs text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Icon Type</label>
                                        <select value={newVal.iconName} onChange={e => setNewVal({...newVal, iconName: e.target.value})} className="bg-gray-950 border border-gray-850 rounded px-2.5 py-1 text-xs text-white">
                                            <option value="CheckCircle">CheckCircle (Integrity)</option>
                                            <option value="Award">Award (Excellence)</option>
                                            <option value="Users">Users (Client First)</option>
                                            <option value="Target">Target (Innovation)</option>
                                        </select>
                                    </div>
                                    <button type="button" onClick={() => {
                                        if (!newVal.title || !newVal.desc) return toast.error('Please fill Core Value Title and Description');
                                        setSettings({ ...settings, aboutPageCoreValues: [...settings.aboutPageCoreValues, newVal] });
                                        setNewVal({ title: '', desc: '', iconName: 'CheckCircle' });
                                        toast.success('Core value item added to staging!');
                                    }} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg"><Plus size={12} className="inline mr-1" /> Add Card</button>
                                </div>
                            </div>

                            {/* Leadership Team Repeater */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Leadership Team (Meet The Minds)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Section Category Header</label>
                                        <input type="text" value={settings.aboutPageTeamSubtitle} onChange={e => setSettings({...settings, aboutPageTeamSubtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Section Title Header</label>
                                        <input type="text" value={settings.aboutPageTeamTitle} onChange={e => setSettings({...settings, aboutPageTeamTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-850">
                                    {settings.aboutPageTeam.map((member, idx) => (
                                        <div key={idx} className="bg-gray-900 p-4 rounded-xl relative space-y-3 border border-gray-855">
                                            <button type="button" onClick={() => removeListItem('aboutPageTeam', idx)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500"><Trash size={14} /></button>
                                            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-gray-950 border border-gray-800">
                                                <img src={member.img} className="w-full h-full object-cover" alt={member.name} />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] text-gray-500 font-bold mb-1">Name</label>
                                                <input type="text" value={member.name} onChange={e => {
                                                    const updated = [...settings.aboutPageTeam];
                                                    updated[idx] = { ...member, name: e.target.value };
                                                    setSettings({ ...settings, aboutPageTeam: updated });
                                                }} className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-0.5 text-xs text-white text-center font-bold" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] text-gray-500 font-bold mb-1">Role</label>
                                                <input type="text" value={member.role} onChange={e => {
                                                    const updated = [...settings.aboutPageTeam];
                                                    updated[idx] = { ...member, role: e.target.value };
                                                    setSettings({ ...settings, aboutPageTeam: updated });
                                                }} className="w-full bg-gray-955 border border-gray-800 rounded px-2 py-0.5 text-xs text-amber-500 text-center font-mono" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-900/50 p-4 rounded-xl border border-dashed border-gray-800 space-y-4">
                                    <h5 className="text-xs font-bold text-gray-300">Add New Leader</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Full Name</label>
                                            <input type="text" placeholder="John Doe" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} className="w-full bg-gray-955 border border-gray-855 rounded px-2.5 py-1 text-xs text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Role / Position</label>
                                            <input type="text" placeholder="General Counsel" value={newTeam.role} onChange={e => setNewTeam({...newTeam, role: e.target.value})} className="w-full bg-gray-955 border border-gray-855 rounded px-2.5 py-1 text-xs text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Upload Photo</label>
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Image URL" value={newTeam.img} onChange={e => setNewTeam({...newTeam, img: e.target.value})} className="flex-1 bg-gray-955 border border-gray-855 rounded px-2 py-1 text-xs text-white" />
                                                <label className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] px-2 py-1.5 rounded cursor-pointer transition-colors shrink-0">
                                                    {uploading ? '...' : 'Upload'}
                                                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'newTeamPhoto')} disabled={uploading} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => {
                                        if (!newTeam.name || !newTeam.role || !newTeam.img) return toast.error('Please fill Name, Role, and Image URL/upload photo');
                                        setSettings({ ...settings, aboutPageTeam: [...settings.aboutPageTeam, newTeam] });
                                        setNewTeam({ name: '', role: '', img: '' });
                                        toast.success('Leader profile added to list!');
                                    }} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg"><Plus size={12} className="inline mr-1" /> Add Team Member</button>
                                </div>
                            </div>

                            {/* Trust Registrations Certs */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Certified & Registered With (Footer strip)</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Section Category Title</label>
                                        <input type="text" value={settings.aboutPageCertificationsTitle} onChange={e => setSettings({...settings, aboutPageCertificationsTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-gray-400">Verifiable Badges List</label>
                                        <div className="space-y-2">
                                            {settings.aboutPageCertifications.map((cert, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={cert} 
                                                        onChange={e => updateListItem('aboutPageCertifications', idx, e.target.value)}
                                                        className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none" 
                                                    />
                                                    <button type="button" onClick={() => removeListItem('aboutPageCertifications', idx)} className="text-gray-500 hover:text-red-500 p-1.5"><Trash size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addListItem('aboutPageCertifications', 'New Registration Badge')} className="text-xs text-amber-500 font-bold flex items-center gap-1"><Plus size={12} /> Add Registration Detail</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. INVESTMENTS PAGE TAB */}
                    {activeTab === 'investments' && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                                <Briefcase className="text-amber-500" size={20} />
                                Investments Page Editor
                            </h3>

                            {/* Investment Hero Banner */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Hero Intro Banner</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Hero Main Title (Use \n for newlines)</label>
                                        <input type="text" value={settings.investmentsPageHeroTitle} onChange={e => setSettings({...settings, investmentsPageHeroTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Button Action Text</label>
                                        <input type="text" value={settings.investmentsPageHeroBtnText} onChange={e => setSettings({...settings, investmentsPageHeroBtnText: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Hero Description text</label>
                                        <textarea value={settings.investmentsPageHeroSubtitle} onChange={e => setSettings({...settings, investmentsPageHeroSubtitle: e.target.value})} rows={2} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Land Banking Section */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Land Banking Strategy</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Badge text</label>
                                        <input type="text" value={settings.investmentsPageLandBankingBadge} onChange={e => setSettings({...settings, investmentsPageLandBankingBadge: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Strategy Title</label>
                                        <input type="text" value={settings.investmentsPageLandBankingTitle} onChange={e => setSettings({...settings, investmentsPageLandBankingTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Strategy Description</label>
                                        <textarea value={settings.investmentsPageLandBankingDesc} onChange={e => setSettings({...settings, investmentsPageLandBankingDesc: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Strategy Cover Image Link</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={settings.investmentsPageLandBankingImage} onChange={e => setSettings({...settings, investmentsPageLandBankingImage: e.target.value})} className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                            <label className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-2 rounded-xl cursor-pointer transition-colors shrink-0">
                                                {uploading ? '...' : 'Upload'}
                                                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'investmentsPageLandBankingImage')} disabled={uploading} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Action Button text</label>
                                        <input type="text" value={settings.investmentsPageLandBankingBtnText} onChange={e => setSettings({...settings, investmentsPageLandBankingBtnText: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="block text-xs font-bold text-gray-455">Land Banking Benefits List</label>
                                        <div className="space-y-2">
                                            {settings.investmentsPageLandBankingBenefits.map((b, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={b} 
                                                        onChange={e => updateListItem('investmentsPageLandBankingBenefits', idx, e.target.value)}
                                                        className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none" 
                                                    />
                                                    <button type="button" onClick={() => removeListItem('investmentsPageLandBankingBenefits', idx)} className="text-gray-500 hover:text-red-500 p-1.5"><Trash size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addListItem('investmentsPageLandBankingBenefits', 'New Land benefit point')} className="text-xs text-amber-500 font-bold flex items-center gap-1"><Plus size={12} /> Add benefit point</button>
                                    </div>
                                </div>
                            </div>

                            {/* Property Development Section */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Property Development Strategy</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Badge text</label>
                                        <input type="text" value={settings.investmentsPageDevBadge} onChange={e => setSettings({...settings, investmentsPageDevBadge: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Strategy Title</label>
                                        <input type="text" value={settings.investmentsPageDevTitle} onChange={e => setSettings({...settings, investmentsPageDevTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Strategy Description</label>
                                        <textarea value={settings.investmentsPageDevDesc} onChange={e => setSettings({...settings, investmentsPageDevDesc: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Strategy Cover Image Link</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={settings.investmentsPageDevImage} onChange={e => setSettings({...settings, investmentsPageDevImage: e.target.value})} className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                            <label className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-2 rounded-xl cursor-pointer transition-colors shrink-0">
                                                {uploading ? '...' : 'Upload'}
                                                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'investmentsPageDevImage')} disabled={uploading} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Action Button text</label>
                                        <input type="text" value={settings.investmentsPageDevBtnText} onChange={e => setSettings({...settings, investmentsPageDevBtnText: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="block text-xs font-bold text-gray-455">Development Benefits List</label>
                                        <div className="space-y-2">
                                            {settings.investmentsPageDevBenefits.map((b, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={b} 
                                                        onChange={e => updateListItem('investmentsPageDevBenefits', idx, e.target.value)}
                                                        className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none" 
                                                    />
                                                    <button type="button" onClick={() => removeListItem('investmentsPageDevBenefits', idx)} className="text-gray-500 hover:text-red-500 p-1.5"><Trash size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addListItem('investmentsPageDevBenefits', 'New Dev benefit point')} className="text-xs text-amber-500 font-bold flex items-center gap-1"><Plus size={12} /> Add benefit point</button>
                                    </div>
                                </div>
                            </div>

                            {/* Capital Appreciation Projections */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Power of Appreciation Estimates</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Appreciation Banner Slogan</label>
                                        <input type="text" value={settings.investmentsPageAppreciationTitle} onChange={e => setSettings({...settings, investmentsPageAppreciationTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Appreciation Footnote (* note)</label>
                                        <input type="text" value={settings.investmentsPageAppreciationNote} onChange={e => setSettings({...settings, investmentsPageAppreciationNote: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-855">
                                    {settings.investmentsPageAppreciationYears.map((ay, idx) => (
                                        <div key={idx} className="bg-gray-900 p-4 rounded-xl border border-gray-855 space-y-2">
                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-bold mb-1">Year Period</label>
                                                <input type="text" value={ay.year} onChange={e => {
                                                    const updated = [...settings.investmentsPageAppreciationYears];
                                                    updated[idx] = { ...ay, year: e.target.value };
                                                    setSettings({ ...settings, investmentsPageAppreciationYears: updated });
                                                }} className="w-full bg-gray-955 border border-gray-800 rounded px-2.5 py-1 text-xs text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-505 font-bold mb-1">Yield Growth Slogan</label>
                                                <input type="text" value={ay.growth} onChange={e => {
                                                    const updated = [...settings.investmentsPageAppreciationYears];
                                                    updated[idx] = { ...ay, growth: e.target.value };
                                                    setSettings({ ...settings, investmentsPageAppreciationYears: updated });
                                                }} className="w-full bg-gray-955 border border-gray-800 rounded px-2.5 py-1 text-xs text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-550 font-bold mb-1">Progress Bar Filled % (0 - 100)</label>
                                                <input type="number" min="0" max="100" value={ay.percentage || 0} onChange={e => {
                                                    const updated = [...settings.investmentsPageAppreciationYears];
                                                    updated[idx] = { ...ay, percentage: parseInt(e.target.value) || 0 };
                                                    setSettings({ ...settings, investmentsPageAppreciationYears: updated });
                                                }} className="w-full bg-gray-955 border border-gray-800 rounded px-2.5 py-1 text-xs text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Investment process steps */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Investment Walkthrough Steps</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Process section title</label>
                                        <input type="text" value={settings.investmentsPageProcessTitle} onChange={e => setSettings({...settings, investmentsPageProcessTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Walkthrough CTA Action Button</label>
                                        <input type="text" value={settings.investmentsPageProcessBtnText} onChange={e => setSettings({...settings, investmentsPageProcessBtnText: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-855">
                                    {settings.investmentsPageProcessSteps.map((step, idx) => (
                                        <div key={idx} className="bg-gray-900 p-4 rounded-xl border border-gray-855 space-y-2">
                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-bold mb-1">Step Number</label>
                                                <input type="text" value={step.step} onChange={e => {
                                                    const updated = [...settings.investmentsPageProcessSteps];
                                                    updated[idx] = { ...step, step: e.target.value };
                                                    setSettings({ ...settings, investmentsPageProcessSteps: updated });
                                                }} className="w-full bg-gray-955 border border-gray-800 rounded px-2.5 py-1 text-xs text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-550 font-bold mb-1">Step Slogan/Title</label>
                                                <input type="text" value={step.title} onChange={e => {
                                                    const updated = [...settings.investmentsPageProcessSteps];
                                                    updated[idx] = { ...step, title: e.target.value };
                                                    setSettings({ ...settings, investmentsPageProcessSteps: updated });
                                                }} className="w-full bg-gray-955 border border-gray-800 rounded px-2.5 py-1 text-xs text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. CONTACT PAGE TAB */}
                    {activeTab === 'contact' && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                                <PhoneCall className="text-amber-500" size={20} />
                                Contact Us Page Editor
                            </h3>

                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Contact page layout texts</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Hero Main Title Header</label>
                                        <input type="text" value={settings.contactPageHeroTitle} onChange={e => setSettings({...settings, contactPageHeroTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Hero Subtitle Header</label>
                                        <input type="text" value={settings.contactPageHeroSubtitle} onChange={e => setSettings({...settings, contactPageHeroSubtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Office opening hours (supports newlines)</label>
                                        <textarea value={settings.contactPageOfficeHours} onChange={e => setSettings({...settings, contactPageOfficeHours: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Office Map Screenshot / Location Image</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={settings.contactPageMapImage} onChange={e => setSettings({...settings, contactPageMapImage: e.target.value})} className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                            <label className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-2 rounded-xl cursor-pointer transition-colors shrink-0">
                                                {uploading ? '...' : 'Upload'}
                                                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'contactPageMapImage')} disabled={uploading} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Google Maps Embed Link / Address URL</label>
                                        <input type="text" value={settings.contactPageMapLink} onChange={e => setSettings({...settings, contactPageMapLink: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                                <ImageIcon className="text-amber-500" size={20} />
                                Portfolio / Projects Page Editor
                            </h3>

                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Portfolio Header</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Main Portfolio Title</label>
                                        <input type="text" value={settings.projectsPageHeroTitle} onChange={e => setSettings({...settings, projectsPageHeroTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Portfolio Subtitle</label>
                                        <input type="text" value={settings.projectsPageHeroSubtitle} onChange={e => setSettings({...settings, projectsPageHeroSubtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    
                                    <div className="border-t border-gray-855 pt-4 flex justify-between items-center">
                                        <h5 className="text-xs font-bold text-gray-450">Available Developments (Estates list)</h5>
                                        <button onClick={() => { setProjectForm({ id: null, title: '', location: '', status: 'Selling Fast', image: '', category: 'Ongoing', description: '' }); setShowModal('project'); }} className="bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 transition-all text-xs font-bold flex items-center gap-1">
                                            <Plus size={12} /> Add Project
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {projects.map((proj) => (
                                            <div key={proj._id} className="bg-gray-900 border border-gray-850 rounded-xl overflow-hidden flex flex-col justify-between">
                                                <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url('${proj.image}')` }} />
                                                <div className="p-3">
                                                    <h6 className="font-bold text-white text-xs">{proj.title}</h6>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{proj.location}</p>
                                                    <p className="text-[10px] text-amber-500 mt-1 font-mono uppercase">Category: {proj.category} | Status: {proj.status}</p>
                                                </div>
                                                <div className="p-2 border-t border-gray-850 flex justify-end gap-1 bg-gray-955/20">
                                                    <button onClick={() => { setProjectForm({ id: proj._id, title: proj.title, location: proj.location, status: proj.status, image: proj.image, category: proj.category || 'Ongoing', description: proj.description || '' }); setShowModal('project'); }} className="p-1 text-gray-400 hover:text-amber-500 rounded">
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button onClick={() => deleteProject(proj._id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 7. POLICIES TAB */}
                    {activeTab === 'policies' && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                                <ShieldCheck className="text-amber-500" size={20} />
                                Policies & Legal Pages
                            </h3>

                            {/* Privacy Policy Editor */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Privacy Policy Page Content</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Page Main Title</label>
                                        <input type="text" value={settings.privacyPageTitle} onChange={e => setSettings({...settings, privacyPageTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Effective Date Label</label>
                                        <input type="text" value={settings.privacyPageEffectiveDate} onChange={e => setSettings({...settings, privacyPageEffectiveDate: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Body Content (Supports headings and double linebreaks)</label>
                                        <textarea value={settings.privacyPageContent} onChange={e => setSettings({...settings, privacyPageContent: e.target.value})} rows={12} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs text-gray-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Terms of Service Editor */}
                            <div className="bg-gray-955 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Terms of Service Page Content</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Page Main Title</label>
                                        <input type="text" value={settings.termsPageTitle} onChange={e => setSettings({...settings, termsPageTitle: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Effective Date Label</label>
                                        <input type="text" value={settings.termsPageEffectiveDate} onChange={e => setSettings({...settings, termsPageEffectiveDate: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Body Content (Supports headings and double linebreaks)</label>
                                        <textarea value={settings.termsPageContent} onChange={e => setSettings({...settings, termsPageContent: e.target.value})} rows={12} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 8. INQUIRIES LOGS TAB */}
                    {activeTab === 'inquiries' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                                <Mail className="text-amber-500" size={20} />
                                Customer Contact Form Inquiries
                            </h3>
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
                                                <span className="text-gray-450 text-xs font-mono">{inq.email}</span>
                                                {inq.phone && <span className="text-gray-455 text-xs font-mono">{inq.phone}</span>}
                                            </div>
                                            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Interest: {inq.interest}</p>
                                            <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-855 mt-2 max-w-3xl leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                                            <p className="text-[10px] text-gray-505">{new Date(inq.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                                            {inq.status === 'new' && (
                                                <button onClick={() => updateInquiryStatus(inq._id, 'read')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-600/20 text-emerald-500 text-xs font-bold rounded-lg transition-colors">
                                                    <CheckCircle2 size={14} /> Mark Read
                                                </button>
                                            )}
                                            {inq.status !== 'archived' && (
                                                <button onClick={() => updateInquiryStatus(inq._id, 'archived')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-855 hover:bg-gray-800 border border-gray-800 text-gray-450 text-xs font-bold rounded-lg transition-colors">
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
            </div>

            {/* MODALS FOR HOMEPAGE / PROJECTS / SERVICES ADDITIONS */}
            {showModal === 'hero' && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleHeroSubmit} className="bg-gray-900 border border-gray-850 p-6 rounded-2xl w-full max-w-lg space-y-4 text-white">
                        <h3 className="text-lg font-bold">{heroForm.id ? 'Edit Carousel Slide Frame' : 'Create Carousel Slide Frame'}</h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Slide Main Title</label>
                            <input type="text" value={heroForm.title} onChange={e => setHeroForm({...heroForm, title: e.target.value})} required className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Slide Subtitle / Description</label>
                            <input type="text" value={heroForm.subtitle} onChange={e => setHeroForm({...heroForm, subtitle: e.target.value})} required className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Slide Image URL</label>
                            <div className="flex gap-3 items-center">
                                <input type="text" value={heroForm.image} onChange={e => setHeroForm({...heroForm, image: e.target.value})} required className="flex-1 bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="https://example.com/image.jpg" />
                                <label className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-3 rounded-xl cursor-pointer transition-colors shrink-0">
                                    {uploading ? '...' : 'Upload'}
                                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'hero')} disabled={uploading} className="hidden" />
                                </label>
                            </div>
                            {heroForm.image && (
                                <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-850 h-28 w-full">
                                    <img src={heroForm.image} className="w-full h-full object-cover" alt="Preview" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 bg-gray-850 hover:bg-gray-800 rounded-xl text-gray-300 font-bold transition-all text-xs">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-bold transition-all text-xs">Save Frame</button>
                        </div>
                    </form>
                </div>
            )}

            {showModal === 'service' && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleServiceSubmit} className="bg-gray-900 border border-gray-855 p-6 rounded-2xl w-full max-w-lg space-y-4 text-white">
                        <h3 className="text-lg font-bold">{serviceForm.id ? 'Edit Service Details' : 'Create Service Details'}</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Service Title</label>
                            <input type="text" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} required className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Service Description</label>
                            <textarea value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} required rows={3} className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Lucide Icon Name (e.g. LandPlot, Building2, Briefcase, Smartphone)</label>
                            <input type="text" value={serviceForm.icon} onChange={e => setServiceForm({...serviceForm, icon: e.target.value})} required className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Redirect Href Link (Optional)</label>
                            <input type="text" value={serviceForm.href} onChange={e => setServiceForm({...serviceForm, href: e.target.value})} className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 bg-gray-850 hover:bg-gray-800 rounded-xl text-gray-300 font-bold transition-all text-xs">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-bold transition-all text-xs">Save Service</button>
                        </div>
                    </form>
                </div>
            )}

            {showModal === 'project' && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleProjectSubmit} className="bg-gray-900 border border-gray-855 p-6 rounded-2xl w-full max-w-lg space-y-4 text-white">
                        <h3 className="text-lg font-bold">{projectForm.id ? 'Edit Development Project' : 'Create Development Project'}</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Project Name</label>
                                <input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Development Location</label>
                                <input type="text" value={projectForm.location} onChange={e => setProjectForm({...projectForm, location: e.target.value})} required className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Selling Status</label>
                                <select value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})} className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-white text-sm">
                                    <option value="Selling Fast">Selling Fast</option>
                                    <option value="Sold Out">Sold Out</option>
                                    <option value="Launching Soon">Launching Soon</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Category Filter</label>
                                <select value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})} className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-white text-sm">
                                    <option value="Completed">Completed</option>
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Future">Future</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Detailed description text</label>
                            <textarea value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} rows={3} className="w-full bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Project Image URL</label>
                            <div className="flex gap-3 items-center">
                                <input type="text" value={projectForm.image} onChange={e => setProjectForm({...projectForm, image: e.target.value})} required className="flex-1 bg-gray-955 border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                                <label className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-3 rounded-xl cursor-pointer transition-colors shrink-0">
                                    {uploading ? '...' : 'Upload'}
                                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'project')} disabled={uploading} className="hidden" />
                                </label>
                            </div>
                            {projectForm.image && (
                                <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-855 h-28 w-full">
                                    <img src={projectForm.image} className="w-full h-full object-cover" alt="Preview" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 bg-gray-855 hover:bg-gray-800 rounded-xl text-gray-300 font-bold transition-all text-xs">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-bold transition-all text-xs">Save Project</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
