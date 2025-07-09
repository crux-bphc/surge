import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";
import { useEffect, useState } from "react";
import { getRatingLevel } from "../utils";
import LoadingIndicator from "../components/LoadingIndicator";
import { useClickAway } from "@uidotdev/usehooks";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/leaderboard")({
  component: RouteComponent,
});

type Leaderboard = {
  id: string,
  name: string,
  email: string,
  cfHandle: string,
  cfRating: number,
  pfpUrl: string,
  batch: string,
}

type LeaderboardHeaderProps = {
  batch: boolean;
  setBatch: React.Dispatch<React.SetStateAction<boolean>>;
  level: boolean;
  setLevel: React.Dispatch<React.SetStateAction<boolean>>;
  batches: string[];
  leaderboard: Leaderboard[];
}

function LeaderboardHeader({ batch, setBatch, level, setLevel, batches, leaderboard }: LeaderboardHeaderProps) {
  const [input, setInput] = useState('')
  const [filteredNames, setFilteredNames] = useState<Leaderboard[]>([])
  const inputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    if (value.trim() === '') {
      setFilteredNames([])
    } else {
      const filtered = leaderboard.filter(user => user.name.toLowerCase().startsWith(value.trim().toLowerCase()))
      setFilteredNames(filtered)
    }
  }
  const batchRef = useClickAway<HTMLDivElement>(() => {
    setBatch(false);
  });

  const levelRef = useClickAway<HTMLDivElement>(() => {
    setLevel(false);
  });
  return (
    <div className="border-b border-[#25293E]">
      <div className="pb-4">
        <div className="mb-7">
          <h1 className="text-3xl font-bold">
            Campus <span className="text-[#919AC8]">Leaderboard</span>
          </h1>
        </div>
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex flex-col w-full relative z-10">
            <input
              type="text"
              value={input}
              onChange={inputChanged}
              placeholder="Search by name"
              className="rounded-3xl text-sm h-12 w-full md:w-80 bg-[#25293E] pl-8 m-auto mb-4 md:m-0"
            />
            {(
              <div className="mt-2 text-sm flex flex-col justify-evenly absolute top-12 w-full">
                {filteredNames.map((user, index) => (
                  <div key={index} className={`absolute z-1 top-0 animate-all duration-200 ease-out bg-[#25293E] h-8 w-80 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${filteredNames.length ? `translate-y-${index * 8} opacity-100` : `-translate-y-10 opacity-0`
                    }`}>
                    <Link to="/profile/$slug" params={{ slug: user.cfHandle }} className="hover:scale-105 transition-all duration-200">
                      {user.name}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between w-full gap-4 md:w-sm">
            <div className="flex flex-col w-full relative">
              <div
                className="rounded-3xl text-sm h-10 w-full bg-[#25293E] flex justify-center items-center cursor-pointer mt-1 hover:bg-[#25294F] z-2"
                onClick={() => setBatch(!batch)}
                ref={batchRef}
              >
                Batch
              </div>
              {(
                <div className="mt-2 text-xs flex flex-col justify-evenly items-center absolute top-10 w-full">
                  {batches.map((b, index) => (
                    <div key={index} className={`absolute z-1 top-0 animate-all duration-200 ease-out bg-[#25293E] h-8 w-42 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${batch ? `translate-y-${index * 8} opacity-100` : `-translate-y-10 opacity-0`
                      }`}>
                      {b || "N/A"}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col w-full relative">
              <div
                className="rounded-3xl text-sm h-10 w-full bg-[#25293E] flex justify-center items-center cursor-pointer mt-1 hover:bg-[#25294F] z-2"
                onClick={() => setLevel(!level)}
                ref={levelRef}
              >
                Level
              </div>
              {(
                <div className="mt-2 text-xs flex flex-col justify-evenly items-center absolute top-10 w-full">
                  <div className={`absolute z-1 top-0 animate-all duration-250 ease-out bg-[#25293E] h-8 w-42 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${level ? `translate-y-0 opacity-100` : `-translate-y-10 opacity-0`
                    }`}>
                    Newbie
                  </div>
                  <div className={`absolute z-1 top-0 animate-all duration-250 ease-out bg-[#25293E] h-8 w-42 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${level ? `translate-y-8 opacity-100` : `-translate-y-10 opacity-0`
                    }`}>
                    Pupil
                  </div>
                  <div className={`absolute z-1 top-0 animate-all duration-250 ease-out bg-[#25293E] h-8 w-42 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${level ? `translate-y-16 opacity-100` : `-translate-y-10 opacity-0`
                    }`}>
                    Specialist
                  </div>
                  <div className={`absolute z-1 top-0 animate-all duration-250 ease-out bg-[#25293E] h-8 w-42 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${level ? `translate-y-24 opacity-100` : `-translate-y-10 opacity-0`
                    }`}>
                    Expert
                  </div>
                  <div className={`absolute z-1 top-0 animate-all duration-250 ease-out bg-[#25293E] h-8 w-42 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${level ? `translate-y-32 opacity-100` : `-translate-y-10 opacity-0`
                    }`}>
                    Candidate Master
                  </div>
                  <div className={`absolute z-1 top-0 animate-all duration-250 ease-out bg-[#25293E] h-8 w-42 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${level ? `translate-y-40 opacity-100` : `-translate-y-10 opacity-0`
                    }`}>
                    Master
                  </div>
                  <div className={`absolute z-1 top-0 animate-all duration-250 ease-out bg-[#25293E] h-8 w-42 flex justify-center items-center hover:bg-[#25294F] border-collapse border border-y-1 border-x-0 border-[#1B1E30] ${level ? `translate-y-48 opacity-100 ` : `-translate-y-10 opacity-0 `
                    }`}>
                    International Master
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RouteComponent() {
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [batch, setBatch] = useState<boolean>(false);
  const [level, setLevel] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/leaderboard`)
      .then((res) => {
        setLeaderboard(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard: ", err);
        setLoading(false);
        setError(true);
      });
  }, []);

  const batches = [...new Set(leaderboard.map(user => user.batch))]

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
      <LeaderboardHeader batch={batch} setBatch={setBatch} level={level} setLevel={setLevel} batches={batches} leaderboard={leaderboard} />
      {/* leaderboard for top 3 */}
      <div className="h-80 mx-auto flex justify-center items-end mb-15 mt-15">
        <div className="flex justify-around items-end h-50 w-150 bg-[#1B1E30] rounded-xl">
          <div className="relative w-1/3 h-50 flex flex-col justify-evenly pt-8">
            {leaderboard[1] &&
              <>
                <div className="absolute -top-13 w-full flex justify-center items-center">
                  <img
                    src={leaderboard[1].pfpUrl}
                    alt="PFP"
                    className="h-18 w-18 border-[#5FCABB] border-4 rounded-full "
                  />
                </div>
                <div className="absolute top-1 w-full text-lg flex justify-center items-center">
                  <span className="bg-[#5FCABB] rounded-full w-7 text-center">2</span>
                </div>
                <div className="text-sm md:text-md flex text-center justify-center items-start mx-1 md:mx-4 max-h-18 md:max-h-12">
                  <Link to="/profile/$slug" params={{ slug: leaderboard[1].cfHandle }} className="hover:scale-105 transition-all duration-200">
                    {leaderboard[1].name}
                  </Link>
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {leaderboard[1].batch || "N/A"}
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {leaderboard[1].cfRating || "N/A"}
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {getRatingLevel(leaderboard[1].cfRating)}
                </div>
              </>
            }
          </div>
          <div className="relative w-1/3 h-65 bg-[#25293E] flex flex-col rounded-t-3xl justify-evenly pt-10">
            {leaderboard[0] &&
              <>
                <div className="absolute -top-17 w-full flex justify-center items-center">
                  <img
                    src={leaderboard[0].pfpUrl}
                    alt="PFP"
                    className="h-24 w-24 border-[#DCBE66] border-4 rounded-full "
                  />
                </div>
                <div className="absolute top-3 text-lg flex justify-center items-center w-full">
                  <span className="w-7 bg-[#DCBE66] rounded-full text-center">1</span>
                </div>
                <div className="text-sm md:text-md flex text-center justify-center items-start mx-1 md:mx-4 max-h-18 md:max-h-12">
                  <Link to="/profile/$slug" params={{ slug: leaderboard[0].cfHandle }} className="hover:scale-105 transition-all duration-200">
                    {leaderboard[0].name}
                  </Link>
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {leaderboard[0].batch || "N/A"}
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {leaderboard[0].cfRating || "N/A"}
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {getRatingLevel(leaderboard[0].cfRating)}
                </div>
                <div className="text-LG font-bold flex justify-center items-center">
                  WINNER
                </div>
              </>
            }
          </div>
          <div className="relative w-1/3 h-50 flex flex-col justify-evenly pt-8">
            {leaderboard[2] &&
              <>
                <div className="absolute -top-13 w-full flex justify-center items-center">
                  <img
                    src={leaderboard[2].pfpUrl}
                    alt="PFP"
                    className="h-18 w-18 border-[#DD7A6C] border-4 rounded-full "
                  />
                </div>
                <div className="absolute top-1 text-lg flex justify-center items-center w-full">
                  <span className="w-7 bg-[#DD7A6C] rounded-full text-center">3</span>
                </div>
                <div className="text-sm md:text-md flex justify-center text-center items-start max-h-18 md:max-h-12 mx-1 md:mx-4">
                  <Link to="/profile/$slug" params={{ slug: leaderboard[2].cfHandle }} className="hover:scale-105 transition-all duration-200">
                    {leaderboard[2].name}
                  </Link>
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {leaderboard[2].batch || "N/A"}
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {leaderboard[2].cfRating || "N/A"}
                </div>
                <div className="text-xs md:text-sm flex justify-center items-center">
                  {getRatingLevel(leaderboard[2].cfRating)}
                </div>
              </>
            }
          </div>
        </div>
      </div>
      {/* leaderboard for other than top 3 */}
      <div className="md:mx-10 flex flex-col">
        {leaderboard.slice(3).map((user, index) => (
          <div
            key={user.id}
            className="h-16 rounded-xl flex justify-start bg-[#25293E] mb-4"
          >
            <div className="w-4 md:w-8 m-4 text-base flex justify-center items-center">
              {index + 4}
            </div>
            <div className="hidden h-16 aspect-1/1 mr-6 text-sm md:text-base md:flex justify-center items-center">
              <img
                src={user.pfpUrl}
                alt="PFP"
                className="h-10 aspect-1/1 rounded-full "
              />
            </div>
            <Link
              to="/profile/$slug"
              params={{ slug: user.cfHandle }}
              className="h-full w-full flex items-center text-sm md:text-base truncate mr-4 max-w-36 md:max-w-none hover:scale-105 transition-all duration-200"
            >
              {user.name}
            </Link>
            <div className="flex gap-4 md:gap-4 ml-auto mr-4">
              <div className="w-8 md:w-16 text-sm text-center md:text-base flex justify-center items-center">
                {user.batch || "N/A"}
              </div>
              <div className="w-8 md:w-16 text-sm text-center md:text-base flex justify-center items-center">
                {user.cfRating || "N/A"}
              </div>
              <div className="w-20 md:w-32 text-sm text-center md:text-base flex justify-center items-center md:pr-2">
                {getRatingLevel(user.cfRating)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
