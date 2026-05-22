import { useState } from "react";
import { Video, Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import { format, isSameDay, parse } from "date-fns";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  instructor: string;
  currentAttendees: number;
  maxAttendees: number;
}

const sessions: Session[] = [
  {
    id: "1",
    title: "Introduction to Shareholder Agreements",
    description: "Live Q&A session covering the fundamentals of drafting shareholder agreements",
    date: "12/15/2025",
    time: "14:00",
    duration: "90 min",
    instructor: "Dr. Sarah Mueller",
    currentAttendees: 18,
    maxAttendees: 30,
  },
  {
    id: "2",
    title: "Advanced Governance Structures",
    description: "Deep dive into complex governance mechanisms and board composition",
    date: "12/20/2025",
    time: "16:00",
    duration: "120 min",
    instructor: "Prof. Michael Schmidt",
    currentAttendees: 22,
    maxAttendees: 25,
  },
  {
    id: "3",
    title: "Exit Strategies Workshop",
    description: "Workshop on exit strategies and mechanisms",
    date: "12/15/2025",
    time: "10:00",
    duration: "60 min",
    instructor: "Dr. Anna Weber",
    currentAttendees: 15,
    maxAttendees: 20,
  },
];

export function LiveSessionsContent() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 11, 7));

  // Parse session dates for comparison
  const sessionDates = sessions.map((s) => 
    parse(s.date, "MM/dd/yyyy", new Date())
  );

  // Get sessions for selected date
  const sessionsOnDate = sessions.filter((s) => {
    const sessionDate = parse(s.date, "MM/dd/yyyy", new Date());
    return isSameDay(sessionDate, selectedDate);
  });

  // Check if a date has sessions (for underline styling)
  const hasSession = (date: Date) => {
    return sessionDates.some((d) => isSameDay(d, date));
  };

  const handleViewOnCalendar = (session: Session) => {
    const sessionDate = parse(session.date, "MM/dd/yyyy", new Date());
    setSelectedDate(sessionDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Live Sessions</h2>
        <p className="text-muted-foreground">Interactive video sessions with expert instructors</p>
      </div>

      {/* Calendar and Sessions Grid */}
      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Calendar */}
        <div className="flex items-stretch">
          <CalendarWidget
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            defaultMonth={new Date(2025, 11, 1)}
            className={cn("p-3 pointer-events-auto h-full")}
            modifiers={{
              hasSession: (date) => hasSession(date),
            }}
            modifiersClassNames={{
              hasSession: "underline text-primary font-semibold",
            }}
          />
        </div>

        {/* Sessions on Date */}
        <div className="h-full">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Sessions on {format(selectedDate, "M/d/yyyy")}
          </h3>
          
          {sessionsOnDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Video className="w-12 h-12 mb-4 opacity-50" />
              <p>No sessions scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionsOnDate.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Video className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{session.title}</p>
                    <p className="text-sm text-muted-foreground">{session.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Upcoming Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">All Upcoming Sessions</h3>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex gap-4">
                {/* Video Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-foreground mb-1">
                    {session.title}
                  </h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    {session.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {session.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {session.time} • {session.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {session.currentAttendees}/{session.maxAttendees}
                    </span>
                  </div>

                  {/* Instructor */}
                  <p className="text-muted-foreground text-sm mb-4">
                    <span className="text-foreground">Instructor:</span> {session.instructor}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button>Register</Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewOnCalendar(session)}>
                      View on Calendar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
