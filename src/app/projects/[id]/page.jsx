"use client";

import React, { use, useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Globe, ChevronLeft, Heart, Link as LinkIcon, Share2, MessageSquare, ArrowUpRight } from 'lucide-react';
import { FiGithub } from "react-icons/fi";
import Link from 'next/link';

const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground font-bold'>$1</strong>");
    html = html.replace(/__(.*?)__/g, "<strong class='text-foreground font-bold'>$1</strong>");
    
    // Italic: *text* or _text_
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.*?)_/g, "<em>$1</em>");

    // Code: `code`
    html = html.replace(/`(.*?)`/g, "<code class='bg-muted px-1.5 py-0.5 rounded font-mono text-sm'>$1</code>");
    
    // Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-primary underline hover:text-primary/80 transition-colors'>$1</a>");
    
    // Newlines to <br />
    html = html.replace(/\n/g, "<br />");
    
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export default function ProjectDetailPage({ params }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();
    
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [profileName, setProfileName] = useState("Developer");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchProject();
        fetch(`/api/admin/profile?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data.name) {
                    setProfileName(data.data.name);
                }
            })
            .catch(err => console.error("Failed to load profile in project details:", err));
    }, [id]);

    const fetchProject = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            if (data.success) {
                setProject(data.data);
                setLikesCount(data.data.caseStudy?.likes || 0);
            }
        } catch (error) {
            console.error("Error fetching project details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (liked) return; // Prevent multiple likes in same session
        setLiked(true);
        setLikesCount(prev => prev + 1);

        try {
            const res = await fetch(`/api/projects/${id}/like`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setLikesCount(data.likes);
            }
        } catch (err) {
            console.error("Error liking project:", err);
        }
    };

    const copyProjectUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: project?.title || "Check out this project!",
                    text: project?.description || "",
                    url: window.location.href,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("Error sharing:", err);
                }
            }
        } else {
            copyProjectUrl();
        }
    };

    if (loading) {
        return (
            <main className='px-6 pb-24 pt-36 w-full max-w-4xl mx-auto min-h-screen flex flex-col justify-center items-center'>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-muted-foreground font-medium">Loading project showcase...</span>
                </div>
            </main>
        );
    }

    if (!project && !loading) {
        notFound();
    }

    const techStack = project.tech || [];
    const caseStudy = project.caseStudy || {};
    const blocks = caseStudy.blocks || [];

    return (
        <main className='px-6 pb-24 pt-32 sm:pt-36 w-full max-w-4xl mx-auto'>
            {/* Breadcrumb back navigation */}
            <div className="mb-8 flex items-center justify-between">
                <Link 
                    href="/#projects" 
                    className="group flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Portfolio
                </Link>
                
                <div className="text-xs text-muted-foreground font-mono">
                    Harsh.so / projects / {project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                </div>
            </div>

            {/* Main Showcase Header Card */}
            <div className="border border-border/50 rounded-2xl bg-card/40 backdrop-blur-md p-6 sm:p-8 mb-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img 
                            src={project.image} 
                            alt={project.title} 
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-border/80 shadow-md shrink-0 bg-muted" 
                        />
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{project.title}</h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">By {profileName}</p>
                        </div>
                    </div>
                    
                    {/* Header Action Buttons */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <button 
                            onClick={copyProjectUrl} 
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border transition-all ${copied ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground'}`}
                        >
                            <LinkIcon size={12} />
                            {copied ? 'Copied!' : 'Copy URL'}
                        </button>
                        <button 
                            onClick={handleShare}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Share2 size={12} />
                            Share
                        </button>
                        {project.link && (
                            <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/95 transition-colors"
                            >
                                Visit Live
                                <ArrowUpRight size={12} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Subtitle / Intro Pitch */}
                {caseStudy.subtitle && (
                    <p className="text-lg sm:text-xl font-medium text-foreground leading-relaxed">
                        {caseStudy.subtitle}
                    </p>
                )}

                {/* Project Links & Core Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/30">
                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {techStack.map((tech, idx) => (
                            <span 
                                key={idx} 
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted border border-border text-foreground"
                            >
                                {typeof tech === 'string' ? tech : tech.name}
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        {project.github && (
                            <a 
                                href={project.github} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <FiGithub className="size-4" />
                                GitHub Code
                            </a>
                        )}
                        {project.link && (
                            <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Globe className="size-4" />
                                Live Product
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Case Study Content Blocks Container */}
            <div className="space-y-12 sm:space-y-16">
                {blocks.length === 0 ? (
                  <div className="text-center space-y-3 py-12">
                    <p className="text-muted-foreground text-sm">{project.description}</p>
                  </div>
                ) : (
                  blocks.map((block) => {
                      if (block.type === 'text') {
                          return (
                              <section key={block.id} className="space-y-3 max-w-2xl mx-auto">
                                  {block.heading && (
                                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                          {block.heading}
                                      </h2>
                                  )}
                                  {block.content && (
                                      <p className="text-base text-muted-foreground leading-relaxed">
                                          {renderMarkdown(block.content)}
                                      </p>
                                  )}
                              </section>
                          );
                      } else if (block.type === 'media') {
                          const isYoutube = block.mediaUrl?.includes("youtube.com") || block.mediaUrl?.includes("youtu.be") || block.mediaUrl?.includes("embed");
                          const isVimeo = block.mediaUrl?.includes("vimeo.com");

                          let videoSrc = block.mediaUrl;
                          if (block.mediaType === 'video') {
                              if (isYoutube) {
                                  let videoId = "";
                                  if (videoSrc.includes("/embed/")) {
                                      videoId = videoSrc.split("/embed/")[1]?.split("?")[0];
                                  } else if (videoSrc.includes("v=")) {
                                      videoId = videoSrc.split("v=")[1]?.split("&")[0];
                                  }
                                  if (videoId) {
                                      videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3`;
                                  }
                              } else if (isVimeo) {
                                  let videoId = "";
                                  if (videoSrc.includes("/video/")) {
                                      videoId = videoSrc.split("/video/")[1]?.split("?")[0];
                                  }
                                  if (videoId) {
                                      videoSrc = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;
                                  }
                              }
                          }

                          return (
                              <section key={block.id} className="space-y-3 w-full">
                                  <div className="rounded-2xl border border-border/50 overflow-hidden bg-muted/20 shadow-lg shadow-black/5">
                                      {block.mediaType === 'video' ? (
                                          isYoutube || isVimeo ? (
                                              <div className="aspect-video w-full">
                                                  <iframe 
                                                      src={videoSrc}
                                                      className="w-full h-full"
                                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                      allowFullScreen
                                                      title="Video showcase"
                                                  ></iframe>
                                              </div>
                                          ) : (
                                              <video 
                                                  src={block.mediaUrl} 
                                                  className="w-full aspect-video object-cover" 
                                                  autoPlay
                                                  loop
                                                  muted
                                                  playsInline
                                              />
                                          )
                                      ) : (
                                          <img 
                                              src={block.mediaUrl} 
                                              alt={block.caption || "Showcase media"} 
                                              className="w-full h-auto max-h-[600px] object-cover mx-auto" 
                                          />
                                      )}
                                  </div>
                                  {block.caption && (
                                      <p className="text-center text-xs sm:text-sm text-muted-foreground/80 italic max-w-xl mx-auto leading-relaxed">
                                          {block.caption}
                                      </p>
                                  )}
                              </section>
                          );
                      }
                      return null;
                  })
                )}
            </div>

            {/* Like and Interact Section */}
            <div className="mt-16 sm:mt-24 pt-10 border-t border-border/40 text-center flex flex-col items-center justify-center space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Like this project</h3>
                <button
                    onClick={handleLike}
                    disabled={liked}
                    className={`group flex items-center justify-center w-16 h-16 rounded-full border shadow-sm transition-all duration-300 ${liked ? 'bg-red-500/10 border-red-500 text-red-500 scale-105' : 'bg-background hover:bg-red-500/5 border-border hover:border-red-500/40 text-muted-foreground hover:text-red-500 active:scale-95'}`}
                    aria-label="Like project"
                >
                    <Heart className={`size-7 transition-transform ${liked ? 'fill-current animate-heart-beat' : 'group-hover:scale-110'}`} />
                </button>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {likesCount} {likesCount === 1 ? 'person liked' : 'people liked'} this project
                </div>
            </div>

            {/* CSS styles for specific heartbeat animations */}
            <style jsx global>{`
                @keyframes heartBeat {
                    0% { transform: scale(1); }
                    14% { transform: scale(1.3); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.3); }
                    70% { transform: scale(1); }
                }
                .animate-heart-beat {
                    animation: heartBeat 0.8s ease-in-out;
                }
            `}</style>
        </main>
    );
}
