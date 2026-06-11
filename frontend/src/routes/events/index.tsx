import { createFileRoute } from "@tanstack/react-router";
import EventCard from "../../components/EventCard";
import ProfileHeader from "../../components/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import LoadingIndicator from "../../components/LoadingIndicator";
import LeaderboardHeader from "../../components/LeaderboardHeader";
import { useMemo } from "react";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      batch: typeof search.batch === "string" ? search.batch : undefined,
      group: typeof search.group === "string" ? search.group : undefined,
    };
  },
});

const events = [
  {
    title: "Summer of CC",
    subtitle: "CC Masti",
    slug: "socc",
  },
];

function RouteComponent() {
  const { user, loading } = useAuth();
  const { batch, group } = Route.useSearch();

  const filteredEvents = useMemo(() => {
    return events; // Filtering logic can be added here if events had batch/group data
  }, [batch, group]);

  if (loading) return <LoadingIndicator />;

  return (
    <div className="max-w-7xl m-auto">
      <div className="mb-8 border-b border-highlight-dark">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              Ongoing <span className="text-highlight-lighter">Events</span>
            </h1>
          </div>
          <ProfileHeader
            cfRating={user?.cfRating || undefined}
            className="hidden md:flex"
          />
        </div>
      </div>

      <div className="mb-10">
        <LeaderboardHeader
          batches={["2025", "2024", "2023", "2022"]}
          groups={[]}
          leaderboard={[]}
          path="/events/"
          hideTitle={true}
        />
      </div>

      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.title}
            title={event.title}
            subtitle={event.subtitle}
            slug={event.slug}
          />
        ))}
      </div>
    </div>
  );
}
