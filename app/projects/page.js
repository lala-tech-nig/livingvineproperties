"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";

// Mock Data
const ALL_PROJECTS = [
    {
        id: 1,
        title: "The Ambiance",
        location: "Lekki Phase 1, Lagos",
        category: "Completed",
        status: "Sold Out",
        image: "https://images.unsplash.com/photo-1600596542815-e32870033baf?q=80&w=2674&auto=format&fit=crop",
        description: "A masterpiece of modern architecture featuring 4-bedroom terrace duplexes with smart home integration."
    },
    {
        id: 2,
        title: "Greenfield Estate",
        location: "Epe, Lagos",
        category: "Ongoing",
        status: "Selling Fast",
        image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=2670&auto=format&fit=crop",
        description: "Affordable land banking plots located in the heart of the new Lagos manufacturing hub."
    },
    {
        id: 3,
        title: "Empire Heights",
        location: "Ikoyi, Lagos",
        category: "Future",
        status: "Coming Soon",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2670&auto=format&fit=crop",
        description: "Ultra-luxury high-rise apartments overlooking the Lagos lagoon."
    },
    {
        id: 4,
        title: "Vine Courts",
        location: "Sangotedo, Lagos",
        category: "Ongoing",
        status: "Selling Fast",
        image: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=2670&auto=format&fit=crop",
        description: "A serene residential community with paved roads, electricity, and recreational parks."
    }
];

export default function Projects() {
    const [filter, setFilter] = useState("All");

    const filteredProjects = filter === "All"
        ? ALL_PROJECTS
        : ALL_PROJECTS.filter(p => p.category === filter);

    return (
        <div className="pt-20 bg-white min-h-screen">
            {/* Simple Header */}
            <div className="bg-gray-50 py-16 text-center border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Our Portfolio</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Explore our track record of excellence. From sold-out estates to upcoming luxury developments.
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
                {filteredProjects.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white flex flex-col h-full">
                                {/* Image */}
                                <div className="relative h-64 overflow-hidden bg-gray-200">
                                    <div
                                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${project.image}')` }}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-black shadow-sm">
                                        {project.category}
                                    </div>
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${project.status === "Sold Out" ? "bg-red-600" : "bg-green-600"
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
