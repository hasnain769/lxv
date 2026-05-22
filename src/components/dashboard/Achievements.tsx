import { Trophy, Star, Target, Zap, Crown, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress: number;
}

const badges: Badge[] = [
  { id: "1", name: "Contract Master", description: "Complete 10 contracts", icon: <Award className="w-8 h-8" />, earned: false, progress: 70 },
  { id: "2", name: "First Victory", description: "Complete your first scenario", icon: <Trophy className="w-8 h-8" />, earned: true, progress: 100 },
  { id: "3", name: "Rising Star", description: "Achieve 90% in any module", icon: <Star className="w-8 h-8" />, earned: true, progress: 100 },
  { id: "4", name: "Focused Learner", description: "Complete 5 modules", icon: <Target className="w-8 h-8" />, earned: false, progress: 40 },
  { id: "5", name: "Speed Demon", description: "Complete a scenario in record time", icon: <Zap className="w-8 h-8" />, earned: false, progress: 0 },
  { id: "6", name: "Perfect Score", description: "Achieve 100% in any scenario", icon: <Crown className="w-8 h-8" />, earned: false, progress: 0 },
];

const Achievements = () => {
  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Your Achievements</h3>
          <p className="text-sm text-muted-foreground">{earnedCount} of {badges.length} badges earned</p>
        </div>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View All
        </button>
      </div>

      <div className="grid grid-cols-6 gap-6">
        {badges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-3 transition-all duration-300",
              badge.earned 
                ? "bg-gradient-primary text-primary-foreground shadow-lg" 
                : "bg-secondary/50 text-muted-foreground border-2 border-dashed border-border"
            )}>
              {badge.icon}
            </div>
            <span className={cn(
              "text-sm font-medium text-center",
              badge.earned ? "text-primary" : "text-muted-foreground"
            )}>
              {badge.name}
            </span>
            <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
              {badge.description}
            </span>
            {!badge.earned && badge.progress > 0 && (
              <span className="text-xs text-accent font-medium mt-1">
                {badge.progress}% Complete
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
