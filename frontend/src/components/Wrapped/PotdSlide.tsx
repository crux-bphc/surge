import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react";

const COLORS = {
  yellow: "rgba(255, 199, 39, 1)",
  darkText: "#0f111a",
  mutedText: "rgba(15, 17, 26, 0.6)",
  dot: "rgba(15, 17, 26, 0.18)",
};

const DottedGridBG = () => (
  <motion.div
    className="absolute inset-0 z-0"
    animate={{
      backgroundPosition: ["0px 0px", "40px 40px"],
    }}
    transition={{
      duration: 25,
      repeat: Infinity,
      ease: "linear",
    }}
    style={{
      backgroundColor: COLORS.yellow,
      backgroundImage: `radial-gradient(${COLORS.dot} 1.2px, transparent 1.2px)`,
      backgroundSize: "24px 24px",
    }}
  />
);

const AnimatedCount = ({ potdSolveCount }: { potdSolveCount: number }) => {
  const count = useMotionValue(0);
  const roundedCount = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, potdSolveCount, {
      duration: 2,
      ease: "easeOut",
      delay: 0.5, 
    });

    return controls.stop;
  }, [potdSolveCount, count]);

  return (
    <motion.p
      className="text-7xl md:text-8xl font-black"
      style={{ color: COLORS.darkText }}
    >
      {roundedCount}
    </motion.p>
  );
};

const PotdSlide = ({ potdSolveCount = 0 }) => {
  const [view, setView] = useState<"intro" | "stats">("intro");

  const subText =
    potdSolveCount == 0 ? "New year new me surely." : potdSolveCount < 4 ? "A strong start." : "That’s discipline.";

  useEffect(() => {
    const t = setTimeout(() => setView("stats"), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <DottedGridBG />

      <div className="relative z-10 h-full flex items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          {view === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-5xl md:text-6xl font-extrabold"
                style={{ color: COLORS.darkText }}
                initial={{ y: 24 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                You showed up.
              </motion.h1>
            </motion.div>
          )}

          {view === "stats" && (
            <motion.div
              key="stats"
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p
                className="uppercase tracking-widest text-sm mb-6"
                style={{ color: COLORS.mutedText }}
              >
                Problem of the Day
              </p>

              <div className="flex flex-col items-center justify-center mb-4">
                <AnimatedCount potdSolveCount={potdSolveCount} />
                <p
                  className="text-sm uppercase tracking-wider mt-1"
                  style={{ color: COLORS.mutedText }}
                >
                  solved
                </p>
              </div>

              <motion.p
                className="text-2xl font-semibold mt-8"
                style={{ color: COLORS.darkText }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.6 }}
              >
                {subText}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PotdSlide;