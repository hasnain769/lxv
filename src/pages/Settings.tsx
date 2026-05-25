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
  const { user, isLoading: isAuth0Loading } = useAuth0();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  if (isAuth0Loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  const handlePasswordReset = async () => {
    if (user.sub && !user.sub.startsWith("auth0|")) {
      setMessage({
        text: "You are logged in via a social provider (e.g. Google). Please change your password directly with your provider.",
        type: "error"
      });
      return;
    }

    setResetting(true);
    setMessage(null);

    try {
      const response = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/dbconnections/change_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
          email: user.email,
          connection: "Username-Password-Authentication"
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage({
        text: `A password reset link has been sent to ${user.email}. Please check your inbox.`,
        type: "success"
      });
    } catch (e: any) {
      setMessage({
        text: `Failed to request password reset: ${e.message}`,
        type: "error"
      });
    } finally {
      setResetting(false);
    }
  };

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
              <div className="space-y-6 flex flex-col items-center">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-24 h-24 rounded-full border-4 border-background shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground border-4 border-background shadow-md">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                )}
                
                <div className="text-center w-full">
                  <h3 className="text-xl font-bold text-foreground mb-1">{user.name || "Anonymous User"}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                
                <div className="w-full text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    To update your avatar or display name, please contact your system administrator.
                    These attributes are managed securely through your Auth0 identity provider.
                  </p>
                </div>
              </div>
            </SettingsCard>



            {/* Security Section */}
            <SettingsCard
              icon={<Lock className="w-6 h-6" />}
              title="Security"
              description="Manage your account security"
            >
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  If you registered using an email and password, you can request a password reset link to be sent to your email.
                  If you registered using a social provider (like Google or GitHub), you must manage your credentials through them.
                </p>

                {message && (
                  <div className={`p-4 rounded-lg mb-4 text-sm font-medium ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {message.text}
                  </div>
                )}

                <Button onClick={handlePasswordReset} disabled={resetting} className="w-full sm:w-auto">
                  {resetting ? "Sending..." : "Send Password Reset Email"}
                </Button>
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
                  <Button variant="outline" className="gap-2" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </Button>
                </SettingsRow>
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