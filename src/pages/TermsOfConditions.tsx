import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { FileText, ShieldAlert, Lock, AlertTriangle } from "lucide-react";

export default function TermsOfConditions() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedConfidentiality, setAcceptedConfidentiality] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const handleAccept = async () => {
    if (!acceptedTerms || !acceptedConfidentiality) {
      toast.error("You must accept all terms before continuing.");
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
      navigate("/");
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while accepting terms.");
      setSubmitting(false);
    }
  };

  const termsContent = (
    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
      <div className="bg-muted p-4 rounded-lg mb-6 text-xs text-muted-foreground">
        <p><strong>Version:</strong> 1.01</p>
        <p><strong>Date:</strong> 21 May 2026</p>
        <p><strong>Company:</strong> LXplorer S.à r.l.-S, Avenue de la Faiencerie 46, 1510 Luxembourg, RCS number: B304830</p>
        <p><strong>Product:</strong> LXSkills & LXVerse</p>
        <p><strong>Contact:</strong> info@lxplorer.com</p>
      </div>

      <h3 className="text-base font-semibold mt-4 mb-2">1. Purpose of the Early Access</h3>
      <p>We are giving you access to a confidential early access demo version of our AI-driven legal simulation platform.</p>
      <p>You may use the demo version only to test it and provide feedback to us.</p>
      <p>You may not use the demo for any commercial purpose, public presentation, publication, teaching, training, benchmarking, or to develop a competing product.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">2. Confidentiality</h3>
      <p>The demo is confidential.</p>
      <p>You agree to keep confidential everything you see, receive, or generate through the demo.</p>
      <p>This includes in particular:</p>
      <ul className="list-disc pl-5 my-2 space-y-1">
        <li>the platform and its design;</li>
        <li>the simulation scenarios;</li>
        <li>the legal documents and templates;</li>
        <li>the AI conversations and outputs;</li>
        <li>the scoring, evaluation, feedback, and learning logic;</li>
        <li>the prompts, agent behaviour, workflows, and product ideas;</li>
        <li>any business, technical, or product information shared with you.</li>
      </ul>
      <p>You may not disclose, share, publish, describe, summarise, or make available any part of the demo to anyone else without our prior written permission.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">3. No Screenshots, Recordings, or Sharing</h3>
      <p>Unless we expressly allow it in writing, you may not:</p>
      <ul className="list-disc pl-5 my-2 space-y-1">
        <li>take screenshots;</li>
        <li>make screen recordings;</li>
        <li>take photos or videos of the demo;</li>
        <li>copy or download demo content;</li>
        <li>post about the demo on social media;</li>
        <li>discuss the demo in public or private groups;</li>
        <li>show the demo to colleagues, friends, clients, students, investors, or other third parties.</li>
      </ul>
      <p>Screenshots may only be used if we ask you to send them for bug-reporting or feedback purposes.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">4. No External AI Uploads</h3>
      <p>You may not upload, paste, copy, or transmit any part of the demo into external AI tools or similar services.</p>
      <p>This includes tools such as ChatGPT, Claude, Gemini, Perplexity, Copilot, translation tools, transcription tools, document-analysis tools, or any other AI system.</p>
      <p>This applies to demo content, screenshots, prompts, scenarios, AI outputs, legal documents, feedback, scores, and evaluations.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">5. No Copying, Reverse Engineering, or Competitive Use</h3>
      <p>You may not:</p>
      <ul className="list-disc pl-5 my-2 space-y-1">
        <li>copy, reproduce, or adapt the demo;</li>
        <li>reverse engineer the demo;</li>
        <li>try to discover the prompts, system instructions, workflows, scoring logic, or technical setup;</li>
        <li>scrape or extract data from the demo;</li>
        <li>use the demo to train or improve another AI system;</li>
        <li>use the demo or anything learned from it to build, support, finance, advise on, or improve a competing product or service.</li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">6. Your Feedback</h3>
      <p>You may provide feedback, suggestions, bug reports, comments, and ideas.</p>
      <p>We may freely use this feedback to improve, develop, and commercialise our product.</p>
      <p>You will not receive any ownership rights, payment, or other rights because of feedback you provide, unless we separately agree otherwise in writing.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">7. Intellectual Property</h3>
      <p>The demo and all related rights remain our property.</p>
      <p>This includes the software, scenarios, prompts, AI-agent setup, workflows, legal content, documents, scoring systems, designs, trademarks, business ideas, and technical know-how.</p>
      <p>You receive only a limited right to access and test the demo. No other rights are granted.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">8. AI Outputs and No Legal Advice</h3>
      <p>The demo uses artificial intelligence.</p>
      <p>The demo is provided only for educational, simulation, testing, and product-development purposes.</p>
      <p>It does not provide legal advice. No lawyer-client relationship is created.</p>
      <p>You must not rely on demo outputs for real legal, business, financial, regulatory, or compliance decisions.</p>
      <p>AI outputs may be inaccurate, incomplete, inconsistent, or misleading.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">9. Data, Logging, and Monitoring</h3>
      <p>We may monitor, record, log, store, and analyse your use of the demo.</p>
      <p>This may include your inputs, AI outputs, interactions, scores, feedback, bug reports, technical data, and usage patterns.</p>
      <p>We use this information to test, secure, improve, and develop the demo and our product.</p>
      <p>Where this information contains personal data, we will process it in accordance with applicable data protection law and our privacy notice.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">10. Your Inputs</h3>
      <p>Please do not enter real client data, confidential third-party information, privileged information, personal data of third parties, or sensitive information into the demo unless we have expressly agreed otherwise.</p>
      <p>You are responsible for anything you enter into the demo.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">11. Access and Security</h3>
      <p>Your demo access is personal.</p>
      <p>You may not share your login, password, access link, or other credentials with anyone else.</p>
      <p>You must notify us immediately if you think your access has been misused, lost, shared, or compromised.</p>
      <p>We may suspend or terminate your access at any time.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">12. Early Access Provided “As Is”</h3>
      <p>The demo is an early, experimental version.</p>
      <p>It may contain errors, interruptions, missing features, inaccurate outputs, or other problems.</p>
      <p>We provide the demo “as is” and “as available”.</p>
      <p>We do not promise that the demo will be correct, complete, available, secure, uninterrupted, or suitable for any particular purpose.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">13. Liability</h3>
      <p>To the maximum extent permitted by law, we are not liable for indirect damages, loss of profits, loss of business, loss of data, reputational harm, or similar losses arising from your use of the demo.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">14. End of Access</h3>
      <p>The confidentiality obligations continue after your access ends.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">15. Duration of Confidentiality</h3>
      <p>You must keep the demo and all confidential information confidential for three years after your last access to the demo.</p>
      <p>For trade secrets, the confidentiality obligation continues for as long as the information remains protected as a trade secret.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">16. Governing Law and Courts</h3>
      <p>These Terms are governed by Luxembourg law.</p>
      <p>The courts of Luxembourg City shall have exclusive jurisdiction.</p>

      <h3 className="text-base font-semibold mt-6 mb-2">17. Contact</h3>
      <p>Questions or notices concerning these Terms should be sent to:</p>
      <p>Email: <a href="mailto:info@lxplorer.com" className="text-primary hover:underline">info@lxplorer.com</a></p>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-muted/30">
      <div className="hidden md:flex w-1/3 bg-slate-950 text-white flex-col p-10 justify-between relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <ShieldAlert className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold tracking-tight">LXVerse</span>
          </div>
          <h2 className="text-3xl font-bold mb-6 leading-tight">Secure Early Access Environment</h2>
          <p className="text-slate-400 text-lg">
            This platform contains proprietary simulation logic and confidential scenarios. Your access is restricted and monitored.
          </p>
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-slate-300 bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <Lock className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">End-to-End Auditable Activity</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Strict No-Sharing Policy Active</span>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Terms & Conditions</h1>
            <p className="text-muted-foreground">
              Please review and accept our confidentiality requirements before accessing the platform.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms} 
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} 
                className="mt-1 w-5 h-5"
              />
              <div className="grid gap-1.5 leading-none flex-1">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium cursor-pointer"
                >
                  I agree to the{" "}
                  <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
                    <DialogTrigger asChild>
                      <span className="text-primary hover:underline font-semibold" onClick={(e) => {
                        e.preventDefault();
                        setTermsOpen(true);
                      }}>
                        Demo Access & Confidentiality Terms
                      </span>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
                      <DialogHeader className="px-6 py-4 border-b border-border bg-slate-50 dark:bg-slate-900/50">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Early Access & Confidentiality Terms
                        </DialogTitle>
                        <DialogDescription>
                          Please read these terms carefully before proceeding.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="flex-1 overflow-y-auto p-6 bg-background">
                        {termsContent}
                      </div>

                      <DialogFooter className="px-6 py-4 border-t border-border bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                        <Button variant="default" onClick={() => {
                          setTermsOpen(false);
                          setAcceptedTerms(true);
                        }}>
                          I have read the terms
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>.
                </label>
                <p className="text-sm text-muted-foreground leading-snug mt-1">
                  You must read and agree to all the terms outlined in the document.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
              <Checkbox 
                id="confidentiality" 
                checked={acceptedConfidentiality} 
                onCheckedChange={(checked) => setAcceptedConfidentiality(checked as boolean)} 
                className="mt-1 w-5 h-5"
              />
              <div className="grid gap-1.5 leading-none flex-1">
                <label
                  htmlFor="confidentiality"
                  className="text-sm font-medium leading-snug cursor-pointer"
                >
                  I understand that the demo is confidential and may not be shared, copied, recorded, screenshotted, reverse engineered, or uploaded to external AI tools.
                </label>
              </div>
            </div>
          </div>

          <Button 
            size="lg"
            className="w-full text-base h-12 shadow-md" 
            onClick={handleAccept} 
            disabled={!acceptedTerms || !acceptedConfidentiality || submitting}
          >
            {submitting ? "Processing Access..." : "Accept and Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
