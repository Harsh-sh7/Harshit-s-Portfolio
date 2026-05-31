"use client";

import React, { useState, useEffect } from 'react';
import ColoredBadge from '@/components/colored-badge';
import { Mail } from 'lucide-react';
import { SiGithub } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { Button } from '@/components/ui/button';
import CardStack from '@/components/card-stack';

const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    // Bold: **text** or __text__ -> styled as highlighted text
    html = html.replace(/\*\*(.*?)\*\*/g, "<span class='text-foreground font-medium'>$1</span>");
    html = html.replace(/__(.*?)__/g, "<span class='text-foreground font-medium'>$1</span>");
    
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

export default function About() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/profile?t=${Date.now()}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load profile");
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    setProfile(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading profile on about page:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <main className='px-6 pb-12 pt-36 w-full max-w-3xl mx-auto min-h-screen flex items-center justify-center'>
                <div className="text-muted-foreground text-sm">Loading About page...</div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className='px-6 pb-12 pt-36 w-full max-w-3xl mx-auto min-h-screen flex items-center justify-center'>
                <div className="text-red-500 text-sm">Failed to load profile settings.</div>
            </main>
        );
    }

    const paragraphs = (profile.aboutBody || "").split(/\r?\n\r?\n/).filter(p => p.trim());
    const bioParagraph = paragraphs[0] || "";
    const journeyParagraphs = paragraphs.slice(1);

    return (
        <main className='px-6 pb-12 pt-36 w-full max-w-3xl mx-auto'>
            <div className='text-2xl sm:text-3xl font-bold tracking-tight'>
                <h1>{profile.aboutHeading1 || "I solve problems,"}</h1>
                <h1 className='text-foreground/50'>{profile.aboutHeading2 || "they call it coding."}</h1>
            </div>

            <div className='mt-6 flex flex-col gap-6 text-muted-foreground'>
                {bioParagraph && (
                    <p>
                        {renderMarkdown(bioParagraph)}
                    </p>
                )}

                <p className="flex flex-wrap gap-2 items-center">
                    I'm <ColoredBadge text="Curious" className="bg-cyan-400/10 text-cyan-400" />, <ColoredBadge text="Focused" className="text-blue-400 bg-blue-400/10" />, <ColoredBadge text="Obsessed" className="text-purple-400 bg-purple-400/10" /> and a <ColoredBadge text="Solver" className="text-emerald-400 bg-emerald-400/10" />.
                </p>

                {journeyParagraphs.length > 0 && (
                    <>
                        <h2 className='text-2xl font-bold mt-8 text-foreground'>My Journey</h2>
                        {journeyParagraphs.map((para, idx) => (
                            <p key={idx}>{renderMarkdown(para)}</p>
                        ))}
                    </>
                )}

                <div className="my-8">
                    <h2 className='text-2xl font-bold mb-6 text-foreground'>A Glimpse</h2>
                    <CardStack items={profile.aboutGallery || []} />
                </div>

                <h2 className='text-2xl font-bold mt-8 text-foreground'>Let's connect</h2>
                <p>
                    Whether you have a problem that needs solving, or you just want to say "Hi" to me, I would love to hear from you.
                </p>

                <div className='flex flex-wrap items-center gap-2 text-foreground'>
                    {profile.email && (
                        <a href={`mailto:${profile.email}`}>
                            <Button variant="outline">
                                <Mail className='size-4 mr-1' /> Email
                            </Button>
                        </a>
                    )}
                    {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                <FaLinkedin className='size-4 mr-1' /> LinkedIn
                            </Button>
                        </a>
                    )}
                    {profile.github && (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                <SiGithub className='size-4 mr-1' /> GitHub
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        </main>
    );
}
