"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, User, Briefcase, FolderOpen, LogOut, Code, Info } from "lucide-react";

import ProfileTab from "./tabs/ProfileTab";
import AboutTab from "./tabs/AboutTab";
import ProjectsTab from "./tabs/ProjectsTab";
import ExperiencesTab from "./tabs/ExperiencesTab";
import ShowcaseTab from "./tabs/ShowcaseTab";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(item => item.trim().startsWith('admin_auth='));
    if (authCookie) {
      const value = authCookie.split('=')[1];
      if (value === 'true') {
        // Clear legacy unhashed cookie
        document.cookie = 'admin_auth=; path=/; max-age=0';
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        alert("Invalid password");
      }
    } catch (error) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
    router.refresh();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-lg border border-border/50 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-foreground text-center">Admin Portal Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 border border-border rounded bg-background text-foreground"
              required
            />
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground p-3 rounded hover:bg-primary/90 transition-colors font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/50 bg-card/30 flex flex-col p-4 md:h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <LayoutDashboard className="text-primary size-6" />
          <h1 className="text-xl font-bold">Admin Portal</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User size={18}/>}>
            Profile Settings
          </TabButton>
          <TabButton active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Info size={18}/>}>
            About Settings
          </TabButton>
          <TabButton active={activeTab === "projects"} onClick={() => setActiveTab("projects")} icon={<Code size={18}/>}>
            Projects
          </TabButton>
          <TabButton active={activeTab === "experience"} onClick={() => setActiveTab("experience")} icon={<Briefcase size={18}/>}>
            Experience
          </TabButton>
          <TabButton active={activeTab === "showcase"} onClick={() => setActiveTab("showcase")} icon={<FolderOpen size={18}/>}>
            Showcase Gallery
          </TabButton>
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-2">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md transition-colors w-full text-left"
          >
            View Live Portfolio
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors w-full text-left"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "about" && <AboutTab />}
        {activeTab === "projects" && <ProjectsTab />}
        {activeTab === "experience" && <ExperiencesTab />}
        {activeTab === "showcase" && <ShowcaseTab />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-medium w-full text-left ${
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
