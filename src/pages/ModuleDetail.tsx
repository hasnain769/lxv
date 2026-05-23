import { useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  ArrowLeft,
  FileText,
  Clock,
  Lock,
  Sparkles,
  Send,
  CheckCircle2,
  Check,
  Play,
  BookOpen,
  Video,
  Users,
  Star,
  Building,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  Quote,
  X,
  History,
  Award,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import UnlockAccessDialog from "@/components/UnlockAccessDialog";
import SubmitQuestionDialog from "@/components/SubmitQuestionDialog";
import ReadingMaterialContent from "@/components/module/ReadingMaterialContent";
import MediaLibraryContent from "@/components/module/MediaLibraryContent";
import { PracticeScenariosContent } from "@/components/module/PracticeScenariosContent";
import { LiveSessionsContent } from "@/components/module/LiveSessionsContent";
import { SpeakersContent } from "@/components/module/SpeakersContent";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2 } from "lucide-react";

const sections = [
  { id: "introduction", title: "Introduction", icon: FileText, locked: false },
  { id: "scenarios", title: "Practice Scenario", icon: Play, locked: false },
  { id: "previous-sessions", title: "Previous Sessions", icon: History, locked: false },
  { id: "reading", title: "Reading Material", icon: BookOpen, locked: true },
  { id: "media", title: "Media Library", icon: Video, locked: true },
  { id: "sessions", title: "Live Sessions", icon: Video, locked: true },
  { id: "speakers", title: "Speakers & Creators", icon: Users, locked: true },
];

const difficultyColors = {
  Beginner: "bg-green-50 text-green-600 border-green-200",
  Intermediate: "bg-amber-50 text-amber-600 border-amber-200",
  Expert: "bg-red-50 text-red-600 border-red-200",
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const ModuleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { getAccessTokenSilently } = useAuth0();
  
  // Pagination for previous sessions
  const [sessionPage, setSessionPage] = useState(0);
  const sessionPageSize = 5;
  
  const { data: moduleData, isLoading: loadingModule } = useQuery({
    queryKey: ["module", id],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/scenarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to fetch scenarios: ${res.status}`);
      const data = await res.json();
      const match = data.scenarios.find((s: any) => s.id === id);
      if (!match) throw new Error("Module not found");
      return match;
    },
    enabled: !!id,
  });

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ["previous-sessions", id, sessionPage],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/chats?scenario_id=${id}&limit=${sessionPageSize}&offset=${sessionPage * sessionPageSize}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!id,
  });

  const { isModuleUnlocked } = useSubscription();
  const moduleId = id || "default";
  const isUnlocked = isModuleUnlocked(moduleId);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(searchParams.get("tab") || "introduction");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I can help you understand the reading material about shareholder agreements. Feel free to ask me any questions!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitQuestionOpen, setSubmitQuestionOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const handleSectionClick = (sectionId: string, isLocked: boolean) => {
    if (isLocked) {
      setUnlockDialogOpen(true);
    } else if (sectionId === "scenarios") {
      navigate(`/library/${id}/scenario/${id}/play`);
    } else {
      setActiveSection(sectionId);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: "Thank you for your question! I'm here to help you understand shareholder agreements better. This is a default response - real AI integration coming soon!",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        {loadingModule ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !moduleData ? (
          <div className="p-12 text-center text-muted-foreground">
            Module not found.
          </div>
        ) : (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            to="/library"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Modules
          </Link>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-4">{moduleData.name}</h1>

          {/* Difficulty & Duration */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              1 hour
            </div>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${difficultyColors.Intermediate}`}>
              Intermediate
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-6">{moduleData.description}</p>


          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {sections.filter(s => !s.locked).map((section) => {
              const isActive = activeSection === section.id;
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => handleSectionClick(section.id, false)}
                >
                  <section.icon className="w-4 h-4" />
                  {section.title}
                </Button>
              );
            })}
          </div>

          {/* Section Content */}
          {activeSection === "introduction" && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Welcome to the Drafting and Corporate Governance Simulation Game</h2>
              
              <p className="text-muted-foreground mb-6 italic text-sm">
                Characters and legal entities may exist in real life. However, the present simulation game has no links with such characters or names. The game is fiction and real life characters (if those appear) are chosen to make the scenarios more realistic.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Scenario Overview</h3>
              <ul className="list-disc pl-5 mb-6 text-muted-foreground space-y-2">
                <li>You are about to take on the role of Danny Crane, lead counsel advising your client, Marc Feider, CEO of Doctena S.A., on an upcoming transaction.</li>
                <li>The scenario should teach you about basic drafting matters in contracts, particularly with a focus on boiler-plate provisions in such contracts as well as basic corporate governance matters. Therefore, when discussion with Marc Feider, keep these matters in mind.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">Your Objectives</h3>
              <ul className="list-disc pl-5 mb-6 text-muted-foreground space-y-2">
                <li>Advise Marc so that he is satisfied and your own professional interests are protected.</li>
                <li>Once the legal framework is clear, draft any necessary documents (agreements, corporate resolutions (where necessary), notices etc).</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">Game Mechanics</h3>
              <ul className="list-disc pl-5 mb-6 text-muted-foreground space-y-2">
                <li>Turn-based Q&A: you may ask Marc (the "client") for any missing facts, documents or preferences.</li>
                <li>You must answer each message in a formal email form.</li>
                <li>You may propose legal steps, propose strategies, draft documents and wordings.</li>
                <li>However, it should be noted that the game scenario does not have as goal to draft new clauses or contractual documents that are not already in the game scenario. You may add boiler-plate clauses and similar if they make sense.</li>
                <li>If you need to check the company's Articles of Association or other documentation, please use all means available to you, such as the Luxembourg company's register.</li>
                <li>The scenario is based on Luxembourg law but the essence is to learn drafting and corporate governance mechanisms that are applicable in principle all over the world.</li>
              </ul>

              <hr className="my-6 border-border" />

              <h3 className="text-lg font-semibold text-foreground mb-3">Next Steps</h3>
              <p className="text-muted-foreground mb-6">
                Ask any questions or begin by clicking <span className="font-bold text-foreground">UNDERSTOOD EVERYTHING</span>. To exit, click <span className="font-bold text-foreground">TERMINATE GAME</span>.
              </p>

              <div className="flex justify-center mt-8">
                <Button size="lg" className="gap-2 px-12" onClick={() => navigate(`/library/${id}/scenario/${id}/play`)}>
                  Start Scenario
                  <Play className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Previous Sessions Section */}
          {activeSection === "previous-sessions" && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Previous Sessions</h2>
              {loadingSessions ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : sessionsData?.chats?.length === 0 ? (
                <p className="text-muted-foreground">No previous sessions found for this scenario.</p>
              ) : (
                <div className="space-y-4">
                  {sessionsData?.chats?.map((session: any) => (
                    <div className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" key={session.id}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {session.last_message_preview || "No messages yet"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <Badge variant="outline" className="capitalize text-xs py-0 h-5">
                            {session.state}
                          </Badge>
                          {session.state.toUpperCase() === 'ENDED' && session.final_score !== undefined && session.final_score !== null && (
                            <span className="text-sm font-medium ml-2 text-foreground flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-primary" />
                              Score: {session.final_score}/{session.max_score || 31}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/library/${id}/scenario/${id}/play?chatId=${session.id}`)}>
                        {session.state.toUpperCase() === 'ENDED' ? 'View Chat' : 'Resume Chat'}
                      </Button>
                    </div>
                  ))}
                  
                  {/* Pagination Controls */}
                  {sessionsData && sessionsData.total > sessionPageSize && (
                    <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSessionPage(p => Math.max(0, p - 1))}
                        disabled={sessionPage === 0}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {sessionPage + 1} of {Math.ceil(sessionsData.total / sessionPageSize)}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSessionPage(p => p + 1)}
                        disabled={(sessionPage + 1) * sessionPageSize >= sessionsData.total}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reading Material Section */}
          {activeSection === "reading" && (
            <ReadingMaterialContent />
          )}

          {/* Media Library Section */}
          {activeSection === "media" && (
            <MediaLibraryContent onViewRelatedSection={() => setActiveSection("reading")} />
          )}

          {/* Practice Scenarios Section */}
          {activeSection === "scenarios" && (
            <PracticeScenariosContent />
          )}

          {/* Live Sessions Section */}
          {activeSection === "sessions" && (
            <LiveSessionsContent />
          )}


          {/* Speakers & Creators Section */}
          {activeSection === "speakers" && (
            <SpeakersContent />
          )}

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 LXVerse. All rights reserved.
          </footer>
        </div>
        )}
      </main>

      {/* Floating AI Assistant Button */}
      <Button
        onClick={() => setAiDrawerOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      {/* AI Assistant Drawer */}
      {aiDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setAiDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[85vw] sm:w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col">
            <div className="p-4 sm:p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">AI Assistant</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAiDrawerOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto space-y-4 bg-white border border-border rounded-2xl p-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === "assistant" ? "bg-secondary" : "bg-primary"
                    }`}>
                      {message.role === "assistant" ? (
                        <Sparkles className="w-4 h-4 text-primary" />
                      ) : (
                        <Users className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className={`rounded-xl p-3 max-w-[85%] ${
                      message.role === "assistant" 
                        ? "bg-secondary rounded-tl-none" 
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-secondary rounded-xl rounded-tl-none p-3">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Ask about the reading..."
                  className="flex-1"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full gap-2 bg-white" onClick={() => setSubmitQuestionOpen(true)}>
                  <HelpCircle className="w-4 h-4" />
                  Submit Questions
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full gap-2 bg-white"
                  onClick={() => navigate(`/library/${id || 'shareholder-agreements'}/scenario/1/experts`)}
                >
                  <Users className="w-4 h-4" />
                  Contact Instructor
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <UnlockAccessDialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen} moduleId={moduleId} />
      <SubmitQuestionDialog open={submitQuestionOpen} onOpenChange={setSubmitQuestionOpen} />
    </div>
  );
};

export default ModuleDetail;
