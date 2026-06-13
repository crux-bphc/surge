import { useState } from "react";
import type { Leaderboard } from "../types/leaderboard";
import { useClickAway } from "@uidotdev/usehooks";
import { Link, useSearch } from "@tanstack/react-router";
import Dropdown from "./Dropdown";

const LEVEL_OPTIONS = [
  "Newbie",
  "Pupil",
  "Specialist",
  "Expert",
  "Candidate Master",
  "Master",
  "International Master",
];

type LeaderboardHeaderProps = {
  batches: string[];
  leaderboard: Leaderboard[];
  path: "/leaderboard/" | "/leaderboard/$slug";
};

export default function LeaderboardHeader({
  batches,
  leaderboard,
  path,
}: LeaderboardHeaderProps) {
  const [input, setInput] = useState("");
  const [filteredNames, setFilteredNames] = useState<Leaderboard[]>([]);

  const { batch, level } = useSearch({ from: path });

  const searchRef = useClickAway<HTMLDivElement>(() => {
    setFilteredNames([]);
  });

  const inputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    const trimmedValue = value.trim().toLowerCase();
    if (trimmedValue === "") {
      setFilteredNames([]);
    } else {
      const filtered = leaderboard.filter((user) =>
        user.name.toLowerCase().startsWith(trimmedValue)
      );
      setFilteredNames(filtered);
    }
  };

  return (
    <div className="border-b border-[#25293E]">
      <div className="pb-4">
        <div className="mb-7">
          <h1 className="text-3xl font-bold">
            Campus <span className="text-highlight-lighter">Leaderboard</span>
          </h1>
        </div>
        <div className="flex flex-col justify-between md:flex-row">
          {/* Search Input and Results */}
          <div
            ref={searchRef}
            className="relative z-25 flex mr-auto w-full md:w-fit flex-col"
          >
            <input
              type="text"
              value={input}
              onChange={inputChanged}
              placeholder="Search by name"
              className="m-auto mb-4 h-10 w-full rounded-3xl bg-[#25293E] pl-8 text-sm md:m-0 md:w-80"
            />
            <div className="absolute top-12 flex w-full flex-col justify-evenly text-sm">
              {filteredNames.map((user, index) => (
                <div
                  key={user.cfHandle} // Always use a unique key
                  className="absolute top-0 z-25 shadow-2xl rounded-sm flex h-8 w-full items-center justify-center border border-y-1 border-x-0 border-[#1B1E30] bg-[#25293E] transition-all duration-200 ease-out hover:bg-[#25294F] md:w-80"
                  style={{ transform: `translateY(${index * 2}rem)` }}
                >
                  <Link
                    to="/profile/$slug"
                    params={{ slug: user.cfHandle }}
                    className="transition-all duration-200 hover:scale-105"
                    onClick={() => setFilteredNames([])} // Close results on click
                  >
                    {user.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex w-full justify-between gap-4 md:w-auto md:min-w-[22rem] z-20">
            <Dropdown
              options={batches}
              selectedValue={batch}
              placeholder="Filter by Batch"
              field="batch"
            />
            <Dropdown
              options={LEVEL_OPTIONS}
              selectedValue={level}
              placeholder="Filter by Level"
              field="level"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
