import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import axios from "axios";
import { useEffect, useState } from "react";
import ProfileHeader from "../../components/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import LoadingIndicator from "../../components/LoadingIndicator";
import ContestCard from "../../components/ContestCard";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/events/$slug")({
  component: RouteComponent,
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

function RouteComponent() {
  const { slug } = useParams({ from: "/events/$slug" });
  const { user, loading } = useAuth();
  const [userRatings, setUserRatings] = useState<
    Record<string, UserRatingChange>
  >({});
  const [loadingRatings, setLoadingRatings] = useState(false);

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

  if (loading || loadingRatings) return <LoadingIndicator />;

  const eventName = slug === "socc" ? "Summer of CC" : slug.toUpperCase();
  const contests = eventContests[slug] || [];

  return (
    <div className="max-w-7xl m-auto">
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
            <h1 className="text-3xl font-bold text-white">{eventName}</h1>
          </div>
          <ProfileHeader
            cfRating={user?.cfRating || undefined}
            className="hidden md:flex"
          />
        </div>
      </div>

      {contests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-white text-xl mb-6">
            Event <span className="text-highlight-lighter">contests</span>
          </h2>
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
    </div>
  );
}
