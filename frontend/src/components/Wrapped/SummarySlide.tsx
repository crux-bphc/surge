import { useRef } from "react";
import { motion } from "motion/react";
import html2canvas from "html2canvas";

interface SummarySlideProps {
  wrappedData: {
    data: {
      solvedCount: number;
      accuracy: number;
      mostSolvedTags: string[];
      longestStreak: number;
      finalRating: number;
      campusRank: number;
      batchRank: number;
      monthlySolves: Array<{ month: string; label: string; solvedCount: number }>;
    };
  };
}

const COLORS = {
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#11111b",
  text: "#cdd6f4",
  subtext0: "#a6adc8",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  blue: "#89b4fa",
  mauve: "#cba6f7",
};

const Background = () => (
  <motion.div
    className="absolute inset-0 z-0 overflow-hidden"
    style={{ backgroundColor: COLORS.base }}
  >
    <motion.div
      className="absolute inset-0"
      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
      transition={{
        duration: 40,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundImage: `
          linear-gradient(135deg, ${COLORS.crust} 25%, transparent 25%),
          linear-gradient(-135deg, ${COLORS.crust} 25%, transparent 25%),
          linear-gradient(45deg, ${COLORS.mantle} 25%, transparent 25%),
          linear-gradient(
          -45deg, ${COLORS.mantle} 25%, transparent 25%)
        `,
        backgroundSize: '80px 80px',
        opacity: 0.2,
      }}
    />
  </motion.div>
);

const SummarySlide = ({ wrappedData }: SummarySlideProps) => {
  const data = wrappedData.data;
  const slideRef = useRef<HTMLDivElement>(null);

  const mostActiveMonth = data.monthlySolves.reduce(
    (maxMonth, currentMonth) =>
      currentMonth.solvedCount > maxMonth.solvedCount ? currentMonth : maxMonth,
    { month: "N/A", label: "N/A", solvedCount: -1 }
  );

  const handleShare = async () => {
    if (!slideRef.current) return;

    try {
      const canvas = await html2canvas(slideRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: COLORS.base,
      });
      const image = canvas.toDataURL("image/png");

      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "surge-wrapped.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          title: "My 2025 Surge Wrapped",
          text: `My 2025 Surge Wrapped: ${data.solvedCount} problems solved, rating ${data.finalRating}.`,
        });
      } else {
        const link = document.createElement("a");
        link.href = image;
        link.download = "surge-wrapped.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("Your Surge Wrapped image has been downloaded!");
      }
    } catch (error) {
      console.error("Error sharing or generating image:", error);
      alert("Failed to share your Surge Wrapped. Please try again.");
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      <Background />
      <div className="flex-grow relative z-10" ref={slideRef}>
        <div className="h-full flex flex-col items-center justify-center px-6 text-center py-4" style={{ color: COLORS.text }}>
          <div className="flex justify-center items-center gap-2">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg"
              style={{ color: COLORS.yellow }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Your 2025 Wrapped
            </motion.h1>
          </div>

          <motion.div
            className="w-full max-w-md rounded-lg p-4 shadow-2xl flex flex-col gap-3"
            style={{ backgroundColor: COLORS.mantle }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          >
            {/* ... rest of the content ... */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <motion.div
                className="p-4 rounded-md border transition-all"
                style={{ backgroundColor: COLORS.crust, borderColor: COLORS.blue }}
                whileHover={{ scale: 1.02, borderColor: COLORS.blue }}
              >
                <p className="text-sm" style={{ color: COLORS.subtext0 }}>Total Solved</p>
                <p className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.yellow }}>{data.solvedCount}</p>
              </motion.div>
              <motion.div
                className="p-4 rounded-md border transition-all"
                style={{ backgroundColor: COLORS.crust, borderColor: COLORS.blue }}
                whileHover={{ scale: 1.02, borderColor: COLORS.blue }}
              >
                <p className="text-sm" style={{ color: COLORS.subtext0 }}>Final Rating</p>
                <p className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.green }}>{data.finalRating}</p>
              </motion.div>
              <motion.div
                className="p-4 rounded-md border transition-all"
                style={{ backgroundColor: COLORS.crust, borderColor: COLORS.blue }}
                whileHover={{ scale: 1.02, borderColor: COLORS.blue }}
              >
                <p className="text-sm" style={{ color: COLORS.subtext0 }}>Longest Streak</p>
                <p className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.yellow }}>{data.longestStreak} days</p>
              </motion.div>
              <motion.div
                className="p-4 rounded-md border transition-all"
                style={{ backgroundColor: COLORS.crust, borderColor: COLORS.blue }}
                whileHover={{ scale: 1.02, borderColor: COLORS.blue }}
              >
                <p className="text-sm" style={{ color: COLORS.subtext0 }}>Accuracy</p>
                <p className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.yellow }}>{(data.accuracy * 100).toFixed(2)}%</p>
              </motion.div>
            </div>

            <div className="flex justify-around items-center p-4 rounded-md shadow-inner"
              style={{ backgroundColor: COLORS.crust, border: `2px solid ${COLORS.mauve}` }}
            >
              <div>
                <p className="text-sm" style={{ color: COLORS.subtext0 }}>Campus Rank</p>
                <p className="text-3xl font-bold" style={{ color: COLORS.mauve }}>{data.campusRank}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: COLORS.subtext0 }}>Batch Rank</p>
                <p className="text-3xl font-bold" style={{ color: COLORS.mauve }}>{data.batchRank}</p>
              </div>
            </div>

            <div className="p-4 rounded-md space-y-2 text-left"
              style={{ backgroundColor: COLORS.crust }}
            >
              <div className="flex flex-col justify-between items-start">
                <span className="text-sm" style={{ color: COLORS.subtext0 }}>Most Active Month</span>
                <span className="text-lg font-bold" style={{ color: COLORS.yellow }}>{mostActiveMonth.month} ({mostActiveMonth.solvedCount} solves)</span>
              </div>
              <div className="flex flex-col justify-between items-start">
                <span className="text-sm" style={{ color: COLORS.subtext0 }}>Top Tags</span>
                <span className="text-lg font-bold" style={{ color: COLORS.yellow }}>{data.mostSolvedTags.slice(0, 3).join(", ")}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="flex-shrink-0 flex justify-center py-4 relative z-20" data-html2canvas-ignore="true">
        <motion.button
          onClick={handleShare}
          className="p-3 rounded-full flex items-center justify-center"
          style={{ backgroundColor: COLORS.blue, color: COLORS.text }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-share-2"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default SummarySlide;