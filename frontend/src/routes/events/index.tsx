import { createFileRoute } from "@tanstack/react-router";
import EventCard from "../../components/EventCard";
import ProfileHeader from "../../components/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import LoadingIndicator from "../../components/LoadingIndicator";
import { useEffect, useState } from "react";
import axios from "axios";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
});

interface Event {
  id: number;
  name: string;
  desc: string;
  createdAt: string;
}

function RouteComponent() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/event`)
      .then((res) => {setEvents(res.data); })
      .catch((err) => {console.error("Error fetching events:", err); })
      .finally(() => {setLoading(false); }); }, []);

  if (loading || authLoading) return <LoadingIndicator />;

  return (
    <div className="max-w-7xl m-auto p-4 md:p-0">
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
        {events.length > 0 ? ( events.map((event) => (
            <EventCard
              key={event.id}
              title={event.name}
              subtitle={event.desc}
              slug={event.id.toString()}
            />
          ))
        ) : ( <div className="text-center py-20 text-muted"> no active events found </div> )}
      </div>
    </div>
  );
}
