"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Image as ImageIcon, FileText, ExternalLink, Upload } from "lucide-react";
import { invalidatePortfolioCache } from "@/lib/dataCache";

// Convert any Google Drive share URL to an embeddable preview URL
function getDriveEmbedUrl(url) {
  if (!url) return null;
  // Already an embed URL
  if (url.includes('/preview')) return url;
  // Standard share link: https://drive.google.com/file/d/FILE_ID/view
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  // Export/open link: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
  // Not a Drive URL — return as-is (could be a direct PDF link)
  return url;
}

export default function ProfileTab() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resumeTab, setResumeTab] = useState('link'); // 'link' | 'upload'
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/profile?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error("Server error " + res.status);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setProfile(data.data);
          // Show preview if a resume URL already exists
          if (data.data.resumeUrl) setShowPreview(true);
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
        invalidatePortfolioCache(); // bust cache so homepage picks up new resume URL
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, fieldName) => {
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
      setProfile(prev => ({ ...prev, [fieldName]: data.url }));
      if (fieldName === 'resumeUrl') setShowPreview(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (name === 'resumeUrl') setShowPreview(!!value);
  };

  if (!profile) return <div>Loading Profile...</div>;

  const embedUrl = getDriveEmbedUrl(profile.resumeUrl);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-1">Profile Settings</h2>
        <p className="text-muted-foreground text-sm">Manage your personal details and social links that appear on the homepage.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b border-border/50 pb-2">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <input name="name" value={profile.name || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Role</label>
              <input name="role" value={profile.role || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Location</label>
              <input name="location" value={profile.location || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input name="email" value={profile.email || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea name="bio" value={profile.bio || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm min-h-[100px]" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Profile Image</label>
              <div className="flex gap-2">
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageUrl')} className="flex-1 p-2 rounded bg-background border border-border text-sm" />
                {profile.imageUrl && <img src={profile.imageUrl} alt="Profile preview" className="h-10 w-10 object-cover rounded" />}
              </div>
            </div>
          </div>
        </div>

        {/* ── Resume Section ── */}
        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Resume</h3>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setResumeTab('link')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${resumeTab === 'link' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ExternalLink className="size-3" /> Google Drive Link
            </button>
            <button
              type="button"
              onClick={() => setResumeTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${resumeTab === 'upload' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Upload className="size-3" /> Upload PDF
            </button>
          </div>

          {resumeTab === 'link' ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Google Drive Share Link</label>
                <input
                  name="resumeUrl"
                  value={profile.resumeUrl || ''}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
                  className="w-full p-2 rounded bg-background border border-border text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  In Google Drive: right-click your PDF → <strong>Share</strong> → <strong>Copy link</strong>. Make sure it's set to <em>"Anyone with the link can view"</em>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-sm font-medium">Upload PDF File</label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e, 'resumeUrl')}
                  className="flex-1 p-2 rounded bg-background border border-border text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">Uploads to Vercel Blob storage.</p>
            </div>
          )}

          {/* Live Preview */}
          {showPreview && embedUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Live Preview</label>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                >
                  Open in Drive <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="rounded-xl border border-border/60 overflow-hidden bg-muted/20" style={{ height: '500px' }}>
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  title="Resume Preview"
                  allow="autoplay"
                />
              </div>
            </div>
          )}

          {!showPreview && !profile.resumeUrl && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border/50 rounded-xl text-muted-foreground gap-2">
              <FileText className="size-8 opacity-40" />
              <p className="text-sm">No resume set yet. Paste a Drive link or upload a PDF above.</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b border-border/50 pb-2">Links & URLs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Portfolio URL</label>
              <input name="portfolioUrl" value={profile.portfolioUrl || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">GitHub</label>
              <input name="github" value={profile.github || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">LinkedIn</label>
              <input name="linkedin" value={profile.linkedin || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">LeetCode</label>
              <input name="leetcode" value={profile.leetcode || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">CodeChef</label>
              <input name="codechef" value={profile.codechef || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Cal.com</label>
              <input name="calcomUrl" value={profile.calcomUrl || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
