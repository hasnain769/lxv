import { useState, useEffect } from "react";
import { diffLines } from "diff";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { 
  X, Save, MessageSquare, History, Check, Play, Undo, Redo, Bold, Italic, 
  List, ListOrdered, FileText, Sparkles, CheckCircle2, ChevronRight, Lock, AlertCircle, Info, AlertTriangle,
  PanelRight, Underline as UnderlineIcon, Strikethrough, Highlighter, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Table as TableIcon, Heading, Plus, Trash2, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Custom tooltip wrapper that shows instantly with a white rounded bubble and black text
const TooltipWrapper = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent className="bg-white text-black border border-slate-200 shadow-md text-xs font-semibold px-2 py-1 select-none z-50">
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

interface DraftingDeskProps {
  chatId: string;
  documentName: string;
  sharedDrafts: any[];
  onClose: () => void;
  getAccessTokenSilently: any;
  refetchDrafts: () => void;
}

export default function DraftingDesk({
  chatId,
  documentName,
  sharedDrafts,
  onClose,
  getAccessTokenSilently,
  refetchDrafts,
}: DraftingDeskProps) {
  const queryClient = useQueryClient();
  const [activeDoc, setActiveDoc] = useState(documentName);
  const [isSaving, setIsSaving] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState("suggestions");
  const [viewingVersion, setViewingVersion] = useState<any | null>(null);
  const [diffMode, setDiffMode] = useState<"redline" | "full">("redline");
  const [diffBaseVersionId, setDiffBaseVersionId] = useState<number | string>("none");
  const [diffCompareVersionId, setDiffCompareVersionId] = useState<number | string>("current");
  const [showInspector, setShowInspector] = useState(false);

  // Sync active document selection if changed from parent
  useEffect(() => {
    if (documentName) {
      setActiveDoc(documentName);
      setViewingVersion(null);
    }
  }, [documentName]);

  // Fetch current draft
  const { data: draft, isLoading: loadingDraft, refetch: refetchDraft } = useQuery({
    queryKey: ["draft", chatId, activeDoc],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/chats/${chatId}/drafts/${activeDoc}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch draft");
      return res.json();
    },
    enabled: !!chatId && !!activeDoc,
  });

  // Fetch suggestions
  const { data: suggestions = [], refetch: refetchSuggestions } = useQuery({
    queryKey: ["suggestions", chatId, activeDoc],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/chats/${chatId}/drafts/${activeDoc}/suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      return res.json();
    },
    enabled: !!chatId && !!activeDoc,
  });

  // Fetch version history
  const { data: versions = [], refetch: refetchVersions } = useQuery({
    queryKey: ["versions", chatId, activeDoc],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/chats/${chatId}/drafts/${activeDoc}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch versions");
      return res.json();
    },
    enabled: !!chatId && !!activeDoc,
  });

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] font-sans p-4",
      },
    },
  });

  const getActiveFormatLabel = () => {
    if (!editor) return "Normal";
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    return "Normal";
  };

  // Update editor content when draft loads
  useEffect(() => {
    if (editor && draft) {
      try {
        const parsed = JSON.parse(draft.content_json);
        
        // Self-healing check: if the content has only one block with newlines,
        // split it into proper paragraph nodes so that formatting works line-by-line.
        if (
          parsed && 
          parsed.type === "doc" && 
          parsed.content && 
          parsed.content.length === 1 && 
          parsed.content[0].type === "paragraph" && 
          parsed.content[0].content && 
          parsed.content[0].content[0] && 
          parsed.content[0].content[0].text && 
          parsed.content[0].content[0].text.includes("\n")
        ) {
          const fullText = parsed.content[0].content[0].text;
          const htmlContent = fullText
            .split("\n")
            .map((line: string) => line.trim() ? `<p>${line}</p>` : "<p></p>")
            .join("");
          editor.commands.setContent(htmlContent);
        } else {
          editor.commands.setContent(parsed);
        }
      } catch (e) {
        const htmlContent = (draft.content_text || "")
          .split("\n")
          .map((line: string) => line.trim() ? `<p>${line}</p>` : "<p></p>")
          .join("");
        editor.commands.setContent(htmlContent);
      }
    }
  }, [editor, draft]);

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/chats/${chatId}/drafts/${activeDoc}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content_json: JSON.stringify(editor.getJSON()),
          content_text: editor.getText()
        })
      });
      if (!res.ok) throw new Error("Failed to save draft");
      const updated = await res.json();
      toast.success(`Draft committed successfully as Version ${updated.version_id}`);
      refetchDraft();
      refetchVersions();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolveSuggestion = async (suggestionId: string, status: "accepted" | "dismissed", quote?: string, suggestedText?: string) => {
    try {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/chats/${chatId}/drafts/${activeDoc}/suggestions/${suggestionId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to resolve suggestion");

      toast.success(`Suggestion marked as ${status}`);
      refetchSuggestions();

      // Inline replacement if accepted and quote is matched
      if (status === "accepted" && editor && quote && suggestedText) {
        const currentHtml = editor.getHTML();
        // Simple search and replace for quote in HTML format
        if (currentHtml.includes(quote)) {
          const updatedHtml = currentHtml.replace(quote, suggestedText);
          editor.commands.setContent(updatedHtml);
          
          // Auto-save the draft with the accepted edit
          const saveRes = await fetch(`${apiUrl}/chats/${chatId}/drafts/${activeDoc}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              content_json: JSON.stringify(editor.getJSON()),
              content_text: editor.getText()
            })
          });
          if (saveRes.ok) {
            refetchDraft();
            refetchVersions();
          }
        } else {
          // If HTML direct replacement failed, try replacing within raw text
          const currentText = editor.getText();
          if (currentText.includes(quote)) {
            const updatedText = currentText.replace(quote, suggestedText);
            editor.commands.setContent(updatedText);
            
            await fetch(`${apiUrl}/chats/${chatId}/drafts/${activeDoc}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                content_json: JSON.stringify(editor.getJSON()),
                content_text: updatedText
              })
            });
            refetchDraft();
            refetchVersions();
          } else {
            toast.info("Suggestion accepted, but the referenced text could not be located in the editor for automatic replacement.");
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to resolve suggestion");
    }
  };

  const getVersionText = (verId: number | string) => {
    if (verId === "current") {
      return editor?.getText() || "";
    }
    if (verId === "none" || !verId) {
      return "";
    }
    const ver = versions.find((v: any) => v.version_id === Number(verId));
    return ver ? ver.content_text || "" : "";
  };

  const renderRedlineDiff = () => {
    if (!viewingVersion || !editor) return null;
    
    const oldText = getVersionText(diffBaseVersionId);
    const newText = getVersionText(diffCompareVersionId);

    const parts = diffLines(oldText, newText);
    const renderedLines: React.ReactNode[] = [];
    let keyCounter = 0;

    parts.forEach((part) => {
      const lines = part.value.split("\n");
      if (lines.length > 1 && lines[lines.length - 1] === "") {
        lines.pop();
      }

      lines.forEach((line) => {
        let className = "font-mono text-[11px] leading-relaxed py-0.5 px-3 whitespace-pre-wrap flex items-start gap-2 ";
        let prefix = " ";
        
        if (part.added) {
          className += "bg-green-100/70 dark:bg-green-950/40 text-green-900 dark:text-green-300 border-l-4 border-green-600 font-medium";
          prefix = "+";
        } else if (part.removed) {
          className += "bg-red-100/70 dark:bg-red-950/40 text-red-900 dark:text-red-300 line-through border-l-4 border-red-600 font-medium opacity-80";
          prefix = "-";
        } else {
          className += "text-slate-600 dark:text-slate-400 border-l-4 border-transparent";
          prefix = " ";
        }

        renderedLines.push(
          <div key={keyCounter++} className={className}>
            <span className="select-none w-3 opacity-60 font-bold shrink-0">{prefix}</span>
            <span className="flex-1">{line || " "}</span>
          </div>
        );
      });
    });

    return (
      <div className="border border-border rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 py-2 divide-y divide-slate-100 dark:divide-slate-900/50">
        {renderedLines.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground text-xs font-sans flex flex-col items-center justify-center gap-2">
            <Info className="w-8 h-8 opacity-45 text-indigo-500 mb-1" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Comparing identical versions</p>
            <p className="text-[10px] opacity-80 max-w-[250px] mx-auto leading-relaxed">
              No differences were found. Try changing the "Compare Base" or "Compare Target" selectors above.
            </p>
          </div>
        ) : (
          renderedLines
        )}
      </div>
    );
  };

  const activeSuggestionCount = suggestions.filter((s: any) => s.status === "pending").length;

  if (!sharedDrafts || sharedDrafts.length === 0) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-background">
        {/* Header */}
        <div className="shrink-0 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">Drafting Desk</h2>
              <p className="text-xs text-muted-foreground">Collaborate on legal documents</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Empty/Locked State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-4 border border-dashed border-indigo-200 dark:border-indigo-800">
            <Lock className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-2">No Documents Shared Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            The drafting desk is currently locked. Your client, Marc Feider, will share relevant document templates (such as the Loan Agreement or Circular Resolutions) with you via the email thread when they are ready for your review and drafting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full overflow-hidden bg-background relative">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base leading-none">Drafting Desk</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5 hidden xs:block">Collaborate on legal documents</p>
          </div>
        </div>
        
        {/* Document Selector / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {sharedDrafts.map((d: any) => (
            <Button
              key={d.document_name}
              variant={activeDoc === d.document_name ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveDoc(d.document_name);
                setViewingVersion(null);
              }}
              className="text-xs font-semibold h-8 capitalize shrink-0"
            >
              {d.document_name.replace(/_/g, " ")}
              {activeDoc === d.document_name && (
                <Badge className="ml-1.5 h-4 px-1 bg-white/20 text-white border-transparent">
                  v{d.version_id}
                </Badge>
              )}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          {/* Editor Tool Bar */}
          {editor && (
            <div className="shrink-0 border-b border-border bg-muted/40 p-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-0.5 flex-wrap">
                {/* Format Dropdown */}
                <TooltipWrapper content="Text Formatting / Headings">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1.5 text-xs font-semibold px-2 text-muted-foreground hover:text-foreground"
                      >
                        <Heading className="h-3.5 w-3.5" />
                        <span>{getActiveFormatLabel()}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem 
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        className={editor.isActive("paragraph") ? "bg-accent font-semibold" : ""}
                      >
                        Normal Text
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive("heading", { level: 1 }) ? "bg-accent font-semibold" : ""}
                      >
                        Heading 1
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive("heading", { level: 2 }) ? "bg-accent font-semibold" : ""}
                      >
                        Heading 2
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editor.isActive("heading", { level: 3 }) ? "bg-accent font-semibold" : ""}
                      >
                        Heading 3
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipWrapper>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Inline formatting buttons */}
                <TooltipWrapper content="Bold">
                  <Button
                    variant={editor.isActive("bold") ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Italic">
                  <Button
                    variant={editor.isActive("italic") ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Underline">
                  <Button
                    variant={editor.isActive("underline") ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Strikethrough">
                  <Button
                    variant={editor.isActive("strike") ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Highlight Text">
                  <Button
                    variant={editor.isActive("highlight") ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8 text-amber-500 hover:text-amber-600 dark:text-amber-400"
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                  >
                    <Highlighter className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Alignment buttons */}
                <TooltipWrapper content="Align Left">
                  <Button
                    variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Align Center">
                  <Button
                    variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Align Right">
                  <Button
                    variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Align Justify">
                  <Button
                    variant={editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Lists */}
                <TooltipWrapper content="Bullet List">
                  <Button
                    variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Numbered List">
                  <Button
                    variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Table Dropdown */}
                <TooltipWrapper content="Table Actions">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1.5 text-xs font-semibold px-2 text-muted-foreground hover:text-foreground"
                      >
                        <TableIcon className="h-3.5 w-3.5" />
                        <span>Table</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                        <Plus className="mr-2 h-3.5 w-3.5" /> Insert Table (3x3)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        disabled={!editor.isActive("table")}
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                      >
                        Add Column After
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={!editor.isActive("table")}
                        onClick={() => editor.chain().focus().addColumnBefore().run()}
                      >
                        Add Column Before
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={!editor.isActive("table")}
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5 text-destructive" /> Delete Column
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        disabled={!editor.isActive("table")}
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                      >
                        Add Row Below
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={!editor.isActive("table")}
                        onClick={() => editor.chain().focus().addRowBefore().run()}
                      >
                        Add Row Above
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={!editor.isActive("table")}
                        onClick={() => editor.chain().focus().deleteRow().run()}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5 text-destructive" /> Delete Row
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        disabled={!editor.isActive("table")}
                        onClick={() => editor.chain().focus().deleteTable().run()}
                        className="text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Table
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipWrapper>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Undo/Redo */}
                <TooltipWrapper content="Undo">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper content="Redo">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>
              </div>

              <div className="flex items-center gap-2">
                <TooltipWrapper content="Toggle Suggestions & History Panel">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 gap-1.5 transition-all text-xs font-semibold ${
                      !showInspector && activeSuggestionCount > 0 
                        ? "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setShowInspector(!showInspector)}
                  >
                    <PanelRight className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">
                      {showInspector ? "Hide Panel" : "Show Panel"}
                    </span>
                  {activeSuggestionCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className={`h-4 min-w-4 px-1 flex items-center justify-center text-[10px] rounded-full font-bold ${
                        showInspector ? "bg-muted-foreground" : "bg-red-500 animate-pulse text-white"
                      }`}
                    >
                      {activeSuggestionCount}
                    </Badge>
                  )}
                </Button>
              </TooltipWrapper>

              <TooltipWrapper content="View unsaved changes since last commit">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs border-indigo-100 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100/50"
                  onClick={() => {
                    setViewingVersion({
                      version_id: draft?.version_id || 1,
                      content_text: draft?.content_text || "",
                      isCurrentWorkspaceDiff: true
                    });
                    setDiffBaseVersionId(draft?.version_id || "none");
                    setDiffCompareVersionId("current");
                    setDiffMode("redline");
                  }}
                  disabled={loadingDraft || isSaving}
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Diff
                </Button>
              </TooltipWrapper>

              <Button
                  size="sm"
                  className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Commit Version"}
                </Button>
              </div>
            </div>
          )}

          {/* Editor Workspace */}
          <ScrollArea className="flex-1 bg-card">
            {loadingDraft ? (
              <div className="flex flex-col items-center justify-center p-20 animate-pulse text-muted-foreground text-sm">
                <Sparkles className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                Loading draft editor...
              </div>
            ) : (
              <div className="max-w-2xl mx-auto py-6 px-4">
                <EditorContent editor={editor} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Side: Inspector Sidebar (Suggestions & History) */}
        {showInspector && (
          <div className="absolute inset-y-0 right-0 z-30 w-[280px] sm:w-[320px] lg:relative lg:inset-auto lg:z-0 flex flex-col bg-background lg:bg-slate-50/50 dark:lg:bg-slate-900/30 overflow-hidden border-l border-border shadow-xl lg:shadow-none animate-in slide-in-from-right duration-200">
            <Tabs value={activeInspectorTab} onValueChange={setActiveInspectorTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="shrink-0 rounded-none bg-muted/40 border-b border-border h-12 p-0 flex items-center justify-between">
                <div className="flex flex-1 h-full">
                  <TabsTrigger
                    value="suggestions"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent h-full text-xs font-semibold"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    Suggestions
                    {activeSuggestionCount > 0 && (
                      <Badge variant="destructive" className="ml-1.5 h-4 px-1.5 text-[10px]">
                        {activeSuggestionCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent h-full text-xs font-semibold"
                  >
                    <History className="w-3.5 h-3.5 mr-1.5" />
                    History
                  </TabsTrigger>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground mr-1"
                  onClick={() => setShowInspector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TabsList>

            {/* Suggestions Tab Content */}
            <TabsContent value="suggestions" className="flex-1 m-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {suggestions.length === 0 ? (
                  <div className="text-center py-12 px-4 text-muted-foreground text-xs flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500/50 mb-3" />
                    <p className="font-semibold">No Pending Suggestions</p>
                    <p className="mt-1">The legal advisors haven't posted any revision suggestions for this document yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestions.map((s: any) => (
                      <div
                        key={s.id}
                        className={`border rounded-lg p-3 bg-card shadow-sm transition-all ${
                          s.status === "accepted"
                            ? "border-green-200 dark:border-green-900/50 bg-green-50/20 dark:bg-green-950/10"
                            : s.status === "dismissed"
                            ? "opacity-50 border-slate-200 dark:border-slate-800"
                            : "border-indigo-100 dark:border-indigo-900/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {s.agent_name.replace(/_/g, " ")}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase tracking-wider px-1.5 py-0 ${
                              s.status === "accepted"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                                : s.status === "dismissed"
                                ? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400"
                            }`}
                          >
                            {s.status}
                          </Badge>
                        </div>

                        {/* Quote from document */}
                        <div className="border-l-2 border-indigo-400 pl-2 py-1 mb-2 text-xs italic text-muted-foreground bg-muted/30">
                          "{s.quote}"
                        </div>

                        {/* Suggested Text */}
                        {s.suggested_text && (
                          <div className="mb-2 bg-indigo-50/30 dark:bg-indigo-950/10 border border-dashed border-indigo-200/50 dark:border-indigo-900/30 rounded p-2 text-xs">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Proposed replacement:</span>
                            <span className="text-foreground">{s.suggested_text}</span>
                          </div>
                        )}

                        {/* Explanation */}
                        <p className="text-xs text-foreground/80 mb-3 leading-relaxed">
                          {s.explanation}
                        </p>

                        {/* Action buttons */}
                        {s.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveSuggestion(s.id, "accepted", s.quote, s.suggested_text)}
                              className="h-7 text-[11px] px-2 flex-1 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-900 dark:hover:bg-green-950/30 dark:hover:text-green-400 gap-1"
                            >
                              <Check className="w-3 h-3" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveSuggestion(s.id, "dismissed")}
                              className="h-7 text-[11px] px-2 flex-1 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 gap-1 text-muted-foreground"
                            >
                              <X className="w-3 h-3" /> Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* History Tab Content */}
            <TabsContent value="history" className="flex-1 m-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {versions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    <History className="w-8 h-8 mx-auto opacity-30 mb-3" />
                    No version snapshots recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((v: any) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setViewingVersion(v);
                          setDiffBaseVersionId(v.version_id > 1 ? v.version_id - 1 : "none");
                          setDiffCompareVersionId(v.version_id);
                          setDiffMode("redline");
                        }}
                        className={`border rounded-lg p-3 bg-card shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors flex flex-col gap-1.5 ${
                          viewingVersion?.id === v.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Version {v.version_id}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                          {v.content_text ? v.content_text.substring(0, 80) : "No text"}...
                        </p>
                        <div className="flex justify-end gap-1 mt-0.5">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 text-[10px] px-2 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-950"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingVersion(v);
                              setDiffBaseVersionId(v.version_id > 1 ? v.version_id - 1 : "none");
                              setDiffCompareVersionId(v.version_id);
                              setDiffMode("redline");
                            }}
                          >
                            View Diff
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 text-[10px] px-2 text-muted-foreground font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingVersion(v);
                              setDiffBaseVersionId(v.version_id > 1 ? v.version_id - 1 : "none");
                              setDiffCompareVersionId(v.version_id);
                              setDiffMode("full");
                            }}
                          >
                            Full Text
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Read-only History Viewer Overlay */}
      {viewingVersion && (
        <div className="absolute inset-0 bg-slate-950/30 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full sm:w-[500px] h-full bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-border bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {viewingVersion.isCurrentWorkspaceDiff ? "Workspace Diff Viewer" : "Historical Snapshot Viewer"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {viewingVersion.isCurrentWorkspaceDiff 
                    ? `Comparing current editor text against Version ${viewingVersion.version_id}` 
                    : diffMode === "redline"
                      ? `Showing differences introduced in Version ${viewingVersion.version_id} (vs. Version ${viewingVersion.version_id - 1})`
                      : `Full text of Version ${viewingVersion.version_id}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingVersion(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Diff Selector & Mode Toggle Header */}
            <div className="shrink-0 flex flex-col gap-2 p-3 border-b border-border bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">Compare Base:</span>
                  <select
                    value={diffBaseVersionId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDiffBaseVersionId(val === "none" ? "none" : val === "current" ? "current" : Number(val));
                    }}
                    className="w-full bg-background border border-border rounded px-2 py-1 outline-none text-foreground focus:border-indigo-500 font-medium"
                  >
                    <option value="none">Empty Document (None)</option>
                    <option value="current">Current Editor Draft</option>
                    {versions.map((ver: any) => (
                      <option key={ver.id} value={ver.version_id}>
                        Version {ver.version_id}
                      </option>
                    ))}
                  </select>
                </div>
                
                <span className="text-muted-foreground font-bold pt-4">→</span>
                
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">Compare Target:</span>
                  <select
                    value={diffCompareVersionId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDiffCompareVersionId(val === "none" ? "none" : val === "current" ? "current" : Number(val));
                    }}
                    className="w-full bg-background border border-border rounded px-2 py-1 outline-none text-foreground focus:border-indigo-500 font-medium"
                  >
                    <option value="current">Current Editor Draft</option>
                    {versions.map((ver: any) => (
                      <option key={ver.id} value={ver.version_id}>
                        Version {ver.version_id}
                      </option>
                    ))}
                    <option value="none">Empty Document (None)</option>
                  </select>
                </div>
              </div>

              {diffBaseVersionId === diffCompareVersionId && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded p-2 text-[10px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5 font-medium leading-normal mt-1 select-none">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                  <span>Base and Target are set to the same version. Change them using the dropdowns above to highlight differences.</span>
                </div>
              )}

              {/* Diff Mode Toggle Tabs */}
              <div className="flex gap-2 mt-1">
                <Button
                  variant={diffMode === "redline" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-3 font-semibold flex-1"
                  onClick={() => setDiffMode("redline")}
                >
                  Redline (Diff)
                </Button>
                <Button
                  variant={diffMode === "full" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-3 font-semibold flex-1"
                  onClick={() => setDiffMode("full")}
                >
                  Full Text
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              {diffMode === "redline" ? (
                renderRedlineDiff()
              ) : (
                <div className="max-w-prose mx-auto prose prose-sm dark:prose-invert font-serif whitespace-pre-wrap leading-relaxed">
                  {getVersionText(diffCompareVersionId)}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-border bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setViewingVersion(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}
