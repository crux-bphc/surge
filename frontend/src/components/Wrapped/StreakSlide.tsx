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
        animate={{ backgroundPosition: ["0% 0%", "200% 200%"] }}
        transition={{
            duration: 80,
            repeat: Infinity,
            ease: "linear",
        }}
        style={{
            backgroundColor: "#0f111a",
            backgroundImage: `
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
    `,
            backgroundSize: "60px 60px",
            boxShadow: "inset 0 0 120px rgba(145,154,200,0.15)",
        }}
    />
);
const StreakSlide = ({ userStreak = 12, highestStreak = 25 }) => {
    const [view, setView] = useState<"intro" | "stats">("intro");
    let diff = highestStreak - userStreak;
    const animatedTotalCount = useAnimatedNumber(
        view === "intro" ? highestStreak : 0,
        600
    );
    const animatedCount = useAnimatedNumber(
        view === "stats" ? userStreak : 0,
        600
    );
    let subtext = "";
    // if (diff>= 23) subtext = "Your highest on campus 🙇";
    if (diff >= 20) subtext = "Peak shit 🙇";
    else if (diff >= 15) subtext = "Tuff.";
    else if (diff >= 5) subtext = "Succesful Grind.";
    else if (diff === 0) subtext = "Held your ground. Consistency is key.";
    else subtext = "You prefer touching grass";

    useEffect(() => {
        const t = setTimeout(() => setView("stats"), 5600); // intro
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
                            className="space-y-12"
                        >
                            <div
                                className="text-[2.5rem] font-extrabold leading-tight tracking-tight whitespace-norwrap"
                                style={{ color: COLORS.red }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                                >
                                    2025's Highest Streak:{" "}
                                </motion.span>
                                <motion.span
                                    className=" text-white"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 1.0, ease: "easeOut" }}
                                >
                                    {animatedTotalCount}
                                </motion.span>{" "}
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 1.6, ease: "easeOut" }}
                                >
                                    days{" "}
                                </motion.span>
                            </div>
                            <div
                                className="mt-1 text-base sm:text-lg md:text-xl font-medium tracking-wide py-8"
                                style={{ color: "rgba(255,255,255,0.65)" }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.8, duration: 2.6, ease: "easeOut" }}
                                >
                                    Let's compare it with yours.
                                </motion.span>
                            </div>
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
                                Your Streak
                            </p>

                            <div
                                className="text-7xl md:text-[6rem] font-black leading-none"
                                style={{ color: COLORS.yellow }}
                            >
                                <motion.span>{animatedCount}</motion.span> days
                            </div>
                            <p
                                className="text-xl md:text-2xl font-bold leading-snug tracking-wide py-8 "
                                style={{ color: COLORS.muted }}
                            >
                                {subtext}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StreakSlide;
