"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";

export default function ProfileTab() {
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
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };



  if (!profile) return <div>Loading Profile...</div>;

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

        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b border-border/50 pb-2">Links & URLs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Portfolio URL</label>
              <input name="portfolioUrl" value={profile.portfolioUrl || ''} onChange={handleChange} className="w-full p-2 rounded bg-background border border-border text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Resume PDF</label>
              <div className="flex gap-2">
                <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'resumeUrl')} className="flex-1 p-2 rounded bg-background border border-border text-sm" />
                {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">View</a>}
              </div>
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
