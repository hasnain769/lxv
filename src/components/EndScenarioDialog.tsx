import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

interface EndScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  scenarioId: string;
  chatId: string;
}

const EndScenarioDialog = ({
  open,
  onOpenChange,
  moduleId,
  scenarioId,
  chatId,
}: EndScenarioDialogProps) => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [loadingText, setLoadingText] = useState("Analyzing your responses...");

  useEffect(() => {
    if (!open) return;

    const texts = [
      "Analyzing your responses...",
      "Evaluating legal accuracy...",
      "Assessing negotiation strategy...",
      "Calculating your score...",
      "Generating feedback...",
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 800);

    let mounted = true;
    
    const transitionAndNavigate = async () => {
      try {
        const token = await getAccessTokenSilently();
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
        
        // This will transition the chat to ENDED and trigger professor scoring
        await fetch(`${apiUrl}/chats/${chatId}/transition`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (mounted) {
          onOpenChange(false);
          navigate(`/library/${moduleId}/scenario/${scenarioId}/evaluation?chatId=${chatId}`);
        }
      } catch (err) {
        console.error("Failed to transition chat to ENDED", err);
      }
    };

    transitionAndNavigate();

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [open, navigate, moduleId, scenarioId, chatId, onOpenChange, getAccessTokenSilently]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Evaluating Performance
          </h3>
          <p className="text-muted-foreground text-center animate-pulse">
            {loadingText}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EndScenarioDialog;
