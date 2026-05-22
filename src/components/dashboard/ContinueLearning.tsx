import { Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Module {
  id: string;
  title: string;
  date: string;
  progress: number;
}

const modules: Module[] = [
  { id: "1", title: "Cross-Border M&A Transaction", date: "Dec 15, 2023", progress: 78 },
  { id: "2", title: "VC Term Sheet Negotiation", date: "Dec 14, 2023", progress: 65 },
  { id: "3", title: "Loan Agreement Drafting", date: "Dec 13, 2023", progress: 82 },
];

const ContinueLearning = () => {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "450ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Continue Learning</h3>
      
      <div className="space-y-3">
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-card rounded-2xl p-4 shadow-card border border-border hover:shadow-elevated hover:border-primary/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-2">
                {module.title}
                <button className="w-6 h-6 min-w-6 min-h-6 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all flex-shrink-0">
                  <Play className="w-3 h-3" />
                </button>
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{module.date}</p>
            <div className="flex items-center gap-3">
              <Progress value={module.progress} className="flex-1 h-2" />
              <span className="text-sm font-semibold text-primary">{module.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContinueLearning;
