import { useState, useEffect, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SatoBootSequence } from "./SatoBootSequence";
import { SatoshiCopilot } from "./SatoshiCopilot";
import { JudgesTour } from "./JudgesTour";

export function AppShell({
  title,
  breadcrumb,
  children,
  aside,
}: {
  title: string;
  breadcrumb: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const [showSato, setShowSato] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if Sato boot sequence has run in this session
    const hasBooted = sessionStorage.getItem("satoshitrace-sato-booted");
    if (!hasBooted) {
      setShowSato(true);
      sessionStorage.setItem("satoshitrace-sato-booted", "true");
    }

    // Global custom event listeners for topbar / buttons
    const handleOpenSato = () => setShowSato(true);
    const handleOpenTour = () => setShowTour(true);

    window.addEventListener("satoshitrace-open-sato", handleOpenSato);
    window.addEventListener("satoshitrace-open-tour", handleOpenTour);

    return () => {
      window.removeEventListener("satoshitrace-open-sato", handleOpenSato);
      window.removeEventListener("satoshitrace-open-tour", handleOpenTour);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* SATO OS Forensic Kernel Diagnostic Boot */}
      {showSato && (
        <SatoBootSequence onComplete={() => setShowSato(false)} />
      )}

      {/* 2-Minute Winning Demo Tour Modal */}
      {showTour && (
        <JudgesTour onClose={() => setShowTour(false)} />
      )}

      {/* Main Command Center Layout */}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={title}
          breadcrumb={breadcrumb}
          onOpenSato={() => setShowSato(true)}
          onOpenTour={() => setShowTour(true)}
        />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
          {aside}
        </div>
        <footer className="mono-xs flex h-7 shrink-0 items-center justify-between border-t border-border bg-panel px-5 text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span>
              Built for Indian Law Enforcement (CBI/ED/State Cyber) • 100% Offline • IT Act 2000 Section 65B Certified
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">FPR: 3.2% GATE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-signal/90 font-medium">SATO AI COPILOT READY</span>
            <span className="text-muted-foreground">AIR-GAPPED // LOCALHOST</span>
          </div>
        </footer>
      </div>

      {/* Floating SATO AI Copilot Assistant */}
      <SatoshiCopilot />
    </div>
  );
}
