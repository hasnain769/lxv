import { Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Certification {
  id: string;
  name: string;
  progress: string;
  scenariosPassed: number;
  totalScenarios: number;
}

const certifications: Certification[] = [
  { id: "1", name: "Shareholder Agreements", progress: "1/3 scenarios passed", scenariosPassed: 1, totalScenarios: 3 },
  { id: "2", name: "M&A Fundamentals", progress: "2/4 scenarios passed", scenariosPassed: 2, totalScenarios: 4 },
  { id: "3", name: "VC Financing", progress: "0/3 scenarios passed", scenariosPassed: 0, totalScenarios: 3 },
];

const Certifications = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-fade-in" style={{ animationDelay: "250ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Certifications</h3>
          <span className="text-sm text-muted-foreground">(0 earned)</span>
        </div>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View All
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            onClick={() => navigate(`/certification/${cert.id}`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
              <Award className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{cert.name}</p>
              <p className="text-xs text-muted-foreground">{cert.progress}</p>
              <div className="mt-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(cert.scenariosPassed / cert.totalScenarios) * 100}%` }}
                />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certifications;
