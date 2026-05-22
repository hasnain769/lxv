import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Crown, CheckCircle } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "@/hooks/use-toast";

interface UnlockAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId?: string;
}

const UnlockAccessDialog = ({ open, onOpenChange, moduleId }: UnlockAccessDialogProps) => {
  const { unlockModule, unlockAnnual } = useSubscription();

  const moduleFeatures = [
    "All reading materials",
    "Media library access",
    "Practice scenarios",
  ];

  const subscriptionFeatures = [
    "Access to all current modules",
    "New modules as they release",
    "Priority expert support",
    "Certification included",
  ];

  const handleModuleUnlock = () => {
    if (moduleId) {
      unlockModule(moduleId);
      toast({
        title: "Module Unlocked!",
        description: "You now have full access to this module.",
      });
      onOpenChange(false);
    }
  };

  const handleAnnualUnlock = () => {
    unlockAnnual();
    toast({
      title: "Annual Subscription Activated!",
      description: "You now have access to all modules.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Unlock Full Access
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a subscription plan to access all module content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* This Module Only */}
          <div 
            className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer"
            onClick={handleModuleUnlock}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">This Module Only</h3>
                  <p className="text-sm text-muted-foreground">
                    One-time access to all content in this module
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">€400</div>
                <div className="text-sm text-muted-foreground">one-time</div>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {moduleFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary/60" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="w-full mt-4" variant="outline">
              Purchase Module - €400
            </Button>
          </div>

          {/* Annual Subscription */}
          <div 
            className="relative border border-primary/30 bg-primary/5 rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={handleAnnualUnlock}
          >
            <div className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
              Best Value
            </div>
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Annual Subscription</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlimited access to all modules
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">€1,000</div>
                <div className="text-sm text-muted-foreground">/year</div>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {subscriptionFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary/60" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="w-full mt-4">
              Subscribe - €1,000/year
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockAccessDialog;
