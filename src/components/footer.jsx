"use client";

import React, { useState, useEffect } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa6'
import { MdOutlineEmail } from 'react-icons/md'
import { FaLinkedin } from "react-icons/fa";
import { SiCodechef } from "react-icons/si";

import { socialLinks as configSocials } from '@/lib/config';

const navLinks = [
    { label: "About", href: "/about" },
    { label: "Showcase", href: "/showcase" },
]

export default function Footer() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetch(`/api/admin/profile?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProfile(data.data);
                }
            })
            .catch(err => console.error("Failed to load footer profile:", err));
    }, []);

    const name = profile?.name || "Developer";
    const socials = [
        {
            label: "LinkedIn",
            href: profile?.linkedin || configSocials.linkedin,
            icon: <FaLinkedin className="w-4 h-4" />
        },
        {
            label: "CodeChef",
            href: profile?.codechef || configSocials.codechef,
            icon: <SiCodechef className="w-4 h-4" />
        },
        {
            label: "Email",
            href: profile?.email ? `mailto:${profile.email}` : `mailto:${configSocials.email}`,
            icon: <MdOutlineEmail className="w-4 h-4" />
        },
        {
            label: "GitHub",
            href: profile?.github || configSocials.github,
            icon: <FaGithub className="w-4 h-4" />
        }
    ];

    return (
        <footer className="border-t border-border/40 w-full max-w-3xl mx-auto">
            <div className="px-4 py-5 sm:py-7">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
                        <p className="text-xs text-muted-foreground/60">
                            © {new Date().getFullYear()} {name}.
                        </p>
                        <div className="hidden md:block w-px h-4 bg-border/50"></div>
                        <div className="flex items-center gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors duration-200"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {socials.map((social) => (
                            <a
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground/70 hover:text-foreground transition-colors duration-200"
                                key={social.label}
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
