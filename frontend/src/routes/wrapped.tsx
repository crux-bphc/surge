import { createFileRoute } from "@tanstack/react-router";
import StoryViewer from "../components/Wrapped/StoryViewer";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingIndicator from "../components/LoadingIndicator";
import ContestsSlide from "../components/Wrapped/ContestsSlide";
import RatingsSlide from "../components/Wrapped/RatingsSlide";
import PotdSlide from "../components/Wrapped/PotdSlide";
import SolvesSlide from "../components/Wrapped/SolvesSlide";
import AccuracySlide from "../components/Wrapped/AccuracySlide";
import TagsSlide from "../components/Wrapped/TagsSlide";
import StreakSlide from "../components/Wrapped/StreakSlide";
import CampusLeaderboardSlide from "../components/Wrapped/CampusLeaderboardSlide";
import SummarySlide from "../components/Wrapped/SummarySlide";

const fetchWrappedData = async (id: string) => {
    try {
        const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/wrapped/${id}`,
            {
                withCredentials: true,
            }
        );
        return res.data;
    } catch (err) {
        console.error("Error fetching wrapped data:", err);
        throw err;
    }
};

export const Route = createFileRoute("/wrapped")({
    component: RouteComponent,
    staticData: { fullScreen: true },
});

function RouteComponent() {
    const [wrappedData, setWrappedData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user || !user.cfHandle) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await fetchWrappedData(user.id);
                setWrappedData(data);
            } catch (error) {
                console.error("Error fetching wrapped data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, loading]);

    if (isLoading) {
        return <LoadingIndicator />;
    }

    if (!user || !wrappedData || !wrappedData.data) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                Could not load wrapped data for the user. Please ensure you are logged
                in and have stats generated.
            </div>
        );
    }

    const SLIDES = [
        {
            id: "1",
            component: (
                <SolvesSlide
                    userSolves={wrappedData.data.solvedCount}
                    totalCampusSolves={540}
                />
            ),
            duration: 12000,
        },
        {
            id: "2",
            component: (
                <AccuracySlide
                    userAccuracy={wrappedData.data.accuracy}
                />
            ),
            duration: 12000,
        },
        {
            id: "3",
            component: (
                <TagsSlide
                    highestSolvedTag="implementation"
                    userTopTags={wrappedData.data.mostSolvedTags}
                />
            ),
            duration: 12000,
        },
        {
            id: "4",
            component: (
                <StreakSlide
                    userStreak={wrappedData.data.longestStreak}
                    highestStreak={25}
                />
            ),
            duration: 12000,
        },
        {
            id: "5",
            component: <RatingsSlide initialRating={wrappedData.data.initialRating} highestRating={wrappedData.data.highestRating} />,
            duration: 12000,
        },
        {
            id: "6",
            component: (
                <ContestsSlide
                    userContests={wrappedData.data.contestCount}
                    avgCampusContests={6}
                />
            ),
            duration: 12000,
        },
        {
            id: "7",
            component: <PotdSlide potdSolveCount={wrappedData.data.potdSolves} />,
            duration: 12000,
        },
        {
            id: "8",
            component: <CampusLeaderboardSlide currentUser={user} />,
            duration: 12000,
        },
        {
            id: "9",
            component: <SummarySlide wrappedData={wrappedData} />,
            duration: 12000,
        },
    ];

    return <StoryViewer slides={SLIDES} />;
}
