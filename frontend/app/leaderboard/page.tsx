"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

interface Score {
  id: number;
  user: {
    username: string;
    // email may not be present in the API payload; keep optional for safety
    email?: string;
  };
  gameType: string;
  score: number;
  createdAt: string;
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<Record<string, Score[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/scores/leaderboard`,
        );
        setScores(response.data);
      } catch (err) {
        setError("Failed to load leaderboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  type UserWithName = {
    name?: string;
    email?: string;
  };

  // Safely get user identifier
  const getCurrentIdentifier = (): string => {
    if (!user) {
      return "";
    }
    const userWithName = user as UserWithName;
    return (userWithName.email || userWithName.name || "").toLowerCase();
  };

  const currentIdentifier = getCurrentIdentifier();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

      {Object.entries(scores).map(([gameType, gameScores]) => (
        <div key={gameType} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 capitalize">{gameType} Leaderboard</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Player
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gameScores.map((score, index) => {
                  const isCurrent =
                    currentIdentifier &&
                    (currentIdentifier === (score.user.email?.toLowerCase() || "") ||
                      currentIdentifier === (score.user.username?.toLowerCase() || ""));
                  return (
                    <tr key={score.id} className={isCurrent ? "bg-blue-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {score.user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(score.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
