import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import ProfileHeader from "../../components/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import LoadingIndicator from "../../components/LoadingIndicator";
import ContestCard from "../../components/ContestCard";
import { ArrowLeft, Trophy } from "lucide-react";
import { getRatingLevel } from "../../utils";
import type { Leaderboard } from "../../types/leaderboard";
import LeaderboardHeader from "../../components/LeaderboardHeader";

export const Route = createFileRoute("/events/$slug")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      batch: typeof search.batch === "string" ? search.batch : undefined,
      group: typeof search.group === "string" ? search.group : undefined,
      view: typeof search.view === "string" ? search.view : undefined,
    };
  },
});

const eventContests: Record<
  string,
  { id: string; name: string; date: string }[]
> = {
  socc: [
    { id: "1", name: "Summer of CC - Contest 1", date: "May 31" },
    { id: "2", name: "Summer of CC - Contest 2", date: "June 7" },
  ],
};

const COLORS = ["bg-green-500", "bg-blue-500", "bg-pink-500", "bg-purple-500"];

type UserRatingChange = {
  contestId: number;
  rank: number;
  oldRating: number;
  newRating: number;
};

const mockData: Record<string, any[]> = {
  "1": [
    {
      id: "u1",
      name: "Aaryan Mehta",
      cfHandle: "nebulaboy",
      pfpUrl: "",
      batch: "2024",
      cfRating: 2000,
      score: 500,
      groupName: "A",
    },
    {
      id: "u2",
      name: "Aaryan Mehta2",
      cfHandle: "nebulaboy2",
      pfpUrl: "",
      batch: "2024",
      cfRating: 2000,
      score: 500,
      groupName: "B",
    },
    {
      id: "u3",
      name: "Aaryan Mehta3",
      cfHandle: "nebulaboy3",
      pfpUrl: "",
      batch: "2024",
      cfRating: 2000,
      score: 500,
      groupName: "C",
    },
    {
      id: "u4",
      name: "Aaryan Mehta4",
      cfHandle: "nebulaboy4",
      pfpUrl: "",
      batch: "2024",
      cfRating: 2000,
      score: 500,
      groupName: "D",
    },
    {
      id: "u5",
      name: "Proteus",
      cfHandle: "Proteus26",
      pfpUrl: "",
      batch: "2024",
      cfRating: 50,
      score: 200,
      groupName: "A",
    },
  ],
  "2": [
    {
      id: "u1",
      name: "Aaryan Mehta",
      cfHandle: "nebulaboy",
      pfpUrl: "",
      batch: "2024",
      cfRating: 2000,
      score: 500,
      groupName: "A",
    },
    {
      id: "u2",
      name: "Aaryan Mehta2",
      cfHandle: "nebulaboy2",
      pfpUrl: "",
      batch: "2024",
      cfRating: 2000,
      score: 500,
      groupName: "B",
    },
    {
      id: "u3",
      name: "Aaryan Mehta3",
      cfHandle: "nebulaboy3",
      pfpUrl: "",
      batch: "2024",
      cfRating: 2000,
      score: 500,
      groupName: "C",
    },
    {
      id: "u4",
      name: "Aaryan Mehta4",
      cfHandle: "nebulaboy4",
      pfpUrl: "",
      batch: "2024",
      cfRating: 2000,
      score: 500,
      groupName: "D",
    },
    {
      id: "u5",
      name: "Proteus",
      cfHandle: "Proteus26",
      pfpUrl: "",
      batch: "2024",
      cfRating: 50,
      score: 200,
      groupName: "A",
    },
    {
      id: "u6",
      name: "Proteus1",
      cfHandle: "Proteus261",
      pfpUrl: "",
      batch: "2024",
      cfRating: 50,
      score: 200,
      groupName: "A",
    },
    {
      id: "u7",
      name: "Proteus2",
      cfHandle: "Proteus262",
      pfpUrl: "",
      batch: "2024",
      cfRating: 50,
      score: 200,
      groupName: "A",
    },
  ],
};

function RouteComponent() {
  const { slug } = useParams({ from: "/events/$slug" });
  const { user, loading } = useAuth();
  const [userRatings, setUserRatings] = useState<
    Record<string, UserRatingChange>
  >({});
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [eventLeaderboard, setEventLeaderboard] = useState<Leaderboard[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const { view } = Route.useSearch();

  useEffect(() => {
    if (user?.cfHandle) {
      setLoadingRatings(true);
      axios
        .get(
          `${import.meta.env.VITE_API_BASE_URL}/account/${user.cfHandle}/ratings`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          const ratingsMap: Record<string, UserRatingChange> = {};
          res.data.forEach((r: UserRatingChange) => {
            ratingsMap[r.contestId.toString()] = r;
          });
          setUserRatings(ratingsMap);
        })
        .finally(() => setLoadingRatings(false));
    }
  }, [user?.cfHandle]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const contests = eventContests[slug] || [];

        const responses = await Promise.all(
          contests.map((c) =>
            axios
              .get(`${import.meta.env.VITE_API_BASE_URL}/leaderboard/${c.id}`)
              .catch((err) => {
                console.warn(
                  `Failed to fetch leaderboard for contest ${c.id}`,
                  err
                );
                return { data: [] };
              })
          )
        );

        let contestResults = responses.map((res) => res.data);

        if (slug === "socc" && contestResults.every((r) => r.length === 0)) {
          contestResults = contests.map((c) => mockData[c.id] || []);
        }

        const aggregation: Record<string, Leaderboard> = {};

        contestResults.forEach((data) => {
          (data as Leaderboard[]).forEach((entry) => {
            if (!aggregation[entry.cfHandle]) {
              aggregation[entry.cfHandle] = {
                ...entry,
                score: 0,
              };
            }
            const s = entry.score || entry.points || 0;
            aggregation[entry.cfHandle].score =
              (aggregation[entry.cfHandle].score || 0) + s;
          });
        });

        const sortedLeaderboard = Object.values(aggregation).sort(
          (a, b) => (b.score || 0) - (a.score || 0)
        );
        setEventLeaderboard(sortedLeaderboard);
      } catch (err) {
        console.error("Error processing event leaderboard:", err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [slug]);

  const currentUserGroup = useMemo(() => {
    if (!user || !eventLeaderboard.length) return null;
    const userEntry = eventLeaderboard.find(
      (e) => e.id === user.id || e.cfHandle === user.cfHandle
    );
    return userEntry?.groupName || null;
  }, [user, eventLeaderboard]);

  const filteredLeaderboard = useMemo(() => {
    if (view === "My Group") {
      return eventLeaderboard.filter(
        (entry) => entry.groupName === currentUserGroup
      );
    }
    return eventLeaderboard;
  }, [view, eventLeaderboard, currentUserGroup]);

  const groupRankings = useMemo(() => {
    if (view !== "Group Wise") return [];
    const aggregation: Record<
      string,
      { name: string; score: number; count: number }
    > = {};
    eventLeaderboard.forEach((entry) => {
      const g = entry.groupName || "N/A";
      if (!aggregation[g]) aggregation[g] = { name: g, score: 0, count: 0 };
      aggregation[g].score += entry.score || 0;
      aggregation[g].count += 1;
    });
    return Object.values(aggregation).sort((a, b) => b.score - a.score);
  }, [view, eventLeaderboard]);

  const batches = [
    ...new Set<string>(eventLeaderboard.map((user) => user.batch)),
  ]
    .filter((batch) => (batch ? true : false))
    .sort((a, b) => parseInt(b) - parseInt(a));

  const groups = [
    ...new Set<string>(eventLeaderboard.map((user) => user.groupName || "")),
  ].filter((g) => g !== "");

  if (loading || loadingRatings) return <LoadingIndicator />;

  const eventName = slug === "socc" ? "Summer of CC" : slug.toUpperCase();
  const contests = eventContests[slug] || [];

  return (
    <div className="max-w-7xl m-auto px-4 md:px-0">
      <div className="mb-8 border-b border-highlight-dark">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              to="/events"
              className="flex items-center gap-1 text-muted hover:text-white transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
            <h1 className="text-3xl font-bold text-white">
              {eventName}{" "}
              <span className="text-highlight-lighter">Dashboard</span>
            </h1>
          </div>
          <ProfileHeader
            cfRating={user?.cfRating || undefined}
            className="hidden md:flex"
          />
        </div>
      </div>

      {contests.length > 0 && (
        <div className="mt-8">
          <LeaderboardHeader
            batches={[]}
            leaderboard={[]}
            path="/events/$slug"
            title="Event"
            titleHighlight="contests"
            hideSearch={true}
            hideFilters={true}
            variant="small"
          />
          <div className="flex flex-wrap gap-6">
            {contests.map((c, i) => (
              <ContestCard
                key={c.id}
                id={c.id}
                name={c.name}
                date={c.date}
                color={COLORS[i % COLORS.length]}
                userPerf={userRatings[c.id]}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 mb-20">
        <LeaderboardHeader
          batches={batches}
          groups={groups}
          leaderboard={filteredLeaderboard}
          path="/events/$slug"
          title="Events"
          titleHighlight="Leaderboard"
          hideSearch={true}
          variant="small"
        />

        {loadingLeaderboard ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-highlight-lighter"></div>
          </div>
        ) : view === "Group Wise" ? (
          <div className="flex flex-col mt-8">
            {groupRankings.map((group, index) => (
              <div
                key={group.name}
                className="h-16 rounded-xl flex justify-start mb-4 items-center bg-[#25293E] text-white"
              >
                <div className="w-8 md:w-16 ml-4 md:m-4 text-base flex justify-center items-center">
                  {index + 1}
                </div>
                <div className="h-full flex-1 flex items-center text-sm md:text-base font-bold">
                  {group.name}
                </div>
                <div className="w-20 md:w-32 text-sm text-center md:text-base flex justify-center items-center font-bold mr-4">
                  {group.score} pts
                </div>
              </div>
            ))}
          </div>
        ) : eventLeaderboard.length > 0 ? (
          <div className="flex flex-col">
            <div className="h-80 mx-auto flex justify-center items-end mb-15 mt-15">
              <div
                className={`flex justify-around items-end h-50 w-150 rounded-xl`}
              >
                {filteredLeaderboard[1] && (
                  <div
                    className={`relative w-full h-50 flex flex-col justify-evenly pt-8 rounded-l-xl ${filteredLeaderboard[1].id === user?.id ? "bg-accent-purple text-highlight-darker" : "bg-[#1B1E30]"}`}
                  >
                    <div className="absolute -top-13 w-full flex justify-center items-center">
                      <img
                        src={filteredLeaderboard[1].pfpUrl}
                        alt="PFP"
                        className="h-18 w-18 border-[#5FCABB] border-4 rounded-full object-cover"
                      />
                    </div>
                    <div className="absolute top-1 w-full text-lg flex justify-center items-center">
                      <span className="bg-[#5FCABB] rounded-full w-7 text-center font-medium">
                        2
                      </span>
                    </div>
                    <div className="text-sm md:text-md flex text-center justify-center items-start mx-1 md:mx-4 max-h-18 md:max-h-12">
                      <Link
                        to="/profile/$slug"
                        params={{ slug: filteredLeaderboard[1].cfHandle }}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        {filteredLeaderboard[1].name}
                      </Link>
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center">
                      {filteredLeaderboard[1].batch || "N/A"}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center font-bold">
                      {filteredLeaderboard[1].score || 0}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center">
                      {filteredLeaderboard[1].groupName ||
                        getRatingLevel(filteredLeaderboard[1].cfRating)}
                    </div>
                  </div>
                )}
                {filteredLeaderboard[0] && (
                  <div
                    className={`relative w-full h-65 bg-[#25293E] flex flex-col rounded-t-3xl justify-evenly pt-10  ${filteredLeaderboard[0].id === user?.id ? "bg-accent-purple text-highlight-darker" : "bg-[#25293E]"}`}
                  >
                    <div className="absolute -top-17 w-full flex justify-center items-center">
                      <img
                        src={filteredLeaderboard[0].pfpUrl}
                        alt="PFP"
                        className="h-24 w-24 border-[#DCBE66] border-4 rounded-full object-cover"
                      />
                    </div>
                    <div className="absolute top-3 text-lg flex justify-center items-center w-full">
                      <span className="w-7 bg-[#DCBE66] rounded-full text-center font-medium">
                        1
                      </span>
                    </div>
                    <div className="text-sm md:text-md flex text-center justify-center items-start mx-1 md:mx-4 max-h-18 md:max-h-12">
                      <Link
                        to="/profile/$slug"
                        params={{ slug: filteredLeaderboard[0].cfHandle }}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        {filteredLeaderboard[0].name}
                      </Link>
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center">
                      {filteredLeaderboard[0].batch || "N/A"}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center font-bold">
                      {filteredLeaderboard[0].score || 0}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center">
                      {filteredLeaderboard[0].groupName ||
                        getRatingLevel(filteredLeaderboard[0].cfRating)}
                    </div>
                    <div className="text-LG font-bold flex justify-center items-center">
                      WINNER
                    </div>
                  </div>
                )}
                {filteredLeaderboard[2] && (
                  <div
                    className={`relative w-full h-50 flex flex-col justify-evenly pt-8 rounded-r-xl ${filteredLeaderboard[2].id === user?.id ? "bg-accent-purple text-highlight-darker" : "bg-[#1B1E30]"}`}
                  >
                    <div className="absolute -top-13 w-full flex justify-center items-center">
                      <img
                        src={filteredLeaderboard[2].pfpUrl}
                        alt="PFP"
                        className="h-18 w-18 border-[#DD7A6C] border-4 rounded-full object-cover"
                      />
                    </div>
                    <div className="absolute top-1 text-lg flex justify-center items-center w-full">
                      <span className="w-7 bg-[#DD7A6C] rounded-full text-center font-medium">
                        3
                      </span>
                    </div>
                    <div className="text-sm md:text-md flex justify-center text-center items-start max-h-18 md:max-h-12 mx-1 md:mx-4">
                      <Link
                        to="/profile/$slug"
                        params={{ slug: filteredLeaderboard[2].cfHandle }}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        {filteredLeaderboard[2].name}
                      </Link>
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center">
                      {filteredLeaderboard[2].batch || "N/A"}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center font-bold">
                      {filteredLeaderboard[2].score || 0}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center">
                      {filteredLeaderboard[2].groupName ||
                        getRatingLevel(filteredLeaderboard[2].cfRating)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-8">
              {filteredLeaderboard.slice(3).map((entry, index) => {
                const actualRank = index + 4;

                return (
                  <div
                    key={entry.cfHandle}
                    className={`h-16 rounded-xl flex justify-start mb-4 items-center transition-all duration-200 hover:scale-[1.01] ${
                      entry.id === user?.id
                        ? "bg-accent-purple text-highlight-darker font-bold"
                        : "bg-[#25293E] text-white"
                    }`}
                  >
                    <div className="w-8 md:w-16 ml-4 md:m-4 text-base flex justify-center items-center">
                      {actualRank}
                    </div>
                    <div className="hidden h-16 aspect-square mr-6 md:flex justify-center items-center">
                      <img
                        src={entry.pfpUrl}
                        alt="PFP"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <Link
                      to="/profile/$slug"
                      params={{ slug: entry.cfHandle }}
                      className="h-full flex-1 flex items-center text-sm md:text-base truncate mr-4 hover:scale-105 transition-all duration-200"
                    >
                      {entry.name}
                    </Link>
                    <div className="flex gap-4 md:gap-4 ml-auto mr-4">
                      <div className="w-8 md:w-16 text-sm text-center md:text-base flex justify-center items-center">
                        {entry.batch || "N/A"}
                      </div>
                      <div className="w-20 md:w-32 text-sm text-center md:text-base flex justify-center items-center font-bold">
                        {entry.score || 0}
                      </div>
                      <div className="hidden md:flex w-32 text-sm text-center md:text-base justify-center items-center pr-2">
                        {entry.groupName || getRatingLevel(entry.cfRating)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#25293E] rounded-2xl border-2 border-dashed border-highlight-light/10">
            <Trophy className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
            <p className="text-muted text-lg">
              No participants have joined this event yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
