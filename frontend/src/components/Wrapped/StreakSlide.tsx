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
    if (userStreak >= 20) subtext = "Peak shit 🙇";
    else if (userStreak >= 15) subtext = "That's insane!";
    else if (userStreak >= 5) subtext = "Succesful Grind.";
    else subtext = "Great start! The only way now is upwards🔥";

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
                                className="text-[2.5rem] font-extrabold leading-tight tracking-tight whitespace-norwrap flex flex-col"
                                style={{ color: COLORS.red }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                                >
                                    BPHC's longest streak was
                                </motion.span>
                                <motion.span
                                    className="text-[5rem] text-white"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 1.0, ease: "easeOut" }}
                                >
                                    {animatedTotalCount}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: .6, ease: "easeOut" }}
                                >
                                    days
                                </motion.span>
                            </div>
                            <div
                                className="mt-1 text-2xl font-medium tracking-wide py-8"
                                style={{ color: "rgba(255,255,255,0.65)" }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.8, duration: 2.6, ease: "easeOut" }}
                                >
                                    What about you?
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
                            className="flex flex-col items-center space-y-3"
                        >
                            <p
                                className="text-xl uppercase tracking-widest"
                                style={{ color: COLORS.muted }}
                            >
                                Your Longest Streak
                            </p>

                            <div
                                className="text-9xl font-black leading-none"
                                style={{ color: COLORS.yellow }}
                            >
                                <motion.span>{animatedCount}</motion.span>
                            </div>
                            <p
                                className="uppercase tracking-widest mb-2 text-xl"
                                style={{ color: COLORS.muted }}
                            >
                                days
                            </p>
                            <p
                                className="text-2xl font-bold leading-snug tracking-wide py-8 "
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
