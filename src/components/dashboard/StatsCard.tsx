import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "default" | "highlight";
  delay?: number;
}

const StatsCard = ({ icon, label, value, subtext, variant = "default", delay = 0 }: StatsCardProps) => {
  return (
    <div 
      className={cn(
        "p-6 rounded-2xl transition-all duration-300 hover:shadow-elevated animate-fade-in relative overflow-hidden",
        variant === "default" && "bg-card border border-border shadow-card",
        variant === "highlight" && "bg-card shadow-card"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <p className="text-4xl font-bold text-foreground mt-1">{value}</p>
          {subtext && (
            <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          variant === "default" && "bg-secondary text-primary",
          variant === "highlight" && "bg-accent/10 text-accent"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
