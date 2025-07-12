import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import classNames from "classnames";

interface Submission {
  creationTimeSeconds: number;
  verdict: string;
}

const getPastYearDates = (): string[] => {
  const today = dayjs().startOf("day");
  return Array.from({ length: 365 }).map((_, i) =>
    today.subtract(364 - i, "day").format("YYYY-MM-DD")
  );
};

const getColor = (count: number) => {
  if (count >= 10) return "bg-cyan-600";
  if (count >= 5) return "bg-cyan-400";
  if (count >= 3) return "bg-cyan-200";
  if (count >= 1) return "bg-cyan-100";
  return "bg-gray-700";
};

const computeStats = (days: string[], heatmap: Record<string, number>) => {
  const totalAll = Object.values(heatmap).reduce((sum, c) => sum + c, 0);
  let totalYear = 0,
    totalMonth = 0;
  let maxStreak = 0,
    curStreak = 0;
  let maxYearStreak = 0,
    curYearStreak = 0;
  let maxMonthStreak = 0,
    curMonthStreak = 0;

  const now = dayjs();
  const oneYearAgo = now.subtract(1, "year");
  const oneMonthAgo = now.subtract(1, "month");

  days.forEach((d) => {
    const c = heatmap[d] || 0;
    // totalAll += c;
    if (dayjs(d).isAfter(oneYearAgo)) totalYear += c;
    if (dayjs(d).isAfter(oneMonthAgo)) totalMonth += c;

    if (c > 0) {
      curStreak++;
      maxStreak = Math.max(maxStreak, curStreak);
    } else {
      curStreak = 0;
    }

    if (dayjs(d).isAfter(oneYearAgo)) {
      if (c > 0) curYearStreak++;
      else curYearStreak = 0;
      maxYearStreak = Math.max(maxYearStreak, curYearStreak);
    }

    if (dayjs(d).isAfter(oneMonthAgo)) {
      if (c > 0) curMonthStreak++;
      else curMonthStreak = 0;
      maxMonthStreak = Math.max(maxMonthStreak, curMonthStreak);
    }
  });

  return {
    totalAll,
    totalYear,
    totalMonth,
    maxStreak,
    maxYearStreak,
    maxMonthStreak,
  };
};

export default function StreakHeatmap({ handle }: { handle: string }) {
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<ReturnType<typeof computeStats> | null>(
    null
  );

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_API_BASE_URL}/account/${handle}/submissions`,
        { withCredentials: true }
      )
      .then((res) => {
        const map: Record<string, number> = {};
        (res.data as Submission[])
          .filter((s) => s.verdict === "AC")
          .forEach((s) => {
            const d = dayjs(s.creationTimeSeconds * 1000).format("YYYY-MM-DD");
            map[d] = (map[d] || 0) + 1;
          });

        const days = getPastYearDates();
        setHeatmap(map);
        setStats(computeStats(days, map));
      });
  }, [handle]);

  const days = getPastYearDates();
  // chunk into weeks of 7 days
  const weeks: string[][] = [];
  //Since each week on the heatmap starts from Sunday and ends on Saturday, get first chunk!
  const indexOfFirstSaturday = days.findIndex((day) => dayjs(day).format("ddd") === 'Sat');
  weeks.push(days.slice(0, indexOfFirstSaturday+1));
  for (let i = indexOfFirstSaturday+1; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  //Populate first week
  //Maybe change this to get the actual dates in the future
  weeks[0] = Array(7-weeks[0].length).fill(weeks[0][0]).concat(weeks[0]);

  // show label at week i if month changes from previous
  const monthNums = weeks.map((w) => dayjs(w[0]).month());
  const monthLabels = monthNums.map((m, i) =>
    i === 0 || m !== monthNums[i - 1] ? dayjs(weeks[i][0]).format("MMM") : ""
  );

  return (
    <div className="mt-10">
      <h2 className="text-white text-xl mb-4">
        Codeforces <span className="text-gray-400">Submissions</span>
      </h2>

      <div className="bg-highlight-dark p-4 rounded-lg">
        <div
          className="grid grid-flow-col text-[.5rem] md:text-xs text-gray-300 mb-1 w-full md:ml-7 md:w-[calc(100%-1.75rem)]"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
        >
          {monthLabels.map((m, i) => (
            <div key={i} className="text-center">
              {m}
            </div>
          ))}
        </div>

        <div className="flex">
          <div className="hidden md:flex flex-col justify-between text-xs text-gray-400 mr-2 w-5">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d) => (
              <div key={d} className="h-4">
                {d}
              </div>
            ))}
          </div>

          <div
            className="grid gap-[2px] w-full aspect-53/7"
            style={{
              gridTemplateRows: "repeat(7, 1fr)",
              gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
            }}
          >
            {weeks.map((week, wi) =>
              week.map((date, di) => {
                const c = heatmap[date] || 0;
                return (
                  <div
                    key={`${wi}-${di}`}
                    style={{ gridColumn: wi + 1, gridRow: di + 1 }}
                    className={classNames(
                      getColor(c),
                      "w-full h-full md:rounded-sm"
                    )}
                    title={`${date}: ${c} submission${c !== 1 ? "s" : ""}`}
                  />
                );
              })
            )}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 grid-rows-2 gap-4 text-center text-white mt-6">
            <div>
              <div className="text-xl md:text-2xl font-semibold">{stats.totalAll}</div>
              <div className="text-xs md:text-sm text-gray-400">
                problems solved for all time
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-semibold">{stats.totalYear}</div>
              <div className="text-xs md:text-sm text-gray-400">
                solved for the last year
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-semibold">{stats.totalMonth}</div>
              <div className="text-xs md:text-sm text-gray-400">
                solved for the last month
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-semibold">
                {stats.maxStreak} days
              </div>
              <div className="text-xs md:text-sm text-gray-400">in a row max</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-semibold">
                {stats.maxYearStreak} days
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                in a row for the last year
              </div>
            </div>
            <div>
              <div className="text-xl font-semibold">
                {stats.maxMonthStreak} days
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                in a row for the last month
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
