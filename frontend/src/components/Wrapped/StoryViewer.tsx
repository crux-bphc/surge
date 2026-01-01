import { Volume2, VolumeOff } from "lucide-react";
import {
  motion,
  MotionValue,
  useMotionValue,
  useTransform,
} from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import IntroSlide from "./IntroSlide";
import UnmutePrompt from "./UnmutePrompt";

type Slide = {
  id: string;
  component: React.ReactNode;
  duration?: number;
  audioSrc?: string;
};

interface StoryViewerProps {
  slides: Slide[];
  introAudioSrc?: string;
}

interface ProgressBarProps {
  slides: Slide[];
  currentIndex: number;
  progress: MotionValue<number>;
}

const DEFAULT_DURATION = 5000;

function ProgressBar({ slides, currentIndex, progress }: ProgressBarProps) {
  return (
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
  );
}

export default function StoryViewer({
  slides,
  introAudioSrc,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);

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
    if (!started && audio && introAudioSrc) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = introAudioSrc;
      audio.muted = muted;
      audio.play().catch((e) => console.warn("Audio playback failed:", e));
    }

    if (started) {
      resetSlide();
      startAudio(currentIndex);
    }
  }, [started, introAudioSrc, currentIndex]);

  const resetSlide = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    progress.set(0);
    startTimeRef.current = Date.now();
  };

  const startAudio = (currentIndex: number) => {
    const audio = audioRef.current;
    if (!audio || !started) return;
    const currentSlide = slides[currentIndex];

    if (currentSlide.audioSrc) {
      audio.src = currentSlide.audioSrc;
      audio.muted = muted;
      audio.currentTime = 0;
      audio.play().catch((e) => console.warn("Audio playback failed:", e));
    } else {
      audio.removeAttribute("src");
    }
  };

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setStarted(false);
    }
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, slides.length]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setMuted((prevMuted) => {
      const isNowMuted = !prevMuted;
      audio.muted = isNowMuted;

      if (!isNowMuted) {
        if (!audio.src) {
          const src = started ? slides[currentIndex]?.audioSrc : introAudioSrc;
          if (src) audio.src = src;
        }
        audio.play().catch((e) => console.warn("Force play failed:", e));
      }

      return isNowMuted;
    });
  }, [started, introAudioSrc, currentIndex, slides]);

  //Progress bar and slide timer
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

  function handleStart() {
    setCurrentIndex(0);
    if (setStarted) setStarted(true);
    try {
      document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Error attempting to enable full-screen mode:", err);
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!started) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      prevSlide();
    } else if (x > width * 0.7) {
      nextSlide();
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    toggleMute();
  };

  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <div
        className="relative w-full h-dvh md:h-[calc(100dvh-3rem)] max-w-md mx-auto"
        onPointerUp={handlePointerUp}
      >
        <UnmutePrompt toggleMute={toggleMute} />
        <button
          className={`absolute w-12 h-12 bottom-4 right-4 rounded-full ${muted ? "bg-black/30" : "bg-black/10"} z-50 flex items-center justify-center`}
          onClick={handleVolumeClick}
          onPointerUp={(e) => e.stopPropagation()}
        >
          {muted ? (
            <VolumeOff className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white/30" />
          )}
        </button>
        {started ? (
          <>
            <ProgressBar
              slides={slides}
              currentIndex={currentIndex}
              progress={progress}
            />
            <motion.div
              key={currentIndex}
              className="w-full h-dvh md:h-[calc(100dvh-3rem)] bg-white/20 md:rounded-lg overflow-hidden md:outline-2 md:outline-[#1C4D8D]/20 md:shadow-lg md:shadow-[#1C4D8D]/20"
            >
              {slides[currentIndex].component}
            </motion.div>
          </>
        ) : (
          <IntroSlide handleStart={handleStart} />
        )}
      </div>
    </div>
  );
}
