import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, ArrowRight, Scale, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface FeedbackExample {
  module: string;
  note: string;
}

interface Feedback {
  id: string;
  title: string;
  description: string;
  score: number;
  icon: React.ReactNode;
  examples?: FeedbackExample[];
}

const feedbackItems: Feedback[] = [
  {
    id: "1",
    title: "Strengthen Finance Skills",
    description: "Your finance scores show room for improvement across 3 recent scenarios.",
    score: 62,
    icon: <FileText className="w-5 h-5" />,
    examples: [
      { module: "VC Term Sheet", note: "Missed key valuation cap implications" },
      { module: "Loan Agreement", note: "Unclear on interest rate calculation methods" },
    ],
  },
  {
    id: "2",
    title: "Corporate Law Review",
    description: "Room for growth in cross-border transaction structuring.",
    score: 68,
    icon: <Landmark className="w-5 h-5" />,
    examples: [
      { module: "EU Cross-Border M&A", note: "Missed regulatory filing requirements" },
      { module: "Corporate Governance", note: "Board approval process incomplete" },
    ],
  },
  {
    id: "3",
    title: "Master Negotiation",
    description: "You're excelling here! Your client communication is consistently strong.",
    score: 90,
    icon: <Scale className="w-5 h-5" />,
  },
];

const FeedbackCard = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success bg-success/10";
    if (score >= 60) return "text-accent bg-accent/10";
    return "text-destructive bg-destructive/10";
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Professor's Feedback</h3>
      
      <div className="space-y-4">
        {feedbackItems.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-2xl p-5 shadow-card border-l-4 border-l-primary border border-border transition-all duration-200 hover:shadow-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <span className={cn(
                    "text-sm font-semibold px-3 py-1 rounded-full",
                    getScoreColor(item.score)
                  )}>
                    {item.score}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <Progress value={item.score} className="h-2 mb-3" />
                
                {item.examples && (
                  <>
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Show Examples
                      {expandedId === item.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {expandedId === item.id && (
                      <div className="mt-3 space-y-2">
                        {item.examples.map((example, i) => (
                          <div key={i} className="bg-secondary/50 rounded-lg p-3">
                            <p className="text-sm font-medium text-foreground">{example.module}</p>
                            <p className="text-xs text-muted-foreground italic">"{example.note}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                
                <button className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-3">
                  Practice Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackCard;
