"use client";

import React, { use, useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';
import { Globe, ChevronLeft, FileText, Archive, ArrowUpRight } from 'lucide-react';
import { FiGithub } from "react-icons/fi";
import Link from 'next/link';

const getMediaType = (url) => {
    if (!url) return 'image';
    const ext = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return 'zip';
    return 'image';
};

export default function CategoryPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const category = resolvedParams.category ? decodeURIComponent(resolvedParams.category) : "";
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [aspectRatios, setAspectRatios] = useState({});

    useEffect(() => {
        if (!data || data.layoutType !== 'grid' || !data.items) return;

        data.items.forEach((item, idx) => {
            const mediaUrl = item.image || item.logoUrl;
            const mediaType = getMediaType(mediaUrl);
            if (mediaType === 'image') {
                const img = new Image();
                img.src = mediaUrl;
                img.onload = () => {
                    setAspectRatios(prev => ({
                        ...prev,
                        [idx]: img.naturalWidth / img.naturalHeight
                    }));
                };
                img.onerror = () => {
                    setAspectRatios(prev => ({
                        ...prev,
                        [idx]: 1.5
                    }));
                };
            } else {
                setAspectRatios(prev => ({
                    ...prev,
                    [idx]: 1.5
                }));
            }
        });
    }, [data]);

    useEffect(() => {
        if (!category) return;

        setLoading(true);
        // Step 1: Fetch showcases to find folder layout configuration
        fetch(`/api/admin/showcase?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
            .then(res => res.json())
            .then(showcaseRes => {
                let currentLayout = 'card';
                if (showcaseRes.success) {
                    const folder = showcaseRes.data.find(d => d.category.toLowerCase() === category?.toLowerCase());
                    if (folder) {
                        currentLayout = folder.layoutType || 'card';
                    }
                }

                // Step 2: Fetch items based on category
                if (category.toLowerCase() === "projects") {
                    fetch(`/api/admin/projects?t=${Date.now()}`, {
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    })
                        .then(res => res.json())
                        .then(resData => {
                            if (resData.success) {
                                setData({
                                    category: "Projects",
                                    layoutType: currentLayout,
                                    items: resData.data.map(p => ({
                                        title: p.title,
                                        name: p.title,
                                        description: p.description,
                                        image: p.image,
                                        logoUrl: p.image,
                                        github: p.github,
                                        link: p.link,
                                        tech: p.tech,
                                        _id: p._id,
                                        isProject: true
                                    }))
                                });
                            }
                            setLoading(false);
                        })
                        .catch(() => setLoading(false));
                } else {
                    if (showcaseRes.success) {
                        const found = showcaseRes.data.find(d => d.category.toLowerCase() === category?.toLowerCase());
                        if (found) {
                            // Sanitize items: clear titles/names that look like filenames
                            const sanitizedItems = (found.items || []).map(item => {
                                const titleVal = item.title || item.name || "";
                                const isFile = titleVal.startsWith("WhatsApp Image") || /\.(jpg|jpeg|png|gif|webp|svg|mp4|mov|pdf|zip)$/i.test(titleVal);
                                return {
                                    ...item,
                                    title: isFile ? "" : (item.title || ""),
                                    name: isFile ? "" : (item.name || "")
                                };
                            });
                            setData({
                                ...found,
                                items: sanitizedItems
                            });
                        } else {
                            setData(null);
                        }
                    }
                    setLoading(false);
                }
            })
            .catch(() => setLoading(false));
    }, [category]);

    if (loading) {
        return <main className='px-6 pb-12 pt-36 w-full max-w-3xl mx-auto'>Loading...</main>;
    }

    if (!data && !loading) {
        notFound();
    }

    const items = data.items || [];

    return (
        <main className='px-6 pb-12 pt-36 w-full max-w-3xl mx-auto'>
            <div className="mb-8">
                <Link 
                    href="/showcase" 
                    className="group flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Showcase
                </Link>
            </div>

            <div className="mb-8 flex items-center gap-2">
                <div>
                    <h1 className='text-3xl font-bold capitalize'>{data.category}</h1>
                    <p className='text-sm text-muted-foreground mt-1'>
                        Showing all items in {data.category}.
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="p-8 text-center bg-accent/50 rounded-xl border border-border border-dashed text-muted-foreground">
                    No items found in this category yet.
                </div>
            ) : data.category.toLowerCase() === "logos" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {items.map((logo, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center p-6 gap-4 text-center font-geist rounded-xl bg-card/70 border border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200">
                            {(() => {
                                const mediaUrl = logo.logoUrl || logo.image;
                                const mediaType = getMediaType(mediaUrl);
                                if (mediaType === 'video') {
                                    return <video src={mediaUrl} className="w-12 h-12 object-contain" autoPlay loop muted playsInline />;
                                } else if (mediaType === 'pdf') {
                                    return (
                                        <a href={mediaUrl} target="_blank" rel="noreferrer" className="text-red-500 flex flex-col items-center gap-1 hover:scale-105 transition-transform">
                                            <FileText className="size-8" />
                                            <span className="text-[10px] underline">PDF</span>
                                        </a>
                                    );
                                } else if (mediaType === 'zip') {
                                    return (
                                        <a href={mediaUrl} download className="text-blue-500 flex flex-col items-center gap-1 hover:scale-105 transition-transform">
                                            <Archive className="size-8" />
                                            <span className="text-[10px] underline">ZIP</span>
                                        </a>
                                    );
                                } else {
                                    return <img src={mediaUrl} alt={logo.name || logo.title} className={`w-12 h-12 object-contain ${logo.invertDark ? 'dark:invert' : ''}`} />;
                                }
                            })()}
                            <div>
                                <h3 className="font-medium text-sm text-foreground">{logo.name || logo.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1 tracking-tight leading-snug max-w-[150px]">{logo.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : data.layoutType === 'grid' ? (
                <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full">
                    {items.map((item, idx) => {
                        const mediaUrl = item.image || item.logoUrl;
                        const mediaType = getMediaType(mediaUrl);
                        const ratio = aspectRatios[idx] || 1.5;
                        const baseWidth = ratio * 200;
                        return (
                            <div 
                                key={idx} 
                                className="relative cursor-pointer overflow-hidden rounded-xl border border-border/30 bg-muted/10 group transition-all duration-200 h-[160px] sm:h-[220px]"
                                style={{
                                    flexGrow: ratio,
                                    flexBasis: `${baseWidth}px`,
                                    maxWidth: '100%'
                                }}
                                onClick={() => {
                                    if (item.isProject) {
                                        router.push(`/projects/${item._id}`);
                                    } else if (mediaType === 'image') {
                                        setSelectedImage(mediaUrl);
                                    }
                                }}
                            >
                                {mediaType === 'video' ? (
                                    <video src={mediaUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                ) : mediaType === 'pdf' ? (
                                    <div className="flex flex-col items-center justify-center gap-2 text-red-500 font-medium h-full w-full bg-accent/10">
                                        <FileText className="size-10" />
                                        <a href={mediaUrl} target="_blank" rel="noreferrer" className="text-xs underline font-semibold" onClick={e=>e.stopPropagation()}>View PDF</a>
                                    </div>
                                ) : mediaType === 'zip' ? (
                                    <div className="flex flex-col items-center justify-center gap-2 text-blue-500 font-medium h-full w-full bg-accent/10">
                                        <Archive className="size-10" />
                                        <a href={mediaUrl} download className="text-xs underline font-semibold" onClick={e=>e.stopPropagation()}>Download ZIP</a>
                                    </div>
                                ) : (
                                    <img 
                                        src={mediaUrl} 
                                        alt={item.title || item.name} 
                                        className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-200" 
                                    />
                                )}
                                
                                {/* Hover details overlay */}
                                {(item.title || item.description) && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 text-white">
                                        {item.title && <h4 className="font-semibold text-sm">{item.title}</h4>}
                                        {item.description && <p className="text-xs text-white/80 mt-1 leading-snug">{item.description}</p>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* Invisible spacer to prevent the last row from stretching excessively */}
                    <div className="flex-grow-[999] flex-shrink-0 h-[160px] sm:h-[220px]" style={{ flexBasis: '200px' }} />
                </div>
            ) : (
                <TooltipProvider>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {items.map((project, idx) => {
                            const hasFooter = (project.tech && project.tech.length > 0) || project.github || project.link || project.isProject;
                            return (
                                <div key={idx} className="flex flex-col group font-geist rounded-xl bg-card/70 border border-border/50 hover:border-border hover:bg-accent/50 ease-out transition-all duration-200">
                                    <div 
                                        className="relative w-full h-40 sm:h-50 overflow-hidden rounded-t-xl bg-muted/50 shrink-0 flex items-center justify-center cursor-pointer"
                                        onClick={() => {
                                            if (project.isProject) {
                                                router.push(`/projects/${project._id}`);
                                            } else {
                                                const mediaUrl = project.image || project.logoUrl;
                                                const mediaType = getMediaType(mediaUrl);
                                                if (mediaType === 'image') setSelectedImage(mediaUrl);
                                            }
                                        }}
                                    >
                                        {(() => {
                                            const mediaUrl = project.image || project.logoUrl;
                                            const mediaType = getMediaType(mediaUrl);
                                            if (mediaType === 'video') {
                                                return (
                                                    <video 
                                                        src={mediaUrl} 
                                                        className="w-full h-full object-cover" 
                                                        autoPlay 
                                                        loop 
                                                        muted 
                                                        playsInline 
                                                    />
                                                );
                                            } else if (mediaType === 'pdf') {
                                                return (
                                                    <div className="flex flex-col items-center justify-center gap-2 text-red-500 font-medium h-full w-full bg-accent/10 hover:bg-accent/30 transition-colors py-4">
                                                        <FileText className="size-10" />
                                                        <a href={mediaUrl} target="_blank" rel="noreferrer" className="text-xs underline hover:text-red-600 font-semibold" onClick={e=>e.stopPropagation()}>View PDF Document</a>
                                                    </div>
                                                );
                                            } else if (mediaType === 'zip') {
                                                return (
                                                    <div className="flex flex-col items-center justify-center gap-2 text-blue-500 font-medium h-full w-full bg-accent/10 hover:bg-accent/30 transition-colors py-4">
                                                        <Archive className="size-10" />
                                                        <a href={mediaUrl} download className="text-xs underline hover:text-blue-600 font-semibold" onClick={e=>e.stopPropagation()}>Download ZIP Archive</a>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <img 
                                                        src={mediaUrl} 
                                                        alt={project.title || project.name} 
                                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" 
                                                    />
                                                );
                                            }
                                        })()}
                                    </div>
                                    {(project.title || project.name || project.description || hasFooter) && (
                                        <div className="flex flex-col flex-1 px-4 sm:px-5 py-4">
                                            {(project.title || project.name || project.github || project.link) && (
                                                <div className="flex justify-between items-start mb-2">
                                                    {(project.title || project.name) && (
                                                        <h3 
                                                            onClick={() => {
                                                                if (project.isProject) router.push(`/projects/${project._id}`);
                                                            }}
                                                            className={`text-base sm:text-lg font-semibold text-foreground transition-colors ${project.isProject ? 'cursor-pointer hover:text-primary hover:underline' : ''}`}
                                                        >
                                                            {project.title || project.name}
                                                        </h3>
                                                    )}
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
                                            )}
                                            {project.description && (
                                                <p className={`text-foreground/70 text-xs sm:text-sm leading-relaxed ${hasFooter ? 'mb-4' : 'mb-0'}`}>
                                                    {project.description}
                                                </p>
                                            )}
                                            {hasFooter && (
                                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/30 gap-4 flex-wrap w-full">
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

                                                    {project.isProject && (
                                                        <Link 
                                                            href={`/projects/${project._id}`}
                                                            className="text-xs inline-flex items-center gap-1 font-semibold text-foreground/80 hover:text-foreground hover:underline transition-all cursor-pointer bg-muted/30 border border-border/50 px-3 py-1.5 rounded-lg shrink-0"
                                                        >
                                                            View Case Study <ArrowUpRight className="size-3.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </TooltipProvider>
            )}

            {/* Lightbox Preview Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-full max-h-full flex items-center justify-center">
                        <img 
                            src={selectedImage} 
                            alt="Lightbox preview" 
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-200" 
                        />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-all text-xs font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
