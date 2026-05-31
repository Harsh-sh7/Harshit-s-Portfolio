"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Eye, EyeOff, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableExperience({ exp, handleEditClick, handleDelete, handleToggleVisibility }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exp._id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0, position: isDragging ? 'relative' : 'static' };

  return (
    <div ref={setNodeRef} style={style} className={`flex gap-4 p-4 border border-border/50 rounded-xl bg-card items-start ${isDragging ? 'opacity-50 shadow-lg' : ''}`}>
      <div {...attributes} {...listeners} className="flex items-center justify-center cursor-grab text-muted-foreground hover:text-foreground mt-2">
        <GripVertical size={20} />
      </div>
      {exp.logo ? (
        <img src={exp.logo} alt={exp.company} className="w-12 h-12 rounded-full object-cover bg-muted" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{exp.company.charAt(0)}</div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-foreground">{exp.title}</h4>
            <p className="text-sm font-medium text-foreground/80">{exp.company}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => handleToggleVisibility(exp)} title={exp.isVisible !== false ? "Hide from Timeline" : "Show in Timeline"} className={`p-1 transition-colors ${exp.isVisible !== false ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-foreground"}`}>
              {exp.isVisible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button onClick={() => handleEditClick(exp)} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
              <Edit2 size={16} />
            </button>
            <button onClick={() => handleDelete(exp._id)} className="text-red-500 hover:text-red-600 p-1 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 mb-2">{exp.date}</p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{exp.description}</p>
      </div>
    </div>
  );
}

export default function ExperiencesTab() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [existingLogo, setExistingLogo] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/experiences?t=${Date.now()}`);
    const data = await res.json();
    if (data.success) {
      setExperiences(data.data);
    }
    setLoading(false);
  };

  const handleEditClick = (exp) => {
    setEditingId(exp._id);
    setTitle(exp.title);
    setCompany(exp.company);
    setDate(exp.date);
    setDescription(exp.description || "");
    setExistingLogo(exp.logo || "");
    setIsVisible(exp.isVisible !== false);
    setLogoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setCompany("");
    setDate("");
    setDescription("");
    setExistingLogo("");
    setIsVisible(true);
    setLogoFile(null);
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    setUploading(true);

    let logoUrl = existingLogo;
    if (logoFile) {
      const formData = new FormData();
      formData.append('file', logoFile);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        logoUrl = uploadData.url;
      } else {
        alert("Logo upload failed");
        setUploading(false);
        return;
      }
    }

    const expData = {
      title,
      company,
      date,
      description,
      logo: logoUrl,
      isVisible
    };

    let url = '/api/admin/experiences';
    let method = 'POST';

    if (editingId) {
      method = 'PUT';
      expData._id = editingId;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expData)
    });

    if (res.ok) {
      cancelEdit();
      fetchExperiences();
    } else {
      alert("Failed to save experience");
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    const res = await fetch(`/api/admin/experiences?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchExperiences();
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExperiences((items) => {
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Save reordered array to backend
        const reordered = newArray.map((item, idx) => ({ id: item._id, order: idx }));
        fetch('/api/admin/experiences/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: reordered })
        });
        
        return newArray;
      });
    }
  };

  const handleToggleVisibility = async (exp) => {
    const res = await fetch('/api/admin/experiences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: exp._id, isVisible: exp.isVisible === false ? true : false })
    });
    if (res.ok) {
      fetchExperiences();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold mb-1">Experiences</h2>
        <p className="text-muted-foreground text-sm">Add, edit, and manage your work experiences displayed in the timeline.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{editingId ? "Edit Experience" : "Add New Experience"}</h3>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel Edit</Button>
          )}
        </div>

        <form onSubmit={handleSaveExperience} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Job Title</label>
              <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="Software Engineer" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Company</label>
              <input required value={company} onChange={e=>setCompany(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="Google" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Date Range</label>
              <input required value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="Jan 2023 - Present" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Company Logo (Optional)</label>
              <div className="flex gap-2 items-center">
                <input type="file" accept="image/*" onChange={e=>setLogoFile(e.target.files[0])} className="flex-1 p-1.5 rounded bg-background border border-border text-sm" />
                {existingLogo && !logoFile && <img src={existingLogo} className="w-10 h-10 object-cover rounded" alt="Preview" />}
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea required value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm min-h-[80px]" placeholder="What did you do there?" />
            </div>
            <div className="space-y-1 md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isVisible" checked={isVisible} onChange={e=>setIsVisible(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
              <label htmlFor="isVisible" className="text-sm font-medium">Show in Timeline</label>
            </div>
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Saving..." : editingId ? "Update Experience" : "Add Experience"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Timeline</h3>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading experiences...</div>
        ) : experiences.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 bg-accent/50 rounded-lg border border-border/50 border-dashed text-center">No experiences found. Add one above.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={experiences.map(e => e._id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-4">
                {experiences.map(exp => (
                  <SortableExperience key={exp._id} exp={exp} handleEditClick={handleEditClick} handleDelete={handleDelete} handleToggleVisibility={handleToggleVisibility} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
