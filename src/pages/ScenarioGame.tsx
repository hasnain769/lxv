import { useState, useRef, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { X, MessageSquare, Users, Send, ChevronRight, FileText, Paperclip, Loader2, Award, Database, ShieldAlert, FileText as FileTextIcon, Lock } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import EndScenarioDialog from "@/components/EndScenarioDialog";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";

interface Attachment {
  name: string;
  type: "PDF" | "DOCX" | "XLSX" | "PNG";
}

interface EmailMessage {
  id: string;
  senderInitials: string;
  senderName: string;
  senderEmail: string;
  timestamp: string;
  subject?: string;
  content: string[];
  attachments?: Attachment[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const initialEmails: EmailMessage[] = [
  {
    id: "1",
    senderInitials: "SC",
    senderName: "Sarah Chen",
    senderEmail: "sarah.chen@company.com",
    timestamp: "Dec 24, 2025 06:45 PM",
    content: [
      "Hi Marc, excited to move forward with the investment. Our legal team will send over the initial draft of the shareholder agreement shortly. Looking forward to a smooth process.",
    ],
  },
  {
    id: "2",
    senderInitials: "MF",
    senderName: "Marc Feider",
    senderEmail: "marc.feider@company.com",
    timestamp: "Dec 24, 2025 06:46 PM",
    subject: "Series A - Initial Questions",
    content: [
      "Hi Cicionaldo,",
      "Sarah just mentioned they'll send the shareholder agreement draft soon. I'm a bit nervous about losing control of the company. Can you help me understand what to watch out for?",
      "Specifically, I'm worried about:",
      "- Board composition",
      "- What decisions they'll have veto power over",
      "- Exit scenarios",
    ],
  },
  {
    id: "3",
    senderInitials: "TW",
    senderName: "Thomas Weber",
    senderEmail: "thomas.weber@company.com",
    timestamp: "Dec 24, 2025 06:46 PM",
    subject: "Draft Shareholder Agreement - TechStartup Series A",
    content: [
      "Dear Cicionaldo,",
      "Please find attached the initial draft of the shareholder agreement for the Series A investment in TechStartup S.A.",
      "Key provisions to review:",
      "- Board composition (3 seats total: 1 founder, 1 investor, 1 independent)",
      "- Protective provisions requiring investor consent",
      "- Drag-along and tag-along rights",
      "- Liquidation preference (1x non-participating)",
      "Looking forward to your feedback.",
      "Best regards,",
      "Thomas Weber",
    ],
    attachments: [
      { name: "Shareholder_Agreement_Draft_v1.pdf", type: "PDF" },
      { name: "Term_Sheet_Summary.docx", type: "DOCX" },
    ],
  },
];

const mockResponses: Record<string, string> = {
  default: "Great question! In a Series A negotiation, it's important to focus on three key areas: board composition, protective provisions, and exit rights. Would you like me to elaborate on any of these?",
  board: "Board composition is crucial. Typically, a Series A investor will want at least one board seat. A common structure is 2 founders, 1 investor, and 1-2 independent directors. This gives founders majority control while giving investors visibility.",
  veto: "Protective provisions (veto rights) are standard in VC deals. Common ones include: issuing new shares, taking on debt, changing the business model, or selling the company. The key is to ensure these are reasonable and don't block normal operations.",
  exit: "Exit provisions include drag-along rights (forcing minority to sell), tag-along rights (allowing minority to join a sale), and liquidation preferences. A 1x non-participating preference is founder-friendly; avoid participating preferences if possible.",
  control: "To protect founder control, negotiate for: founder-friendly board composition, limited reserved matters, and sunset provisions on investor rights. Also consider voting agreements that preserve founder voting power.",
};

const getMockResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("board")) return mockResponses.board;
  if (lowerQuery.includes("veto") || lowerQuery.includes("protective")) return mockResponses.veto;
  if (lowerQuery.includes("exit") || lowerQuery.includes("drag") || lowerQuery.includes("tag")) return mockResponses.exit;
  if (lowerQuery.includes("control")) return mockResponses.control;
  return mockResponses.default;
};

const mockEmailReplies: Record<string, string[]> = {
  default: [
    "Thank you for your response, Cicionaldo.",
    "We appreciate your thorough analysis. Let me discuss your points with my team and get back to you shortly.",
    "In the meantime, please let me know if you have any additional concerns.",
    "Best regards,",
    "Thomas Weber",
  ],
  board: [
    "Thank you for your feedback on the board composition, Cicionaldo.",
    "We understand your concerns about maintaining founder control. We're open to discussing a 2-1-2 structure (2 founders, 1 investor, 2 independent directors) as an alternative.",
    "However, we would need to ensure that the independent directors are mutually agreed upon by both parties.",
    "Let's schedule a call to discuss this further.",
    "Best regards,",
    "Thomas Weber",
  ],
  protective: [
    "Hi Cicionaldo,",
    "I've reviewed your comments on the protective provisions. While some of these are standard for our fund, I'm willing to discuss narrowing the scope of certain veto rights.",
    "Specifically, we could consider removing the veto on hiring decisions below C-level and increasing the debt threshold that triggers investor consent.",
    "Looking forward to your thoughts.",
    "Thomas Weber",
  ],
};

const getMockEmailReply = (content: string): string[] => {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes("board") || lowerContent.includes("director") || lowerContent.includes("seat")) {
    return mockEmailReplies.board;
  }
  if (lowerContent.includes("veto") || lowerContent.includes("protective") || lowerContent.includes("consent")) {
    return mockEmailReplies.protective;
  }
  return mockEmailReplies.default;
};

const ScenarioGame = () => {
  const { id, scenarioId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlChatId = searchParams.get("chatId");
  const viewParam = searchParams.get("view");
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [response, setResponse] = useState("");
  const [professorQuery, setProfessorQuery] = useState("");
  const [showProfessor, setShowProfessor] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMarcTyping, setIsMarcTyping] = useState(false);
  const [endScenarioOpen, setEndScenarioOpen] = useState(false);
  const [localGameMessages, setLocalGameMessages] = useState<any[]>([]);
  const [localHelpMessages, setLocalHelpMessages] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const emailThreadEndRef = useRef<HTMLDivElement>(null);

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<{ name: string, type: string } | null>(null);
  const [docContent, setDocContent] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const openDocument = async (attachment: Attachment) => {
    setActiveDocument(attachment);
    setDocModalOpen(true);
    setLoadingDoc(true);
    setDocError(null);
    setDocContent(null);

    try {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const headers = { Authorization: `Bearer ${token}` };

      const res = await fetch(`${apiUrl}/scenarios/${scenarioId}/documents`, { headers });
      if (!res.ok) throw new Error("Failed to fetch documents list");
      const docs: string[] = await res.json();

      // Try to find a matching document by name ignoring extension
      const baseName = attachment.name.split('.')[0].toLowerCase().replace(/_/g, ' ');
      const matchedDoc = docs.find(d => {
        const dBase = d.split('.')[0].toLowerCase().replace(/_/g, ' ');
        return dBase.includes(baseName) || baseName.includes(dBase);
      });

      if (!matchedDoc) {
        // Just show a fake placeholder if the document doesn't actually exist in the backend
        setTimeout(() => {
          setDocContent(`[DOCUMENT CONTENT: ${attachment.name}]\n\nThis is a simulated secure document viewer. The contents of this file are restricted to authorized personnel involved in the Series A transaction.\n\nPlease refer to the data room for the complete executed version.`);
          setLoadingDoc(false);
        }, 1000);
        return;
      }

      const contentRes = await fetch(`${apiUrl}/scenarios/${scenarioId}/documents/${matchedDoc}`, { headers });
      if (!contentRes.ok) throw new Error("Failed to fetch document content");
      const data = await contentRes.json();
      setDocContent(data.content);
      setLoadingDoc(false);
    } catch (err) {
      console.error("Failed to fetch document:", err);
      setDocError("Failed to load document securely. Please try again.");
      setLoadingDoc(false);
    }
  };

  const [rcsModalOpen, setRcsModalOpen] = useState(false);
  const [aoaContent, setAoaContent] = useState<string | null>(null);
  const [loadingAoa, setLoadingAoa] = useState(false);
  const [aoaError, setAoaError] = useState<string | null>(null);

  const fetchAoaContent = async () => {
    setLoadingAoa(true);
    setAoaError(null);
    try {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const headers = { Authorization: `Bearer ${token}` };

      const res = await fetch(`${apiUrl}/scenarios/${scenarioId}/rcs`, { headers });
      if (!res.ok) throw new Error("Failed to fetch rcs documents list");
      const docs: string[] = await res.json();

      const aoaDoc = docs.find(d => d.toLowerCase().includes('aoa') || d.toLowerCase().includes('articles'));

      if (!aoaDoc) {
        setAoaError("Articles of Association (AoA) document not found in the scenario RCS vault.");
        setLoadingAoa(false);
        return;
      }

      const contentRes = await fetch(`${apiUrl}/scenarios/${scenarioId}/rcs/${aoaDoc}`, { headers });
      if (!contentRes.ok) throw new Error("Failed to fetch document content");
      const data = await contentRes.json();
      setAoaContent(data.content);
    } catch (err) {
      console.error("Failed to fetch AoA:", err);
      setAoaError("Failed to access the RCS registry. Please try again later.");
    } finally {
      setLoadingAoa(false);
    }
  };

  useEffect(() => {
    if (rcsModalOpen && !aoaContent && !loadingAoa) {
      fetchAoaContent();
    }
  }, [rcsModalOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [response]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localHelpMessages, isTyping]);

  useEffect(() => {
    emailThreadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localGameMessages, isMarcTyping]);

  // Fetch or Create Chat
  const { data: activeChat, isLoading: loadingChat } = useQuery({
    queryKey: ["active-chat", scenarioId, urlChatId],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";

      if (!urlChatId) return null;

      // Resume existing chat
      const detailRes = await fetch(`${apiUrl}/chats/${urlChatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return detailRes.json();
    },
    enabled: !!scenarioId && !!urlChatId,
  });

  // Auto-navigate to scorecard when state becomes ENDED
  useEffect(() => {
    if (activeChat?.state?.toLowerCase() === 'ended' && viewParam !== 'chat') {
      navigate(`/library/${id}/scenario/${scenarioId}/evaluation?chatId=${urlChatId}`);
    }
  }, [activeChat?.state, navigate, id, scenarioId, urlChatId, viewParam]);

  // Handle Chat Creation separately
  useEffect(() => {
    let mounted = true;
    const createChat = async () => {
      if (urlChatId) return; // already have one

      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";

      try {
        const createRes = await fetch(`${apiUrl}/chats/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ scenario_id: scenarioId })
        });
        if (!createRes.ok) throw new Error("Failed to create chat");
        const newChat = await createRes.json();

        if (mounted) {
          navigate(`/library/${id}/scenario/${scenarioId}/play?chatId=${newChat.id}`, { replace: true });
        }
      } catch (err) {
        console.error("Failed to create chat", err);
      }
    };

    createChat();
    return () => { mounted = false; };
  }, [id, scenarioId, urlChatId, navigate, getAccessTokenSilently]);

  useEffect(() => {
    let mounted = true;
    const triggerTransition = async () => {
      if (activeChat && activeChat.state.toUpperCase() === "INTRO") {
        setIsMarcTyping(true);
        const token = await getAccessTokenSilently();
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
        try {
          await fetch(`${apiUrl}/chats/${activeChat.id}/transition`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
        } finally {
          if (mounted) {
            setIsMarcTyping(false);
            queryClient.invalidateQueries({ queryKey: ["active-chat", scenarioId, urlChatId] });
          }
        }
      }
    };
    triggerTransition();
    return () => { mounted = false; };
  }, [activeChat, getAccessTokenSilently, scenarioId, urlChatId, queryClient]);

  useEffect(() => {
    if (activeChat) {
      const gameTextMsgs = activeChat.game_messages.filter((m: any) => m.type === "TextMessage" || m.type === "ModelClientStreamingChunkEvent");

      // Don't filter out Professor, keep them in the email thread too
      setLocalGameMessages(gameTextMsgs);

      // Keep Professor intro in help sidebar too, for reference
      const introMsgs = gameTextMsgs.filter((m: any) => m.source === "Professor");
      const helpMsgs = activeChat.help_messages.filter((m: any) => m.type === "TextMessage" || m.type === "ModelClientStreamingChunkEvent");

      setLocalHelpMessages([...introMsgs, ...helpMsgs]);
    }
  }, [activeChat]);

  const handleSendEmail = async () => {
    if (response.trim() && !isSendingEmail && activeChat) {
      const messageContent = response;
      setResponse("");
      setIsSendingEmail(true);
      setIsMarcTyping(true);

      setLocalGameMessages((prev) => [
        ...prev,
        { id: "temp-user", agent_type: "UserMessage", content: messageContent, created_at: new Date().toISOString() }
      ]);

      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";

      try {
        const res = await fetch(`${apiUrl}/chats/${activeChat.id}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: messageContent })
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let assistantMessageId = "temp-assistant";
        let firstChunk = true;

        while (!done) {
          const { value, done: readerDone } = await reader!.read();
          done = readerDone;
          if (value) {
            if (firstChunk) {
              setIsMarcTyping(false);
              firstChunk = false;
            }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.id) assistantMessageId = data.id;
                  if (data.content !== undefined) {
                    setLocalGameMessages((prev) => {
                      const newMsgs = [...prev];
                      const idx = newMsgs.findIndex((m) => m.id === assistantMessageId);
                      if (idx >= 0) {
                        newMsgs[idx] = { ...newMsgs[idx], content: data.content };
                      } else {
                        newMsgs.push({ id: assistantMessageId, agent_type: "AssistantMessage", content: data.content, created_at: new Date().toISOString() });
                      }
                      return newMsgs;
                    });
                  }
                } catch (e) { }
              }
            }
          }
        }
      } finally {
        setIsSendingEmail(false);
        setIsMarcTyping(false);
        queryClient.invalidateQueries({ queryKey: ["active-chat", scenarioId] });
      }
    }
  };

  const handleAskProfessor = async () => {
    if (professorQuery.trim() && !isTyping && activeChat) {
      const query = professorQuery;
      setProfessorQuery("");
      setIsTyping(true);

      setLocalHelpMessages((prev) => [
        ...prev,
        { id: "temp-user-help", agent_type: "UserMessage", content: query, created_at: new Date().toISOString() }
      ]);

      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";

      try {
        const res = await fetch(`${apiUrl}/chats/${activeChat.id}/help`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: query })
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let assistantMessageId = "temp-assistant-help";

        while (!done) {
          const { value, done: readerDone } = await reader!.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.id) assistantMessageId = data.id;
                  if (data.content !== undefined) {
                    setLocalHelpMessages((prev) => {
                      const newMsgs = [...prev];
                      const idx = newMsgs.findIndex((m) => m.id === assistantMessageId);
                      if (idx >= 0) {
                        newMsgs[idx] = { ...newMsgs[idx], content: data.content };
                      } else {
                        newMsgs.push({ id: assistantMessageId, agent_type: "AssistantMessage", content: data.content, created_at: new Date().toISOString() });
                      }
                      return newMsgs;
                    });
                  }
                } catch (e) { }
              }
            }
          }
        }
      } finally {
        setIsTyping(false);
        queryClient.invalidateQueries({ queryKey: ["active-chat", scenarioId] });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskProfessor();
    }
  };

  const isInitializing = !urlChatId || loadingChat || (activeChat && activeChat.state.toUpperCase() === "INTRO");

  const emails: EmailMessage[] = localGameMessages
    .filter((msg: any) => {
      // The backend saves the Professor's scorecard as a GAME state message.
      // We must hide it from the email thread so it only appears in the evaluation UI.
      if (msg.source === "Professor") return false;
      return msg.state?.toLowerCase() !== "ended";
    })
    .map((msg: any) => ({
      id: msg.id,
      senderInitials: msg.agent_type === "UserMessage" ? "D" : msg.source === "Professor" ? "P" : "M",
      senderName: msg.agent_type === "UserMessage" ? "Danny" : msg.source === "Professor" ? "Professor Guide" : "Marc Feider",
      senderEmail: msg.agent_type === "UserMessage" ? "danny@company.com" : msg.source === "Professor" ? "system@guide" : "marc.feider@company.com",
      timestamp: new Date(msg.created_at).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
      }),
      content: msg.content ? msg.content.split("\n").filter((line: string) => line.trim()) : [],
    }));

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden w-full">
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col w-full h-full transition-all duration-300 ${showProfessor ? 'md:mr-96' : ''}`}>
          {/* Header */}
          <header className="shrink-0 bg-card border-b border-border z-20">
            <div className="px-4 sm:px-6 py-4 flex items-center gap-4">
              <Link
                to={`/library/${id}?tab=previous-sessions`}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="font-bold text-foreground text-sm sm:text-base truncate">Series A Investment - Email Thread</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Shareholder Agreement Negotiation</p>
              </div>
            </div>
            {/* Action buttons row */}
            <div className="px-4 md:px-6 pb-4 flex flex-wrap items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs px-2.5 md:h-9 md:text-sm md:px-3 md:gap-2"
                onClick={() => setShowProfessor(true)}
              >
                <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Ask AI Professor
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs px-2.5 md:h-9 md:text-sm md:px-3 md:gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50"
                onClick={() => setRcsModalOpen(true)}
              >
                <Database className="w-3.5 h-3.5 md:w-4 md:h-4" />
                RCS Access
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs px-2.5 md:h-9 md:text-sm md:px-3 md:gap-2 opacity-50 hidden md:flex"
                disabled
              >
                <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Ask Human Expert (Coming Soon)
              </Button>
              {activeChat?.state?.toLowerCase() !== 'ended' && (
                <Button variant="destructive" size="sm" className="h-8 text-xs px-2.5 md:h-9 md:text-sm md:px-3" onClick={() => setEndScenarioOpen(true)}>
                  End Scenario
                </Button>
              )}
            </div>
          </header>

          {/* Scenario Overview */}
          <div className="shrink-0 bg-muted/30 border-b border-border px-4 md:px-6 py-3 md:py-4">
            <h2 className="font-semibold text-foreground mb-1 text-sm md:text-base">Scenario Overview</h2>
            <p className="text-muted-foreground text-xs md:text-sm">
              You are <span className="text-foreground font-medium">Danny</span>, advising{" "}
              <span className="text-foreground font-medium">Marc Feider</span>. Review the messages below and respond when ready.
            </p>
          </div>

          {/* Email Thread - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {emails.map((email) => (
              <div key={email.id} className={`border border-border rounded-xl overflow-hidden ${email.senderInitials === "D" ? "bg-slate-100 dark:bg-slate-800/50" : "bg-card"}`}>
                {/* Email Header with distinct background */}
                <div className="bg-muted/50 border-b border-border px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0">
                        {email.senderInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{email.senderName}</p>
                        <p className="text-sm text-muted-foreground truncate">{email.senderEmail}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground shrink-0">{email.timestamp}</p>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-5 space-y-3">
                  {email.content.map((paragraph, index) => (
                    <p key={index} className="text-foreground">
                      {paragraph}
                    </p>
                  ))}

                  {/* Attachments */}
                  {email.attachments && email.attachments.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-border">
                      <p className="text-sm text-primary font-medium mb-3">
                        {email.attachments.length} Attachment{email.attachments.length > 1 ? "s" : ""}
                      </p>
                      <div className="space-y-2">
                        {email.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-muted/30 border border-border rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                {attachment.type === "PDF" ? (
                                  <FileText className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground">{attachment.type}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => openDocument(attachment)}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(isMarcTyping || isInitializing) && (
              <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="bg-muted/50 border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                      M
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Marc Feider</p>
                      <p className="text-sm text-muted-foreground">marc.feider@company.com</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-muted-foreground text-sm mt-3">Marc is typing...</p>
                </div>
              </div>
            )}
            <div ref={emailThreadEndRef} className="scroll-m-32 h-1" />
          </div>

          {/* Compose Response */}
          <div className="shrink-0 bg-card border-t border-border p-4 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)] z-20">
            {activeChat?.state?.toLowerCase() === 'ended' ? (
              <div className="flex flex-col items-center justify-center p-4">
                <p className="text-muted-foreground mb-4">This scenario has concluded. Your performance has been evaluated.</p>
                <Button
                  className="gap-2"
                  size="lg"
                  onClick={() => navigate(`/library/${id}/scenario/${scenarioId}/evaluation?chatId=${urlChatId}`)}
                >
                  <Award className="w-5 h-5" />
                  View Scorecard
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-sm">Compose Response</h3>
                  <p className="text-sm text-muted-foreground">From: Danny</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Type your email response here..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-[44px] max-h-[200px] resize-none w-full"
                    rows={1}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="sentences"
                    spellCheck="false"
                    data-form-type="other"
                  />
                  <Button onClick={handleSendEmail} className="gap-2 shrink-0 w-full sm:w-auto">
                    <Send className="w-4 h-4" />
                    Send Email
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Professor Guide Sidebar */}
        {showProfessor && (
          <div className="fixed right-0 top-0 h-[100dvh] w-full md:w-96 bg-card border-l border-border flex flex-col z-50">
            {/* Professor Header */}
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-lg">
                  P
                </div>
                <div>
                  <p className="font-bold text-foreground">Professor Guide</p>
                  <p className="text-sm text-muted-foreground">Ask for advice anytime</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfessor(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {localHelpMessages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p className="mb-2">👋 Hi! I'm your professor guide.</p>
                  <p>Ask me anything about the negotiation strategy, legal terms, or best practices.</p>
                </div>
              )}
              {localHelpMessages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.agent_type === "UserMessage" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 ${msg.agent_type === "UserMessage"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                      }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <div className="flex gap-2 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Professor Input */}
            <div className="shrink-0 border-t border-border p-4">
              <Textarea
                placeholder="Ask the professor for guidance..."
                value={professorQuery}
                onChange={(e) => setProfessorQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] resize-none mb-3"
                rows={2}
              />
              <div className="flex justify-end">
                <Button onClick={handleAskProfessor} disabled={isTyping} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <EndScenarioDialog
        open={endScenarioOpen}
        onOpenChange={setEndScenarioOpen}
        moduleId={id || ""}
        scenarioId={scenarioId || ""}
        chatId={urlChatId || ""}
      />

      {/* Fake RCS Modal */}
      <Dialog open={rcsModalOpen} onOpenChange={setRcsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 py-4 border-b border-border bg-slate-50 dark:bg-slate-900/50">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Database className="w-5 h-5 text-blue-600" />
              Registre de Commerce et des Sociétés (RCS)
            </DialogTitle>
            <DialogDescription>
              Luxembourg Business Registers - Electronic Portal
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col p-6">
            <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4 text-primary" />
                  Articles of Association (Statuts coordonnés)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Company: target_company_sa</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                Verified Document
              </Badge>
            </div>

            <div className="flex-1 border border-border rounded-lg overflow-y-auto bg-card relative">
              {loadingAoa ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">Connecting to RCS Database...</p>
                </div>
              ) : aoaError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <ShieldAlert className="w-10 h-10 text-red-500 mb-4 opacity-80" />
                  <p className="text-red-500 font-medium mb-2">{aoaError}</p>
                  <Button variant="outline" onClick={fetchAoaContent}>Retry Connection</Button>
                </div>
              ) : (
                <div className="p-8 prose prose-sm dark:prose-invert max-w-none font-serif whitespace-pre-wrap">
                  {aoaContent}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-slate-50 dark:bg-slate-900/50">
            <Button variant="outline" onClick={() => setRcsModalOpen(false)}>
              Close Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Document Viewer Modal */}
      <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b border-border bg-slate-100 dark:bg-slate-900 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                {activeDocument?.type === "PDF" ? (
                  <FileTextIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <FileTextIcon className="w-5 h-5 text-blue-500" />
                )}
                {activeDocument?.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Secure Document Viewer - LXVerse Data Room
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 p-6">
            <div className="flex-1 border border-slate-200 dark:border-slate-800 shadow-inner rounded-md overflow-y-auto bg-white dark:bg-slate-900 relative">
              {loadingDoc ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
                  <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <FileTextIcon className="w-6 h-6 text-primary absolute" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium animate-pulse">Decrypting and loading document...</p>
                </div>
              ) : docError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900">
                  <ShieldAlert className="w-12 h-12 text-red-500 mb-4 opacity-80" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 max-w-sm">{docError}</p>
                  <Button onClick={() => activeDocument && openDocument(activeDocument)}>Retry Loading</Button>
                </div>
              ) : (
                <div className="p-10 md:p-16 prose prose-slate dark:prose-invert max-w-none font-serif text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-sm min-h-full">
                  {/* Decorative Document Header */}
                  <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-8 mb-8 text-center opacity-50 select-none">
                    <div className="uppercase tracking-widest text-xs font-bold mb-2">Strictly Confidential</div>
                    <div className="text-xs">Draft Version - Subject to Review</div>
                  </div>

                  {docContent}

                  {/* Decorative Document Footer */}
                  <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-8 mt-16 text-center opacity-30 select-none flex justify-between text-xs">
                    <span>LXVerse Reference: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-slate-100 dark:bg-slate-900 flex justify-between items-center sm:justify-between">
            <Badge variant="outline" className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent">
              <Lock className="w-3 h-3 mr-1" /> End-to-End Encrypted
            </Badge>
            <Button variant="default" onClick={() => setDocModalOpen(false)}>
              Close Viewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScenarioGame;
