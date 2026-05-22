import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Info, Target, Users, Play, Loader2 } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";

// Removed hardcoded scenariosData

const difficultyColors = {
  Beginner: "bg-green-100 text-green-700 border-green-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Expert: "bg-red-100 text-red-700 border-red-200",
};

const ScenarioDetail = () => {
  const { id, scenarioId } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  const { data: scenario, isLoading: loadingScenario } = useQuery({
    queryKey: ["scenario", scenarioId],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/scenarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch scenarios");
      const data = await res.json();
      const match = data.scenarios.find((s: { id: string; name: string; description?: string }) => s.id === scenarioId);
      if (!match) throw new Error("Scenario not found");
      return {
        ...match,
        difficulty: "Intermediate", // Fallback
        duration: "45 min" // Fallback
      };
    },
    enabled: !!scenarioId,
  });

  const { data: previousSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["previous-sessions", scenarioId],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/chats?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      // Use the actual ID fetched from API or mapped
      return data.chats.filter((chat: { scenario_id: string; id: string; created_at: string; state: string }) => chat.scenario_id === scenarioId);
    },
    enabled: !!scenarioId,
  });

  if (loadingScenario) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">
          <p className="text-muted-foreground">Scenario not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <div className="p-8 max-w-4xl">
          {/* Back link */}
          <Link
            to={`/library/${id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Module
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${difficultyColors[scenario.difficulty]} font-medium`}>
                {scenario.difficulty}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {scenario.duration}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">{scenario.name}</h1>
            <p className="text-muted-foreground text-lg">{scenario.description || "No description available for this scenario."}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-center text-muted-foreground">
            <Info className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>Detailed scenario instructions and context will be available soon.</p>
          </div>

          {/* Start Scenario Button */}
          <div className="flex justify-center mb-12">
            <Link to={`/library/${id}/scenario/${scenarioId}/play`}>
              <Button size="lg" className="gap-2 px-12">
                Start Scenario
                <Play className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Previous Sessions */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Previous Sessions</h2>
            {loadingSessions ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : previousSessions?.length === 0 ? (
              <p className="text-muted-foreground">No previous sessions found for this scenario.</p>
            ) : (
              <div className="space-y-4">
                {previousSessions?.map((session: { id: string; created_at: string; state: string }) => (
                  <div key={session.id} className="bg-background border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        Session from {new Date(session.created_at).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {session.state}
                      </Badge>
                    </div>
                    {/* Use a Link if you have a viewer page, or disable it for now */}
                    <Button variant="outline" size="sm" disabled>
                      View Chat (Coming Soon)
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScenarioDetail;
