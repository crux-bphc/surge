import { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from "motion/react";

const COLORS = {
  deepRed: '#2c0b0e', 
  brightRed: '#ff6b6b',
  white: '#ffffff',
  muted: '#dbaeb3',
  darkHighlight: '#4a1216'
};

const useAnimatedNumber = (value: number, delay: number = 0) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 40, damping: 15 }); 
  const displayValue = useTransform(springValue, (current) => Math.round(current));

  useEffect(() => {
    const t = setTimeout(() => {
      motionValue.set(value);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, motionValue]);

  return displayValue;
};

const RedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0" style={{ backgroundColor: COLORS.deepRed }} />
    
    <motion.div
      className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20"
      style={{
        background: `conic-gradient(from 0deg, transparent 0deg, ${COLORS.brightRed} 180deg, transparent 360deg)`,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />

    <motion.div
      className="absolute top-1/4 left-1/4 w-0 h-0 border-l-[50px] border-r-[50px] border-b-[100px] border-l-transparent border-r-transparent opacity-10"
      style={{ borderBottomColor: COLORS.brightRed }}
      animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-32 h-32 border-4 opacity-10"
      style={{ borderColor: COLORS.brightRed }}
      animate={{ rotate: [0, 90, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <div 
      className="absolute inset-0 opacity-20"
      style={{ 
        backgroundImage: `linear-gradient(${COLORS.darkHighlight} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.darkHighlight} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
    />
  </div>
);

const RatingsSlide = ({ initialRating = 1200, highestRating = 1650 }) => {
  const [viewState, setViewState] = useState('intro'); // 'intro' | 'stats'

  const growth = highestRating - initialRating;
  const animatedRating = useAnimatedNumber(viewState === 'stats' ? highestRating : 0, 400);

  let subtext = "";
  if (growth >= 400) subtext = "You went absolutely Super Saiyan this year.";
  else if (growth >= 200) subtext = "That is a serious climb. Respect.";
  else if (growth > 0) subtext = "Brick by brick. A solid step forward.";
  else if (growth === 0) subtext = "Held your ground. Consistency is key.";
  else subtext = "A learning year. The comeback story starts now.";

  useEffect(() => {
    const timer = setTimeout(() => {
      setViewState('stats');
    }, 4000); // 4 secs for reading the intro
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden text-white font-sans">
      <RedBackground />

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          
          {viewState === 'intro' && (
            <motion.div
              key="intro"
              className="flex flex-col items-center justify-center"
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)", transition: { duration: 0.5 } }}
            >
              <div className="overflow-hidden mb-4">
                <motion.h1 
                  className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }} // Cubic Bezier for "Snap" effect
                >
                  "Rating is just
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-8">
                <motion.h1 
                  className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter"
                  style={{ color: COLORS.brightRed }}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                >
                  a number."
                </motion.h1>
              </div>

              <motion.p 
                className="text-lg md:text-xl font-mono opacity-80"
                style={{ color: COLORS.muted }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                (So don't take this personally)
              </motion.p>
            </motion.div>
          )}

          {viewState === 'stats' && (
            <motion.div
              key="stats"
              className="flex flex-col items-center w-full"
            >
              <motion.h2 
                className="text-2xl md:text-3xl font-medium mb-6 text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Your highest rating this year
              </motion.h2>

              <motion.div 
                className="relative text-[8rem] md:text-[12rem] leading-none font-black tracking-tighter z-20"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.5 }}
              >
                <motion.span>{animatedRating}</motion.span>
                
                <motion.div 
                  className="absolute bottom-4 left-0 w-full h-4"
                  style={{ backgroundColor: COLORS.brightRed }}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                />
              </motion.div>

              <motion.div 
                className="mt-12 max-w-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.6 }}
              >
                <p className="text-xl md:text-2xl font-bold leading-snug tracking-wide" style={{ color: COLORS.muted }}>
                  {subtext}
                </p>
                <p className="text-sm mt-3 font-mono" style={{ color: COLORS.brightRed }}>
                  ({growth > 0 ? '+' : ''}{growth} rating since 1st Jan)
                </p>
              </motion.div>
              
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default RatingsSlide;