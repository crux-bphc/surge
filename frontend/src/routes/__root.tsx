import { Outlet, createRootRoute, useMatches } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Login from "../pages/Login";
import Navbar from "../components/Navbar";
import CFHandleModal from "../components/CFHandleModal";
import LoadingIndicator from "../components/LoadingIndicator";

export const Route = createRootRoute({
  component: RootComponent,
});

export default function RootComponent() {
  const { user, loading, setUser } = useAuth();

  if (loading)
    return (
      <div className="bg-dark-background">
        <LoadingIndicator />
      </div>
    );

  if (!user) {
    return <Login />;
  }

  const matches = useMatches();
  const isFullScreen = matches.some((match) => match.staticData.fullScreen);

  return (
    <div className="flex flex-col md:flex-row  min-h-screen">
      {isFullScreen ? (
        <main className="flex-grow overflow-hidden bg-dark-background text-white max-w-screen">
          <Outlet />
        </main>
      ) : (
        <>
          <Navbar />
          <main className="flex-grow overflow-hidden p-6 md:mt-0 md:ml-30 bg-dark-background text-white max-w-screen">
            <Outlet />
          </main>
        </>
      )}
      {import.meta.env.VITE_ENV === "development" && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
      {user.cfHandle === null && (
        <CFHandleModal
          onSuccess={(updatedUser) => {
            setUser(updatedUser);
          }}
        />
      )}
    </div>
  );
}
