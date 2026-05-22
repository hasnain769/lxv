import { Link } from "react-router-dom";
import { Search, Clock, ArrowRight, FileText } from "lucide-react";
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
  progress: number;
  scenarios: number;
  tags: string[];
  duration: string;
  createdBy: string;
}

const myModules: Module[] = [
  {
    id: "shareholder-agreements",
    title: "Negotiation and Drafting of Shareholder Agreements",
    description: "Master the art of negotiating and drafting comprehensive shareholder agreements for various business structures.",
    difficulty: "Intermediate",
    progress: 65,
    scenarios: 8,
    tags: ["Corporate Law", "M&A", "Contract Drafting"],
    duration: "6-8 hours",
    createdBy: "Schmidt & Partners LLP",
  },
];

const difficultyColors = {
  Beginner: "bg-green-50 text-green-600 border-green-200",
  Intermediate: "bg-amber-50 text-amber-600 border-amber-200",
  Expert: "bg-red-50 text-red-600 border-red-200",
};

const ModuleCard = ({ module }: { module: Module }) => (
  <div className="bg-card rounded-2xl border border-border shadow-card flex flex-col overflow-hidden">
    {/* Created by banner */}
    <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
      <FileText className="w-4 h-4" />
      <span className="text-sm">
        Created by <span className="font-semibold">{module.createdBy}</span>
      </span>
    </div>

    <div className="p-5 flex flex-col flex-1">
      {/* Difficulty & Progress row */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${difficultyColors[module.difficulty]}`}>
          {module.difficulty}
        </span>
        <span className="text-sm font-medium text-primary">
          {module.progress}% complete
        </span>
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

      {/* Continue Learning Button */}
      <Button asChild className="w-full gap-2">
        <Link to={`/library/${module.id}`}>
          Continue Learning
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  </div>
);

const MyModules = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Modules</h1>
            <p className="text-muted-foreground">
              Your subscribed modules and learning progress
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            {myModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 LXVerse. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
};

export default MyModules;
