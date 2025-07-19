import { useEffect, useState } from "react";
import axios from "axios";

interface SolvedProblem {
  name: string;
  rating?: number;
  tags: string[];
  dateSolved: Date;
  contestId?: number;
  index: string;
  verdict: string;
}

export default function CompetitiveStanding({ handle }: { handle: string }) {
  const [solved, setSolved] = useState<SolvedProblem[]>([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/account/${handle}/solved`, {
        withCredentials: true,
      })
      .then((res) => {
        setSolved(res.data);
      });
  }, [handle]);

  // Derived Stats
  const totalSolved = solved.length;

  const allTags = solved.flatMap((p) => p.tags);
  const tagCounts = allTags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const mostCommonTag =
    Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const ratedProblems = solved.filter((p) => p.rating !== undefined);
  const highestRating = Math.max(...ratedProblems.map((p) => p.rating!), 0);
  const avgRating =
    ratedProblems.length > 0
      ? Math.round(
          ratedProblems.reduce((sum, p) => sum + (p.rating ?? 0), 0) /
            ratedProblems.length
        )
      : "N/A";

  return (
    <div className="mt-6">
      <h2 className="text-white text-xl mb-4">
        Competitive <span className="text-gray-400">Standing</span>
      </h2>

      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Problems solved"
          value={totalSolved}
          img="/illustrations/completed.png"
        />
        <Card
          title="Most solved tag"
          value={mostCommonTag}
          img="/illustrations/search.png"
        />
        <Card
          title="Highest rating solved"
          value={highestRating}
          img="/illustrations/trophy.png"
        />
        <Card
          title="Avg problem rating"
          value={avgRating}
          img="/illustrations/data.png"
        />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  img,
}: {
  title: string;
  value: string | number;
  img: string;
}) {
  return (
    <div className="bg-card-light rounded-xl p-4 flex items-center justify-between shadow hover:scale-[1.01] transition-transform max-w-screen-sm">
      <div className="w-[calc(100%-6rem)]">
        <div className="text-sm text-gray-400 mb-1 underline underline-offset-auto font-bold">
          {title}
        </div>
        <div className="text-3xl font-bold text-highlight-light truncate break-all">{value}</div>
      </div>
      <img src={img} alt={title} className="h-24 w-24" />
    </div>
  );
}
