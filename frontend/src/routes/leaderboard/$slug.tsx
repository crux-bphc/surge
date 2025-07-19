import { createFileRoute, useParams } from "@tanstack/react-router";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { getRatingLevel } from "../../utils";
import LoadingIndicator from "../../components/LoadingIndicator";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import type { Leaderboard } from "../../types/leaderboard";
import LeaderboardHeader from "../../components/LeaderboardHeader";

export const Route = createFileRoute("/leaderboard/$slug")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			batch: typeof search.batch === "string" ? search.batch : undefined,
			level: typeof search.level === "string" ? search.level : undefined,
		};
	},
});

function RouteComponent() {
	const [leaderboardData, setLeaderboardData] = useState<Leaderboard[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const { user } = useAuth();
	const { slug } = useParams({ from: "/leaderboard/$slug" });

	const { batch, level } = Route.useSearch();

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE_URL}/leaderboard/${slug}`)
			.then((res) => {
				setLeaderboardData(res.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Error fetching leaderboard: ", err);
				setLoading(false);
				setError(true);
			});
	}, [slug]);

	const filteredLeaderboard = useMemo(() => {
		return leaderboardData
			.filter((entry: Leaderboard) => !batch || entry.batch === batch)
			.filter(
				(entry: Leaderboard) =>
					!level || getRatingLevel(entry.cfRating) === level
			);
	}, [batch, level, leaderboardData]);

	const batches = [
		...new Set<string>(leaderboardData.map((user) => user.batch)),
	].filter((batch) => (batch ? true : false));

	if (loading) return <LoadingIndicator />;

	if (error)
		return (
			<div className="min-h-screen text-white flex items-center justify-center">
				<div className="text-red-400 animate-pulse">
					Error fetching leaderboard.
				</div>
			</div>
		);

	return (
		<div className="w-full max-w-7xl m-auto">
			<LeaderboardHeader
				batches={batches}
				leaderboard={filteredLeaderboard}
				path={"/leaderboard/$slug"}
			/>
			{/* leaderboard for top 3 */}
			<div className="h-80 mx-auto flex justify-center items-end mb-15 mt-15">
				<div className={`flex justify-around items-end h-50 w-150 rounded-xl`}>
					{filteredLeaderboard[1] && (
						<div
							className={`relative w-full h-50 flex flex-col justify-evenly pt-8 rounded-l-xl ${filteredLeaderboard[1].id === user?.id ? "bg-accent-purple text-highlight-darker" : "bg-[#1B1E30]"}`}
						>
							<div className="absolute -top-13 w-full flex justify-center items-center">
								<img
									src={filteredLeaderboard[1].pfpUrl}
									alt="PFP"
									className="h-18 w-18 border-[#5FCABB] border-4 rounded-full "
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
							<div className="text-xs md:text-sm flex justify-center items-center">
								{filteredLeaderboard[1].rank || "-"}
							</div>
							<div className="text-xs md:text-sm flex justify-center items-center">
								{getRatingLevel(filteredLeaderboard[1].cfRating)}
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
									className="h-24 w-24 border-[#DCBE66] border-4 rounded-full "
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
							<div className="text-xs md:text-sm flex justify-center items-center">
								{filteredLeaderboard[0].rank || "-"}
							</div>
							<div className="text-xs md:text-sm flex justify-center items-center">
								{getRatingLevel(filteredLeaderboard[0].cfRating)}
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
									className="h-18 w-18 border-[#DD7A6C] border-4 rounded-full "
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
							<div className="text-xs md:text-sm flex justify-center items-center">
								{filteredLeaderboard[2].rank || "-"}
							</div>
							<div className="text-xs md:text-sm flex justify-center items-center">
								{getRatingLevel(filteredLeaderboard[2].cfRating)}
							</div>
						</div>
					)}
				</div>
			</div>
			{/* leaderboard for other than top 3 */}
			<div className="md:mx-10 flex flex-col">
				{filteredLeaderboard.slice(3).map((leaderboardUser, index) => (
					<div
						key={leaderboardUser.id}
						className={`h-16 rounded-xl flex justify-start mb-4 ${leaderboardUser.id === user?.id ? "bg-accent-purple text-highlight-darker font-bold" : "bg-[#25293E]"}`}
					>
						<div className="w-4 md:w-8 m-4 text-base flex justify-center items-center">
							{index + 4}
						</div>
						<div className="hidden h-16 aspect-1/1 mr-6 text-sm md:text-base md:flex justify-center items-center">
							<img
								src={leaderboardUser.pfpUrl}
								alt="PFP"
								className="h-10 aspect-1/1 rounded-full"
							/>
						</div>
						<Link
							to="/profile/$slug"
							params={{ slug: leaderboardUser.cfHandle }}
							className="h-full w-full flex items-center text-sm md:text-base truncate mr-4 max-w-36 md:max-w-none hover:scale-105 transition-all duration-200"
						>
							{leaderboardUser.name}
						</Link>
						<div className="flex gap-4 md:gap-4 ml-auto mr-4">
							<div className="w-8 md:w-16 text-sm text-center md:text-base flex justify-center items-center">
								{leaderboardUser.batch || "N/A"}
							</div>
							<div className="w-8 md:w-16 text-sm text-center md:text-base flex justify-center items-center">
								{leaderboardUser.rank || "-"}
							</div>
							<div className="w-20 md:w-32 text-sm text-center md:text-base flex justify-center items-center md:pr-2">
								{getRatingLevel(leaderboardUser.cfRating)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
