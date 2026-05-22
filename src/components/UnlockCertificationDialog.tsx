import { CreditCard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface UnlockCertificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleTitle: string;
  price: number;
  onConfirm: () => void;
}

const UnlockCertificationDialog = ({
  open,
  onOpenChange,
  moduleTitle,
  price,
  onConfirm,
}: UnlockCertificationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <DialogTitle className="text-xl">Unlock Certification</DialogTitle>
          </div>
          <DialogDescription>
            Pay a one-time fee to unlock the certification for this module.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Module Name */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Module:</p>
            <p className="font-semibold text-foreground">{moduleTitle}</p>
          </div>

          {/* Certification Fee */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Certification Fee</span>
            <span className="text-2xl font-bold text-primary">€{price}</span>
          </div>

          {/* Warning Notice */}
          <div className="border border-border rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This is a one-time payment. Each scenario can only be attempted once — no retries.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gap-2" onClick={onConfirm}>
            <CreditCard className="w-4 h-4" />
            Pay €{price} & Unlock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockCertificationDialog;
