import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import { compressImage } from '../utils/imageCompressor';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../constants/itemPresets';
import {
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  MapPin,
  Tag,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function ReportLostItemModal({ isOpen, onClose, onReportCreated }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    itemName: '',
    category: ITEM_CATEGORIES[0],
    locationPreset: CAMPUS_LOCATIONS[0],
    customLocation: '',
    dateLost: new Date().toISOString().split('T')[0],
    color: '',
    size: '',
    description: '',
    agreedToHonesty: true
  });

  const [photo, setPhoto] = useState(null);
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
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setError('');

    try {
      const compressed = await compressImage(file, 1024, 0.75);
      setPhoto(compressed);
    } catch (err) {
      setError(err.message || 'Failed to process reference image.');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!user) {
      setError('Please sign in to file a lost item report.');
      return;
    }

    if (!formData.itemName.trim()) {
      setError('Please enter the name of your lost item.');
      return;
    }

    const finalLocation =
      formData.locationPreset === 'Other / Custom Location'
        ? formData.customLocation.trim()
        : formData.locationPreset;

    if (!finalLocation) {
      setError('Please specify the last known location of your item.');
      return;
    }

    if (!formData.agreedToHonesty) {
      setError('You must confirm the truthfulness of your report.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: user.id,
        itemName: formData.itemName.trim(),
        category: formData.category,
        lastKnownLocation: finalLocation,
        dateLost: formData.dateLost,
        color: formData.color.trim(),
        size: formData.size.trim(),
        description: formData.description.trim(),
        photoUrl: photo
      };

      const created = await itemService.createLostReport(payload);
      setSuccessMessage('Lost item report filed! Automated matching engine is actively scanning posts.');

      if (onReportCreated) {
        onReportCreated(created);
      }

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to file lost item report.');
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
        aria-labelledby="lost-modal-title"
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 sm:px-8 sm:py-6 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="lost-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Report a Lost Item
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-theme/10 text-theme border border-theme/20">
                  <Sparkles className="w-3 h-3" /> Auto-Match Enabled
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                File a report to receive notifications when a matching belonging is turned in by a Finder.
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
              Lost Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="e.g. Navy Blue Aquaflask (32oz), Scientific Calculator, Maroon Wallet"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme focus:ring-1 focus:ring-theme transition"
            />
          </div>

          {/* Category & Date Lost */}
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
                Date Misplaced / Lost <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.dateLost}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, dateLost: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Last Known Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Last Known Campus Location <span className="text-rose-500">*</span>
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
                placeholder="Specify precise location (e.g. Near West Staircase, 2nd Floor Lab 3)"
                className="mt-2 w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
              />
            )}
          </div>

          {/* Color & Size / Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Color (Optional)
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Dark Blue, Silver, Maroon"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Size / Brand / Model (Optional)
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g. 32oz, fx-991CW, Large"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Identifying Description &amp; Distinct Marks
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide specific details such as stickers, scratches, custom wallpapers, keychains, or specific contents that can prove you own the item..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-theme transition resize-none"
            />
          </div>

          {/* Reference Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Reference Photo (Optional)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Upload a past photo of the item, serial receipt, or similar model for visual comparison.
            </p>

            {photo ? (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800">
                <img src={photo} alt="Reference" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition shadow-xs"
                  title="Remove reference photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={compressing}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-theme dark:hover:border-theme flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-theme dark:hover:text-theme transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 text-xs font-semibold"
              >
                <Upload className="w-4 h-4" />
                <span>{compressing ? 'Optimizing Photo...' : 'Upload Reference Image'}</span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Truthfulness & Verification Notice */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When an item matching your description is posted by a Finder, you will receive an immediate in-app alert. You will then be able to submit a claim with specific proof of ownership.
            </p>

            <label className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.agreedToHonesty}
                onChange={(e) => setFormData({ ...formData, agreedToHonesty: e.target.checked })}
                className="w-4 h-4 rounded text-theme focus:ring-theme border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                I certify that this report is filed in good faith and the information is true.
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
                  <span>Filing Report...</span>
                </>
              ) : (
                <span>Submit Missing Report &rarr;</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
