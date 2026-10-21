import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  User,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ItemDetailModal({ isOpen, onClose, item, onInitiateClaim }) {
  const { user } = useAuth();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const photos = item.photos || [];
  const isFinder = user?.id === item.finder_id;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[36px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-modal-title"
      >
        {/* Header */}
        <div className="relative px-6 py-4 sm:px-8 sm:py-5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {item.status === 'AvailableForClaim' || !item.status || item.status === 'Available' ? 'Available for Claim' : item.status}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              {item.category}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Photos Display */}
          {photos.length > 0 ? (
            <div className="space-y-2">
              <div className="relative aspect-video sm:aspect-16/9 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <img
                  src={photos[activePhotoIndex]?.photo_url || photos[0]?.photo_url}
                  alt={item.item_name}
                  className="w-full h-full object-contain"
                />

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id || idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activePhotoIndex === idx
                          ? 'border-theme shadow-xs'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-center">
              <Tag className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No photos uploaded by the Finder for this item.</p>
            </div>
          )}

          {/* Title & Conditions */}
          <div>
            <h2 id="item-modal-title" className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {item.item_name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Condition: <strong className="text-slate-900 dark:text-white">{item.condition || 'Good'}</strong>
              </span>
              {item.color && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Color: <strong>{item.color}</strong>
                </span>
              )}
              {item.size && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Size/Spec: <strong>{item.size}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Location & Discovery Metadata */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-theme shrink-0" />
              <span>Location Found: <strong className="text-slate-900 dark:text-white">{item.location_found}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-theme shrink-0" />
              <span>Date Found: <strong>{item.date_found}</strong> {item.time_found && `at ${item.time_found}`}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4 text-theme shrink-0" />
              <span>Finder: <strong>{item.finder?.full_name || 'Anonymous Iskolar'}</strong> ({item.finder?.role_title || 'PUP Student'})</span>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Finder&apos;s Description &amp; Notes
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {item.description}
              </p>
            </div>
          )}

          {/* P2P Verification Guidance */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold">Peer-to-Peer Ownership Verification Process</p>
              <p className="leading-relaxed">
                To claim this item, click &quot;Submit Ownership Claim&quot; below. You will be prompted to supply distinct identifying proofs (passcodes, scratches, receipts, or contents). Upon Finder approval, you will coordinate mutual handover at an authorized campus Safe-Exchange Zone (Main Lobby, Library, Guard Post, or Student Plaza).
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Back to Feed
            </button>

            {isFinder ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> You posted this item
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onInitiateClaim) onInitiateClaim(item);
                }}
                className="px-6 py-2.5 rounded-full bg-theme hover:bg-theme-hover text-white text-xs sm:text-sm font-semibold transition shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Submit Ownership Claim &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
