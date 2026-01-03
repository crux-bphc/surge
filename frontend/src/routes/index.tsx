import { createFileRoute } from "@tanstack/react-router";
import ProfileHeader from "../components/ProfileHeader";
import { useAuth } from "../context/AuthContext";
import LoadingIndicator from "../components/LoadingIndicator";
import { toTitleCase } from "../utils";
import UpcomingContests from "../components/UpcomingContests";
import RecentActivity from "../components/RecentActivity";
import CompetitiveStanding from "../components/CompetitiveStanding";
import WrappedBanner from "../components/Wrapped/WrappedBanner";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingIndicator />;

  return (
    <div className="p-4 pt-0 m-auto">
      <div className="mb-8 border-b border-[#25293E]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg">
              Welcome <span className="text-highlight-lighter">back,</span>
            </h1>
            <h1 className="text-3xl ">{toTitleCase(user?.name, true)}</h1>
          </div>
          <ProfileHeader cfRating={user?.cfRating} className="hidden md:flex" />
        </div>
      </div>
      {user?.cfHandle && <WrappedBanner />}
      {user?.cfHandle && <CompetitiveStanding handle={user?.cfHandle} />}
      <UpcomingContests />
      {user?.cfHandle && <RecentActivity handle={user?.cfHandle} />}
    </div>
  );
}
