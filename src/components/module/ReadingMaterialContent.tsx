import { Link, useParams } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";

const readingMaterials = [
  {
    id: "drafting-shareholder-agreements",
    title: "Drafting of Shareholder Agreements",
    description: "Master the essential clauses and provisions in shareholder agreements, from governance structures to exit strategies.",
    duration: "45 min",
    sections: 5,
  },
  {
    id: "basics-corporate-governance",
    title: "Basics of Corporate Governance",
    description: "Understand the fundamentals of corporate governance, board structures, and fiduciary duties.",
    duration: "30 min",
    sections: 4,
  },
  {
    id: "exit-mechanisms",
    title: "Exit Mechanisms & Transfer Restrictions",
    description: "Learn about drag-along, tag-along rights, and other mechanisms governing share transfers.",
    duration: "35 min",
    sections: 4,
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution Frameworks",
    description: "Explore different approaches to resolving shareholder disputes including mediation and arbitration.",
    duration: "25 min",
    sections: 3,
  },
];

const ReadingMaterialContent = () => {
  const { id } = useParams();
  
  return (
    <div>
      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground mb-2">Reading Material</h2>
      <p className="text-muted-foreground mb-6">Choose a topic to begin reading</p>

      {/* Reading Materials List */}
      <div className="space-y-4">
        {readingMaterials.map((material) => (
          <Link
            key={material.id}
            to={`/library/${id}/reading/${material.id}`}
            className="block bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg mb-1">{material.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{material.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {material.duration}
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {material.sections} Sections
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReadingMaterialContent;
