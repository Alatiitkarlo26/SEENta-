import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import { compressImage } from '../utils/imageCompressor';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, ITEM_CONDITIONS } from '../constants/itemPresets';
import {
  X,
  Upload,
  Camera,
  Trash2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';

export default function PostFoundItemModal({ isOpen, onClose, onItemPosted }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    itemName: '',
    category: ITEM_CATEGORIES[0],
    locationPreset: CAMPUS_LOCATIONS[0],
    customLocation: '',
    dateFound: new Date().toISOString().split('T')[0],
    timeFound: '',
    condition: 'Good',
    color: '',
    size: '',
    description: '',
    agreedToCustody: true
  });

  const [photos, setPhotos] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photos.length + files.length > 3) {
      setError('You can upload a maximum of 3 photos per found item post.');
      return;
    }

    setCompressing(true);
    setError('');

    try {
      const compressedList = [];
      for (const file of files) {
        const compressed = await compressImage(file, 1024, 0.75);
        compressedList.push(compressed);
      }
      setPhotos((prev) => [...prev, ...compressedList]);
    } catch (err) {
      setError(err.message || 'Failed to process image.');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!user) {
      setError('Please sign in to post a found item.');
      return;
    }

    if (!formData.itemName.trim()) {
      setError('Please enter the item name or title.');
      return;
    }

    const finalLocation =
      formData.locationPreset === 'Other / Custom Location'
        ? formData.customLocation.trim()
        : formData.locationPreset;

    if (!finalLocation) {
      setError('Please specify the campus location where the item was found.');
      return;
    }

    if (!formData.agreedToCustody) {
      setError('You must agree to the safe custody pledge.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        finderId: user.id,
        itemName: formData.itemName.trim(),
        category: formData.category,
        locationFound: finalLocation,
        dateFound: formData.dateFound,
        timeFound: formData.timeFound || null,
        condition: formData.condition,
        color: formData.color.trim(),
        size: formData.size.trim(),
        description: formData.description.trim(),
        photoUrls: photos
      };

      const created = await itemService.createFoundPost(payload, photos);
      setSuccessMessage('Found item published to the PUP Biñan campus feed successfully!');

      if (onItemPosted) {
        onItemPosted(created);
      }

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to publish found item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[36px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 sm:px-8 sm:py-6 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Post a Found Item
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-theme/10 text-theme border border-theme/20">
                  P2P Custody
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Report an unattended belonging on campus so the owner can verify and claim it.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Item Name / Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="e.g. Casio fx-991CW Calculator, Black Tumbler, PUP ID"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme focus:ring-1 focus:ring-theme transition"
            />
          </div>

          {/* Category & Condition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition appearance-none cursor-pointer"
                >
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition appearance-none cursor-pointer"
              >
                {ITEM_CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campus Location Found */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Campus Location Found <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.locationPreset}
                onChange={(e) => setFormData({ ...formData, locationPreset: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition appearance-none cursor-pointer"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>

            {formData.locationPreset === 'Other / Custom Location' && (
              <input
                type="text"
                required
                value={formData.customLocation}
                onChange={(e) => setFormData({ ...formData, customLocation: e.target.value })}
                placeholder="Specify precise location (e.g. Room 304, Near Bench by Canteen)"
                className="mt-2 w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
              />
            )}
          </div>

          {/* Date & Time Found */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Date Discovered <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.dateFound}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, dateFound: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Time (Optional)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.timeFound}
                  onChange={(e) => setFormData({ ...formData, timeFound: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Color & Size Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Color (Optional)
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Maroon, Matte Black, Silver"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Size / Brand (Optional)
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g. 32oz, Medium, Casio, Apple"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Description &amp; Identifying Details
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe distinguishing marks, stickers, engravings, or any particular features that will help the owner confirm ownership..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition resize-none"
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Item Photos <span className="text-slate-400 font-normal">({photos.length}/3 photos)</span>
              </label>
              <span className="text-[11px] text-slate-500">Auto-compressed for fast loading</span>
            </div>

            {/* Photo Previews */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {photos.map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800"
                >
                  <img src={src} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md">
                      Cover Photo
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition shadow-xs"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {photos.length < 3 && (
                <button
                  type="button"
                  disabled={compressing}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-theme dark:hover:border-theme flex flex-col items-center justify-center p-3 text-slate-500 dark:text-slate-400 hover:text-theme dark:hover:text-theme transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[11px] font-semibold">
                    {compressing ? 'Optimizing...' : 'Upload Photo'}
                  </span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Safe Custody & Honesty Pledge */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold">Peer-to-Peer Safe Custody Agreement</p>
                <p className="leading-relaxed">
                  As the Finder, you hold temporary custody of this item. When an Iskolar files a claim, you will review their proof and coordinate an in-person handoff at the designated Campus Security Safe Exchange Zone.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/60 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.agreedToCustody}
                onChange={(e) => setFormData({ ...formData, agreedToCustody: e.target.checked })}
                className="w-4 h-4 rounded text-theme focus:ring-theme border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                I agree to the SEENta P2P Custody and Truthfulness Policy.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || compressing}
              className="px-6 py-2.5 rounded-full bg-theme hover:bg-theme-hover text-white text-xs sm:text-sm font-semibold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Post...</span>
                </>
              ) : (
                <span>Publish Found Item &rarr;</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
