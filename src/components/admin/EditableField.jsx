"use client";

import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function EditableField({ 
  value, 
  apiEndpoint,
  fieldKey,
  type = "text", 
  multiline = false, 
  className = "",
  renderComponent 
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document.cookie.includes('admin_auth=true')) {
      setIsAdmin(true);
    }
  }, []);

  const handleSave = async () => {
    if (!apiEndpoint || !fieldKey) return;
    setIsSaving(true);
    try {
      const res = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldKey]: currentValue })
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh(); // Refresh page to show updated server components
      } else {
        alert("Failed to save");
      }
    } catch (e) {
      alert("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    if (renderComponent) return renderComponent(value);
    return <span className={className}>{value}</span>;
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-2 border border-primary/50 bg-background rounded z-50 relative min-w-[200px]">
        {multiline ? (
          <textarea 
            className="p-2 border rounded text-sm text-foreground bg-background min-h-[100px] w-full"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
        ) : (
          <input 
            type={type}
            className="p-2 border rounded text-sm text-foreground bg-background w-full"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            setCurrentValue(value);
            setIsEditing(false);
          }}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative inline-block ${className}`}>
      {renderComponent ? renderComponent(value) : value}
      <button 
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
        }}
        className="absolute -top-3 -right-3 p-1.5 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
      >
        <Pencil size={12} />
      </button>
    </div>
  );
}
