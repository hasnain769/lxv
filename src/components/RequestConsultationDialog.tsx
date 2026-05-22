import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Expert {
  initials: string;
  name: string;
  title: string;
  pricePerSession: number;
}

interface RequestConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expert: Expert | null;
}

const RequestConsultationDialog = ({
  open,
  onOpenChange,
  expert,
}: RequestConsultationDialogProps) => {
  const [message, setMessage] = useState("");

  if (!expert) return null;

  const handleSubmit = () => {
    // Handle submission logic here
    console.log("Consultation request sent:", { expert: expert.name, message });
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Request Consultation</DialogTitle>
          <DialogDescription>
            Send a message to {expert.name} to schedule a consultation session.
          </DialogDescription>
        </DialogHeader>

        {/* Expert Info Card */}
        <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-4 my-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {expert.initials}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{expert.name}</h4>
              <p className="text-sm text-muted-foreground">{expert.title}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-foreground">
              ${expert.pricePerSession}
            </span>
            <span className="text-muted-foreground text-sm">/15 min</span>
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-base font-semibold">
            Your Message
          </Label>
          <Textarea
            id="message"
            placeholder="Describe what you need help with..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px] resize-y border-2 border-primary/20 focus:border-primary"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Send Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestConsultationDialog;
