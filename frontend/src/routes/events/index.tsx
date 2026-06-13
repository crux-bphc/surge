import { createFileRoute } from "@tanstack/react-router";
import EventCard from "../../components/EventCard";
import ProfileHeader from "../../components/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import LoadingIndicator from "../../components/LoadingIndicator";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
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

      <div className="space-y-6">
        {events.map((event) => (
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
