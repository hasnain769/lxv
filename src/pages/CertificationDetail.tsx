import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Award, Lock, ArrowLeft, CreditCard, CheckCircle2, AlertTriangle, Clock, Target, Play } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import UnlockCertificationDialog from "@/components/UnlockCertificationDialog";

interface CertificationScenario {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  minScore: number;
  maxScore: number;
  status: "not-started" | "passed" | "failed";
  userScore?: number;
}

// Mock data - in real app this would come from API/database
const certificationModules = [
  {
    id: "shareholder-agreements",
    title: "Negotiation and Drafting of Shareholder Agreements",
    price: 300,
    scenarios: 3,
    isUnlocked: false,
  },
];

const certificationScenarios: CertificationScenario[] = [
  {
    id: "1",
    number: 1,
    title: "Founder Equity Split Negotiation",
    description: "Navigate a complex negotiation between co-founders regarding initial equity distribution.",
    duration: "25 min",
    minScore: 6,
    maxScore: 10,
    status: "passed",
    userScore: 7,
  },
  {
    id: "2",
    number: 2,
    title: "Investor Rights Clause Drafting",
    description: "Draft protective provisions and investor rights clauses for a Series A investment.",
    duration: "30 min",
    minScore: 6,
    maxScore: 10,
    status: "not-started",
  },
  {
    id: "3",
    number: 3,
    title: "Exit Strategy and Tag-Along Rights",
    description: "Advise on exit mechanisms and negotiate tag-along/drag-along provisions.",
    duration: "35 min",
    minScore: 6,
    maxScore: 10,
    status: "not-started",
  },
];

const CertificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const certModule = certificationModules.find((m) => m.id === id) || certificationModules[0];
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(certModule.isUnlocked);

  const handleUnlockConfirm = () => {
    setIsUnlocked(true);
    setUnlockDialogOpen(false);
  };

  const passedCount = certificationScenarios.filter((s) => s.status === "passed").length;
  const totalCount = certificationScenarios.length;
  const progressPercentage = 30; // Fixed at 30%

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <div className="p-8 max-w-4xl">
          {/* Back link */}
          <Link 
            to="/certification" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Certifications
          </Link>

          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Certification Progress</h1>
            </div>
            <p className="text-muted-foreground">
              {certModule.title}
            </p>
          </header>

          {/* Locked State Card */}
          {!isUnlocked && (
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border animate-fade-in" style={{ animationDelay: "100ms" }}>
              {/* Header with lock icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Certification Locked</h2>
                  <p className="text-muted-foreground">Pay a one-time fee to start your certification journey</p>
                </div>
              </div>

              {/* Price Box */}
              <div className="border border-border rounded-xl p-5 bg-background mb-6 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">€{certModule.price}</p>
                  <p className="text-sm text-muted-foreground">One-time certification fee</p>
                </div>
                <Button size="lg" className="gap-2" onClick={() => setUnlockDialogOpen(true)}>
                  <CreditCard className="w-5 h-5" />
                  Unlock Certification
                </Button>
              </div>

              {/* What you'll get */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">What you'll get:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    Access to {certModule.scenarios} certification scenarios
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    Official certificate upon completion
                  </li>
                  <li className="flex items-center gap-3 text-amber-600">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    Each scenario is one-shot only — no retries
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Unlocked State */}
          {isUnlocked && (
            <div className="space-y-6 animate-fade-in">
              {/* Progress Card */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Certification Progress</span>
                  </div>
                  <Badge variant="outline" className="bg-background">
                    {passedCount} / {totalCount} Passed
                  </Badge>
                </div>
                <Progress value={progressPercentage} className="h-2 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Score at least 6/10 in all scenarios to earn your certificate.
                </p>
              </div>

              {/* Warning Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700">One Attempt Only</p>
                    <p className="text-sm text-amber-600">
                      Each certification scenario can only be attempted once. Make sure you are fully prepared before starting. There are no retries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Certification Scenarios */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Certification Scenarios</h2>
                <div className="space-y-4">
                  {certificationScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`bg-card border rounded-xl p-5 ${
                        scenario.status === "passed" 
                          ? "border-green-200 bg-green-50/50" 
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Scenario Number */}
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <span className="font-semibold text-muted-foreground">{scenario.number}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-foreground">{scenario.title}</h3>
                            {scenario.status === "passed" && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Passed
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {scenario.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {scenario.duration}
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Target className="w-4 h-4" />
                              Min. Score: {scenario.minScore}/{scenario.maxScore}
                            </div>
                            {scenario.userScore !== undefined && (
                              <span className="text-green-700 font-bold">
                                Your Score: {scenario.userScore}/{scenario.maxScore}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        {scenario.status === "not-started" && (
                          <Button 
                            className="gap-2 shrink-0"
                            onClick={() => navigate(`/library/${id}/scenario/${scenario.id}/play`)}
                          >
                            <Play className="w-4 h-4" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certification Requirements */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-3">Certification Requirements</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">• Complete all {totalCount} certification scenarios</li>
                  <li className="text-muted-foreground">• Achieve a minimum score of 6/10 in each scenario</li>
                  <li className="text-amber-600">• Each scenario is one-shot only — no retries allowed</li>
                  <li className="text-muted-foreground">• Upon completion, download your certificate as a PDF</li>
                </ul>
              </div>
            </div>
          )}

          {/* Unlock Certification Dialog */}
          <UnlockCertificationDialog
            open={unlockDialogOpen}
            onOpenChange={setUnlockDialogOpen}
            moduleTitle={certModule.title}
            price={certModule.price}
            onConfirm={handleUnlockConfirm}
          />

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 LXVerse. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
};

export default CertificationDetail;
