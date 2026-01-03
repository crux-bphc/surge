import { Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function UnmutePrompt({
  toggleMute,
}: {
  toggleMute: () => void;
}) {
  const [showUnmutePrompt, setShowUnmutePrompt] = useState<boolean>(true);

  const handlePromptSelection = (enableSound: boolean) => {
    if (enableSound) {
      toggleMute(); // Turn on sound (will also force play)
    }
    setShowUnmutePrompt(false); // Close modal
  };

  return (
    <AnimatePresence>
      {showUnmutePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center md:rounded-lg"
          // Prevent clicks on the overlay from triggering slide navigation
          onPointerUp={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="p-4 bg-white/10 rounded-full">
              <Volume2 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Turn on sound?</h3>
              <p className="text-white/70 text-sm max-w-[200px]">
                This experience is designed to be viewed with audio.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <button
                onClick={() => handlePromptSelection(true)}
                className="w-full py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors"
              >
                Turn on Sound
              </button>
              <button
                onClick={() => handlePromptSelection(false)}
                className="w-full py-3 text-white/50 text-sm font-medium hover:text-white transition-colors"
              >
                No thanks
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
