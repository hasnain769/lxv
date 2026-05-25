import { useState, useEffect } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  GraduationCap,
  Star,
  Award,
  ChevronDown,
  FileText,
  Video,
  Play,
  Users,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  comingSoon?: boolean;
}

const NavItem = ({ icon, label, href, active, comingSoon }: NavItemProps) => (
  comingSoon ? (
    <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 opacity-60 cursor-not-allowed text-foreground/70">
      <Lock className="w-5 h-5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0 shrink-0 whitespace-nowrap">Coming Soon</Badge>
    </div>
  ) : (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-foreground/70 hover:text-foreground hover:bg-secondary"
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  )
);

interface SubNavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  comingSoon?: boolean;
}

const SubNavItem = ({ icon, label, href, active, comingSoon }: SubNavItemProps) => (
  comingSoon ? (
    <div className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 opacity-60 cursor-not-allowed text-foreground/70">
      <Lock className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <Badge variant="secondary" className="text-[9px] uppercase px-1 py-0 shrink-0 whitespace-nowrap">Soon</Badge>
    </div>
  ) : (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200",
        active
          ? "bg-secondary text-foreground font-medium"
          : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  )
);

const moduleSubItems = [
  { id: "introduction", title: "Introduction", icon: FileText, alwaysUnlocked: true, isSeparatePage: false, comingSoon: false },
  { id: "scenarios", title: "Practice Scenario", icon: Play, alwaysUnlocked: true, isSeparatePage: false, comingSoon: false },
  { id: "sessions", title: "Previous Sessions", icon: Video, alwaysUnlocked: true, isSeparatePage: false, comingSoon: false },
  { id: "reading", title: "Reading Material", icon: BookOpen, alwaysUnlocked: false, isSeparatePage: false, comingSoon: true },
  { id: "media", title: "Media Library", icon: Video, alwaysUnlocked: false, isSeparatePage: false, comingSoon: true },
  { id: "speakers", title: "Speakers & Creators", icon: Users, alwaysUnlocked: false, isSeparatePage: true, comingSoon: true },
];

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { useAuth0 } from "@auth0/auth0-react";

// SidebarContent extracts the inner content so it can be reused in Sheet and Desktop
const SidebarContent = ({ isModuleOpen, setIsModuleOpen, location, currentSubPath, moduleTitle, moduleId, isUnlocked }: any) => {
  const { user } = useAuth0();

  const name = user?.name || user?.nickname || "User";
  const email = user?.email || "";
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  const picture = user?.picture;

  return (
    <div className="h-full w-full bg-card flex flex-col">
      {/* Logo */}
      <div className="p-6 pr-12 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">LXVerse</h1>
            <p className="text-xs text-muted-foreground">Legal Learning Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" href="/" active={location.pathname === "/"} comingSoon />
          <NavItem icon={<Star className="w-5 h-5" />} label="My Modules" href="/my-modules" active={location.pathname === "/my-modules"} comingSoon />

          {/* Module Library with collapsible submenu */}
          <Collapsible open={isModuleOpen} onOpenChange={setIsModuleOpen}>
            <div
              className={cn(
                "flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                location.pathname.startsWith("/library")
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-foreground/70 hover:text-foreground hover:bg-secondary"
              )}
            >
              <Link to="/library" className="flex items-center gap-3 flex-1">
                <BookOpen className="w-5 h-5" />
                Module Library
              </Link>
              {(isModuleOpen || location.pathname.startsWith("/library/")) && (
                <CollapsibleTrigger asChild>
                  <button className="p-1 hover:bg-white/10 rounded">
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isModuleOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
              )}
            </div>

            {(isModuleOpen || location.pathname.startsWith("/library/")) && (
              <CollapsibleContent className="mt-1 ml-2 space-y-0.5">
                {/* Module Title */}
                <div className="px-4 py-2 text-xs font-semibold text-primary tracking-wide">
                  {moduleTitle}
                </div>

                {/* Sub-navigation items */}
                {moduleSubItems.map((item) => {
                  const isSpeakersPage = currentSubPath === "speakers";
                  const isActive = item.id === "speakers"
                    ? isSpeakersPage
                    : item.id === "introduction" && !isSpeakersPage;
                  const href = item.isSeparatePage
                    ? `/library/${moduleId}/${item.id}`
                    : `/library/${moduleId}`;
                  const isItemLocked = !item.alwaysUnlocked && !isUnlocked;

                  return (
                    <SubNavItem
                      key={item.id}
                      icon={<item.icon className="w-4 h-4" />}
                      label={item.title}
                      href={href}
                      active={isActive}
                      comingSoon={item.comingSoon}
                    />
                  );
                })}
              </CollapsibleContent>
            )}
          </Collapsible>

          <NavItem icon={<Award className="w-5 h-5" />} label="Certification" href="/certification" active={location.pathname.startsWith("/certification")} comingSoon />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" href="/settings" active={location.pathname === "/settings"} comingSoon />
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground overflow-hidden shrink-0">
            {picture && !picture.includes('cdn.auth0.com/avatars') ? (
              <img src={picture} alt={name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { isModuleUnlocked } = useSubscription();
  const isInModule = location.pathname.startsWith("/library/") && location.pathname !== "/library";
  const currentSubPath = location.pathname.split("/").slice(3).join("/");

  // Extract module ID from path
  const pathParts = location.pathname.split("/");
  const moduleId = pathParts[2] || "";
  const moduleTitle = moduleId.replace(/-/g, " ").toUpperCase();
  const isUnlocked = isModuleUnlocked(moduleId);

  const [isModuleOpen, setIsModuleOpen] = useState(isInModule);

  useEffect(() => {
    if (isInModule) {
      setIsModuleOpen(true);
    }
  }, [isInModule]);

  const sidebarProps = { isModuleOpen, setIsModuleOpen, location, currentSubPath, moduleTitle, moduleId, isUnlocked };

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-base font-bold text-foreground">LXVerse</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 -mr-2 text-foreground/70 hover:text-foreground">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 border-r border-border">
            <SidebarContent {...sidebarProps} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col z-40">
        <SidebarContent {...sidebarProps} />
      </aside>
    </>
  );
};

export default Sidebar;
