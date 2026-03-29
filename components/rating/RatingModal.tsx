"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RatingModalProps {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  targetName?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { rating: number; review?: string }) => Promise<void>;
}

export function RatingModal({
  open,
  loading = false,
  error,
  targetName,
  onOpenChange,
  onSubmit,
}: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");

  const activeRating = hoveredRating || selectedRating;

  const ratingLabel = useMemo(() => {
    if (activeRating === 0) return "Pick a rating";
    if (activeRating === 1) return "Poor";
    if (activeRating === 2) return "Fair";
    if (activeRating === 3) return "Good";
    if (activeRating === 4) return "Very Good";
    return "Excellent";
  }, [activeRating]);

  const reset = () => {
    setSelectedRating(0);
    setHoveredRating(0);
    setReview("");
  };

  const handleSubmit = async () => {
    if (!selectedRating || loading) return;
    await onSubmit({ rating: selectedRating, review: review.trim() || undefined });
    reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !loading) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-[#0d0a1e] border-white/8">
        <DialogHeader>
          <DialogTitle>Rate User</DialogTitle>
          <DialogDescription>
            Share feedback for {targetName || "this user"} after your interaction.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/3 p-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={loading}
                  aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setSelectedRating(value)}
                  className="p-1 disabled:opacity-40"
                >
                  <Star
                    size={28}
                    className={cn(
                      "transition-colors",
                      activeRating >= value ? "text-amber-400 fill-amber-400" : "text-foreground/25"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-foreground/60">{ratingLabel}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60">Review (optional)</label>
            <textarea
              rows={4}
              maxLength={1000}
              value={review}
              disabled={loading}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What was your experience like?"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {error && <p className="text-xs font-medium text-rose-300">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="glass" disabled={loading} onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || selectedRating < 1}>
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
