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
const AccuracySlide = ({ userAccuracy = 48, averageCampusAccuracy = 45 }) => {
    const [view, setView] = useState<"intro" | "stats">("intro");

    const animatedCampusAccuracy = useAnimatedNumber(
        view === "intro" ? averageCampusAccuracy : 10,
        600
    );
    const animatedUserAccuracy = useAnimatedNumber(
        view === "stats" ? userAccuracy : 0,
        600
    );

    let subtext = "";
    if (userAccuracy >= 60)
        subtext = "You rank in the top 10 in terms of accuracy";
    else if (userAccuracy >= 45)
        subtext = "Your accuracy is higher than the campus average!";
    else if (userAccuracy === 0)
        subtext = "Held your ground. Consistency is key.";
    else subtext = "We come back harder in 2026!";
    useEffect(() => {
        const t = setTimeout(() => setView("stats"), 6600);
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
                            <div
                                className="text-8xl font-extrabold leading-tight tracking-tight whitespace-norwrap"
                                style={{ color: COLORS.yellow }}
                            >
                                <motion.span
                                    className="text-white"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                                >
                                    {animatedCampusAccuracy}
                                </motion.span>

                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                                >
                                    %
                                </motion.span>
                            </div>
                            <div
                                className="mt-1 text-base sm:text-lg md:text-xl font-medium tracking-wide"
                                style={{ color: "rgba(255,255,255,0.65)" }}
                            >
                                {" "}
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
                                >
                                    This is how accurate people were on AVERAGE{" "}
                                </motion.span>
                            </div>

                            <motion.h1
                                className="mt-12 text-xl font-bold tracking-tight"
                                style={{ color: "rgba(255,255,255,0.9)" }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 3.2,
                                    duration: .6,
                                    ease: "easeIn",
                                }}
                            >
                                Let's see how you did.
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
                            <div
                                className="text-8xl md:text-[9rem] font-black leading-none"
                                style={{ color: COLORS.yellow }}
                            >
                                <motion.span
                                    className="text-white"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                                >
                                    {animatedUserAccuracy}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                                >
                                    %{" "}
                                </motion.span>
                            </div>
                            <p
                                className="text-xl font-bold leading-snug tracking-wide py-4"
                                style={{ color: COLORS.muted }}
                            >
                                <span
                                    style={{
                                        color: COLORS.purple,
                                    }}
                                >
                                    <motion.span
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
                                    >
                                        {subtext}{" "}
                                    </motion.span>
                                </span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AccuracySlide;
