import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import ProfileHeader from "../../../components/ProfileHeader";
import { useAuth } from "../../../context/AuthContext";
import LoadingIndicator from "../../../components/LoadingIndicator";
import ContestCard from "../../../components/ContestCard";
import { ArrowLeft, Trophy } from "lucide-react";
import LeaderboardHeader from "../../../components/LeaderboardHeader";

export const Route = createFileRoute("/events/$slug/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      batch: typeof search.batch === "string" ? search.batch : undefined,
      group: typeof search.group === "string" ? search.group : undefined,
      view: typeof search.view === "string" ? search.view : undefined,
    };
  },
});

const COLORS = ["bg-green-500", "bg-blue-500", "bg-pink-500", "bg-purple-500"];

interface EventDetail {
  id: number;
  name: string;
  desc: string;
  contests: {
    id: number;
    name: string;
    startTime: string;
    durationMinutes: number;
  }[];
}

function RouteComponent() {
  const { slug: eventId } = useParams({ from: "/events/$slug" });
  const { user, loading: authLoading } = useAuth();
  const { view, batch, group } = Route.useSearch();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/event/${eventId}`)
      .then((res) => {
        setEvent(res.data);
      })
      .catch((err) => {
        console.error("Error fetching event details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [eventId]);

  useEffect(() => {
    setLoadingLeaderboard(true);
    let type = "global";
    if (view === "Group Wise") type = "group-vs-group";
    if (view === "My Group") type = "intra-group";

    axios
      .get(
        `${import.meta.env.VITE_API_BASE_URL}/event/${eventId}/leaderboard?type=${type}`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setLeaderboard(res.data);
      })
      .catch((err) => {
        console.error("Error fetching event leaderboard:", err);
      })
      .finally(() => {
        setLoadingLeaderboard(false);
      });
  }, [eventId, view]);

  const filteredLeaderboard = useMemo(() => {
    if (view === "Group Wise") return leaderboard;
    return leaderboard
      .filter(
        (entry) => !batch || (entry.email && entry.email.includes(`f${batch}`))
      )
      .filter((entry) => !group || entry.groupName === group);
  }, [leaderboard, batch, group, view]);

  const batches = useMemo(() => {
    if (view === "Group Wise") return [];
    const b = new Set<string>();
    leaderboard.forEach((u) => {
      if (u.email) {
        const match = u.email.match(/f(\d{4})/);
        if (match) b.add(match[1]);
      }
    });
    return Array.from(b).sort((a, b) => parseInt(b) - parseInt(a));
  }, [leaderboard, view]);

  const groups = useMemo(() => {
    if (view === "Group Wise") return [];
    const g = new Set<string>();
    leaderboard.forEach((u) => {
      if (u.groupName) g.add(u.groupName);
    });
    return Array.from(g).sort();
  }, [leaderboard, view]);

  if (authLoading || loading) return <LoadingIndicator />;
  if (!event) return <div className="text-center py-20">Event not found.</div>;

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
              {event.name}{" "}
              <span className="text-highlight-lighter">Dashboard</span>
            </h1>
            <p className="text-muted mt-2">{event.desc}</p>
          </div>
          <ProfileHeader
            cfRating={user?.cfRating || undefined}
            className="hidden md:flex"
          />
        </div>
      </div>

      {event.contests.length > 0 && (
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
          <div className="flex flex-wrap gap-6 mt-6">
            {event.contests.map((c, i) => (
              <ContestCard
                key={c.id}
                id={c.id.toString()}
                name={c.name}
                date={new Date(c.startTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                color={COLORS[i % COLORS.length]}
                isEvent={true}
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
            {filteredLeaderboard.map((group, index) => (
              <div
                key={group.groupId}
                className="h-16 rounded-xl flex justify-start mb-4 items-center bg-[#25293E] text-white"
              >
                <div className="w-8 md:w-16 ml-4 md:m-4 text-base flex justify-center items-center">
                  {index + 1}
                </div>
                <div className="h-full flex-1 flex items-center text-sm md:text-base font-bold">
                  {group.groupName}
                </div>
                <div className="w-20 md:w-32 text-sm text-center md:text-base flex justify-center items-center font-bold mr-4 text-highlight-lighter text-lg">
                  {group.score} pts
                </div>
              </div>
            ))}
          </div>
        ) : filteredLeaderboard.length > 0 ? (
          <div className="flex flex-col mt-8">
            <div className="h-80 mx-auto flex justify-center items-end mb-15 mt-15">
              <div
                className={`flex justify-around items-end h-50 w-150 rounded-xl`}
              >
                {filteredLeaderboard[1] && (
                  <div
                    className={`relative w-full h-50 flex flex-col justify-evenly pt-8 rounded-l-xl ${filteredLeaderboard[1].userId === user?.id ? "bg-accent-purple text-highlight-darker" : "bg-[#1B1E30]"}`}
                  >
                    <div className="absolute -top-13 w-full flex justify-center items-center">
                      <img
                        src={filteredLeaderboard[1].pfpUrl}
                        alt="PFP"
                        className="h-18 w-18 border-[#5FCABB] border-4 rounded-full object-cover"
                      />
                    </div>
                    <div className="absolute top-1 w-full text-lg flex justify-center items-center">
                      <span className="bg-[#5FCABB] rounded-full w-7 text-center font-medium text-white">
                        2
                      </span>
                    </div>
                    <div className="text-sm md:text-md flex text-center justify-center items-start mx-1 md:mx-4 max-h-18 md:max-h-12 text-white">
                      <Link
                        to="/profile/$slug"
                        params={{ slug: filteredLeaderboard[1].cfHandle }}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        {filteredLeaderboard[1].name}
                      </Link>
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center text-slate-100 font-bold uppercase tracking-wider">
                      {filteredLeaderboard[1].groupName || "N/A"}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center font-black text-[#DCBE66]">
                      {filteredLeaderboard[1].score || 0} pts
                    </div>
                  </div>
                )}

                {filteredLeaderboard[0] && (
                  <div
                    className={`relative w-full h-65 bg-[#25293E] flex flex-col rounded-t-3xl justify-evenly pt-10 ${filteredLeaderboard[0].userId === user?.id ? "bg-accent-purple text-highlight-darker" : "bg-[#25293E]"}`}
                  >
                    <div className="absolute -top-17 w-full flex justify-center items-center">
                      <img
                        src={filteredLeaderboard[0].pfpUrl}
                        alt="PFP"
                        className="h-24 w-24 border-[#DCBE66] border-4 rounded-full object-cover"
                      />
                    </div>
                    <div className="absolute top-3 text-lg flex justify-center items-center w-full">
                      <span className="w-7 bg-[#DCBE66] rounded-full text-center font-medium text-white">
                        1
                      </span>
                    </div>
                    <div className="text-sm md:text-md flex text-center justify-center items-start mx-1 md:mx-4 max-h-18 md:max-h-12 text-white font-bold text-lg">
                      <Link
                        to="/profile/$slug"
                        params={{ slug: filteredLeaderboard[0].cfHandle }}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        {filteredLeaderboard[0].name}
                      </Link>
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center text-slate-100 font-bold uppercase tracking-wider">
                      {filteredLeaderboard[0].groupName || "N/A"}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center font-black text-[#DCBE66] text-lg">
                      {filteredLeaderboard[0].score || 0} pts
                    </div>
                    <div className="text-lg font-bold flex justify-center items-center">
                      WINNER
                    </div>
                  </div>
                )}

                {filteredLeaderboard[2] && (
                  <div
                    className={`relative w-full h-50 flex flex-col justify-evenly pt-8 rounded-r-xl ${filteredLeaderboard[2].userId === user?.id ? "bg-accent-purple text-highlight-darker" : "bg-[#1B1E30]"}`}
                  >
                    <div className="absolute -top-13 w-full flex justify-center items-center">
                      <img
                        src={filteredLeaderboard[2].pfpUrl}
                        alt="PFP"
                        className="h-18 w-18 border-[#DD7A6C] border-4 rounded-full object-cover"
                      />
                    </div>
                    <div className="absolute top-1 text-lg flex justify-center items-center w-full">
                      <span className="w-7 bg-[#DD7A6C] rounded-full text-center font-medium text-white">
                        3
                      </span>
                    </div>
                    <div className="text-sm md:text-md flex justify-center text-center items-start max-h-18 md:max-h-12 mx-1 md:mx-4 text-white">
                      <Link
                        to="/profile/$slug"
                        params={{ slug: filteredLeaderboard[2].cfHandle }}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        {filteredLeaderboard[2].name}
                      </Link>
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center text-slate-100 font-bold uppercase tracking-wider">
                      {filteredLeaderboard[2].groupName || "N/A"}
                    </div>
                    <div className="text-xs md:text-sm flex justify-center items-center font-black text-[#DCBE66]">
                      {filteredLeaderboard[2].score || 0} pts
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-8">
              {filteredLeaderboard.slice(3).map((entry, index) => (
                <div
                  key={entry.cfHandle}
                  className={`h-16 rounded-xl flex justify-start mb-4 items-center transition-all duration-200 hover:scale-[1.01] ${
                    entry.userId === user?.id
                      ? "bg-accent-purple text-highlight-darker font-bold"
                      : "bg-[#25293E] text-white"
                  }`}
                >
                  <div className="w-8 md:w-16 ml-4 md:m-4 text-base flex justify-center items-center">
                    {index + 4}
                  </div>
                  <div className="hidden h-16 aspect-square mr-6 md:flex justify-center items-center">
                    <img
                      src={entry.pfpUrl}
                      alt="PFP"
                      className="h-10 w-10 rounded-full object-cover border border-highlight-light/20"
                    />
                  </div>
                  <Link
                    to="/profile/$slug"
                    params={{ slug: entry.cfHandle }}
                    className="h-full flex-1 flex items-center text-sm md:text-base truncate mr-4 hover:underline transition-all duration-200"
                  >
                    {entry.name}
                  </Link>
                  <div className="flex gap-4 md:gap-8 ml-auto mr-8 items-center font-black">
                    <div className="hidden md:block text-sm text-white uppercase tracking-tighter">
                      {entry.groupName || "N/A"}
                    </div>
                    <div className="w-24 text-sm text-right md:text-base text-[#DCBE66]">
                      {entry.score || 0} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#25293E] rounded-2xl border-2 border-dashed border-highlight-light/10 mt-8">
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
