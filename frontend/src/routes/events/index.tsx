import { createFileRoute } from "@tanstack/react-router";
import ProfileHeader from "../../components/ProfileHeader";
import UpcomingContests from "../../components/UpcomingContests";
import { useAuth } from "../../context/AuthContext";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl m-auto">
      <div className="mb-8 border-b border-highlight-dark">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              Upcoming <span className="text-highlight-lighter">Events</span>
            </h1>
            <div className="text-muted text-sm">Blah Blah</div>
          </div>
          <ProfileHeader
            cfRating={user?.cfRating || undefined}
            className="hidden md:flex"
          />
        </div>
      </div>
      <UpcomingContests />
    </div>
  );
}
