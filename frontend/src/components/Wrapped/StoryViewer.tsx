import { Volume2, VolumeOff } from "lucide-react";
import { motion, useMotionValue, useTransform } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  id: string;
  component: React.ReactNode;
  duration?: number;
  audioSrc?: string;
};

interface StoryViewerProps {
  slides: Slide[];
  setStarted: (started: boolean) => void;
}

const DEFAULT_DURATION = 5000;

export default function StoryViewer({ slides, setStarted }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);

  const progress = useMotionValue(0);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeDuration = slides[currentIndex]?.duration || DEFAULT_DURATION;

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentSlide = slides[currentIndex];

    audio.pause();
    audio.currentTime = 0;

    if (currentSlide.audioSrc) {
      audio.src = currentSlide.audioSrc;
      audio.play().catch((e) => console.warn("Audio playback failed:", e));
    } else {
      audio.removeAttribute("src");
    }
  }, [currentIndex, slides]);

  const resetSlide = () => {
    progress.set(0);
    startTimeRef.current = Date.now();
  };

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetSlide();
    } else {
      setStarted(false);
    }
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetSlide();
    }
  }, [currentIndex, slides.length]);
  useEffect(() => {
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / activeDuration) * 100, 100);

      if (newProgress >= 100) {
        progress.set(100);
        nextSlide();
      } else {
        progress.set(newProgress);
        timerRef.current = requestAnimationFrame(updateProgress);
      }
    };

    timerRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [currentIndex, nextSlide, progress, activeDuration]);

  const handlePointerUp = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      prevSlide();
    } else if (x > width * 0.7) {
      nextSlide();
    }
  };

  const handleVolumeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (muted) {
      audio.muted = false;
      setMuted(false);
    } else {
      audio.muted = true;
      setMuted(true);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <div
        className="relative w-full h-dvh md:h-[calc(100dvh-3rem)] max-w-md mx-auto"
        onPointerUp={handlePointerUp}
      >
        <button className="absolute w-12 h-12 bottom-4 right-4 rounded-full bg-black/10 z-50 flex items-center justify-center" onClick={handleVolumeToggle} onPointerUp={(e) => e.stopPropagation()}>
          {muted ? (
            <VolumeOff className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white/70" />
          )}
        </button>
        <motion.div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-4">
          {slides.map((_, index) => (
            <div
              key={slides[index].id}
              className="h-[.125rem] flex-1 rounded-full overflow-hidden bg-white/20"
            >
              <motion.div
                className="h-full bg-white"
                style={{
                  width: useTransform(progress, (p: number) =>
                    index < currentIndex
                      ? "100%"
                      : index === currentIndex
                        ? `${p}%`
                        : "0%"
                  ),
                }}
              />
            </div>
          ))}
        </motion.div>
        <motion.div
          key={currentIndex}
          className="w-full h-dvh md:h-[calc(100dvh-3rem)] bg-white/20 md:rounded-lg overflow-hidden md:outline-2 md:outline-[#1C4D8D]/20 md:shadow-lg md:shadow-[#1C4D8D]/20"
        >
          {slides[currentIndex].component}
        </motion.div>
      </div>
    </div>
  );
}
