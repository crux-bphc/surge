import { createFileRoute } from "@tanstack/react-router";
import StoryViewer from "../components/Wrapped/StoryViewer";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingIndicator from "../components/LoadingIndicator";
import ContestsSlide from "../components/Wrapped/ContestsSlide";
import RatingsSlide from "../components/Wrapped/RatingsSlide";
import PotdSlide from "../components/Wrapped/PotdSlide";

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

    if (!user || !user.cfHandle) return;

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

  const SLIDES = [
    {
      id: "1",
      component: <RatingsSlide highestRating={1000}/>,
      duration: 12000,
    },
    {
      id: "2",
      component: <ContestsSlide userContests={14} avgCampusContests={6}/>,
      duration: 12000,
    },
    {
      id: "3",
      component: <PotdSlide potdSolveCount={2}/>,
      duration: 12000,
    },
  ];

  return <StoryViewer slides={SLIDES} />;
}
