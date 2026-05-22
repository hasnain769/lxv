import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function TermsOfConditions() {
  const { getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!accepted) {
      toast.error("You must accept the terms before continuing.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiUrl}/auth/accept-toc`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept TOC");
      }

      toast.success("Terms accepted successfully!");
      // Redirect to home. User will need to re-login to refresh token claims
      // Or we can silently fetch a new token if Auth0 is configured for it
      // For now, we redirect to home.
      navigate("/");
      window.location.reload(); // Quick refresh to clear old token claims
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while accepting terms.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Welcome to the Early Access program for the Legal Training Platform. As an early tester, you must agree to our confidentiality and beta testing terms.
        </p>
        
        <div className="mb-6 rounded-md border bg-muted p-4 h-64 overflow-y-auto text-sm">
          <p className="mb-2"><strong>1. Confidentiality</strong></p>
          <p className="mb-4">All scenarios, AI interactions, and features are strictly confidential and must not be shared outside of this testing environment.</p>
          <p className="mb-2"><strong>2. Feedback</strong></p>
          <p className="mb-4">By participating, you agree to provide honest feedback regarding your experience with the platform.</p>
          <p className="mb-2"><strong>3. Data Usage</strong></p>
          <p>Your interactions will be logged and analyzed to improve the AI models and system infrastructure.</p>
        </div>

        <div className="mb-8 flex items-center space-x-3">
          <Checkbox 
            id="terms" 
            checked={accepted} 
            onCheckedChange={(checked) => setAccepted(checked as boolean)} 
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read and agree to the Terms & Conditions
          </label>
        </div>

        <Button 
          className="w-full" 
          onClick={handleAccept} 
          disabled={!accepted || submitting}
        >
          {submitting ? "Processing..." : "Accept and Continue"}
        </Button>
      </div>
    </div>
  );
}
