import { Play, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const mediaItems = [
  {
    id: "governance-structures",
    title: "Governance Structures in Practice",
    description: "Learn how to structure effective board composition and reserved matters",
    duration: "18:45",
  },
  {
    id: "economic-rights",
    title: "Understanding Economic Rights",
    description: "Deep dive into dividend policies and anti-dilution provisions",
    duration: "22:30",
  },
  {
    id: "transfer-restrictions",
    title: "Transfer Restrictions Explained",
    description: "Master ROFR, permitted transfers, and ownership control mechanisms",
    duration: "16:20",
  },
  {
    id: "exit-strategy",
    title: "Planning Your Exit Strategy",
    description: "Comprehensive guide to tag-along, drag-along, and buy-sell provisions",
    duration: "25:15",
  },
  {
    id: "dispute-resolution",
    title: "Effective Dispute Resolution",
    description: "Navigate arbitration clauses and deadlock mechanisms",
    duration: "19:50",
  },
];

interface MediaLibraryContentProps {
  onViewRelatedSection?: () => void;
}

const MediaLibraryContent = ({ onViewRelatedSection }: MediaLibraryContentProps) => {
  const handleWatchVideo = () => {
    window.open("https://example.com", "_blank");
  };

  return (
    <div>
      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground mb-2">Media Library</h2>
      <p className="text-muted-foreground mb-6">Video resources linked to reading material sections</p>

      {/* Media Items List */}
      <div className="space-y-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {item.duration}
                  </div>
                  <Button variant="outline" size="sm" className="h-8" onClick={onViewRelatedSection}>
                    View Related Section
                  </Button>
                  <Button size="sm" className="h-8 gap-1.5" onClick={handleWatchVideo}>
                    Watch Video
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibraryContent;
