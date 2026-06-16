import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageLightboxProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}

const ImageLightbox = ({ images, currentIndex, open, onOpenChange, onIndexChange }: ImageLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 0.5;

  const currentImage = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  // Reset state when image changes or dialog opens/closes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [open, currentIndex]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onIndexChange(currentIndex - 1);
    }
  }, [hasPrev, currentIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onIndexChange(currentIndex + 1);
    }
  }, [hasNext, currentIndex, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Escape":
          onOpenChange(false);
          break;
        case "+":
        case "=":
          setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
          break;
        case "-":
          setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_SCALE));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrev, handleNext, onOpenChange]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_SCALE));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((prev) => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!currentImage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-background/95 backdrop-blur-sm border-none">
        <DialogTitle className="sr-only">{currentImage.alt}</DialogTitle>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className="h-9 w-9"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className="h-9 w-9"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleReset}
            className="h-9 w-9"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Previous Button */}
        {hasPrev && (
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Next Button */}
        {hasNext && (
          <Button
            variant="secondary"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Image Container */}
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
            draggable={false}
          />
        </div>

        {/* Footer with counter and hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-sm text-muted-foreground bg-background/80 px-4 py-2 rounded-full">
          <span className="font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">← → to navigate • Scroll to zoom</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;
