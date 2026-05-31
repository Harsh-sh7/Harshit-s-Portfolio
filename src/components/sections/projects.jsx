"use client";

import React, { useState, useEffect } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from '@/components/ui/tooltip'
import { Globe, ArrowUpRight } from 'lucide-react'
import { FiGithub } from "react-icons/fi"
import Link from 'next/link'

export default function Projects() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/admin/projects?t=${Date.now()}`)
            .then(res => {
                if (!res.ok) throw new Error("Server error " + res.status);
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    // Filter visible projects and show top 4
                    const visibleProjects = data.data.filter(p => p.isVisible !== false);
                    setProjects(visibleProjects.slice(0, 4))
                }
                setLoading(false)
            })
            .catch((err) => {
                console.error("Failed to load projects:", err);
                setLoading(false);
            })
    }, [])

    if (loading) {
        return (
            <section className="mt-20">
                <h2 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Featured Projects</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                    <div className="h-64 bg-muted rounded-xl"></div>
                    <div className="h-64 bg-muted rounded-xl"></div>
                </div>
            </section>
        )
    }

    if (projects.length === 0) {
        return null;
    }

    return (
        <section className="mt-20">
            <h2 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Featured Projects</h2>
            <TooltipProvider>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((project, idx) => (
                        <div key={idx} className="flex flex-col group font-geist rounded-xl bg-card/70 border border-border/50 hover:border-border hover:bg-accent/50 ease-out transition-all duration-200">
                            <Link href={`/projects/${project._id}`} className="relative w-full h-40 sm:h-50 overflow-hidden rounded-t-xl bg-muted/50 shrink-0">
                                <img src={project.image} alt={`${project.title} - Project thumbnail`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                            </Link>
                            <div className="flex flex-col flex-1 px-4 sm:px-6 py-4 sm:py-5">
                                <div className="flex justify-between items-start mb-3 sm:mb-3.5">
                                    <Link href={`/projects/${project._id}`} className="hover:underline">
                                        <h3 className="text-base sm:text-lg font-medium text-foreground transition-colors">{project.title}</h3>
                                    </Link>
                                    <div className="flex gap-3">
                                        {project.github && (
                                            <a target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors ease-out" href={project.github}>
                                                <FiGithub className='size-5' />
                                            </a>
                                        )}
                                        {project.link && (
                                            <a target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors ease-out" href={project.link}>
                                                <Globe className='size-5' />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <p className="text-foreground/70 text-sm leading-relaxed mb-6">{project.description}</p>
                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/30 gap-4">
                                    {project.tech && project.tech.length > 0 ? (
                                        <div className="flex flex-wrap gap-2.5 items-center">
                                            {project.tech.map((t, tIdx) => (
                                                <Tooltip key={tIdx}>
                                                    <TooltipTrigger asChild>
                                                        <img src={t.icon} alt={t.name} className={`w-5.5 h-5.5 object-contain hover:scale-110 transition-transform duration-150 ease-out cursor-pointer ${t.invertDark ? 'dark:invert' : ''}`} />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" sideOffset={6}>
                                                        {t.name}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    ) : (
                                        <div />
                                    )}

                                    <Link 
                                        href={`/projects/${project._id}`}
                                        className="text-xs inline-flex items-center gap-1 font-semibold text-foreground/80 hover:text-foreground hover:underline transition-all cursor-pointer bg-muted/30 border border-border/50 px-3 py-1.5 rounded-lg shrink-0"
                                    >
                                        View Case Study <ArrowUpRight className="size-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </TooltipProvider>
        </section>
    )
}
