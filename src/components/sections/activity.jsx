"use client";

import React, { useState, useEffect } from 'react'
import GithubCalendar from '../github-calendar'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

const techStack = [
    { name: "TypeScript", src: "/icons/typescript.svg" },
    { name: "JavaScript", src: "/icons/javascript.svg" },
    { name: "Python", src: "/icons/python.svg" },
    { name: "Java", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
    { name: "Node.js", src: "/icons/nodejs.svg" },
    { name: "React", src: "/icons/react.svg" },
    { name: "Next.js", src: "/icons/nextjs.svg", invertDark: true },
    { name: "Tailwind CSS", src: "/icons/tailwindcss.svg" },
    { name: "Express.js", src: "/icons/express.svg", invertDark: true },
    { name: "MongoDB", src: "/icons/mongodb.svg" },
    { name: "PostgreSQL", src: "/icons/postgresql.svg" },
    { name: "MySQL", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" },
    { name: "SQL", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azuresqldatabase/azuresqldatabase-original.svg" },
    { name: "Git", src: "/icons/git.svg" },
    { name: "GitHub", src: "/icons/github.svg", invertDark: true },
    { name: "Docker", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
    { name: "Kubernetes", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg" },
    { name: "AWS", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", invertDark: true },
    { name: "Terraform", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg" },
    { name: "Bash", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg", invertDark: true },
    { name: "Figma", src: "/icons/figma.svg" },
    { name: "Postman", src: "/icons/postman.svg" },
    { name: "C++", src: "/icons/cplusplus.svg" },
    { name: "LangChain", src: "/icons/langchain.svg", invertDark: true },
    { name: "LangGraph", src: "/icons/langgraph.svg" },
]

export default function Activity() {
    const [githubUsername, setGithubUsername] = useState("");

    useEffect(() => {
        fetch(`/api/admin/profile?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data.github) {
                    // Extract username from github URL (e.g. "https://github.com/username")
                    const url = data.data.github.trim();
                    if (url.includes('github.com')) {
                        const parts = url.split('/');
                        const username = parts[parts.length - 1] || parts[parts.length - 2];
                        if (username && username.toLowerCase() !== 'github.com') {
                            setGithubUsername(username);
                            return;
                        }
                    }
                }
                // Fallback to env or empty
                const envUsername = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "";
                setGithubUsername(envUsername);
            })
            .catch(err => {
                console.error("Failed to load activity profile:", err);
                setGithubUsername(process.env.NEXT_PUBLIC_GITHUB_USERNAME || "");
            });
    }, []);

    return (
        <section>
            {githubUsername && (
                <div className='mt-12'>
                    <GithubCalendar username={githubUsername} />
                </div>
            )}

            <div className="mt-10">
                <h2 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Tech Stack</h2>
                <div className="flex flex-wrap items-center gap-3 opacity-95 sm:gap-4">
                    {techStack.map((tech) => (
                        <Tooltip key={tech.name}>
                            <TooltipTrigger asChild>
                                <img
                                    src={tech.src}
                                    alt={tech.name}
                                    className={`h-6 w-6 cursor-pointer object-contain transition-transform duration-200 hover:scale-110 sm:h-8 sm:w-8 ${tech.invertDark ? 'dark:invert' : ''}`}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={6}>
                                {tech.name}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </section>
    )
}