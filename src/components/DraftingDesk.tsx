import { useState, useEffect } from "react";
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
  List, ListOrdered, FileText, Sparkles, CheckCircle2, ChevronRight, Lock, AlertCircle,
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
        editor.commands.setContent(parsed);
      } catch (e) {
        editor.commands.setContent(draft.content_text || "");
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1.5 text-xs font-semibold px-2 text-muted-foreground hover:text-foreground"
                      title="Text Formatting / Headings"
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

                <div className="w-px h-4 bg-border mx-1" />

                {/* Inline formatting buttons */}
                <Button
                  variant={editor.isActive("bold") ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("italic") ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("underline") ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  title="Underline"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("strike") ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  title="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("highlight") ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 text-amber-500 hover:text-amber-600 dark:text-amber-400"
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                  title="Highlight Text"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Alignment buttons */}
                <Button
                  variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                  title="Align Justify"
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Lists */}
                <Button
                  variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Table Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1.5 text-xs font-semibold px-2 text-muted-foreground hover:text-foreground"
                      title="Table Actions"
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

                <div className="w-px h-4 bg-border mx-1" />

                {/* Undo/Redo */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  title="Undo"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  title="Redo"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 gap-1.5 transition-all text-xs font-semibold ${
                    !showInspector && activeSuggestionCount > 0 
                      ? "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setShowInspector(!showInspector)}
                  title="Toggle Suggestions & History Panel"
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
                        onClick={() => setViewingVersion(v)}
                        className={`border rounded-lg p-3 bg-card shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors ${
                          viewingVersion?.id === v.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Version {v.version_id}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {v.content_text ? v.content_text.substring(0, 80) : "No text"}...
                        </p>
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
                <h3 className="font-bold text-sm">Historical Snapshot Viewer</h3>
                <p className="text-xs text-muted-foreground">Viewing Version {viewingVersion.version_id}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingVersion(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-prose mx-auto prose prose-sm dark:prose-invert font-serif whitespace-pre-wrap leading-relaxed">
                {viewingVersion.content_text}
              </div>
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
  );
}
