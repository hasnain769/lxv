import { Award, Lock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";

interface CertificationModuleProps {
  id: string;
  title: string;
  completedScenarios: number;
  totalScenarios: number;
  minimumScore: number;
  maxScore: number;
  price?: number;
  isUnlocked: boolean;
}

const CertificationModule = ({
  id,
  title,
  completedScenarios,
  totalScenarios,
  minimumScore,
  maxScore,
  price,
  isUnlocked,
}: CertificationModuleProps) => (
  <Link to={`/certification/${id}`} className="block">
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        
        {!isUnlocked && price && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent text-accent shrink-0">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">€{price} to unlock</span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {completedScenarios} / {totalScenarios} scenarios completed • Minimum score required: {minimumScore}/{maxScore}
      </p>
      
      {/* Progress segments with arrow */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: totalScenarios }).map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index < completedScenarios ? "bg-green-500" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </div>
  </Link>
);

const Certification = () => {
  const modules: CertificationModuleProps[] = [
    {
      id: "shareholder-agreements",
      title: "Negotiation and Drafting of Shareholder Agreements",
      completedScenarios: 1,
      totalScenarios: 3,
      minimumScore: 6,
      maxScore: 10,
      price: 300,
      isUnlocked: false,
    },
  ];

  const certifiedCount = 0;
  const totalModules = modules.length;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <div className="p-8 max-w-4xl">
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Certification</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Complete certification scenarios to earn your professional credentials.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/30">
              <span className="text-accent font-medium">⚠️ Each scenario is one-shot only.</span>
            </div>
          </header>

          {/* Your Purchased Modules Section */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Your Purchased Modules</h2>
              <div className="px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground">
                {certifiedCount} / {totalModules} Certified
              </div>
            </div>

            <div className="space-y-4">
              {modules.map((module, index) => (
                <CertificationModule key={index} {...module} />
              ))}
            </div>
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

export default Certification;