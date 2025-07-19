import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

type Contest = {
  id: number;
  event: string;
  host: string;
  start: string;
  duration: string;
  href: string;
};

const PLATFORM_LOGOS: Record<string, string> = {
  "codeforces.com": "/logos/codeforces.svg",
  "codechef.com": "/logos/codechef.png",
  "atcoder.jp": "/logos/atcoder.png",
};

const formatDate = (iso: string) =>
  new Date(iso.endsWith("Z") ? iso : iso + "Z").toLocaleString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

const formatDuration = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const UpcomingContests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + "/contest/upcoming")
      .then((res) => res.json())
      .then((data: Contest[]) => {
        const sorted = data
          .sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
          )
          .slice(0, 5);

        setContests(sorted);
      })
      .catch((err) => console.error("Failed to fetch contests", err));
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-white text-xl mb-4 mt-4">
        Upcoming <span className="text-gray-400">contests</span>
      </h2>

      <div className="flex space-x-6 overflow-x-auto pr-4 pb-2 sm:justify-start">
        {contests.map((c) => {
          const logo =
            PLATFORM_LOGOS[
              Object.keys(PLATFORM_LOGOS).find((key) => c.host.includes(key)) ||
                ""
            ] || "/logos/contest-default.svg";

          return (
            <div
              key={c.id}
              className="flex-none w-[330px] bg-highlight-dark rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-[1.01]"
            >
              <div className="w-full h-24 bg-gradient-to-br from-highlight-dark to-highlight-light flex items-center justify-center">
                <img
                  src={logo}
                  alt={c.host}
                  className="h-16 w-auto object-contain"
                />
              </div>

              <div className="p-5 flex flex-col h-[calc(100%-6rem)] justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{c.event}</h3>
                  <div className="mt-1 flex justify-between items-center text-sm text-gray-400">
                    <span>{c.host.replace("www.", "")}</span>
                    <span className="flex items-center gap-1">
                      <Clock
                        size={16}
                        className="inline-block text-yellow-400"
                      />
                      {formatDuration(parseInt(c.duration, 10))}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mt-4">
                    <strong>Starts:</strong> {formatDate(c.start)}
                  </p>
                </div>

                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 text-sm font-semibold px-5 py-2 rounded-full bg-accent-yellow hover:bg-yellow-500 text-highlight-darker text-center transition"
                >
                  Go to Contest →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingContests;
