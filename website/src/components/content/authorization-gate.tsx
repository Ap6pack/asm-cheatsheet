"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { usePreferencesStore, useHydration } from "@/lib/stores";

interface AuthorizationGateProps {
  children: React.ReactNode;
}

export function AuthorizationGate({ children }: AuthorizationGateProps) {
  const hydrated = useHydration();
  const { hasAcknowledgedDisclaimer, acknowledgeDisclaimer } = usePreferencesStore();
  const [showDialog, setShowDialog] = React.useState(false);

  React.useEffect(() => {
    if (hydrated && !hasAcknowledgedDisclaimer) {
      setShowDialog(true);
    }
  }, [hydrated, hasAcknowledgedDisclaimer]);

  const handleAccept = () => {
    acknowledgeDisclaimer();
    setShowDialog(false);
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={(open) => {
        // Don't allow closing without acknowledging
        if (!open && !hasAcknowledgedDisclaimer) return;
        setShowDialog(open);
      }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <DialogTitle>Authorization Required</DialogTitle>
            </div>
            <DialogDescription asChild>
              <div className="text-left pt-2 space-y-3 text-sm text-[var(--muted-foreground)]">
                <p>
                  The tools and techniques described in this resource are intended for
                  <strong> authorized security testing only</strong>.
                </p>
                <p>
                  Before using any commands or workflows, ensure you have:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Written authorization from the asset owner</li>
                  <li>A clearly defined scope of testing</li>
                  <li>Appropriate legal agreements in place</li>
                  <li>Understanding of applicable laws and regulations</li>
                </ul>
                <p className="text-sm font-medium">
                  Unauthorized access to computer systems is illegal and unethical.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={handleAccept} className="w-full sm:w-auto">
              <ShieldCheck className="mr-2 h-4 w-4" />
              I Understand &amp; Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
}
