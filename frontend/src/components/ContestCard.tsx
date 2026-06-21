import { Link } from "@tanstack/react-router";

interface ContestCardProps {
  id: string;
  name: string;
  date: string;
  color: string;
  isEvent?: boolean;
  userPerf?: {
    rank: number;
    oldRating: number;
    newRating: number;
  };
}

export default function ContestCard({
  id,
  name,
  date,
  color,
  isEvent,
  userPerf,
}: ContestCardProps) {
  const diff = userPerf ? userPerf.newRating - userPerf.oldRating : null;

  if (isEvent) {
    return (
      <Link
        to="/events/leaderboard/$slug"
        params={{ slug: id }}
        search={{ view: "Global" }}
        className="w-full md:w-[350px] rounded-lg flex shadow-md overflow-hidden hover:scale-[1.015] transition-transform duration-150"
      >
        <div
          className={`${color} text-white p-4 w-1/3 flex flex-col justify-center`}
        >
          <div className="text-sm opacity-80 mb-1">Date</div>
          <div className="text-lg font-bold">{date}</div>
        </div>
        <div className="bg-highlight-dark text-white p-4 w-2/3 flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-60 mb-1">Contest</div>
            <div className="text-md font-mono mb-2">
              {name.length > 50 ? name.slice(0, 50) + "..." : name}
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            {userPerf ? (
              <>
                <span
                  className={`${
                    diff !== null && diff >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {diff !== null && diff >= 0 ? "+" : ""}
                  {diff}
                </span>
                <span className="text-gray-300">Rank #{userPerf.rank}</span>
              </>
            ) : (
              <span className="text-accent-yellow">View Leaderboard →</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/leaderboard/$slug"
      params={{ slug: id }}
      search={{ batch: undefined, level: undefined, group: undefined }}
      className="w-full md:w-[350px] rounded-lg flex shadow-md overflow-hidden hover:scale-[1.015] transition-transform duration-150"
    >
      <div
        className={`${color} text-white p-4 w-1/3 flex flex-col justify-center`}
      >
        <div className="text-sm opacity-80 mb-1">Date</div>
        <div className="text-lg font-bold">{date}</div>
      </div>
      <div className="bg-highlight-dark text-white p-4 w-2/3 flex flex-col justify-between">
        <div>
          <div className="text-sm opacity-60 mb-1">Contest</div>
          <div className="text-md font-mono mb-2">
            {name.length > 50 ? name.slice(0, 50) + "..." : name}
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          {userPerf ? (
            <>
              <span
                className={`${
                  diff !== null && diff >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {diff !== null && diff >= 0 ? "+" : ""}
                {diff}
              </span>
              <span className="text-gray-300">Rank #{userPerf.rank}</span>
            </>
          ) : (
            <span className="text-accent-yellow">View Leaderboard →</span>
          )}
        </div>
      </div>
    </Link>
  );
}
