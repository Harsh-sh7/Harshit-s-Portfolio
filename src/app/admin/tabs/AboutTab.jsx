"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";

const getMediaType = (url) => {
  if (!url) return 'image';
  const ext = url.split('.').pop().toLowerCase();
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return 'zip';
  return 'image';
};

export default function AboutTab() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/profile?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error("Server error " + res.status);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setProfile(data.data);
        } else {
          console.error("API Error:", data.error);
        }
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        alert("About settings updated successfully!");
      } else {
        alert("Failed to update About settings.");
      }
    } catch (err) {
      alert("Error saving About settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCardFileUpload = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      const newGallery = [...(profile.aboutGallery || [])];
      newGallery[idx] = { ...newGallery[idx], src: data.url };
      setProfile(prev => ({ ...prev, aboutGallery: newGallery }));
    } catch (error) {
      console.error('Error uploading card file:', error);
      alert('Failed to upload card photo');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById("aboutBodyTextarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (syntax === "bold") replacement = `**${selectedText || "bold text"}**`;
    else if (syntax === "italic") replacement = `*${selectedText || "italic text"}*`;
    else if (syntax === "code") replacement = `\`${selectedText || "code"}\``;
    else if (syntax === "link") replacement = `[${selectedText || "link text"}](https://example.com)`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    
    setProfile(prev => ({ ...prev, aboutBody: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  if (!profile) return <div>Loading About Page settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-1">About Page Settings</h2>
        <p className="text-muted-foreground text-sm">Manage the dynamic headers, body text, and interactive Polaroid card stack gallery shown on the About page.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* About Page content section */}
        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b border-border/50 pb-2">About Page Content</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">About Title Line 1</label>
                <input name="aboutHeading1" value={profile.aboutHeading1 || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">About Title Line 2</label>
                <input name="aboutHeading2" value={profile.aboutHeading2 || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium flex justify-between items-center">
                <span>Text Body (Blank lines split paragraphs. Supports Markdown: **bold**, *italic*, `code`, [link](url))</span>
              </label>
              
              <div className="flex gap-2.5 items-center mb-1 bg-muted/30 p-1.5 rounded border border-border/40">
                <button 
                  type="button" 
                  onClick={() => insertMarkdown("bold")}
                  className="px-2.5 py-1 text-xs font-bold bg-background hover:bg-accent rounded border border-border transition-colors cursor-pointer"
                  title="Bold Text (**bold**)"
                >
                  B
                </button>
                <button 
                  type="button" 
                  onClick={() => insertMarkdown("italic")}
                  className="px-2.5 py-1 text-xs italic bg-background hover:bg-accent rounded border border-border transition-colors cursor-pointer"
                  title="Italic Text (*italic*)"
                >
                  I
                </button>
                <button 
                  type="button" 
                  onClick={() => insertMarkdown("code")}
                  className="px-2.5 py-1 text-xs font-mono bg-background hover:bg-accent rounded border border-border transition-colors cursor-pointer"
                  title="Code Text (`code`)"
                >
                  &lt;/&gt;
                </button>
                <button 
                  type="button" 
                  onClick={() => insertMarkdown("link")}
                  className="px-2.5 py-1 text-xs bg-background hover:bg-accent rounded border border-border underline transition-colors cursor-pointer"
                  title="Insert Link ([text](url))"
                >
                  Link
                </button>
                <span className="text-[10px] text-muted-foreground self-center ml-auto">
                  Tip: Select text to wrap, or just click to insert!
                </span>
              </div>

              <textarea 
                id="aboutBodyTextarea"
                name="aboutBody" 
                value={profile.aboutBody || ''} 
                onChange={handleChange} 
                className="w-full p-2 rounded bg-background border border-border text-sm min-h-[300px]" 
                placeholder="Write your dynamic About content here... Use a double-newline to start a new paragraph."
              />
            </div>
          </div>
        </div>

        {/* About Polaroid Stack (Glimpse) */}
        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <div>
              <h3 className="font-semibold text-lg">About Polaroid Stack (Glimpse Gallery)</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Manage the interactive card stack images and details shown on the About page.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newCard = {
                  id: 'gallery-' + Date.now().toString() + Math.random().toString(36).substring(2, 5),
                  src: '/gallery/0.png',
                  title: 'New Card',
                  subtitle: 'Description here'
                };
                setProfile(prev => ({ ...prev, aboutGallery: [...(prev.aboutGallery || []), newCard] }));
              }}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors flex items-center gap-1 font-medium"
            >
              <Plus size={14} /> Add Polaroid Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(profile.aboutGallery || []).map((card, idx) => (
              <div key={card.id || idx} className="p-4 border border-border/50 rounded-lg bg-background/50 flex flex-col gap-3 relative group">
                <button 
                  type="button" 
                  onClick={() => {
                    const newGallery = (profile.aboutGallery || []).filter((_, cIdx) => cIdx !== idx);
                    setProfile(prev => ({ ...prev, aboutGallery: newGallery }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-md transition-colors"
                  title="Remove Card"
                >
                  <Trash2 size={14} />
                </button>

                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-muted rounded overflow-hidden shrink-0 border border-border flex items-center justify-center relative">
                    {card.src ? (
                      <img src={card.src} alt="Card preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-muted-foreground size-6" />
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-[10px] text-white cursor-pointer transition-opacity">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleCardFileUpload(e, idx)}
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Title</label>
                      <input 
                        value={card.title || ''} 
                        onChange={(e) => {
                          const newGallery = [...(profile.aboutGallery || [])];
                          newGallery[idx] = { ...newGallery[idx], title: e.target.value };
                          setProfile(prev => ({ ...prev, aboutGallery: newGallery }));
                        }}
                        placeholder="e.g. Designing"
                        className="w-full p-1.5 text-xs rounded bg-background border border-border"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Subtitle</label>
                      <input 
                        value={card.subtitle || ''} 
                        onChange={(e) => {
                          const newGallery = [...(profile.aboutGallery || [])];
                          newGallery[idx] = { ...newGallery[idx], subtitle: e.target.value };
                          setProfile(prev => ({ ...prev, aboutGallery: newGallery }));
                        }}
                        placeholder="e.g. Beside coding, I design"
                        className="w-full p-1.5 text-xs rounded bg-background border border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save About Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
