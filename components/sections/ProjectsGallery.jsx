"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const PROJECTS = [
    {
        title: "The Ambiance",
        location: "Lekki Phase 1",
        status: "Selling Fast",
        image: "https://images.unsplash.com/photo-1600596542815-e32870033baf?q=80&w=2674&auto=format&fit=crop",
    },
    {
        title: "Greenfield Estate",
        location: "Epe, Lagos",
        status: "Sold Out",
        image: "https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=2667&auto=format&fit=crop",
    },
    {
        title: "Empire Heights",
        location: "Ikoyi",
        status: "Launching Soon",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2670&auto=format&fit=crop",
    },
];

const ProjectsGallery = () => {
    return (
        <SectionWrapper className="bg-white">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                    <span className="text-primary font-bold uppercase tracking-widest text-sm">Portfolio</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mt-2">
                        Featured Developments
                    </h2>
                </div>
                <Button variant="outline" className="hidden md:flex" asChild>
                    <Link href="/projects">View All Projects</Link>
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {PROJECTS.map((project, index) => (
                    <div key={index} className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url('${project.image}')` }}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider mb-3 rounded-full">
                                {project.status}
                            </div>
                            <h3 className="text-3xl font-serif font-bold text-white mb-1 group-hover:text-primary transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-white/80 mb-6 flex items-center gap-2">
                                <span className="w-1 h-1 bg-primary rounded-full" /> {project.location}
                            </p>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                <span className="inline-flex items-center text-white font-medium border-b border-white pb-1 hover:text-primary hover:border-primary transition-colors">
                                    View Details <ArrowUpRight className="ml-2 w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 md:hidden text-center">
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/projects">View All Projects</Link>
                </Button>
            </div>
        </SectionWrapper>
    );
};

export default ProjectsGallery;
