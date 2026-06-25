"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [header, setHeader] = useState({
        projectsPageHeroTitle: "",
        projectsPageHeroSubtitle: ""
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data } = await api.get('/website/projects');
                if (data) {
                    setProjects(data);
                }
            } catch (error) {
                console.error("Failed to fetch website projects:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) {
                    setHeader({
                        projectsPageHeroTitle: data.projectsPageHeroTitle || "",
                        projectsPageHeroSubtitle: data.projectsPageHeroSubtitle || ""
                    });
                }
            } catch (e) {
                // Fail silently
            }
        };

        fetchProjects();
        fetchSettings();
    }, []);

    const filteredProjects = filter === "All"
        ? projects
        : projects.filter(p => p.category === filter);

    return (
        <div className="bg-white min-h-screen">
            {/* Simple Header */}
            <div className="bg-gray-50 py-16 text-center border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">{header.projectsPageHeroTitle}</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        {header.projectsPageHeroSubtitle}
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="container mx-auto px-4 py-8 flex flex-wrap justify-center gap-4">
                {["All", "Completed", "Ongoing", "Future"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${filter === cat
                            ? "bg-primary text-white border-primary shadow-md"
                            : "bg-white text-gray-500 border-gray-200 hover:border-primary/50 hover:text-primary"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Projects Grid */}
            <SectionWrapper className="pt-8 pb-24">
                {loading ? (
                    <div className="text-center py-20">Loading our developments...</div>
                ) : filteredProjects.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project) => (
                            <div key={project._id} className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white flex flex-col h-full">
                                {/* Image */}
                                <div className="relative h-64 overflow-hidden bg-gray-200">
                                    <div
                                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${project.image}')` }}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-black shadow-sm">
                                        {project.category}
                                    </div>
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
                                        project.status === "Sold Out" ? "bg-red-600" : "bg-green-600"
                                    }`}>
                                        {project.status}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 font-medium flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary/40" /> {project.location}
                                    </p>
                                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                                        {project.description}
                                    </p>
                                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors" asChild>
                                        <Link href={`/contact?project=${encodeURIComponent(project.title)}`}>
                                            Request Info <ArrowUpRight className="ml-2 w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-xl text-gray-500 font-medium">No projects found in this category.</p>
                        <Button variant="link" onClick={() => setFilter("All")} className="mt-2 text-primary">
                            View All Projects
                        </Button>
                    </div>
                )}
            </SectionWrapper>
        </div>
    );
}
