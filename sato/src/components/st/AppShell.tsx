import { useState, useEffect, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SatoBootSequence } from "./SatoBootSequence";
import { SatoshiCopilot } from "./SatoshiCopilot";
import { JudgesTour } from "./JudgesTour";
import { CommandPalette } from "./CommandPalette";

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
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    // Check if Sato boot sequence has run in this session
    const hasBooted = sessionStorage.getItem("satoshitrace-sato-booted");
    if (!hasBooted) {
      setShowSato(true);
      sessionStorage.setItem("satoshitrace-sato-booted", "true");
    }

    // Global custom event listeners
    const handleOpenSato = () => setShowSato(true);
    const handleOpenTour = () => setShowTour(true);
    const handleOpenCmdK = () => setShowCommandPalette(true);

    window.addEventListener("satoshitrace-open-sato", handleOpenSato);
    window.addEventListener("satoshitrace-open-tour", handleOpenTour);
    window.addEventListener("satoshitrace-open-cmdk", handleOpenCmdK);

    // Global Cmd+K / Ctrl+K keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("satoshitrace-open-sato", handleOpenSato);
      window.removeEventListener("satoshitrace-open-tour", handleOpenTour);
      window.removeEventListener("satoshitrace-open-cmdk", handleOpenCmdK);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0E14] text-[#E6EDF3]">
      {/* SATO OS Forensic Kernel Diagnostic Boot (Full Screen Overlay) */}
      {showSato && (
        <div className="fixed inset-0 z-[9999] w-screen h-screen overflow-hidden bg-[#0A0E14]">
          <SatoBootSequence onComplete={() => setShowSato(false)} />
        </div>
      )}

      {/* 2-Minute Winning Demo Tour Modal */}
      {showTour && (
        <JudgesTour onClose={() => setShowTour(false)} />
      )}

      {/* Global Terminal Command Palette (⌘K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />

      {/* Main Command Center Layout */}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={title}
          breadcrumb={breadcrumb}
          onOpenSato={() => setShowSato(true)}
          onOpenTour={() => setShowTour(true)}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />
        <div className="flex min-h-0 flex-1 bg-[#0A0E14]">
          <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
          {aside}
        </div>
        <footer className="font-mono flex h-6.5 shrink-0 items-center justify-between border-t border-[#1C232E] bg-[#0D1117] px-4 text-[10px] text-[#7D8590] select-none">
          <div className="flex items-center gap-3">
            <span className="text-[#7D8590]">
              CLASSIFIED // LAW ENFORCEMENT FORENSICS (CBI/ED/FIU) • 100% AIR-GAPPED • IT ACT 2000 SEC 65B
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88]" />
            <span className="text-[#39FF88] font-bold">CONSENSUS GATE: FPR &lt; 3.2%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#7D8590]">CRYPTO PROOF: <span className="text-[#E6EDF3] font-bold">SHA-256 SEALED</span></span>
            <span className="text-[#1C232E]">|</span>
            <span className="text-[#39FF88] font-semibold">127.0.0.1:8000 LOCALHOST</span>
          </div>
        </footer>
      </div>

      {/* Floating SATO AI Copilot Assistant */}
      <SatoshiCopilot />
    </div>
  );
}
