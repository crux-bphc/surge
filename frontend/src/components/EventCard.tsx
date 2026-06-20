import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface EventCardProps {
  title: string;
  subtitle: string;
  slug: string;
  buttonLabel?: string;
}

export default function EventCard({
  title,
  subtitle,
  slug,
  buttonLabel = "View Event",
}: EventCardProps) {
  return (
    <div className="w-full min-h-[180px] rounded-lg bg-highlight-dark p-4 lg:p-6 flex flex-col justify-between shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl text-white mb-1">{title}</h2>
          <div className="text-muted text-sm">{subtitle}</div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-4">
        <Link
          to="/events/$slug"
          params={{ slug }}
          search={{ batch: undefined, group: undefined, view: undefined }}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-accent-purple hover:bg-accent-purple/80 text-white transition-transform duration-200 hover:scale-105 text-md font-medium"
        >
          {buttonLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
