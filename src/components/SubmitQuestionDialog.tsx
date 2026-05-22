import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Coins } from "lucide-react";

interface SubmitQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubmitQuestionDialog = ({ open, onOpenChange }: SubmitQuestionDialogProps) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const availableCredits = 10;

  const handleSubmit = () => {
    if (!question.trim()) return;
    // Handle submit logic here
    console.log("Submitting question:", question);
    setQuestion("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Submit a Question</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ask content questions about the course material. Our instructors will respond to your inquiry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Available Credits */}
          <div className="flex items-center justify-between bg-secondary/50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Available Credits</span>
            </div>
            <span className="text-xl font-bold text-foreground">{availableCredits}</span>
          </div>

          {/* Question Input */}
          <div className="space-y-2">
            <label className="font-medium text-foreground">Your Question</label>
            <Textarea
              placeholder="Type your question about the course material here..."
              className="min-h-[180px] resize-none border-primary/30 focus:border-primary"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This will cost 1 credit to submit.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => {
                onOpenChange(false);
                navigate("/settings");
              }}
            >
              <Coins className="w-4 h-4" />
              Recharge Credits
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={!question.trim()}
            >
              Submit Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitQuestionDialog;
