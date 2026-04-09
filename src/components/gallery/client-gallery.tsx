"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Camera,
  ImageIcon,
  XCircle,
  Filter,
  Undo2,
  Play,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Photo {
  id: string;
  fileName: string;
  previewUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
  selectionStatus?: PhotoStatus;
}

type PhotoStatus = "unreviewed" | "selected" | "rejected";
type FilterTab = "unreviewed" | "selected" | "rejected" | "all";

interface SessionState {
  statuses: Record<string, PhotoStatus>;
  lastViewedIndex: number;
  timestamp: number;
}

interface ClientGalleryProps {
  albumTitle: string;
  studioName: string;
  photos: Photo[];
  albumId: string;
}

const STORAGE_KEY_PREFIX = "studiosmart_gallery_";

export function ClientGallery({
  albumTitle,
  studioName,
  photos: initialPhotos,
  albumId,
}: ClientGalleryProps) {
  const params = useParams();
  const token = params.token as string | undefined;
  const storageKey = `${STORAGE_KEY_PREFIX}${albumId}`;

  // Always start with server-safe defaults (no localStorage)
  const [statuses, setStatuses] = useState<Record<string, PhotoStatus>>(() => {
    const initial: Record<string, PhotoStatus> = {};
    initialPhotos.forEach((p) => {
      initial[p.id] = p.selectionStatus || "unreviewed";
    });
    return initial;
  });

  const [activeTab, setActiveTab] = useState<FilterTab>("unreviewed");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [undoStack, setUndoStack] = useState<Array<{ id: string; prevStatus: PhotoStatus }>>([]);
  const [fadeOutIds, setFadeOutIds] = useState<Set<string>>(new Set());
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  // Load session from localStorage AFTER hydration (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) { setSessionLoaded(true); return; }
      const session: SessionState = JSON.parse(raw);
      // Expire after 7 days
      if (Date.now() - session.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(storageKey);
        setSessionLoaded(true);
        return;
      }
      // Restore statuses from session
      setStatuses((prev) => {
        const merged = { ...prev };
        for (const id of Object.keys(merged)) {
          if (session.statuses[id]) {
            merged[id] = session.statuses[id];
          }
        }
        return merged;
      });
      if (session.lastViewedIndex > 0) {
        setShowResumePrompt(true);
      }
    } catch { /* ignore */ }
    setSessionLoaded(true);
  }, [storageKey]);

  // Persist session to localStorage
  useEffect(() => {
    if (!sessionLoaded) return; // Don't save until we've loaded first
    const session: SessionState = {
      statuses,
      lastViewedIndex: lightboxIndex ?? 0,
      timestamp: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(session));
  }, [statuses, lightboxIndex, storageKey, sessionLoaded]);

  // Calculate counts
  const counts = useMemo(() => {
    const c = { unreviewed: 0, selected: 0, rejected: 0, all: initialPhotos.length };
    Object.values(statuses).forEach((s) => {
      if (s === "unreviewed") c.unreviewed++;
      else if (s === "selected") c.selected++;
      else if (s === "rejected") c.rejected++;
    });
    return c;
  }, [statuses, initialPhotos.length]);

  // Filtered photos based on active tab
  const filteredPhotos = useMemo(() => {
    if (activeTab === "all") return initialPhotos;
    return initialPhotos.filter((p) => statuses[p.id] === activeTab);
  }, [initialPhotos, statuses, activeTab]);

  const isLightboxOpen = lightboxIndex !== null;
  const currentPhoto = isLightboxOpen ? filteredPhotos[lightboxIndex] : null;

  // Progress percentage
  const reviewedPercent = Math.round(
    ((counts.selected + counts.rejected) / counts.all) * 100
  );

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isLightboxOpen]);


  // API call to persist selection
  const syncSelection = useCallback(
    async (photoId: string, selectionState: boolean | null) => {
      try {
        const res = await fetch("/api/selections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoId,
            isSelected: selectionState,
            ...(token && { token }),
          }),
        });
        if (!res.ok) throw new Error("Failed");
      } catch {
        // Silently fail — local state is the source of truth for the session
        console.error("Failed to sync selection for", photoId);
      }
    },
    [token]
  );

  const updateStatus = useCallback(
    (photoId: string, newStatus: PhotoStatus) => {
      setStatuses((prev) => {
        const prevStatus = prev[photoId];
        // Push to undo stack
        setUndoStack((us) => [...us.slice(-20), { id: photoId, prevStatus }]);
        return { ...prev, [photoId]: newStatus };
      });

      // Sync to server
      if (newStatus === "selected") syncSelection(photoId, true);
      else if (newStatus === "rejected") syncSelection(photoId, false);
      else if (newStatus === "unreviewed") syncSelection(photoId, null);
    },
    [syncSelection]
  );

  const handleSelect = useCallback(() => {
    if (!currentPhoto || isActioning) return;
    setIsActioning(true);
    const isAlreadySelected = statuses[currentPhoto.id] === "selected";
    
    if (isAlreadySelected) {
      updateStatus(currentPhoto.id, "unreviewed");
      toast("Moved back to unreviewed", { icon: "↩️" });
    } else {
      updateStatus(currentPhoto.id, "selected");
      toast.success("Photo selected ✨");
    }
    
    setIsActioning(false);
    // Auto-advance after a short delay if not already selected
    if (!isAlreadySelected) {
      setTimeout(() => navigateNext(), 300);
    }
  }, [currentPhoto, statuses, updateStatus, isActioning]);

  const handleReject = useCallback(() => {
    if (!currentPhoto || isActioning) return;
    setIsActioning(true);
    updateStatus(currentPhoto.id, "rejected");
    toast("Photo skipped", { icon: "⏭️" });
    setIsActioning(false);
    // Auto-advance
    setTimeout(() => {
      // If this was the last photo in the filtered list, close lightbox
      if (lightboxIndex !== null && lightboxIndex >= filteredPhotos.length - 1) {
        closeLightbox();
      } else {
        // Stay at same index (next photo slides in since current was rejected from filtered list)
        // Only re-render needed
      }
    }, 200);
  }, [currentPhoto, statuses, updateStatus, isActioning, lightboxIndex, filteredPhotos]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setStatuses((prev) => ({ ...prev, [last.id]: last.prevStatus }));
    // Sync undo to server
    if (last.prevStatus === "selected") syncSelection(last.id, true);
    else if (last.prevStatus === "rejected") syncSelection(last.id, false);
    else syncSelection(last.id, null);
    toast("Action undone", { icon: "↩️" });
  }, [undoStack, syncSelection]);

  // Grid: fade out rejected photos when on "unreviewed" tab
  const handleGridReject = useCallback((photoId: string) => {
    setFadeOutIds((prev) => new Set(prev).add(photoId));
    updateStatus(photoId, "rejected");
    toast("Photo skipped", { icon: "⏭️" });
    // Remove from DOM after animation
    setTimeout(() => {
      setFadeOutIds((prev) => {
        const next = new Set(prev);
        next.delete(photoId);
        return next;
      });
    }, 400);
  }, [updateStatus]);

  const handleGridSelect = useCallback((photoId: string) => {
    const isAlreadySelected = statuses[photoId] === "selected";
    if (isAlreadySelected) {
      updateStatus(photoId, "unreviewed");
      toast("Moved back to unreviewed", { icon: "↩️" });
    } else {
      updateStatus(photoId, "selected");
      toast.success("Photo selected ✨");
    }
  }, [statuses, updateStatus]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setSwipeOffset(0);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setSwipeOffset(0);
  };

  const [photoOpacity, setPhotoOpacity] = useState(1);
  const [photoScale, setPhotoScale] = useState(1);

  const navigateNext = () => {
    if (lightboxIndex === null || isTransitioning) return;
    if (lightboxIndex < filteredPhotos.length - 1) {
      setIsTransitioning(true);
      // Fade out + shrink
      setPhotoOpacity(0);
      setPhotoScale(0.92);
      setTimeout(() => {
        setLightboxIndex(lightboxIndex + 1);
        // Reset position, then fade in
        setSwipeOffset(0);
        setPhotoScale(1.04);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhotoOpacity(1);
            setPhotoScale(1);
            setIsTransitioning(false);
          });
        });
      }, 250);
    }
  };

  const navigatePrev = () => {
    if (lightboxIndex === null || isTransitioning) return;
    if (lightboxIndex > 0) {
      setIsTransitioning(true);
      setPhotoOpacity(0);
      setPhotoScale(0.92);
      setTimeout(() => {
        setLightboxIndex(lightboxIndex - 1);
        setSwipeOffset(0);
        setPhotoScale(1.04);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhotoOpacity(1);
            setPhotoScale(1);
            setIsTransitioning(false);
          });
        });
      }, 250);
    }
  };


  // Protection: Disable right-click, dragging, and common shortcuts

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleDragStart = (e: DragEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+C
      if (e.ctrlKey && (e.key === "s" || e.key === "p" || e.key === "u" || e.key === "c")) {
        e.preventDefault();
        return;
      }
      
      // Lightbox navigation
      if (!isLightboxOpen) return;
      if (e.key === "ArrowLeft") navigatePrev();
      if (e.key === "ArrowRight") navigateNext();
      if (e.key === "Escape") closeLightbox();
      if (e.key === "s" || e.key === "S") handleSelect();
      if (e.key === "x" || e.key === "X") handleReject();
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, lightboxIndex, filteredPhotos, navigateNext, navigatePrev, handleSelect, handleReject]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    
    // Only trigger horizontal swipe if movement is primarily horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
      setSwipeOffset(deltaX); // 1:1 movement feels much more responsive
      
      // Dynamic opacity & scale based on drag distance
      const progress = Math.min(Math.abs(deltaX) / (window.innerWidth * 0.5), 1);
      setPhotoOpacity(1 - progress * 0.4);
      setPhotoScale(1 - progress * 0.05);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    
    const threshold = window.innerWidth * 0.15; // Lower threshold (15%) for easier swiping
    
    if (swipeOffset < -threshold) {
      navigateNext();
    } else if (swipeOffset > threshold) {
      navigatePrev();
    } else {
      // Snap back with transition
      setSwipeOffset(0);
      setPhotoOpacity(1);
      setPhotoScale(1);
    }
    isSwiping.current = false;
  };

  const handleResumeReview = () => {
    setActiveTab("unreviewed");
    const unreviewedPhotos = initialPhotos.filter((p) => statuses[p.id] === "unreviewed");
    if (unreviewedPhotos.length > 0) {
      openLightbox(0);
    }
    setShowResumePrompt(false);
  };

  const startFreshReview = () => {
    setActiveTab("unreviewed");
    if (filteredPhotos.length > 0) openLightbox(0);
  };

  const tabs: { key: FilterTab; label: string; count: number; icon: React.ReactNode }[] = [
    { key: "unreviewed", label: "To Review", count: counts.unreviewed, icon: <Eye className="w-3.5 h-3.5" /> },
    { key: "selected", label: "Selected", count: counts.selected, icon: <Heart className="w-3.5 h-3.5" /> },
    { key: "rejected", label: "Skipped", count: counts.rejected, icon: <EyeOff className="w-3.5 h-3.5" /> },
    { key: "all", label: "All", count: counts.all, icon: <ImageIcon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div id="gallery-container" className="min-h-screen bg-[#0a0a0a] text-white no-select protected-content">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="px-4 py-3 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
                  {albumTitle}
                </h1>
                <p className="text-[11px] text-white/40 font-medium">by {studioName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {undoStack.length > 0 && !(reviewedPercent === 100 && activeTab === "selected") && (
                <button
                  onClick={handleUndo}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-colors"
                  title="Undo last action"
                >
                  <Undo2 className="w-3.5 h-3.5 text-white/60" />
                </button>
              )}
              <div className="px-3 py-1.5 bg-white/[0.06] rounded-full border border-white/[0.08] text-[11px] font-medium text-white/60">
                <span className="text-emerald-400 font-bold">{counts.selected}</span>
                <span className="mx-1">selected</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-white/40 mb-1 font-medium">
              <span>{reviewedPercent}% reviewed</span>
              <span>{counts.unreviewed} remaining</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${reviewedPercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none touch-pan-x">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border touch-manipulation active:scale-[0.96] active:opacity-70 ${
                  activeTab === tab.key
                    ? "bg-white/[0.1] border-white/[0.15] text-white"
                    : "bg-transparent border-transparent text-white/40 hover:text-white/60"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`ml-0.5 px-1.5 rounded-full text-[10px] ${
                    activeTab === tab.key
                      ? "bg-white/[0.12] text-white"
                      : "bg-white/[0.04] text-white/30"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Resume Prompt */}
      {showResumePrompt && (
        <div className="px-4 sm:px-6 pt-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <p className="text-xs text-white/60">
                <span className="text-white/80 font-medium">Welcome back!</span> You have a saved session.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResumePrompt(false)}
                className="text-[10px] px-3 py-1.5 rounded-full bg-white/[0.06] text-white/40 font-medium hover:bg-white/[0.1] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleResumeReview}
                className="text-[10px] px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold hover:bg-indigo-500/30 transition-colors border border-indigo-500/30"
              >
                Resume Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Review Button */}
      {activeTab === "unreviewed" && counts.unreviewed > 0 && !isLightboxOpen && (
        <div className="px-4 sm:px-6 pt-4 max-w-7xl mx-auto">
          <button
            onClick={startFreshReview}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:from-amber-500/20 hover:to-orange-500/20 transition-all group"
          >
            <Play className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-amber-300">
              Start Quick Review ({counts.unreviewed} photos)
            </span>
          </button>
        </div>
      )}

      {/* Photo Grid */}
      <main className="px-3 sm:px-6 py-4 max-w-7xl mx-auto">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/20 gap-4">
            <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center">
              {activeTab === "selected" ? (
                <Heart className="w-8 h-8" />
              ) : activeTab === "rejected" ? (
                <EyeOff className="w-8 h-8" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>
            <p className="text-sm font-medium">
              {activeTab === "unreviewed"
                ? "All photos reviewed! 🎉"
                : activeTab === "selected"
                ? "No photos selected yet"
                : activeTab === "rejected"
                ? "No skipped photos"
                : "No photos found"}
            </p>
            {activeTab === "unreviewed" && counts.selected > 0 && (
              <button
                onClick={() => setActiveTab("selected")}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                View your {counts.selected} selected photo{counts.selected !== 1 ? "s" : ""} →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">
            {filteredPhotos.map((photo, index) => {
              const status = statuses[photo.id];
              const isFadingOut = fadeOutIds.has(photo.id);

              return (
                <div
                  key={photo.id}
                  className={`group relative aspect-[3/4] overflow-hidden rounded-lg sm:rounded-xl bg-white/[0.03] transition-all duration-300 ${
                    isFadingOut ? "opacity-0 scale-90" : "opacity-100 scale-100"
                  }`}
                >
                  {/* Main Image — tappable */}
                  <div
                    className="w-full h-full cursor-pointer touch-manipulation select-none active:opacity-80 transition-opacity"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.fileName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Selection Badge */}
                  {status === "selected" && (
                    <div className="absolute top-2 right-2 z-10 pointer-events-none">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-white/20">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {status === "rejected" && activeTab !== "unreviewed" && (
                    <div className="absolute top-2 right-2 z-10 pointer-events-none">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/10">
                        <XIcon className="w-4 h-4 text-white/40" />
                      </div>
                    </div>
                  )}

                  {/* Border for selected */}
                  {status === "selected" && (
                    <div className="absolute inset-0 ring-2 ring-inset ring-emerald-500/50 rounded-lg sm:rounded-xl pointer-events-none" />
                  )}

                  {/* Quick action overlay buttons — hidden on mobile, hover-only on desktop */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 hidden sm:flex gap-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 bg-gradient-to-t from-black/70 to-transparent">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeTab === "unreviewed") handleGridReject(photo.id);
                        else {
                          updateStatus(photo.id, "unreviewed");
                          toast("Moved to unreviewed", { icon: "↩️" });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.15] text-white/60 hover:text-white/90 text-[10px] font-semibold transition-colors"
                    >
                      {activeTab === "unreviewed" ? (
                        <><XCircle className="w-3 h-3" /> Skip</>
                      ) : (
                        <><Undo2 className="w-3 h-3" /> Undo</>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGridSelect(photo.id);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-semibold transition-colors ${
                        status === "selected"
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${status === "selected" ? "fill-current" : ""}`} />
                      {status === "selected" ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bar */}
      {counts.selected > 0 && !isLightboxOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-[slideUp_0.3s_ease-out]">
          {reviewedPercent === 100 && activeTab === "selected" ? (
            <button
              onClick={() => {
                toast.success(`Selection submitted! ${counts.selected} photos finalized 🎉`);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 backdrop-blur-2xl border border-emerald-500/25 shadow-2xl shadow-black/40 hover:bg-emerald-500/25 transition-all active:scale-95 touch-manipulation"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">Submit Selection</span>
            </button>
          ) : (
            /* Regular Stats Bar */
            <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.1] shadow-2xl shadow-black/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">
                {counts.selected} photo{counts.selected !== 1 ? "s" : ""} selected
              </span>
              {activeTab !== "selected" && (
                <button
                  onClick={() => setActiveTab("selected")}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors ml-2 touch-manipulation active:opacity-60"
                >
                  View →
                </button>
              )}
              {reviewedPercent === 100 && activeTab !== "selected" && (
                <button
                  onClick={() => setActiveTab("selected")}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1 touch-manipulation active:opacity-60"
                >
                  Submit →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== LIGHTBOX ===== */}
      {isLightboxOpen && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col touch-none">
          {/* Lightbox Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-md">
                {lightboxIndex! + 1} / {filteredPhotos.length}
              </span>
              {statuses[currentPhoto.id] === "selected" && (
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {undoStack.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors border border-white/[0.08] touch-manipulation active:scale-90"
                >
                  <Undo2 className="w-4 h-4 text-white/60" />
                </button>
              )}
              <button
                onClick={closeLightbox}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors border border-white/[0.08] touch-manipulation active:scale-90"
              >
                <XIcon className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          {/* Photo Container with Swipe */}
          <div
            className="flex-1 flex items-center justify-center relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Desktop Navigation Arrows */}
            {lightboxIndex! > 0 && (
              <button
                onClick={navigatePrev}
                className="hidden sm:flex absolute left-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors border border-white/[0.08]"
              >
                <ChevronLeft className="w-6 h-6 text-white/70" />
              </button>
            )}
            {lightboxIndex! < filteredPhotos.length - 1 && (
              <button
                onClick={navigateNext}
                className="hidden sm:flex absolute right-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors border border-white/[0.08]"
              >
                <ChevronRight className="w-6 h-6 text-white/70" />
              </button>
            )}

            {/* The Actual Image */}
            <div
              className="w-full h-full flex items-center justify-center px-4"
              style={{
                transform: `translateX(${swipeOffset}px) scale(${photoScale})`,
                opacity: photoOpacity,
                transition: isSwiping.current
                  ? "none"
                  : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
              }}
            >
              <img
                src={currentPhoto.previewUrl || currentPhoto.thumbnailUrl}
                alt={currentPhoto.fileName}
                className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-xl select-none shadow-2xl shadow-black/50 pointer-events-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
              {/* Invisible protective overlay for mobile long-press */}
              <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-8 px-4">
            {/* Mini progress dots */}
            <div className="flex justify-center gap-1 mb-5">
              {filteredPhotos
                .slice(
                  Math.max(0, lightboxIndex! - 3),
                  Math.min(filteredPhotos.length, lightboxIndex! + 4)
                )
                .map((p, i) => {
                  const actualIndex = Math.max(0, lightboxIndex! - 3) + i;
                  return (
                    <div
                      key={p.id}
                      className={`rounded-full transition-all duration-300 ${
                        actualIndex === lightboxIndex
                          ? "w-6 h-1.5 bg-amber-400"
                          : statuses[p.id] === "selected"
                          ? "w-1.5 h-1.5 bg-emerald-400"
                          : "w-1.5 h-1.5 bg-white/20"
                      }`}
                    />
                  );
                })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-8">
              {/* Skip / Reject */}
              <button
                onClick={handleReject}
                disabled={isActioning}
                className="group flex flex-col items-center gap-1.5 touch-manipulation"
              >
                <div className="w-16 h-16 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-white/[0.06] border-2 border-white/[0.1] hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200 active:scale-75">
                  <XCircle className="w-7 h-7 text-white/50 group-hover:text-red-400 transition-colors" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                  Skip
                </span>
              </button>

              {/* Select / Heart */}
              <button
                onClick={handleSelect}
                disabled={isActioning}
                className="group flex flex-col items-center gap-1.5 touch-manipulation"
              >
                <div
                  className={`w-20 h-20 sm:w-16 sm:h-16 flex items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 ${
                    statuses[currentPhoto.id] === "selected"
                      ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30"
                      : "bg-gradient-to-br from-amber-500 to-orange-500 border-amber-400 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                  }`}
                >
                  {statuses[currentPhoto.id] === "selected" ? (
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  ) : (
                    <Heart className="w-8 h-8 text-white" />
                  )}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold ${
                    statuses[currentPhoto.id] === "selected" ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {statuses[currentPhoto.id] === "selected" ? "Selected" : "Select"}
                </span>
              </button>

              {/* Next */}
              <button
                onClick={navigateNext}
                disabled={lightboxIndex! >= filteredPhotos.length - 1}
                className="group flex flex-col items-center gap-1.5 touch-manipulation"
              >
                <div className="w-16 h-16 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-white/[0.06] border-2 border-white/[0.1] hover:border-white/20 transition-all duration-200 active:scale-75">
                  <ChevronRight className="w-7 h-7 text-white/50 group-hover:text-white/80 transition-colors" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                  Next
                </span>
              </button>
            </div>

            {/* Keyboard hint for desktop */}
            <div className="hidden sm:flex justify-center mt-4 gap-4 text-[10px] text-white/20">
              <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">S</kbd> Select</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">X</kbd> Skip</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">→</kbd> Navigate</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
