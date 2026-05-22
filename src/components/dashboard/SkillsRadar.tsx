import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const skillsData = [
  { skill: "Contract Law", value: 85, fullMark: 100 },
  { skill: "Corporate", value: 72, fullMark: 100 },
  { skill: "Finance", value: 62, fullMark: 100 },
  { skill: "Negotiation", value: 90, fullMark: 100 },
  { skill: "Client Relations", value: 75, fullMark: 100 },
  { skill: "Presentation", value: 68, fullMark: 100 },
];

const SkillsRadar = () => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">Skill Profile</h3>
        <p className="text-sm text-muted-foreground">Your performance across key legal domains</p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={skillsData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
            <defs>
              <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(240, 100%, 27%)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(240, 100%, 40%)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
              tickLine={false}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="hsl(240, 100%, 27%)"
              fill="url(#skillGradient)"
              strokeWidth={2}
              dot={{ fill: "hsl(240, 100%, 27%)", strokeWidth: 0, r: 4 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillsRadar;
