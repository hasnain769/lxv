import { Link } from "react-router-dom";
import { Search, Clock, ArrowRight, FileText, GraduationCap } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
  progress?: number;
  scenarios: number;
  tags: string[];
  duration: string;
  createdBy?: string;
}

// Removed hardcoded modules

const difficultyColors = {
  Beginner: "bg-green-50 text-green-600 border-green-200",
  Intermediate: "bg-amber-50 text-amber-600 border-amber-200",
  Expert: "bg-red-50 text-red-600 border-red-200",
};

const ModuleCard = ({ module }: { module: Module }) => (
  <div className="bg-card rounded-2xl border border-border shadow-card flex flex-col overflow-hidden">
    {/* Banner - either Created by or LXVerse original */}
    {module.createdBy ? (
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <span className="text-sm">
          Created by <span className="font-semibold">{module.createdBy}</span>
        </span>
      </div>
    ) : (
      <div className="bg-secondary text-secondary-foreground px-4 py-3 flex items-center gap-2">
        <GraduationCap className="w-4 h-4" />
        <span className="text-sm font-medium">LXVerse Original Content</span>
      </div>
    )}

    <div className="p-5 flex flex-col flex-1">
      {/* Difficulty & Progress row */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${difficultyColors[module.difficulty]}`}>
          {module.difficulty}
        </span>
        {module.progress !== undefined && (
          <span className="text-sm font-medium text-primary">
            {module.progress}% complete
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
        {module.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {module.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {module.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs bg-background">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Duration & Scenarios */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 mt-auto">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {module.duration}
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          {module.scenarios} scenarios
        </div>
      </div>

      {/* View Module Button */}
      <Button asChild className="w-full gap-2">
        <Link to={`/library/${module.id}`}>
          View Module
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  </div>
);

import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2 } from "lucide-react";

const ModuleLibrary = () => {
  const { getAccessTokenSilently } = useAuth0();

  const { data: realModules, isLoading, error } = useQuery({
    queryKey: ["scenarios"], // We use scenarios as modules
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

  const displayModules: Module[] = realModules?.map((rs: any) => ({
    id: rs.id,
    title: rs.name,
    description: rs.description || "No description provided.",
    difficulty: "Intermediate",
    scenarios: 1, // Treating it as 1 scenario per module since they ARE the scenarios
    tags: ["General"],
    duration: "1 hour",
  })) || [];
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">Module Library</h1>
            <p className="text-muted-foreground">
              Browse our comprehensive collection of legal training modules
            </p>
          </header>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-8 animate-fade-in" style={{ animationDelay: "50ms" }}>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                className="pl-10"
              />
            </div>
            <Select defaultValue="all-categories">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                <SelectItem value="corporate-law">Corporate Law</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="ip-law">IP Law</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-modules">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-modules">All Modules</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Module Grid */}
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20">
              <p className="font-semibold">Failed to load modules.</p>
              <p className="text-sm mt-1">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
            </div>
          ) : displayModules.length === 0 ? (
            <div className="p-8 text-center bg-muted/30 rounded-2xl border border-border">
              <p className="text-muted-foreground">No modules available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              {displayModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 LXVerse. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ModuleLibrary;
