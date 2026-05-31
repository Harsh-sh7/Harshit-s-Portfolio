"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Folder, Plus, ChevronRight, Image as ImageIcon, Edit2, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const getMediaType = (url) => {
  if (!url) return 'image';
  const ext = url.split('.').pop().toLowerCase();
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return 'zip';
  return 'image';
};

function SortableShowcaseItem({ item, idx, handleEditItemClick, handleDeleteItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `item-${idx}` });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0, position: isDragging ? 'relative' : 'static' };

  const mediaUrl = item.image || item.logoUrl;
  const mediaType = getMediaType(mediaUrl);

  return (
    <div ref={setNodeRef} style={style} className={`border border-border/50 rounded-xl bg-card overflow-hidden flex flex-col group relative ${isDragging ? 'opacity-50 shadow-lg' : ''}`}>
      <div className="h-32 bg-muted relative flex items-center justify-center">
        <div {...attributes} {...listeners} className="absolute top-2 left-2 z-10 p-1.5 bg-card/80 backdrop-blur text-foreground rounded-md shadow cursor-grab hover:bg-card">
          <GripVertical size={14} />
        </div>
        
        {mediaType === 'video' ? (
          <video src={mediaUrl} className="w-full h-full object-cover" muted playsInline />
        ) : mediaType === 'pdf' ? (
          <div className="flex flex-col items-center justify-center gap-1 text-red-500 font-medium">
            <span className="text-3xl">📄</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">PDF Document</span>
          </div>
        ) : mediaType === 'zip' ? (
          <div className="flex flex-col items-center justify-center gap-1 text-blue-500 font-medium">
            <span className="text-3xl">📦</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">ZIP Archive</span>
          </div>
        ) : (
          <img src={mediaUrl} alt={item.title || item.name} className="w-full h-full object-cover" />
        )}

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={() => handleEditItemClick(item, idx)} className="p-1.5 bg-card/80 backdrop-blur text-foreground rounded-md shadow hover:bg-card">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleDeleteItem(idx)} className="p-1.5 bg-red-500 text-white rounded-md shadow hover:bg-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-semibold text-sm">{item.title || item.name || "Untitled Photo"}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{item.description || "No description provided."}</p>
      </div>
    </div>
  );
}

function SortableFolder({ folder, editingFolderId, editingFolderName, setEditingFolderName, handleEditFolderSave, setEditingFolderId, setActiveFolder, handleDeleteFolder }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: folder._id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0, position: isDragging ? 'relative' : 'static' };

  return (
    <div 
      ref={setNodeRef} style={style}
      className={`flex flex-col items-center justify-center p-6 border border-border/50 rounded-xl bg-card hover:bg-accent/50 transition-colors group relative ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <div {...attributes} {...listeners} className="absolute top-2 left-2 p-1.5 text-muted-foreground cursor-grab hover:text-foreground">
        <GripVertical size={14} />
      </div>
      {editingFolderId === folder._id ? (
        <div className="flex flex-col gap-2 items-center w-full" onClick={e => e.stopPropagation()}>
          <input 
            autoFocus
            value={editingFolderName}
            onChange={e => setEditingFolderName(e.target.value)}
            className="w-full p-1 text-center text-sm rounded border border-border bg-background"
            onKeyDown={e => {
              if (e.key === 'Enter') handleEditFolderSave(folder._id);
              if (e.key === 'Escape') setEditingFolderId(null);
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEditFolderSave(folder._id)}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingFolderId(null)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div onClick={() => setActiveFolder(folder)} className="flex flex-col items-center w-full h-full cursor-pointer">
          <Folder className="size-12 text-primary mb-3" />
          <h4 className="font-semibold text-sm text-center">{folder.category}</h4>
          <p className="text-xs text-muted-foreground mt-1">{folder.items.length} items</p>
        </div>
      )}

      {editingFolderId !== folder._id && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingFolderId(folder._id);
              setEditingFolderName(folder.category);
            }} 
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent bg-background/80 backdrop-blur rounded-md border border-border/30 transition-colors"
            title="Edit Folder Name"
          >
            <Edit2 size={12} />
          </button>
          <button 
            type="button"
            onClick={(e) => handleDeleteFolder(folder._id, e)} 
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 bg-background/80 backdrop-blur rounded-md border border-border/30 transition-colors"
            title="Delete Folder"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ShowcaseTab() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState(null);

  // New Folder State
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  // New Item State
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImage, setItemImage] = useState(null);
  const [existingItemImage, setExistingItemImage] = useState("");
  const [itemLink, setItemLink] = useState("");
  const [itemGithub, setItemGithub] = useState("");
  const [uploading, setUploading] = useState(false);

  // Bulk Photos Grid states
  const [uploadMode, setUploadMode] = useState("single"); // "single" or "bulk"
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/showcase?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    const data = await res.json();
    if (data.success) {
      setFolders(data.data);
      if (activeFolder) {
        // Refresh active folder data
        const updatedActive = data.data.find(f => f._id === activeFolder._id);
        if (updatedActive) setActiveFolder(updatedActive);
      }
    }
    setLoading(false);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    const res = await fetch('/api/admin/showcase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newFolderName, items: [] })
    });
    if (res.ok) {
      setNewFolderName("");
      fetchFolders();
    }
  };

  const handleEditFolderSave = async (folderId) => {
    if (!editingFolderName.trim()) return;
    
    const res = await fetch('/api/admin/showcase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: folderId, category: editingFolderName })
    });
    if (res.ok) {
      setEditingFolderId(null);
      setEditingFolderName("");
      fetchFolders();
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this entire folder and all its items?")) return;
    const res = await fetch(`/api/admin/showcase?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (activeFolder?._id === id) setActiveFolder(null);
      fetchFolders();
    }
  };

  const handleUpdateLayout = async (layout) => {
    if (!activeFolder) return;
    
    const previousLayout = activeFolder.layoutType || 'card';
    
    // Optimistic UI state update
    setActiveFolder(prev => ({ ...prev, layoutType: layout }));
    setFolders(prev => prev.map(f => f._id === activeFolder._id ? { ...f, layoutType: layout } : f));

    try {
      const res = await fetch('/api/admin/showcase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeFolder._id, layoutType: layout })
      });
      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }
    } catch (err) {
      console.error("Failed to save layout type:", err);
      alert("Failed to save layout configuration: " + err.message);
      // Rollback UI state
      setActiveFolder(prev => ({ ...prev, layoutType: previousLayout }));
      setFolders(prev => prev.map(f => f._id === activeFolder._id ? { ...f, layoutType: previousLayout } : f));
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!activeFolder || bulkFiles.length === 0) return;
    setBulkUploading(true);
    setBulkProgress(0);

    try {
      const uploadedItems = [];
      for (let i = 0; i < bulkFiles.length; i++) {
        const file = bulkFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedItems.push({
            title: "",
            name: "",
            description: "",
            image: uploadData.url,
            logoUrl: uploadData.url,
            link: "",
            github: "",
            tech: []
          });
        }
        setBulkProgress(Math.round(((i + 1) / bulkFiles.length) * 100));
      }

      const updatedItems = [...activeFolder.items, ...uploadedItems];
      const res = await fetch('/api/admin/showcase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeFolder._id, items: updatedItems, layoutType: 'grid' })
      });

      if (res.ok) {
        setBulkFiles([]);
        setUploadMode("single");
        fetchFolders();
      } else {
        alert("Failed to save bulk items");
      }
    } catch (err) {
      console.error("Bulk Upload Error:", err);
      alert("Error uploading photos");
    } finally {
      setBulkUploading(false);
      setBulkProgress(0);
    }
  };

  const handleEditItemClick = (item, index) => {
    setEditingItemIndex(index);
    setItemTitle(item.title || item.name || "");
    setItemDesc(item.description || "");
    setItemLink(item.link || "");
    setItemGithub(item.github || "");
    setExistingItemImage(item.image || item.logoUrl || "");
    setItemImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditItem = () => {
    setEditingItemIndex(null);
    setItemTitle("");
    setItemDesc("");
    setItemLink("");
    setItemGithub("");
    setExistingItemImage("");
    setItemImage(null);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!activeFolder) return;
    setUploading(true);

    let imageUrl = existingItemImage;
    if (itemImage) {
      const formData = new FormData();
      formData.append('file', itemImage);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        imageUrl = uploadData.url;
      } else {
        alert("Image upload failed");
        setUploading(false);
        return;
      }
    }

    const newItem = {
      title: itemTitle,
      name: itemTitle,
      description: itemDesc,
      image: imageUrl,
      logoUrl: imageUrl,
      link: itemLink,
      github: itemGithub,
      tech: []
    };

    const updatedItems = [...activeFolder.items];
    if (editingItemIndex !== null) {
      updatedItems[editingItemIndex] = newItem;
    } else {
      updatedItems.push(newItem);
    }
    
    const res = await fetch('/api/admin/showcase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: activeFolder._id,
        items: updatedItems,
        layoutType: activeFolder.layoutType || 'card'
      })
    });

    if (res.ok) {
      cancelEditItem();
      fetchFolders();
    } else {
      alert("Failed to save item");
    }
    setUploading(false);
  };

  const handleDeleteItem = async (index) => {
    if (!activeFolder) return;
    if (!confirm("Delete this item?")) return;

    const updatedItems = [...activeFolder.items];
    updatedItems.splice(index, 1);

    const res = await fetch('/api/admin/showcase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: activeFolder._id,
        items: updatedItems,
        layoutType: activeFolder.layoutType || 'card'
      })
    });

    if (res.ok) {
      fetchFolders();
    }
  };

  const handleFoldersDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFolders((items) => {
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        const reordered = newArray.map((item, idx) => ({ id: item._id, order: idx }));
        fetch('/api/admin/showcase/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: reordered })
        });
        
        return newArray;
      });
    }
  };

  const handleItemsDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeIdx = parseInt(active.id.split('-')[1]);
      const overIdx = parseInt(over.id.split('-')[1]);
      
      const newItemsArray = arrayMove(activeFolder.items, activeIdx, overIdx);
      setActiveFolder({ ...activeFolder, items: newItemsArray });
      
      // Save items array to backend
      fetch('/api/admin/showcase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeFolder._id,
          items: newItemsArray,
          layoutType: activeFolder.layoutType || 'card'
        })
      });
    }
  };

  if (activeFolder) {
    return (
      <div className="space-y-8 max-w-5xl">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => {setActiveFolder(null); cancelEditItem();}} className="text-muted-foreground hover:text-foreground transition-colors font-medium">Showcase</button>
            <ChevronRight size={16} className="text-muted-foreground" />
            <h2 className="text-2xl font-bold">{activeFolder.category}</h2>
          </div>
          <button 
            type="button"
            onClick={(e) => handleDeleteFolder(activeFolder._id, e)}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 border border-red-500/20 cursor-pointer"
          >
            <Trash2 size={13} /> Delete Folder
          </button>
        </div>
        
        {/* Folder Layout Type Selector */}
        <div className="bg-card border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Folder Display Layout</h3>
            <p className="text-xs text-muted-foreground">Choose how visitors view this folder's contents.</p>
          </div>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => handleUpdateLayout('card')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${activeFolder.layoutType !== 'grid' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent border-border text-muted-foreground'}`}
            >
              Standard Cards
            </button>
            <button 
              type="button"
              onClick={() => handleUpdateLayout('grid')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${activeFolder.layoutType === 'grid' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent border-border text-muted-foreground'}`}
            >
              Photos Grid (Google Photos style)
            </button>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{editingItemIndex !== null ? `Edit Item in ${activeFolder.category}` : `Add Item to ${activeFolder.category}`}</h3>
            {editingItemIndex !== null && (
              <Button variant="ghost" size="sm" onClick={cancelEditItem}>Cancel Edit</Button>
            )}
          </div>

          {editingItemIndex === null && (
            <div className="flex gap-4 border-b border-border/30 pb-3 mb-5">
              <button 
                type="button" 
                onClick={() => setUploadMode("single")} 
                className={`text-sm font-semibold pb-1 border-b-2 cursor-pointer transition-all ${uploadMode === 'single' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                Upload Single Item
              </button>
              <button 
                type="button" 
                onClick={() => setUploadMode("bulk")} 
                className={`text-sm font-semibold pb-1 border-b-2 cursor-pointer transition-all ${uploadMode === 'bulk' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                Bulk Photos Upload
              </button>
            </div>
          )}

          {uploadMode === 'bulk' && editingItemIndex === null ? (
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div className="p-8 border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors rounded-xl flex flex-col items-center justify-center text-center gap-2">
                <ImageIcon className="size-8 text-muted-foreground/60" />
                <div className="text-sm font-medium">Select multiple images to upload</div>
                <p className="text-xs text-muted-foreground max-w-sm">Images will be automatically arranged in the grid layout and named after their filenames. You can select multiple files at once.</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={e => setBulkFiles(Array.from(e.target.files))} 
                  className="mt-2 text-xs border border-border rounded p-1.5 bg-background text-foreground cursor-pointer"
                  required
                />
                {bulkFiles.length > 0 && (
                  <div className="text-xs font-semibold text-primary mt-1">
                    {bulkFiles.length} photos selected ready to upload
                  </div>
                )}
              </div>
              <Button type="submit" disabled={bulkUploading || bulkFiles.length === 0}>
                {bulkUploading ? `Uploading... ${bulkProgress}%` : `Upload ${bulkFiles.length} Photos`}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Title / Name</label>
                  <input required value={itemTitle} onChange={e=>setItemTitle(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="Item Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">File / Media (Image, Video, PDF, ZIP, etc.)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="file" 
                      onChange={e=>setItemImage(e.target.files[0])} 
                      className="flex-1 p-1.5 rounded bg-background border border-border text-sm cursor-pointer" 
                      required={editingItemIndex === null && !existingItemImage} 
                    />
                    {existingItemImage && !itemImage && (
                      <div className="w-10 h-10 border border-border rounded overflow-hidden flex items-center justify-center shrink-0 bg-muted">
                        {getMediaType(existingItemImage) === 'video' ? (
                          <video src={existingItemImage} className="w-full h-full object-cover" muted />
                        ) : getMediaType(existingItemImage) === 'pdf' ? (
                          <span className="text-xl">📄</span>
                        ) : getMediaType(existingItemImage) === 'zip' ? (
                          <span className="text-xl">📦</span>
                        ) : (
                          <img src={existingItemImage} className="w-full h-full object-cover" alt="Preview" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Link (Optional)</label>
                  <input value={itemLink} onChange={e=>setItemLink(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">GitHub (Optional)</label>
                  <input value={itemGithub} onChange={e=>setItemGithub(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm" placeholder="https://github.com/..." />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea required value={itemDesc} onChange={e=>setItemDesc(e.target.value)} className="w-full p-2 rounded bg-background border border-border text-sm min-h-[80px]" placeholder="Brief description..." />
                </div>
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Saving..." : editingItemIndex !== null ? "Update Item" : "Add Item"}
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Items in {activeFolder.category}</h3>
          {activeFolder.items.length === 0 ? (
            <div className="p-4 bg-accent/50 border border-border/50 border-dashed rounded-lg text-center text-muted-foreground text-sm">
              No items yet.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemsDragEnd}>
              <SortableContext items={activeFolder.items.map((_, i) => `item-${i}`)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeFolder.items.map((item, idx) => (
                    <SortableShowcaseItem key={`item-${idx}`} item={item} idx={idx} handleEditItemClick={handleEditItemClick} handleDeleteItem={handleDeleteItem} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold mb-1">Showcase Gallery</h2>
        <p className="text-muted-foreground text-sm">Manage your showcase folders and their contents.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-4">Create New Folder</h3>
        <form onSubmit={handleCreateFolder} className="flex gap-4">
          <input 
            required 
            value={newFolderName} 
            onChange={e=>setNewFolderName(e.target.value)} 
            className="flex-1 p-2 rounded bg-background border border-border text-sm" 
            placeholder="e.g. Graphic Design, Logos, UI Kits" 
          />
          <Button type="submit" className="gap-2"><Plus size={16}/> Create Folder</Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Your Folders</h3>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 bg-accent/50 rounded-lg border border-border/50 border-dashed text-center">No folders found. Create one above.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFoldersDragEnd}>
            <SortableContext items={folders.map(f => f._id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {folders.map(folder => (
                  <SortableFolder 
                    key={folder._id} 
                    folder={folder} 
                    editingFolderId={editingFolderId}
                    editingFolderName={editingFolderName}
                    setEditingFolderName={setEditingFolderName}
                    handleEditFolderSave={handleEditFolderSave}
                    setEditingFolderId={setEditingFolderId}
                    setActiveFolder={setActiveFolder}
                    handleDeleteFolder={handleDeleteFolder}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
