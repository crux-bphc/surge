import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "@tanstack/react-router";

type ContestActivity = {
	contestId: number;
	contestName: string;
	handle: string;
	rank: number;
	ratingUpdateTimeSeconds: number;
	oldRating: number;
	newRating: number;
};

const COLORS = ["bg-green-500", "bg-blue-500", "bg-pink-500", "bg-purple-500"];

export default function RecentActivity({ handle }: { handle: string }) {
	const [activities, setActivities] = useState<ContestActivity[]>([]);

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE_URL}/account/${handle}/ratings`, {
				withCredentials: true,
			})
			.then((res) => {
				setActivities(res.data.reverse().slice(0, 5)); // Show last 5 contests
			});
	}, [handle]);

	return (
		<div className="mt-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-white text-xl">
					Recent <span className="text-gray-400">activity</span>
				</h2>
			</div>

			<div className="flex space-x-4 overflow-x-auto pb-2">
				{activities.map((a, i) => {
					const diff = a.newRating - a.oldRating;
					const color = COLORS[i % COLORS.length];

					return (
						<Link
							key={a.contestId}
							to="/leaderboard/$slug"
							params={{ slug: a.contestId.toString() }}
              search={{batch: undefined, level: undefined}}
							className="min-w-[280px] rounded-lg flex shadow-md overflow-hidden hover:scale-[1.015] transition-transform duration-150"
						>
							<div className={`${color} text-white p-4 w-1/3`}>
								<div className="text-sm opacity-80 mb-1">Date</div>
								<div className="text-lg font-bold">
									{dayjs(a.ratingUpdateTimeSeconds * 1000).format("MMM D")}
								</div>
							</div>
							<div className="bg-highlight-dark text-white p-4 w-2/3 flex flex-col justify-between">
								<div className="text-sm opacity-60 mb-1">Contest</div>
								<div className="text-md font-mono mb-2">
									{a.contestName.length > 50
										? a.contestName.slice(0, 50) + "..."
										: a.contestName}
								</div>
								<div className="flex justify-between items-center text-xs">
									<span
										className={`${
											diff >= 0 ? "text-green-400" : "text-red-400"
										}`}
									>
										{diff >= 0 ? "+" : ""}
										{diff}
									</span>
									<span className="text-gray-300">Rank #{a.rank}</span>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
