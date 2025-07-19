import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

interface RatingPoint {
  ratingUpdateTimeSeconds: number;
  newRating: number;
}

export default function RatingGraph({ handle }: { handle: string }) {
  const [data, setData] = useState<RatingPoint[]>([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/account/${handle}/ratings`, {
        withCredentials: true,
      })
      .then((res) => {
        setData(res.data);
      });
  }, [handle]);

  const formattedData = data.map((d) => ({
    date: dayjs(d.ratingUpdateTimeSeconds * 1000).format("MM-YY"),
    rating: d.newRating,
  }));

  return (
    <div>
      <h2 className="text-white text-xl mb-4 mt-4">
        Rating <span className="text-gray-400">Graph</span>
      </h2>
      <div className="bg-highlight-dark p-4 md:p-6 rounded-lg">
        <ResponsiveContainer width="100%" height={300} className={"text-xs md:text-sm"} >
          <LineChart data={formattedData}>
            <XAxis dataKey="date" tick={{ fill: "white" }} />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "white" }} tickMargin={0} width={32} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937", // gray-800
                border: "1px solid #374151", // gray-700
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#f9fafb" }} // gray-50
              itemStyle={{ color: "#f9fafb" }} // gray-50
            />{" "}
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#f87171"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
