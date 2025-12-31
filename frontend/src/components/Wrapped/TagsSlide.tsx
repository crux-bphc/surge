import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

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

const TAG_COLORS = [
    "#FFC727", // yellow
    "#919AC8", // purple
    "#EB5757", // red
    "#6FCF97", // green
    "#56CCF2", // blue
];

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

const CHARS = "abcdefghijklmnopqrstuvwxyz";

const ShuffleText = ({
    text,
    duration = 700,
    className,
    style,
}: {
    text: string;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
}) => {
    const [display, setDisplay] = useState(text);

    useEffect(() => {
        const interval = 40;
        const steps = Math.floor(duration / interval);
        let frame = 0;

        const id = setInterval(() => {
            frame++;
            //  This is to control how much text is rendered - in the sense that some text stays as it is, the other text keeps shuffling
            const progress = Math.floor((frame / steps) * text.length);

            const shuffle = text
                .split("")
                .map((c, i) =>
                    i < progress ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
                )
                .join("");

            setDisplay(shuffle);

            if (frame >= steps) {
                clearInterval(id);
                setDisplay(text);
            }
        }, interval);

        return () => clearInterval(id);
    }, [text, duration]);

    return (
        <span className={className} style={style}>
            {display}
        </span>
    );
};

type TagsSlideProps = {
    highestSolvedTag: string;
    userTopTags: string[];
};

const TagsSlide = ({ highestSolvedTag, userTopTags }: TagsSlideProps) => {
    const [view, setView] = useState<"intro" | "stats">("intro");

    useEffect(() => {
        const t = setTimeout(() => setView("stats"), 5000);
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
                                className="text-5xl font-extrabold tracking-tight"
                                style={{ color: COLORS.yellow }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                                >
                                    {" "}
                                    <ShuffleText text={highestSolvedTag} duration={2200} />
                                </motion.span>{" "}
                            </div>

                            <div
                                className="mt-1 text-xl font-medium tracking-wide"
                                style={{ color: "rgba(255,255,255,0.65)" }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
                                >
                                    was the most solved tag on campus.{" "}
                                </motion.span>{" "}
                            </div>

                            <motion.h1
                                className="mt-6 text-3xl font-bold tracking-tight"
                                style={{ color: "rgba(255,255,255,0.9)" }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.6, duration: 1.4 }}
                            >
                                Your 5 most solved tags?
                            </motion.h1>
                        </motion.div>
                    )}

                    {view === "stats" && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 35 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex flex-col items-center gap-y-12"
                        >
                            <div
                                className=" mt-10
    flex flex-col gap-4
    max-w-xl md:max-w-2xl
    mx-auto
    px-4 sm:px-6
    py-6
    rounded-2xl
    bg-white/5
    backdrop-blur-sm
    border border-white/10"
                            >
                                {userTopTags.map((tag, i) => (
                                    <motion.div
                                        key={tag}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: i * 0.1,
                                            duration: 0.4,
                                        }}
                                        className="text-4xl font-bold"
                                        style={{ color: TAG_COLORS[i] }}
                                    >
                                        •<ShuffleText text={tag} duration={1300} />
                                    </motion.div>
                                ))}
                            </div>
                            <motion.p
                                className="mt-7 text-2xl font-semibold"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.6, duration: 0.6 }}
                                style={{ color: "#fff" }}
                            >
                                Interesting.{" "}
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TagsSlide;
