import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Trash2,
  Star,
  Check,
  Plus,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { PG } from '../../../types';

interface ManagePhotosModalProps {
  isOpen: boolean;
  pg: PG | null;
  onClose: () => void;
  onSubmit: (pgId: string, images: string[]) => Promise<void>;
}

const PRESET_PHOTOS = [
  {
    title: 'Modern Single Bedroom',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Twin Sharing Room with AC',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Executive Workstation & Desk',
    url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Rooftop Lounge & Terrace',
    url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Resident Dining & Mess',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Clean Attached Washroom',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ManagePhotosModal: React.FC<ManagePhotosModalProps> = ({
  isOpen,
  pg,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !pg) return null;

  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pg && pg.images) {
      setImages([...pg.images]);
    }
  }, [pg]);

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Process selected or dropped image files
  const processFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setUrlInput('');
  };

  const handleAddPreset = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const handleSetPrimary = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleDelete = (index: number) => {
    if (images.length <= 1) {
      alert('Your PG listing requires at least 1 photo.');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Please upload or select at least one property photo.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(pg.id, images);
      onClose();
    } catch (err) {
      console.error('Failed to update photos:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl my-8 p-5 sm:p-6 shadow-xl space-y-5 text-slate-800 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Upload & Manage Property Photos</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                  {images.length} Photos
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload room photos from your device, organize galleries, and choose your primary cover photo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Drag and Drop / Local File Upload Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-700 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">
              Click to select photos or drag & drop here
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports JPG, PNG, WEBP (Supports multiple photo uploads directly from laptop/mobile)
            </p>
          </div>

          {/* Direct URL Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="url"
              placeholder="Or paste an image web link URL (https://...)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              className="flex-1 bg-transparent text-slate-900 text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors cursor-pointer shrink-0 border border-slate-200 shadow-2xs"
            >
              Add URL
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick Property Presets (1-Click Add):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PHOTOS.map((preset, pIdx) => {
                const isAdded = images.includes(preset.url);
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleAddPreset(preset.url)}
                    disabled={isAdded}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                    }`}
                  >
                    {isAdded ? '✓ ' : '+ '}
                    {preset.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Gallery ({images.length})
              </span>
              <span className="text-[11px] text-slate-500">
                First photo is the Cover Photo displayed on search cards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden group relative flex flex-col shadow-2xs"
                >
                  <div className="relative h-36 w-full bg-slate-100">
                    <img
                      src={img}
                      alt={`Property ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Cover Photo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="absolute top-2 left-2 bg-white/90 hover:bg-slate-900 text-slate-800 hover:text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        Set as Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      title="Delete this photo"
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-rose-600 text-slate-600 hover:text-white rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ordering Controls */}
                  <div className="p-2 flex items-center justify-between bg-slate-50 text-[10px] text-slate-500 border-t border-slate-100">
                    <span>Photo #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move forward"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move backward"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Gallery...' : `Save Photos (${images.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
