import { useState, useEffect } from "react";
import {
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "motion/react";

const COLORS = {
  highlightLighter: "#919ac8",
  highlightLight: "rgba(69, 75, 104, 1)",
  highlightDark: "rgba(37, 41, 62, 1)",
  highlightDarker: "rgba(23, 39, 75, 1)",
  background: "rgba(15, 17, 26, 1)",
  red: "rgba(235, 87, 87, 1)",
  purple: "rgba(145, 154, 200, 1)",
  muted: "rgba(141, 152, 170, 1)",
  yellow: "rgba(255, 199, 39, 1)",
  cardLight: "rgba(229, 231, 242, 1)",
};

const useAnimatedNumber = (value: number, delay = 0) => {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    stiffness: 70,
    damping: 20,
  });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    const t = setTimeout(() => mv.set(value), delay);
    return () => clearTimeout(t);
  }, [value, delay, mv]);

  return rounded;
};

const Background = () => (
  <motion.div
    className="absolute inset-0 z-0"
    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
    transition={{
      duration: 30,
      repeat: Infinity,
      ease: "linear",
    }}
    style={{
      backgroundImage: `
        linear-gradient(
          120deg,
          ${COLORS.background} 30%,
          ${COLORS.highlightDarker} 45%,
          ${COLORS.highlightDark} 55%,
          ${COLORS.background} 70%
        )
      `,
      backgroundSize: "200% 200%",
    }}
  />
);

const ContestsSlide = ({ userContests = 12, avgCampusContests = 5 }) => {
  const [view, setView] = useState<"intro" | "stats">("intro");

  const diff = userContests - avgCampusContests;
  const isAbove = diff >= 0;
  const absDiff = Math.abs(diff);

  const animatedCount = useAnimatedNumber(
    view === "stats" ? userContests : 0,
    600
  );

  useEffect(() => {
    const t = setTimeout(() => setView("stats"), 3600); // intro
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Background />

      <div className="relative z-10 h-full flex items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          {view === "intro" && (
            <motion.div
              key="intro"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="space-y-4"
            >
              <motion.h1
                className="text-5xl md:text-6xl font-extrabold"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                You competed.
              </motion.h1>

              <motion.h1
                className="text-5xl md:text-6xl font-extrabold"
                style={{ color: COLORS.yellow }}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
              >
                We counted.
              </motion.h1>
            </motion.div>
          )}

          {view === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <p
                className="uppercase tracking-widest mb-2 text-sm"
                style={{ color: COLORS.muted }}
              >
                Total Contests
              </p>

              <div
                className="text-8xl md:text-[9rem] font-black leading-none"
                style={{ color: COLORS.yellow }}
              >
                <motion.span>{animatedCount}</motion.span>
              </div>

              <motion.p
                className="mt-5 text-xl md:text-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                style={{ color: COLORS.cardLight }}
              >
                That's{" "}
                {absDiff}{" "}
                <span style={{ color: isAbove ? COLORS.purple : COLORS.red }}>
                  {isAbove ? "more" : "less"}
                </span>{" "}
                than the campus average.
              </motion.p>

              <motion.p
                className="mt-7 text-2xl font-semibold"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                style={{ color: isAbove ? COLORS.yellow : COLORS.red }}
              >
                {isAbove ? "Nice." : "Push harder next year."}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContestsSlide;
