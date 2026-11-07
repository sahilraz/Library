import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client.js';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Student Photo',
  value,
  onChange,
  maxSizeMB = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync internal preview if external value changes
  React.useEffect(() => {
    if (value && value !== preview) {
      setPreview(value);
    }
  }, [value]);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image size must be less than ${maxSizeMB}MB.`);
      return;
    }

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload to secure server-side endpoint
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post<{
        success: boolean;
        url: string;
        displayUrl?: string;
        message?: string;
      }>('/upload/image', formData);

      if (res.success && res.url) {
        onChange(res.url);
        setPreview(res.url);
      } else {
        throw new Error(res.message || 'Image upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo to server. Please try again.');
      // Keep local preview or reset
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5 text-xs">
      {label && <label className="font-semibold text-slate-700 block">{label}</label>}

      {preview ? (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0 shadow-xs">
            <img src={preview} alt="Student preview" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading to CDN...' : 'Photo Attached'}</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {uploading ? 'Processing secure upload...' : 'Stored and accessible'}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[11px] font-bold text-blue-600 hover:underline disabled:opacity-50"
              >
                Change Photo
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="text-[11px] font-bold text-rose-600 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-50/50"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-slate-700">
            Click to upload student photo
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            JPG, PNG or WebP up to {maxSizeMB}MB
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

