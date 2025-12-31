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
            duration: 180,
            repeat: Infinity,
            ease: "linear",
        }}
        style={{
            backgroundColor: "#000",
            backgroundImage: `
      radial-gradient(3px 3px at 10% 20%, white 50%, transparent 0%),
      radial-gradient(1.5px 1.5px at 30% 80%, rgba(255,255,255,0.8) 50%, transparent 100%),
      radial-gradient(.5px .5px at 50% 50%, rgba(255,255,255,0.6) 50%, transparent 60%),
      radial-gradient(3px 3px at 70% 30%, rgba(255,255,255,0.9) 50%, transparent 60%),
      radial-gradient(1.5px 1.5px at 90% 70%, rgba(255,255,255,0.7) 50%, transparent 60%)`,
            backgroundSize: "300px 300px",
        }}
    />
);
const SolvesSlide = ({ userSolves = 12, totalCampusSolves = 540 }) => {
    const [view, setView] = useState<"intro" | "stats">("intro");

    const animatedTotalCount = useAnimatedNumber(
        view === "intro" ? totalCampusSolves : 0,
        600
    );
    const animatedCount = useAnimatedNumber(
        view === "stats" ? userSolves : 0,
        600
    );
    let subtext = "";
    if (userSolves >= 1100) subtext = "Your highest on campus 🙇";
    else if (userSolves >= 500) subtext = "Peak shit 🙇";
    else if (userSolves >= 200) subtext = "Bro is cooking.";
    else if (userSolves >= 100) subtext = "I see that the grind has started.";
    else if (userSolves >= 50) subtext = "Reach 100 fast bro.";
    else if (userSolves === 0) subtext = "Held your ground. Consistency is key.";
    else subtext = "Atleast you're not a sweat";

    useEffect(() => {
        const t = setTimeout(() => setView("stats"), 6600); // intro
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
                                className="text-[3.2rem] font-extrabold leading-tight tracking-tight whitespace-norwrap"
                                style={{ color: COLORS.yellow }}
                            >
                                BPHC solved{" "}
                                <motion.span
                                    className="block text-white"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                                >
                                    {animatedTotalCount}
                                </motion.span>
                                <div
                                    className="mt-1 text-xl font-medium tracking-wide"
                                    style={{ color: "rgba(255,255,255,0.65)" }}
                                >
                                    problems in 2025
                                </div>
                            </div>

                            <motion.h1
                                className="text-2xl font-bold tracking-tight"
                                style={{ color: "rgba(255,255,255,0.9)" }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 3.2,
                                    duration: .6,
                                    ease: "easeIn",
                                }}
                            >
                                That's about 20% of all problems on Codeforces
                            </motion.h1>
                        </motion.div>
                    )}

                    {view === "stats" && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 35 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex flex-col items-center space-y-12"
                        >
                            <p
                                className="uppercase tracking-widest mb-2 text-sm"
                                style={{ color: COLORS.muted }}
                            >
                                You Solved
                            </p>

                            <div
                                className="text-[9rem] font-black leading-none"
                                style={{ color: COLORS.yellow }}
                            >
                                <motion.span>{animatedCount}</motion.span>
                            </div>
                            <motion.p
                                className="text-2xl font-bold leading-snug tracking-wide"
                                style={{ color: COLORS.muted }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 1.2,
                                    duration: 0.6,
                                    ease: "easeIn",
                                }}
                            >
                                {subtext}
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SolvesSlide;
