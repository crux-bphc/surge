import { createFileRoute } from "@tanstack/react-router";
import StoryViewer from "../components/Wrapped/StoryViewer";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingIndicator from "../components/LoadingIndicator";

const fetchWrappedData = async (id: string) => {
  axios
    .get(`${import.meta.env.VITE_API_BASE_URL}/wrapped/${id}`, {
      withCredentials: true,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error("Error fetching wrapped data:", err);
      throw err;
    });
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
      component: <Component1 />,
      duration: 500,
    },
    {
      id: "2",
      component: <Component2 />,
    },
    {
      id: "3",
      component: <Component3 />,
      duration: 7000,
    },
  ];

  return <StoryViewer slides={SLIDES} />;
}

function Component1() {
  return <>component1</>;
}

function Component2() {
  return <>component2</>;
}

function Component3() {
  return <>component3</>;
}
