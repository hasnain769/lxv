import { Target, Flame } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import Achievements from "@/components/dashboard/Achievements";
import Certifications from "@/components/dashboard/Certifications";
import SkillsRadar from "@/components/dashboard/SkillsRadar";
import ActivityCalendar from "@/components/dashboard/ActivityCalendar";
import FeedbackCard from "@/components/dashboard/FeedbackCard";
import ContinueLearning from "@/components/dashboard/ContinueLearning";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8 max-w-6xl">
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, John!
            </h1>
            <p className="text-lg text-muted-foreground">
              Ready to continue your legal learning journey?
            </p>
          </header>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <StatsCard
              icon={<Target className="w-6 h-6" />}
              label="Scenarios Completed"
              value="7 / 10"
              subtext="Contract Law module"
              delay={0}
            />
            <StatsCard
              icon={<Flame className="w-6 h-6" />}
              label="Learning Activity"
              value="7 Day Streak"
              subtext="Keep it up!"
              variant="highlight"
              delay={50}
            />
          </div>

          {/* Achievements row */}
          <div className="mb-8">
            <Achievements />
          </div>

          {/* Certifications row */}
          <div className="mb-8">
            <Certifications />
          </div>

          {/* Skills + Activity row */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-7">
              <SkillsRadar />
            </div>
            <div className="col-span-5">
              <ActivityCalendar />
            </div>
          </div>

          {/* Feedback + Continue Learning row */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7">
              <FeedbackCard />
            </div>
            <div className="col-span-5">
              <ContinueLearning />
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

export default Index;
