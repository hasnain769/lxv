import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { Award, Target, TrendingUp, TrendingDown, CheckCircle2, XCircle, Trophy, Medal, Zap, Home, RotateCcw, Users, Lightbulb, Loader2, MessageSquare } from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const parseEvaluationText = (text: string) => {
  if (!text) return null;
  
  // Clean up completion checkboxes if present
  const cleanText = text.replace(/✅ Evaluation checked for correctness/g, '').trim();

  // Extract groups
  const groups: any[] = [];
  const groupRegex = /\*\*Group \d+(?:[^a-zA-Z0-9]+)([^*]+)\s*\([^)]*\):\*\*\s*(?:\*\*)?Score:(?:\*\*)?\s*(\d+)(?:\/\d+)?\s*(?:\*\*)?Evidence(?:[^\n]*):(?:\*\*)?\s*(.*?)\s*(?:\*\*)?Feedback(?:[^\n]*):(?:\*\*)?\s*(.*?)(?=\*\*Group|\*\*Overall|$)/gis;
  
  let match;
  while ((match = groupRegex.exec(cleanText)) !== null) {
    groups.push({
      category: match[1].trim(),
      score: parseInt(match[2], 10) || 0,
      evidence: match[3].trim(),
      feedback: match[4].trim(),
    });
  }

  // Calculate rawScore primarily by summing group scores to ensure consistency
  let rawScore = 0;
  let maxScore = 31; // Default
  
  if (groups.length > 0) {
    rawScore = groups.reduce((sum, g) => sum + g.score, 0);
  } else {
    // Fallback if group parsing failed: extract overall score from text
    const scoreMatches = [...cleanText.matchAll(/(?:\*\*Overall Score[^*]*:\*\*|\*\*Score[^*]*:\*\*|Overall Score[^\d]*:|Score[^\d]*:)\s*(\d+)(?:\/(\d+))?/gi)];
    if (scoreMatches.length > 0) {
      const lastMatch = scoreMatches[scoreMatches.length - 1];
      rawScore = parseInt(lastMatch[1], 10) || 0;
      if (lastMatch[2]) {
        maxScore = parseInt(lastMatch[2], 10);
      }
    }
  }

  const percentageScore = Math.round((rawScore / maxScore) * 100);
  
  // Extract performance band
  const bandMatch = cleanText.match(/\*\*Performance Band:\*\*\s*(.+)/i);
  const grade = bandMatch ? bandMatch[1].trim() : "Evaluated";



  // Extract psychological profile
  const profileMatch = cleanText.match(/\*\*Psychological Profile of the Player:\*\*(.*?)(?=\*\*|$)/is);
  const profile = profileMatch ? profileMatch[1].trim() : "Not enough linguistic material available.";

  // Extract final feedback
  const feedbackMatch = cleanText.match(/\*\*Final Feedback to Player:\*\*(.*?)(?=\*\*|$)/is);
  const feedback = feedbackMatch ? feedbackMatch[1].trim() : "Great effort! Keep practicing your legal reasoning and negotiations.";

  // Extract General Scenario Comments
  const scenarioCommentsMatch = cleanText.match(/\*\*General Scenario Comments:\*\*(.*?)(?=\*\*|$)/is);
  const scenarioComments = scenarioCommentsMatch ? scenarioCommentsMatch[1].trim() : "";

  return {
    score: percentageScore,
    rawScore,
    maxScore,
    grade,
    groups,
    profile,
    feedback,
    scenarioComments,
    rawText: cleanText
  };
};

const ScenarioEvaluation = () => {
  const { id, scenarioId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const chatId = searchParams.get("chatId");
  const { getAccessTokenSilently } = useAuth0();

  const { data: chatData, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!chatId) throw new Error("No chat ID provided");
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load chat data");
      return res.json();
    },
    enabled: !!chatId,
    refetchInterval: (query) => {
      // Refresh periodically if the state is not yet ENDED (scoring in progress)
      if (query.state.data?.state !== "ended") {
        return 2000;
      }
      return false;
    }
  });

  // The backend saves the scorecard message with state='game' during the transition,
  // so we just find the most recent Professor message once the chat is ended.
  const evaluationMessage = chatData?.game_messages?.slice().reverse().find((m: any) => m.source === "Professor");
  const parsedData = evaluationMessage ? parseEvaluationText(evaluationMessage.content) : null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-primary";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading || (!parsedData && chatData?.state !== "ended")) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Scoring your performance...</h2>
        <p className="text-muted-foreground mt-2">The Professor is analyzing your responses.</p>
      </div>
    );
  }

  if (!parsedData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-foreground">Evaluation Not Found</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          We couldn't find the scorecard for this session. It's possible the evaluation is still generating or encountered an error.
        </p>
        <Button className="mt-8 gap-2" onClick={() => navigate(`/library/${id}`)}>
          <Home className="w-4 h-4" /> Back to Module
        </Button>
      </div>
    );
  }

  // Determine what they did well vs missed
  const didWell = parsedData.groups.filter(g => g.score > 0);
  const missed = parsedData.groups.filter(g => g.score === 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64 pt-20 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md -mt-8 pt-8 pb-4 mb-8 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                Performance Scorecard
              </h1>
              <p className="text-muted-foreground mt-1">{chatData?.scenario_name || "Legal Negotiation"}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate(`/library/${id}/scenario/${scenarioId}/play`)}
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button 
                className="gap-2"
                onClick={() => navigate(`/library/${id}/scenario/${scenarioId}/play?chatId=${chatId}`)}
              >
                <MessageSquare className="w-4 h-4" />
                Back to Chat
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            
            {/* Score Card */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col items-center justify-center">
              <Badge variant="outline" className="px-5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border-primary/20">
                {parsedData.grade}
              </Badge>
              <div className={`text-7xl font-bold tracking-tight mb-2 ${getScoreColor(parsedData.score)}`}>
                {parsedData.score}%
              </div>
              <p className="text-muted-foreground font-medium">Raw Score: {parsedData.rawScore} / {parsedData.maxScore}</p>
              <div className="w-full max-w-md mt-6 bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(parsedData.score)}`}
                  style={{ width: `${parsedData.score}%` }}
                />
              </div>
            </div>

            {/* Insights Grid */}
            {(didWell.length > 0 || missed.length > 0) && (
            <div className={`grid grid-cols-1 gap-6 ${didWell.length > 0 && missed.length > 0 ? 'md:grid-cols-2' : ''}`}>
              {/* What You Did Well */}
              {didWell.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h2 className="font-bold text-foreground">What You Did Well</h2>
                </div>
                <ul className="space-y-3">
                  {didWell.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {/* Areas for Improvement */}
              {missed.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                  <h2 className="font-bold text-foreground">Areas for Improvement</h2>
                </div>
                <ul className="space-y-3">
                  {missed.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>{item.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
              )}
            </div>
            )}

            {/* Professor's Final Feedback */}
            {parsedData.feedback && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-primary">Professor's Remarks</h2>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 font-medium whitespace-pre-wrap">
                {parsedData.feedback}
              </div>
            </div>
            )}

            {/* Psychological Profile */}
            {parsedData.profile && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Psychological Profile</h2>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {parsedData.profile}
              </div>
            </div>
            )}

            {/* Points Breakdown */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Detailed Evaluation</h2>
              </div>
              
              <div className="space-y-6">
                {parsedData.groups.map((category: any, idx: number) => {
                  return (
                  <div key={idx} className="border border-border rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <div className="bg-muted/50 px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="font-semibold text-foreground">{category.category}</h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${category.score > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {category.score} pts
                        </span>
                      </div>
                    </div>
                    
                    {/* Feedback Details */}
                    <div className="p-5 space-y-4">
                      {category.evidence && (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Evidence</span>
                          <div className="bg-background border border-border rounded-md p-3 text-sm text-foreground">
                            {category.evidence}
                          </div>
                        </div>
                      )}
                      {category.feedback && (
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${category.score > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            Feedback
                          </span>
                          <div className={`rounded-md p-4 text-sm ${category.score > 0 ? 'bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-300' : 'bg-orange-50 text-orange-900 dark:bg-orange-950/30 dark:text-orange-300'}`}>
                            {category.feedback}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScenarioEvaluation;
