import { useMemo } from "react";
import { cn } from "@/lib/utils";

const generateActivityData = () => {
  const rows = 7;
  const cols = 20;
  const data: number[][] = [];
  
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const rand = Math.random();
      if (rand < 0.25) row.push(0);
      else if (rand < 0.45) row.push(1);
      else if (rand < 0.65) row.push(2);
      else if (rand < 0.85) row.push(3);
      else row.push(4);
    }
    data.push(row);
  }
  return data;
};

const ActivityCalendar = () => {
  const activityData = useMemo(() => generateActivityData(), []);
  
  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return "bg-muted";
      case 1: return "bg-primary/20";
      case 2: return "bg-primary/40";
      case 3: return "bg-primary/70";
      case 4: return "bg-primary";
      default: return "bg-muted";
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-fade-in h-full flex flex-col" style={{ animationDelay: "350ms" }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Learning Activity</h3>
        <p className="text-sm text-muted-foreground">Your daily scenario completion over the last year</p>
      </div>

      <div className="flex-1 flex items-center">
        <div className="grid gap-1 w-full" style={{ gridTemplateColumns: `repeat(20, 1fr)` }}>
          {activityData.flat().map((level, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-full transition-all duration-200 hover:scale-125",
                getActivityColor(level)
              )}
            />
          ))}
        </div>
      </div>

      {/* Streak and Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">7</span>
            <span className="text-sm text-muted-foreground">Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={cn("w-2 h-2 rounded-full", getActivityColor(level))} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendar;
