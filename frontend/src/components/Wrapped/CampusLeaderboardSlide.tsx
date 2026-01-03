import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

type LeaderboardUser = {
  id: string;
  name: string;
  campusRank: number;
  finalRating: number;
};

interface CampusLeaderboardSlideProps {
  currentUser: {
    id: string;
  };
}

const COLORS = {
  highlightLight: "rgba(69, 75, 104, 1)",
  highlightDark: "rgba(37, 41, 62, 1)",
  highlightDarker: "rgba(23, 39, 75, 1)",
  background: "rgba(15, 17, 26, 1)",
  muted: "rgba(141, 152, 170, 1)",
  yellow: "rgba(255, 199, 39, 1)",
  cardLight: "rgba(229, 231, 242, 1)",
  userHighlight: "#22c55e", 
};

const Background = () => (
  <motion.div
    className="absolute inset-0 z-0"
    style={{
      backgroundColor: COLORS.background,
      backgroundImage: `
        linear-gradient(rgba(144, 238, 144, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(144, 238, 144, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: '2rem 2rem',
    }}
    animate={{ backgroundPosition: ["0% 0%", "2rem 2rem"] }}
    transition={{
      duration: 10,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

const CampusLeaderboardSlide = ({ currentUser }: CampusLeaderboardSlideProps) => {
  const [view, setView] = useState<"intro" | "stats">("intro");
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/api/wrapped/leaderboard", {withCredentials: true});

        setLeaderboard(res.data.data);
        setIsError(false);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setView("stats"), 3000);
    return () => clearTimeout(t);
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const currentUserRanked = leaderboard.find(user => user.id === currentUser.id);
  const isUserInTop3 = top3.some(user => user.id === currentUser.id);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Background />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center text-white">
        <AnimatePresence mode="wait">
          {view === "intro" && (
            <motion.div
              key="intro"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <motion.h1
                className="text-5xl md:text-6xl font-extrabold"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Where do you stand?
              </motion.h1>
            </motion.div>
          )}

          {view === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-sm flex flex-col gap-6"
            >
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.yellow }}>Campus Top 3</h2>
              {isLoading && <p>Loading...</p>}
              {isError && <p>Could not load leaderboard.</p>}
              
              {!isLoading && !isError && leaderboard.length === 0 && (
                <p>No leaderboard data available.</p>
              )}

              <div className="space-y-3">
                {top3?.map((user) => (
                  <motion.div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ 
                      backgroundColor: user.id === currentUser.id ? COLORS.userHighlight : COLORS.highlightLight 
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center">
                      <span className="text-xl font-bold w-8" style={{ color: user.id === currentUser.id ? 'white' : COLORS.muted }}>{user.campusRank}</span>
                      <span className="font-semibold">{user.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: COLORS.yellow }}>{user.finalRating}</span>
                  </motion.div>
                ))}
              </div>

              {!isUserInTop3 && currentUserRanked && (
                <motion.div
                  key={currentUserRanked.id}
                  className="flex flex-col items-center justify-between mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <p className="text-xl font-semibold mb-2">Your Rank</p>
                  <div className="flex items-center justify-between w-full p-4 rounded-lg" style={{backgroundColor: COLORS.userHighlight}}>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold w-10 text-white">{currentUserRanked.campusRank}</span>
                      <span className="text-lg font-semibold">{currentUserRanked.name}</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: COLORS.yellow }}>{currentUserRanked.finalRating}</span>
                  </div>
                </motion.div>
              )}

              {!currentUserRanked && (
                <motion.div
                  key={currentUser.id}
                  className="flex flex-col items-center justify-between mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <p className="text-xl font-semibold mb-2">2026 is the perfect year to start your leaderboard journey!</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CampusLeaderboardSlide;