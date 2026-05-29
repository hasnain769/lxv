import { Link, useParams } from "react-router-dom";
import { Play, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
  duration: string;
  lastScore?: number;
  status: "not-started" | "in-progress" | "completed";
}

// Removed hardcoded scenarios

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700 border-green-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Expert: "bg-red-100 text-red-700 border-red-200",
};

export function PracticeScenariosContent() {
  const { id } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  const { data: realScenarios, isLoading, error } = useQuery({
    queryKey: ["scenarios"],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/scenarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to fetch scenarios: ${res.status}`);
      const data = await res.json();
      return data.scenarios || [];
    }
  });

  const getButtonLabel = (status: string | undefined) => {
    switch (status) {
      case "completed":
        return "Play Again";
      case "in-progress":
        return "Continue";
      default:
        return "Play";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20">
        <p className="font-semibold">Failed to load scenarios.</p>
        <p className="text-sm mt-1">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
      </div>
    );
  }

  const displayScenarios = realScenarios
    ?.filter((rs: any) => rs.status === "Active")
    ?.map((rs: { id: string; name: string; description?: string; created_at: string }, idx: number) => {
      return {
        id: rs.id,
        title: rs.name,
        description: rs.description || "No description provided.",
        difficulty: "Intermediate", // Fallback if backend doesn't provide
        duration: "45 min", // Fallback
        status: "not-started"
      };
    }) || [];

  if (displayScenarios.length === 0) {
    return (
      <div className="p-8 text-center bg-muted/30 rounded-2xl border border-border">
        <p className="text-muted-foreground">No scenarios available for this module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayScenarios.map((scenario: Scenario) => (
        <div
          key={scenario.id}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex gap-4">
            {/* Play Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Play className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {scenario.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {scenario.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{scenario.duration}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${difficultyColors[scenario.difficulty]} font-medium`}
                  >
                    {scenario.difficulty}
                  </Badge>
                  {scenario.lastScore !== undefined && (
                    <span className="text-sm text-primary font-semibold">
                      Last Score: {scenario.lastScore}%
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <Button asChild className="gap-2">
                  <Link to={`/library/${id}/scenario/${scenario.id}/play`}>
                    Start Scenario
                    <Play className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
