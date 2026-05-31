"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Globe, Edit2, Eye, EyeOff, GripVertical } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableProject({ proj, handleEditClick, handleDelete, handleToggleVisibility }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: proj._id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0, position: isDragging ? 'relative' : 'static' };

  return (
    <div ref={setNodeRef} style={style} className={`flex gap-4 p-4 border border-border/50 rounded-xl bg-card ${isDragging ? 'opacity-50 shadow-lg' : ''}`}>
      <div {...attributes} {...listeners} className="flex items-center justify-center cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical size={20} />
      </div>
      <img src={proj.image} alt={proj.title} className="w-24 h-24 object-cover rounded-md bg-muted" />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold">{proj.title}</h4>
          <div className="flex items-center gap-1">
            <button onClick={() => handleToggleVisibility(proj)} title={proj.isVisible !== false ? "Hide from Portfolio" : "Show in Portfolio"} className={`p-1 transition-colors ${proj.isVisible !== false ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-foreground"}`}>
              {proj.isVisible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button onClick={() => handleEditClick(proj)} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
              <Edit2 size={16} />
            </button>
            <button onClick={() => handleDelete(proj._id)} className="text-red-500 hover:text-red-600 p-1 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">{proj.description}</p>
        <div className="mt-auto flex gap-3">
          {proj.link && <a href={proj.link} target="_blank" className="text-muted-foreground hover:text-foreground"><Globe size={16}/></a>}
          {proj.github && <a href={proj.github} target="_blank" className="text-muted-foreground hover:text-foreground"><FiGithub size={16}/></a>}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [github, setGithub] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Case Study State
  const [subtitle, setSubtitle] = useState("");
  const [caseStudyBlocks, setCaseStudyBlocks] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/projects?t=${Date.now()}`);
    const data = await res.json();
    if (data.success) {
      setProjects(data.data);
    }
    setLoading(false);
  };

  const handleEditClick = (proj) => {
    setEditingId(proj._id);
    setTitle(proj.title);
    setDescription(proj.description);
    setLink(proj.link || "");
    setGithub(proj.github || "");
    setExistingImage(proj.image || "");
    setIsVisible(proj.isVisible !== false);
    setSubtitle(proj.caseStudy?.subtitle || "");
    setCaseStudyBlocks(proj.caseStudy?.blocks || []);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setLink("");
    setGithub("");
    setExistingImage("");
    setIsVisible(true);
    setSubtitle("");
    setCaseStudyBlocks([]);
    setImageFile(null);
  };

  const addTextBlock = () => {
    setCaseStudyBlocks(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type: "text",
        heading: "",
        content: ""
      }
    ]);
  };

  const addMediaBlock = (url = "", mediaType = "image") => {
    setCaseStudyBlocks(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type: "media",
        mediaUrl: url,
        mediaType: mediaType,
        caption: ""
      }
    ]);
  };

  const updateBlock = (id, fields) => {
    setCaseStudyBlocks(prev => 
      prev.map(block => block.id === id ? { ...block, ...fields } : block)
    );
  };

  const insertMarkdown = (blockId, syntax) => {
    const textarea = document.getElementById(`textarea-${blockId}`);
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
    
    updateBlock(blockId, { content: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  const deleteBlock = (id) => {
    setCaseStudyBlocks(prev => prev.filter(block => block.id !== id));
  };

  const moveBlock = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= caseStudyBlocks.length) return;
    const newBlocks = [...caseStudyBlocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[newIndex];
    newBlocks[newIndex] = temp;
    setCaseStudyBlocks(newBlocks);
  };

  const handleBlockFileUpload = async (e, blockId, mediaType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        updateBlock(blockId, { mediaUrl: data.url, mediaType });
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    let filePasted = false;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1 || item.type.indexOf("video") !== -1) {
        const file = item.getAsFile();
        if (!file) continue;
        filePasted = true;
        
        const mediaType = item.type.indexOf("video") !== -1 ? "video" : "image";
        
        const formData = new FormData();
        formData.append("file", file);
        
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            addMediaBlock(data.url, mediaType);
          } else {
            alert("Pasted file upload failed: " + data.error);
          }
        } catch (err) {
          console.error("Paste upload error:", err);
          alert("Error uploading pasted file");
        }
      }
    }
    
    if (filePasted) {
      e.preventDefault();
      return;
    }

    const text = e.clipboardData.getData("text");
    if (text) {
      const trimmed = text.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const lower = trimmed.toLowerCase();
        const isImage = /\.(png|jpe?g|gif|webp|svg)/.test(lower);
        const isVideo = /\.(mp4|webm|ogg|mov)/.test(lower) || lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com");
        
        if (isImage) {
          e.preventDefault();
          addMediaBlock(trimmed, "image");
        } else if (isVideo) {
          e.preventDefault();
          let finalUrl = trimmed;
          if (trimmed.includes("youtube.com/watch?v=")) {
            const urlObj = new URL(trimmed);
            const videoId = urlObj.searchParams.get("v");
            if (videoId) {
              finalUrl = `https://www.youtube.com/embed/${videoId}`;
            }
          } else if (trimmed.includes("youtu.be/")) {
            const parts = trimmed.split("/");
            const videoId = parts[parts.length - 1];
            if (videoId) {
              finalUrl = `https://www.youtube.com/embed/${videoId}`;
            }
          }
          addMediaBlock(finalUrl, "video");
        }
      }
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl = existingImage;
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        imageUrl = uploadData.url;
      } else {
        alert("Image upload failed");
        setUploading(false);
        return;
      }
    }

    const projectData = {
      title,
      description,
      link,
      github,
      image: imageUrl,
      isVisible,
      caseStudy: {
        subtitle,
        blocks: caseStudyBlocks
      }
    };

    let url = '/api/admin/projects';
    let method = 'POST';

    if (editingId) {
      method = 'PUT';
      projectData._id = editingId;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });

    if (res.ok) {
      cancelEdit();
      fetchProjects();
    } else {
      alert("Failed to save project");
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchProjects();
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        const reordered = newArray.map((item, idx) => ({ id: item._id, order: idx }));
        fetch('/api/admin/projects/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: reordered })
        });
        
        return newArray;
      });
    }
  };

  const handleToggleVisibility = async (proj) => {
    const res = await fetch('/api/admin/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: proj._id, isVisible: proj.isVisible === false ? true : false })
    });
    if (res.ok) {
      fetchProjects();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold mb-1">Projects</h2>
        <p className="text-muted-foreground text-sm">Add, edit, and manage the projects displayed on your portfolio.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{editingId ? "Edit Project" : "Add New Project"}</h3>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel Edit</Button>
          )}
        </div>
        
        <form onSubmit={handleSaveProject} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title</label>
              <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="Project Name" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Cover Image</label>
              <div className="flex gap-2 items-center">
                <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files[0])} className="flex-1 p-1.5 rounded bg-background border border-border text-sm" required={!editingId && !existingImage} />
                {existingImage && !imageFile && <img src={existingImage} className="w-10 h-10 object-cover rounded" alt="Preview" />}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Live Link (Optional)</label>
              <input value={link} onChange={e=>setLink(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">GitHub Link (Optional)</label>
              <input value={github} onChange={e=>setGithub(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="https://github.com/..." />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea required value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm min-h-[80px]" placeholder="Brief project description..." />
            </div>
            <div className="space-y-1 md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isVisible" checked={isVisible} onChange={e=>setIsVisible(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
              <label htmlFor="isVisible" className="text-sm font-medium">Show in Portfolio</label>
            </div>
          </div>

          {editingId && (
            <div className="border-t border-border/50 pt-6 mt-6 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-semibold text-lg">Case Study Editor (Contra Style)</h3>
                <span className="text-xs text-muted-foreground bg-muted/50 border border-border/50 px-3 py-1 rounded-full">
                  💡 Tip: Paste images/videos directly into the canvas area below!
                </span>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Case Study Subtitle / Intro Sentence</label>
                <input 
                  value={subtitle} 
                  onChange={e=>setSubtitle(e.target.value)} 
                  className="w-full p-2.5 rounded bg-background border border-border text-sm" 
                  placeholder="e.g. How we built a decentralized file sharing protocol for creative professionals."
                />
              </div>

              <div 
                onPaste={handlePaste} 
                className="border border-dashed border-border/50 rounded-xl p-5 bg-muted/10 min-h-[300px] space-y-4 relative"
              >
                <div className="text-xs text-center text-muted-foreground/60 pb-2 border-b border-border/50">
                  --- Canvas Paste & Edit Area ---
                </div>

                {caseStudyBlocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <p className="text-sm text-muted-foreground">Your case study is empty.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Add text/media blocks below, or copy-paste an image or video directly anywhere here.</p>
                  </div>
                ) : (
                  caseStudyBlocks.map((block, index) => (
                    <div key={block.id} className="bg-card border border-border/50 rounded-lg p-4 space-y-3 relative group/block">
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                          Block #{index + 1}: {block.type === 'text' ? '📝 Text Section' : '🖼️ Media / Video'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            type="button" 
                            onClick={() => moveBlock(index, 'up')} 
                            disabled={index === 0} 
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1 text-xs border border-border/50 rounded bg-background"
                          >
                            ▲
                          </button>
                          <button 
                            type="button" 
                            onClick={() => moveBlock(index, 'down')} 
                            disabled={index === caseStudyBlocks.length - 1} 
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1 text-xs border border-border/50 rounded bg-background"
                          >
                            ▼
                          </button>
                          <button 
                            type="button" 
                            onClick={() => deleteBlock(block.id)} 
                            className="text-red-500 hover:text-red-600 p-1 text-xs border border-border/50 rounded bg-background font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {block.type === 'text' ? (
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            value={block.heading} 
                            onChange={e => updateBlock(block.id, { heading: e.target.value })} 
                            placeholder="Section Title / Heading" 
                            className="w-full p-2 text-sm font-semibold rounded bg-background border border-border"
                          />
                          <div className="flex gap-2.5 items-center mb-1 bg-muted/30 p-1.5 rounded border border-border/40">
                            <button 
                              type="button" 
                              onClick={() => insertMarkdown(block.id, "bold")}
                              className="px-2.5 py-1 text-xs font-bold bg-background hover:bg-accent rounded border border-border transition-colors cursor-pointer"
                              title="Bold Text (**bold**)"
                            >
                              B
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertMarkdown(block.id, "italic")}
                              className="px-2.5 py-1 text-xs italic bg-background hover:bg-accent rounded border border-border transition-colors cursor-pointer"
                              title="Italic Text (*italic*)"
                            >
                              I
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertMarkdown(block.id, "code")}
                              className="px-2.5 py-1 text-xs font-mono bg-background hover:bg-accent rounded border border-border transition-colors cursor-pointer"
                              title="Code Text (`code`)"
                            >
                              &lt;/&gt;
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertMarkdown(block.id, "link")}
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
                            id={`textarea-${block.id}`}
                            value={block.content} 
                            onChange={e => updateBlock(block.id, { content: e.target.value })} 
                            placeholder="Write your explanation or section text here... (Supports Markdown: **bold**, *italic*, `code`, [link](url))" 
                            className="w-full p-2 text-sm rounded bg-background border border-border min-h-[100px]"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground">Type:</span>
                              <select 
                                value={block.mediaType} 
                                onChange={e => updateBlock(block.id, { mediaType: e.target.value })}
                                className="p-1 text-xs rounded bg-background border border-border"
                              >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                              </select>
                            </div>
                            
                            <input 
                              type="text" 
                              value={block.mediaUrl} 
                              onChange={e => updateBlock(block.id, { mediaUrl: e.target.value })} 
                              placeholder="Media URL (e.g. /uploads/... or YouTube embed URL)" 
                              className="w-full p-2 text-xs rounded bg-background border border-border"
                            />

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground font-medium">Or Upload file:</span>
                              <input 
                                type="file" 
                                accept={block.mediaType === 'image' ? 'image/*' : 'video/*'} 
                                onChange={e => handleBlockFileUpload(e, block.id, block.mediaType)} 
                                className="w-full p-1 text-xs rounded bg-background border border-border"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2 flex flex-col justify-between">
                            <textarea 
                              value={block.caption} 
                              onChange={e => updateBlock(block.id, { caption: e.target.value })} 
                              placeholder="Add a caption or subtitle for this media..." 
                              className="w-full p-2 text-xs rounded bg-background border border-border flex-1 min-h-[80px]"
                            />
                            
                            {block.mediaUrl && (
                              <div className="border border-border rounded overflow-hidden h-24 flex items-center justify-center bg-muted/30">
                                {block.mediaType === 'image' ? (
                                  <img src={block.mediaUrl} className="max-h-24 max-w-full object-contain" alt="Preview" />
                                ) : block.mediaUrl.includes("youtube.com") || block.mediaUrl.includes("vimeo.com") || block.mediaUrl.includes("embed") ? (
                                  <span className="text-xs text-muted-foreground">YouTube/Vimeo Video Embed</span>
                                ) : (
                                  <video src={block.mediaUrl} className="max-h-24 max-w-full object-contain" controls />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                <div className="flex flex-wrap gap-3 pt-3 border-t border-border/50 justify-center">
                  <button 
                    type="button" 
                    onClick={addTextBlock} 
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-xs rounded-md font-medium border border-border flex items-center gap-1.5 transition-colors"
                  >
                    📝 Add Text Section
                  </button>
                  <button 
                    type="button" 
                    onClick={() => addMediaBlock("", "image")} 
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-xs rounded-md font-medium border border-border flex items-center gap-1.5 transition-colors"
                  >
                    🖼️ Add Media Block
                  </button>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={uploading}>
            {uploading ? "Saving..." : editingId ? "Update Project" : "Add Project"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Existing Projects</h3>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 bg-accent/50 rounded-lg border border-border/50 border-dashed text-center">No projects found. Add one above.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={projects.map(p => p._id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(proj => (
                  <SortableProject key={proj._id} proj={proj} handleEditClick={handleEditClick} handleDelete={handleDelete} handleToggleVisibility={handleToggleVisibility} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
