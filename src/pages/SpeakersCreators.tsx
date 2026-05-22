import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users, Building, Star, GraduationCap, Linkedin, Globe, Video } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";

const creatorsData = [
  {
    initials: "AF",
    name: "Dr. Alexandra Foster",
    role: "Lead Module Creator",
    company: "Schmidt & Partners LLP",
    bio: "Senior Partner with 20+ years of experience in corporate law. Led the development of this comprehensive training module drawing from extensive practical experience in negotiating complex shareholder agreements.",
    credentials: "JD Harvard Law, LLM Corporate Law",
    rating: 4.9,
    tags: ["Corporate Law", "Shareholder Agreements", "M&A"],
    linkedIn: "#",
    website: "#",
  },
  {
    initials: "MW",
    name: "Marcus Webb",
    role: "Content Developer",
    company: "Schmidt & Partners LLP",
    bio: "Former General Counsel turned legal educator. Specializes in creating practical, scenario-based learning experiences for junior lawyers.",
    credentials: "JD Yale Law, MBA Wharton",
    rating: 4.8,
    tags: ["Legal Education", "Contract Drafting", "Corporate Governance"],
    linkedIn: "#",
    website: "#",
  },
];

const speakersData = [
  {
    initials: "SM",
    name: "Prof. Sarah Mitchell",
    role: "Guest Lecturer",
    company: "London School of Economics",
    bio: "Professor of Corporate Law with extensive experience in governance frameworks. Regular speaker at international corporate law conferences.",
    credentials: "PhD Corporate Law, 15+ years teaching",
    sessions: 12,
    tags: ["Corporate Governance", "Fiduciary Duties", "Board Structures"],
    linkedIn: "#",
    hasWebsite: false,
  },
  {
    initials: "DC",
    name: "David Chen",
    role: "Industry Expert Speaker",
    company: "TechVentures Capital",
    bio: "Managing Partner specializing in early-stage investments. Brings real-world perspective on shareholder agreements in the startup ecosystem.",
    credentials: "MBA Stanford, JD Columbia",
    sessions: 8,
    tags: ["Venture Capital", "Startup Law", "Investment Agreements"],
    linkedIn: "#",
    hasWebsite: true,
  },
  {
    initials: "ER",
    name: "Emma Rodriguez",
    role: "Live Session Instructor",
    company: "Rodriguez Legal Consultancy",
    bio: "Renowned mediator with over 200 successful shareholder dispute resolutions. Conducts interactive sessions on conflict prevention and resolution strategies.",
    credentials: "JD Oxford, Certified Mediator",
    sessions: 15,
    tags: ["Dispute Resolution", "Mediation", "Shareholder Conflicts"],
    linkedIn: "#",
    hasWebsite: false,
  },
];

const SpeakersCreators = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8 max-w-4xl">
        {/* Back link */}
        <Link
          to={`/library/${id || 'shareholder-agreements'}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Module
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-2">Speakers & Creators</h1>
        <p className="text-muted-foreground mb-8">Meet the experts behind this module</p>

        {/* Module Creators Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Module Creators</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            The experienced professionals who designed and developed this comprehensive learning experience.
          </p>

          <div className="space-y-4">
            {creatorsData.map((creator, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary shrink-0">
                    {creator.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{creator.name}</h3>
                        <p className="text-sm text-muted-foreground">{creator.role}</p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <Building className="w-3.5 h-3.5" />
                          {creator.company}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-foreground">{creator.rating}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {creator.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-muted-foreground text-sm mt-3">{creator.bio}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {creator.credentials}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                          <Globe className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Session Speakers Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Live Session Speakers</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Industry experts and guest lecturers who contribute to our live sessions.
          </p>

          <div className="space-y-4">
            {speakersData.map((speaker, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary shrink-0">
                    {speaker.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{speaker.name}</h3>
                        <p className="text-sm text-muted-foreground">{speaker.role}</p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <Building className="w-3.5 h-3.5" />
                          {speaker.company}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Video className="w-4 h-4" />
                        {speaker.sessions} sessions
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {speaker.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-muted-foreground text-sm mt-3">{speaker.bio}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {speaker.credentials}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                        {speaker.hasWebsite && (
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpeakersCreators;
