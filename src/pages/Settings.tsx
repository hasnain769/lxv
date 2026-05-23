import { useState } from "react";
import { User, Bell, Moon, Globe, CreditCard, Lock, LogOut, Trash2 } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth0 } from "@auth0/auth0-react";

const SettingsCard = ({ 
  icon, 
  title, 
  description, 
  children,
  variant = "default"
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  children: React.ReactNode;
  variant?: "default" | "danger";
}) => (
  <div className={`bg-card rounded-2xl p-6 shadow-card border ${variant === "danger" ? "border-destructive/30" : "border-border"} animate-fade-in`}>
    <div className="flex items-center gap-3 mb-6">
      <div className={`${variant === "danger" ? "text-destructive" : "text-primary"}`}>
        {icon}
      </div>
      <div>
        <h2 className={`text-xl font-semibold ${variant === "danger" ? "text-destructive" : "text-foreground"}`}>{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const SettingsRow = ({ 
  label, 
  description, 
  children 
}: { 
  label: string; 
  description: string; 
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth0();

  const nameParts = (user?.name || user?.nickname || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  const email = user?.email || "";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-lg text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </header>

          <div className="space-y-6">
            {/* Profile Section */}
            <SettingsCard
              icon={<User className="w-6 h-6" />}
              title="Profile"
              description="Manage your personal information"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
                    <Input placeholder="First Name" defaultValue={firstName} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
                    <Input placeholder="Last Name" defaultValue={lastName} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input type="email" placeholder="Email address" defaultValue={email} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Profession</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Student / Graduate</SelectLabel>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Legal Professional</SelectLabel>
                        <SelectItem value="junior-lawyer">Junior Lawyer</SelectItem>
                        <SelectItem value="senior-lawyer">Senior Lawyer</SelectItem>
                        <SelectItem value="counsel">Counsel</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="in-house-counsel">In-House Counsel</SelectItem>
                        <SelectItem value="general-counsel">General Counsel</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Business / Investment</SelectLabel>
                        <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                        <SelectItem value="founder">Founder / Co-Founder</SelectItem>
                        <SelectItem value="ceo">CEO / Executive</SelectItem>
                        <SelectItem value="board-member">Board Member</SelectItem>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="vc">Venture Capitalist</SelectItem>
                        <SelectItem value="angel">Angel Investor</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Other</SelectLabel>
                        <SelectItem value="consultant">Consultant</SelectItem>
                        <SelectItem value="academic">Academic / Professor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Changes</Button>
              </div>
            </SettingsCard>

            {/* Notifications Section */}
            <SettingsCard
              icon={<Bell className="w-6 h-6" />}
              title="Notifications"
              description="Configure how you receive notifications"
            >
              <div>
                <SettingsRow 
                  label="Email Notifications" 
                  description="Receive updates about your courses via email"
                >
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </SettingsRow>
                <SettingsRow 
                  label="Session Reminders" 
                  description="Get reminded before live sessions start"
                >
                  <Switch checked={sessionReminders} onCheckedChange={setSessionReminders} />
                </SettingsRow>
                <SettingsRow 
                  label="Progress Updates" 
                  description="Weekly summary of your learning progress"
                >
                  <Switch checked={progressUpdates} onCheckedChange={setProgressUpdates} />
                </SettingsRow>
              </div>
            </SettingsCard>

            {/* Appearance Section */}
            <SettingsCard
              icon={<Moon className="w-6 h-6" />}
              title="Appearance"
              description="Customize the look and feel"
            >
              <SettingsRow 
                label="Dark Mode" 
                description="Toggle dark mode on or off"
              >
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </SettingsRow>
            </SettingsCard>

            {/* Language & Region Section */}
            <SettingsCard
              icon={<Globe className="w-6 h-6" />}
              title="Language & Region"
              description="Set your preferred language and timezone"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Language</label>
                  <Select defaultValue="english">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Timezone</label>
                  <Select defaultValue="utc1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc0">UTC+0 (Greenwich Mean Time)</SelectItem>
                      <SelectItem value="utc1">UTC+1 (Central European Time)</SelectItem>
                      <SelectItem value="utc-5">UTC-5 (Eastern Time)</SelectItem>
                      <SelectItem value="utc-8">UTC-8 (Pacific Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SettingsCard>

            {/* Payment Details Section */}
            <SettingsCard
              icon={<CreditCard className="w-6 h-6" />}
              title="Payment Details"
              description="Manage your billing and payment information"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Cardholder Name</label>
                  <Input placeholder="John Doe" defaultValue="John Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Card Number</label>
                  <Input placeholder="•••• •••• •••• ••••" defaultValue="•••• •••• •••• ••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Expiry Date</label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">CVV</label>
                    <Input placeholder="•••" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Billing Address</label>
                  <Input placeholder="123 Main St, City, Country" defaultValue="123 Main St, City, Country" />
                </div>
                <Button>Save Payment Details</Button>
              </div>
            </SettingsCard>

            {/* Security Section */}
            <SettingsCard
              icon={<Lock className="w-6 h-6" />}
              title="Security"
              description="Manage your account security"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Current Password</label>
                  <Input type="password" placeholder="" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">New Password</label>
                  <Input type="password" placeholder="" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Confirm New Password</label>
                  <Input type="password" placeholder="" />
                </div>
                <Button>Update Password</Button>
              </div>
            </SettingsCard>

            {/* Account Actions Section */}
            <SettingsCard
              icon={<LogOut className="w-6 h-6" />}
              title="Account Actions"
              description="Log out or permanently delete your account"
              variant="danger"
            >
              <div>
                <SettingsRow 
                  label="Log Out" 
                  description="Sign out of your account on this device"
                >
                  <Button variant="outline" className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </Button>
                </SettingsRow>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </SettingsCard>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 LXVerse. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Settings;