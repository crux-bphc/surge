import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle,
  Hourglass,
  Info,
  AlertCircle,
  Lightbulb,
  Trophy,
} from "lucide-react";
import ProfileHeader from "../components/ProfileHeader";
import { useAuth } from "../context/AuthContext";
import POTDStreakHeatmap from "../components/POTDStreakHeatmap";
import LoadingIndicator from "../components/LoadingIndicator";
import type { User } from "../types/User";

export const Route = createFileRoute("/potd")({
  component: RouteComponent,
});

interface Problem {
  id: number;
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
}

interface TopSolver {
  user: User;
  solveCount: number;
}

export function RouteComponent() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solved, setSolved] = useState(false);
  const [solveCount, setSolveCount] = useState<number>(0);
  const [showTags, setShowTags] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(true);
  const [topSolver, setTopSolver] = useState<TopSolver | null>(null);
  const [loadingTop, setLoadingTop] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchTopSolver();

    fetch(`${import.meta.env.VITE_API_BASE_URL}/potd/current`)
      .then((res) => res.json())
      .then((data) => {
        setProblem(data.problem);
        setSolved(data.solved);
        setSolveCount(data.solveCount);
      })
      .catch(() => setProblem(null));
  }, []);

  const checkSolve = async () => {
    if (!problem) return;
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/potd/verify-solve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contestId: problem.contestId,
            index: problem.index,
          }),
        }
      );
      const json = await res.json();
      setMessage(json.message);
      if (res.ok) {
        setSolved(true);
        fetchTopSolver();
      }
    } catch {
      setMessage("Error checking solve");
    } finally {
      setChecking(false);
    }
  };

  const fetchTopSolver = async () => {
    setLoadingTop(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/potd/stats`
      );
      const { topSolvers } = await res.json();
      if (topSolvers.length) setTopSolver(topSolvers[0]);
    } catch {
      // ignore
    } finally {
      setLoadingTop(false);
    }
  };

  const toggleTop = () => {
    const next = !showTop;
    setShowTop(next);
    if (next && !topSolver) fetchTopSolver();
  };

  if (!problem) {
    return <LoadingIndicator />;
  }

  return (
    <div className="max-w-7xl m-auto">
      <div className="mb-8 border-b border-highlight-dark">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2 font-bold">
              Problem Of <span className="text-highlight-lighter">The Day</span>
            </h1>
            <div className="text-muted text-sm">
              A daily coding challenge to sharpen your CP skills
            </div>
          </div>
          <ProfileHeader
            cfRating={user?.cfRating || undefined}
            className="hidden md:flex"
          />
        </div>
      </div>

      <div className="mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* POTD Card */}
          <div className="flex-1 bg-highlight-dark  rounded-lg p-4 lg:p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl text-white mb-1">{problem.name}</h2>
                <div className="text-muted text-sm">
                  Contest {problem.contestId} • Problem {problem.index} • Solved
                  by <span className="text-white">{solveCount} </span>{" "}
                  {solveCount == 1 ? "person " : "people "}
                  today
                </div>
              </div>
              <button
                onClick={() => setShowTags(!showTags)}
                className="flex items-center text-xs hover:text-white transition-colors duration-200 hover:cursor-pointer"
              >
                {showTags ? (
                  <EyeOff className="w-4 h-4 mr-1" />
                ) : (
                  <Eye className="w-4 h-4 mr-1" />
                )}
                {showTags ? "Hide Tags" : "Show Tags"}
              </button>
            </div>

            {showTags && (
              <div className="mb-4">
                <div className="text-muted text-xs mb-1">Tags:</div>
                <div className="flex flex-wrap gap-3">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-highlight-light text-accent-purple px-2 py-0.5 rounded-full border border-accent-purple/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-5">
              <a
                href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-accent-purple hover:bg-accent-purple/80 text-white transition-transform duration-200 hover:scale-105 text-md"
              >
                <ExternalLink className="w-4 h-4" />
                Solve Problem
              </a>
              {solved ? (
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-md">
                  <CheckCircle className="w-4 h-4" /> Solved
                </div>
              ) : (
                <button
                  onClick={checkSolve}
                  disabled={checking}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-transform duration-200 text-md hover:cursor-pointer ${
                    checking
                      ? "bg-muted text-black cursor-not-allowed"
                      : "bg-accent-yellow hover:bg-accent-yellow/80 text-dark-background hover:scale-105"
                  }`}
                >
                  {checking ? (
                    <Hourglass className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {checking ? "Checking" : "Verify Submission"}
                </button>
              )}
            </div>

            {message && (
              <div
                className={`mt-4 p-3 rounded-lg border text-xs ${
                  /Error|failed/.test(message)
                    ? "bg-accent-red/20 border-accent-red text-accent-red"
                    : "bg-accent-yellow/20 border-accent-yellow text-accent-yellow"
                }`}
              >
                <div className="flex items-center gap-1">
                  {/Error|failed/.test(message) ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                  {message}
                </div>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="lg:w-1/3 bg-highlight-dark rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg text-white flex items-center gap-1">
                {showTop ? (
                  <Trophy className="w-5 h-5 mr-2 text-accent-yellow" />
                ) : (
                  <Lightbulb className="w-5 h-5 " />
                )}{" "}
                {showTop ? "Hall of Fame" : "How it works"}
              </h3>
              <button
                onClick={toggleTop}
                className="text-xs text-accent-yellow hover:underline hover:cursor-pointer"
              >
                {showTop ? "How to solve?" : "See Top"}
              </button>
            </div>

            {showTop ? (
              loadingTop ? (
                <LoadingIndicator />
              ) : topSolver ? (
                <div className="p-2 flex flex-col items-center gap-3 max-w-xs mx-auto">
                  <img
                    src={topSolver.user.pfpUrl}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex items-center gap-1">
                    <h4 className="text-lg font-semibold text-white">
                      {topSolver.user.name}
                    </h4>
                  </div>
                  <p className="text-base text-muted">
                    has solved{" "}
                    <span className="font-bold text-accent-yellow">
                      {topSolver.solveCount}
                    </span>{" "}
                    POTD{topSolver.solveCount > 1 ? "s" : ""}
                  </p>
                </div>
              ) : (
                <div className="text-muted text-sm">No solves yet.</div>
              )
            ) : (
              <div className="space-y-2 text-muted text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-accent-purple">1.</span>
                  <span>Click "Solve" to open the problem</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-purple">2.</span>
                  <span>Submit your solution on Codeforces</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-purple">3.</span>
                  <span>Return and click "Verify" to check your answer</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <POTDStreakHeatmap key={solved ? "solved" : "unsolved"} />
    </div>
  );
}
