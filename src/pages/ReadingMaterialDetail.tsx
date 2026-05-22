import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, ExternalLink, Sparkles, Send, X } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface Section {
  id: string;
  title: string;
  intro: string;
  subsections: {
    title: string;
    content: string;
  }[];
  relatedVideo?: {
    title: string;
    duration: string;
  };
}

const readingMaterialsData: Record<string, {
  title: string;
  duration: string;
  sections: Section[];
}> = {
  "drafting-shareholder-agreements": {
    title: "Drafting of Shareholder Agreements",
    duration: "45 min",
    sections: [
      {
        id: "governance",
        title: "Governance and Decision-Making",
        intro: "Shareholder agreements must establish clear governance structures that balance power between different stakeholder groups. This includes defining board composition, voting rights, and decision-making processes.",
        subsections: [
          {
            title: "Board Composition",
            content: "The board of directors is the primary governance body. Agreements typically specify the number of directors, appointment rights for different shareholder classes, and any observer rights for minority stakeholders.",
          },
          {
            title: "Reserved Matters",
            content: "Certain fundamental decisions require supermajority or unanimous approval, protecting minority shareholders from major changes without their consent. These typically include amendments to constitutional documents, major asset disposals, changes to share capital, and related party transactions.",
          },
        ],
        relatedVideo: {
          title: "Governance Structures in Practice",
          duration: "18:45",
        },
      },
      {
        id: "economic-rights",
        title: "Economic Rights and Distributions",
        intro: "Economic rights define how profits and losses are shared among shareholders, including dividend policies, distribution preferences, and liquidation waterfalls.",
        subsections: [
          {
            title: "Dividend Rights",
            content: "Agreements specify dividend policies, including timing, discretion of the board, and any preferences for certain share classes. Preferred shareholders often have cumulative dividend rights or liquidation preferences.",
          },
          {
            title: "Anti-Dilution Protection",
            content: "Investors typically negotiate anti-dilution provisions to protect their ownership percentage in case of down-round financing or new share issuances at lower valuations.",
          },
        ],
        relatedVideo: {
          title: "Understanding Economic Rights",
          duration: "22:30",
        },
      },
      {
        id: "transfer-restrictions",
        title: "Transfer Restrictions",
        intro: "Transfer restrictions control how and when shareholders can sell or transfer their shares, ensuring stability and protecting against unwanted third-party ownership.",
        subsections: [
          {
            title: "Right of First Refusal",
            content: "Existing shareholders typically have the right to purchase shares before they can be sold to third parties, maintaining the existing ownership structure.",
          },
          {
            title: "Lock-up Periods",
            content: "Founders and key shareholders are often subject to lock-up periods during which they cannot sell their shares, ensuring commitment to the company's long-term success.",
          },
        ],
        relatedVideo: {
          title: "Transfer Restrictions Explained",
          duration: "16:20",
        },
      },
      {
        id: "exit-strategies",
        title: "Exit Strategies and Mechanisms",
        intro: "Exit provisions define how shareholders can realize the value of their investment, including tag-along and drag-along rights, IPO provisions, and buy-sell mechanisms.",
        subsections: [
          {
            title: "Tag-Along Rights",
            content: "Minority shareholders can participate in sales initiated by majority shareholders, ensuring they receive the same terms and aren't left behind in a transaction.",
          },
          {
            title: "Drag-Along Rights",
            content: "Majority shareholders can compel minority shareholders to participate in a sale, ensuring that potential acquirers can obtain 100% of the company.",
          },
        ],
        relatedVideo: {
          title: "Planning Your Exit Strategy",
          duration: "25:15",
        },
      },
      {
        id: "dispute-resolution",
        title: "Dispute Resolution",
        intro: "Effective dispute resolution mechanisms prevent costly litigation and maintain business relationships when conflicts arise between shareholders.",
        subsections: [
          {
            title: "Mediation and Arbitration",
            content: "Most agreements require disputes to be resolved through mediation or arbitration rather than court proceedings, providing faster, more confidential resolution.",
          },
          {
            title: "Deadlock Provisions",
            content: "When shareholders cannot agree on fundamental matters, deadlock provisions provide mechanisms for resolution, including casting votes, buy-out options, or even dissolution.",
          },
        ],
        relatedVideo: {
          title: "Effective Dispute Resolution",
          duration: "19:50",
        },
      },
    ],
  },
  "basics-corporate-governance": {
    title: "Basics of Corporate Governance",
    duration: "30 min",
    sections: [
      {
        id: "fundamentals",
        title: "Fundamentals of Corporate Governance",
        intro: "Corporate governance encompasses the systems, principles, and processes by which companies are directed and controlled.",
        subsections: [
          {
            title: "Key Principles",
            content: "The fundamental principles include accountability, transparency, fairness, and responsibility. These guide all governance decisions and structures.",
          },
          {
            title: "Stakeholder Interests",
            content: "Effective governance balances the interests of shareholders, management, customers, employees, and the broader community.",
          },
        ],
      },
      {
        id: "board-structure",
        title: "Board Structure and Composition",
        intro: "The board of directors serves as the primary governance mechanism, overseeing management and protecting shareholder interests.",
        subsections: [
          {
            title: "Board Independence",
            content: "Independent directors bring objectivity and can better represent minority shareholder interests, free from management influence.",
          },
          {
            title: "Committee Structure",
            content: "Key committees including audit, compensation, and nomination committees handle specialized governance functions.",
          },
        ],
      },
      {
        id: "fiduciary-duties",
        title: "Fiduciary Duties",
        intro: "Directors and officers owe fiduciary duties to the company and its shareholders, forming the legal foundation of governance.",
        subsections: [
          {
            title: "Duty of Care",
            content: "Directors must act with the care that a reasonably prudent person would exercise in similar circumstances.",
          },
          {
            title: "Duty of Loyalty",
            content: "Directors must act in good faith and in the best interests of the company, avoiding conflicts of interest.",
          },
        ],
      },
      {
        id: "compliance",
        title: "Compliance and Risk Management",
        intro: "Governance frameworks must include robust compliance and risk management systems to protect the organization.",
        subsections: [
          {
            title: "Internal Controls",
            content: "Effective internal controls ensure accurate financial reporting and compliance with laws and regulations.",
          },
          {
            title: "Risk Oversight",
            content: "The board must understand and oversee the company's risk profile, ensuring appropriate risk management strategies.",
          },
        ],
      },
    ],
  },
  "exit-mechanisms": {
    title: "Exit Mechanisms & Transfer Restrictions",
    duration: "35 min",
    sections: [
      {
        id: "overview",
        title: "Overview of Exit Mechanisms",
        intro: "Exit mechanisms provide shareholders with pathways to realize the value of their investment while protecting the interests of remaining shareholders.",
        subsections: [
          {
            title: "Types of Exits",
            content: "Common exit routes include trade sales, IPOs, management buyouts, and secondary sales to other investors.",
          },
          {
            title: "Planning Considerations",
            content: "Exit planning should begin early, considering timing, valuation expectations, and the interests of all shareholder groups.",
          },
        ],
      },
      {
        id: "drag-tag",
        title: "Drag-Along and Tag-Along Rights",
        intro: "These reciprocal rights balance the interests of majority and minority shareholders in sale transactions.",
        subsections: [
          {
            title: "Drag-Along Mechanics",
            content: "Drag-along provisions allow majority shareholders to force minority shareholders to sell on the same terms, facilitating clean exits.",
          },
          {
            title: "Tag-Along Protections",
            content: "Tag-along rights ensure minority shareholders can participate in sales, preventing them from being left with illiquid stakes.",
          },
        ],
      },
      {
        id: "rofr",
        title: "Right of First Refusal",
        intro: "ROFR provisions give existing shareholders the opportunity to purchase shares before they are sold to third parties.",
        subsections: [
          {
            title: "ROFR Process",
            content: "The selling shareholder must first offer shares to existing shareholders on the same terms offered by the third party.",
          },
          {
            title: "Exceptions and Carve-outs",
            content: "Certain transfers, such as to family members or affiliated entities, are typically exempt from ROFR requirements.",
          },
        ],
      },
      {
        id: "buyouts",
        title: "Buy-Sell Mechanisms",
        intro: "Buy-sell provisions provide structured mechanisms for shareholders to exit when disputes arise or circumstances change.",
        subsections: [
          {
            title: "Shotgun Clauses",
            content: "One shareholder offers to buy the other's shares at a stated price; the recipient can accept or turn the tables and buy at that price.",
          },
          {
            title: "Put and Call Options",
            content: "These options give shareholders the right to sell (put) or buy (call) shares at predetermined prices or formulas.",
          },
        ],
      },
    ],
  },
  "dispute-resolution": {
    title: "Dispute Resolution Frameworks",
    duration: "25 min",
    sections: [
      {
        id: "prevention",
        title: "Dispute Prevention",
        intro: "The best dispute resolution strategy is prevention through clear agreements and effective communication.",
        subsections: [
          {
            title: "Clear Drafting",
            content: "Precise, unambiguous language in agreements prevents many disputes by eliminating interpretation disagreements.",
          },
          {
            title: "Regular Communication",
            content: "Scheduled shareholder meetings and transparent reporting help identify and address issues before they escalate.",
          },
        ],
      },
      {
        id: "mediation",
        title: "Mediation",
        intro: "Mediation provides a collaborative approach to dispute resolution with the assistance of a neutral third party.",
        subsections: [
          {
            title: "Mediation Process",
            content: "A mediator facilitates discussions and helps parties find mutually acceptable solutions without imposing decisions.",
          },
          {
            title: "Advantages",
            content: "Mediation preserves relationships, maintains confidentiality, and typically resolves disputes faster and cheaper than litigation.",
          },
        ],
      },
      {
        id: "arbitration",
        title: "Arbitration",
        intro: "Arbitration provides a binding resolution mechanism that is typically faster and more confidential than court proceedings.",
        subsections: [
          {
            title: "Arbitration Clauses",
            content: "Well-drafted arbitration clauses specify the rules, venue, number of arbitrators, and governing law for any disputes.",
          },
          {
            title: "Enforcement",
            content: "Arbitration awards are generally enforceable internationally under the New York Convention, providing certainty across borders.",
          },
        ],
      },
    ],
  },
};

const ReadingMaterialDetail = () => {
  const { id, materialId } = useParams();
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I can help you understand the reading material about shareholder agreements. Feel free to ask me any questions!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const material = materialId ? readingMaterialsData[materialId] : null;

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: "Thank you for your question! I'm here to help you understand this material better. This is a default response - real AI integration coming soon!",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  if (!material) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">
          <p className="text-muted-foreground">Reading material not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {/* Back link */}
          <Link
            to={`/library/${id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Module
          </Link>

          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 max-w-3xl">
              {/* Header */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">{material.title}</h1>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {material.duration}
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="space-y-10">
                  {material.sections.map((section, index) => (
                    <div key={section.id} id={section.id}>
                      <h2 className="text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
                        {index + 1}. {section.title}
                      </h2>
                      <p className="text-foreground mt-4 mb-6 leading-relaxed">
                        {section.intro}
                      </p>

                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="mb-4">
                          <h3 className="font-semibold text-foreground mb-2">{subsection.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{subsection.content}</p>
                        </div>
                      ))}

                      {section.relatedVideo && (
                        <a
                          href="https://example.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Watch: {section.relatedVideo.title} ({section.relatedVideo.duration})
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-72 shrink-0">
              <div className="sticky top-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
                {/* Content Outline */}
                <div className="bg-card border border-border rounded-2xl p-5 mb-4">
                  <h3 className="font-semibold text-foreground mb-4">Content Outline</h3>
                  <nav className="space-y-2">
                    {material.sections.map((section, index) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {index + 1}. {section.title}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* AI Assistant Card */}
                <div className="bg-card border border-border rounded-2xl p-5 flex flex-col flex-1 min-h-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">AI Assistant</h3>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        <div
                          className={`rounded-xl px-3 py-2 text-sm max-w-[200px] ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-3 h-3 text-primary" />
                        </div>
                        <div className="bg-muted rounded-xl px-3 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2 shrink-0">
                    <Input
                      placeholder="Ask about the reading material..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="text-sm"
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={isLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadingMaterialDetail;
