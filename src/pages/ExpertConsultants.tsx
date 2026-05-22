import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, CheckCircle, Clock, MessageSquare, Video } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RequestConsultationDialog from "@/components/RequestConsultationDialog";

interface Expert {
  id: string;
  initials: string;
  name: string;
  title: string;
  tags: string[];
  description: string;
  experience: string;
  availability: string;
  availableToday: boolean;
  rating: number;
  reviews: number;
  pricePerSession: number;
}

const experts: Expert[] = [
  {
    id: "1",
    initials: "SM",
    name: "Dr. Sarah Mitchell",
    title: "Senior Corporate Law Partner",
    tags: ["Shareholder Agreements", "M&A", "Corporate Governance"],
    description: "Former General Counsel at a Fortune 500 company with 15+ years advising on complex shareholder agreements and corporate restructuring.",
    experience: "15+ years experience",
    availability: "Available today",
    availableToday: true,
    rating: 4.9,
    reviews: 127,
    pricePerSession: 180,
  },
  {
    id: "2",
    initials: "MC",
    name: "Michael Chen",
    title: "Venture Capital Legal Advisor",
    tags: ["Startup Law", "Investment Agreements", "Exit Strategies"],
    description: "Specialized in startup financing and shareholder agreements for tech companies. Has advised 100+ successful funding rounds.",
    experience: "12+ years experience",
    availability: "Available tomorrow",
    availableToday: false,
    rating: 4.8,
    reviews: 93,
    pricePerSession: 150,
  },
  {
    id: "3",
    initials: "ER",
    name: "Emma Rodriguez",
    title: "Corporate Governance Specialist",
    tags: ["Board Structures", "Fiduciary Duties", "Shareholder Rights"],
    description: "Expert in designing governance frameworks for closely-held companies and family businesses.",
    experience: "18+ years experience",
    availability: "Available today",
    availableToday: true,
    rating: 4.9,
    reviews: 156,
    pricePerSession: 165,
  },
];

const ExpertConsultants = () => {
  const { id, scenarioId } = useParams();
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  const handleRequestConsultation = (expert: Expert) => {
    setSelectedExpert(expert);
    setConsultationDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-64 p-8">
        <Link
          to={`/library/${id}/scenario/${scenarioId}/play`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Module
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Expert Consultants</h1>
          <p className="text-muted-foreground">
            Connect with specialists in shareholder agreements and corporate law
          </p>
        </div>

        <div className="space-y-6">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-primary">
                    {expert.initials}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {expert.name}
                      </h3>
                      <p className="text-muted-foreground">{expert.title}</p>
                    </div>

                    {/* Rating & Price */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">
                          {expert.rating}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          ({expert.reviews} reviews)
                        </span>
                      </div>
                      <div>
                        <span className="text-xl font-bold text-foreground">
                          ${expert.pricePerSession}
                        </span>
                        <span className="text-muted-foreground text-sm">/15 min</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {expert.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-sm text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4">{expert.description}</p>

                  {/* Experience & Availability */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">{expert.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className={expert.availableToday ? "text-primary font-medium" : "text-muted-foreground"}>
                        {expert.availability}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button className="gap-2" onClick={() => handleRequestConsultation(expert)}>
                      <MessageSquare className="w-4 h-4" />
                      Request Consultation
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Video className="w-4 h-4" />
                      Schedule Video Call
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <RequestConsultationDialog
          open={consultationDialogOpen}
          onOpenChange={setConsultationDialogOpen}
          expert={selectedExpert}
        />
      </main>
    </div>
  );
};

export default ExpertConsultants;
