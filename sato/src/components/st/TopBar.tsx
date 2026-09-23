import { useRef, useState, useEffect } from "react";
import { Bell, FileText, Search, Upload, Zap, Loader2, Award, Shield, Cpu } from "lucide-react";
import { toast } from "sonner";
import { simulateAttack, uploadSeizedLogs, getPdfReportUrl, getCachedCases } from "@/lib/api";

export function TopBar({
  title,
  breadcrumb,
  onOpenSato,
  onOpenTour,
  onOpenCommandPalette,
}: {
  title: string;
  breadcrumb: string;
  onOpenSato?: () => void;
  onOpenTour?: () => void;
  onOpenCommandPalette?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    const c = getCachedCases();
    return c && c.length > 0 ? c[0].id : "ACTIVE-LEAD";
  });

  useEffect(() => {
    const handleCaseUpdate = (e: any) => {
      if (e.detail?.job_id) {
        setActiveCaseId(`CASE-${e.detail.job_id.slice(4, 12).toUpperCase()}`);
      }
    };
    const handleRefresh = () => {
      const c = getCachedCases();
      if (c && c.length > 0) {
        setActiveCaseId(c[0].id);
      }
    };
    window.addEventListener("satoshitrace-case-updated", handleCaseUpdate);
    window.addEventListener("satoshitrace-refresh", handleRefresh);
    return () => {
      window.removeEventListener("satoshitrace-case-updated", handleCaseUpdate);
      window.removeEventListener("satoshitrace-refresh", handleRefresh);
    };
  }, []);

  const handleSimulate = async () => {
    try {
      setIsSimulating(true);
      const res = await simulateAttack();
      toast.error("⚡ Live Ransomware Infiltration Detected", {
        description: `Attack signature: ${res.attack_type} • LockBit suspect flagged in pulsing RED`,
      });
      window.dispatchEvent(new CustomEvent("satoshitrace-refresh"));
    } catch (err: any) {
      toast.error("Simulation failed", { description: err.message });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadSeizedLogs(file);
      toast.success("✅ Forensic Logs Ingested & Cryptographically Locked", {
        description: `${res.total_records.toLocaleString()} transactions parsed • SHA-256: ${res.sha256.slice(0, 16)}... • Sec 65B Certified`,
      });
      window.dispatchEvent(new CustomEvent("satoshitrace-refresh"));
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadPdf = () => {
    window.open(getPdfReportUrl("default", activeCaseId), "_blank");
    toast.info("📄 Generating Section 65B Forensic Evidence Dossier...", {
      description: "ReportLab engine compiling cryptographic SHA-256 chain of custody.",
    });
  };

  const triggerSato = () => {
    if (onOpenSato) {
      onOpenSato();
    } else {
      window.dispatchEvent(new CustomEvent("satoshitrace-open-sato"));
    }
  };

  const triggerTour = () => {
    if (onOpenTour) {
      onOpenTour();
    } else {
      window.dispatchEvent(new CustomEvent("satoshitrace-open-tour"));
    }
  };

  const triggerCmdK = () => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      window.dispatchEvent(new CustomEvent("satoshitrace-open-cmdk"));
    }
  };

  return (
    <header className="flex h-13 shrink-0 items-center justify-between border-b border-[#1C232E] bg-[#0D1117] px-4 font-mono select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.json,.xml"
      />

      {/* Left: View Title & Operational Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3] truncate">{title}</h1>
            <span className="rounded bg-[#1C232E] px-1.5 py-0.2 text-[9px] text-[#7D8590] border border-[#1C232E]">
              LOCAL-AIRGAP
            </span>
          </div>
          <p className="text-[10px] text-[#7D8590] truncate font-mono">{breadcrumb}</p>
        </div>
      </div>

      {/* Center: Command Palette Trigger Search Box */}
      <div className="flex items-center justify-center flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={triggerCmdK}
          className="group flex h-7.5 w-full items-center justify-between rounded border border-[#1C232E] bg-[#0A0E14] px-2.5 text-xs text-[#7D8590] hover:border-[#39FF88]/40 hover:text-[#E6EDF3] transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={12} className="text-[#7D8590] group-hover:text-[#39FF88] transition-colors" />
            <span className="text-[10.5px] truncate">Search wallet, TXID, IP, case…</span>
          </div>
          <kbd className="rounded border border-[#1C232E] bg-[#0D1117] px-1.5 py-0.5 text-[9px] font-mono text-[#7D8590]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Defense Health Badges & Tactical Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Air-Gap Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 rounded border border-[#1C232E] bg-[#0A0E14] px-2 py-1 text-[10px] text-[#7D8590]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-pulse shadow-[0_0_6px_#39FF88]" />
          <span className="text-[#39FF88] font-bold">100% AIR-GAPPED</span>
          <span className="text-[#1C232E]">|</span>
          <span className="text-[#7D8590] tabular-nums">127.0.0.1</span>
        </div>

        {/* Active Case Badge */}
        <div className="hidden md:flex items-center gap-1 rounded border border-[#1C232E] bg-[#0A0E14] px-2 py-1 text-[10px]">
          <span className="text-[#7D8590]">CASE:</span>
          <span className="font-bold text-[#E6EDF3]">{activeCaseId}</span>
        </div>

        {/* Examiner ID */}
        <div className="hidden xl:flex items-center gap-1 rounded border border-[#1C232E] bg-[#0A0E14] px-2 py-1 text-[10px]">
          <span className="text-[#7D8590]">EXAMINER:</span>
          <span className="font-bold text-[#39FF88]">#8412</span>
        </div>

        <span className="h-4 w-px bg-[#1C232E] mx-0.5" />

        {/* Kernel Diagnostic Boot */}
        <button
          onClick={triggerSato}
          className="flex items-center gap-1 rounded border border-[#1C232E] bg-[#0A0E14] px-2 py-1 text-[10.5px] text-[#7D8590] hover:text-[#39FF88] hover:border-[#39FF88]/40 active:scale-95 transition-all"
          title="Re-run SATO OS Forensic Kernel Diagnostic"
        >
          <Cpu size={12} className="text-[#39FF88]" />
          <span className="hidden sm:inline">KERNEL</span>
        </button>

        {/* 2-Min Demo Tour */}
        <button
          onClick={triggerTour}
          className="flex items-center gap-1 rounded border border-[#39FF88]/30 bg-[#39FF88]/10 px-2 py-1 text-[10.5px] font-semibold text-[#39FF88] hover:bg-[#39FF88]/20 active:scale-95 transition-all"
          title="Start 2-Minute Demo Tour"
        >
          <Award size={12} />
          <span className="hidden sm:inline">TOUR</span>
        </button>

        {/* Attack Simulation */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex items-center gap-1 rounded border border-[#1C232E] bg-[#0A0E14] px-2 py-1 text-[10.5px] text-[#7D8590] hover:text-[#FF9F1C] hover:border-[#FF9F1C]/40 active:scale-95 transition-all"
          title="Simulate Inbound Ransomware Attack"
        >
          {isSimulating ? <Loader2 size={12} className="animate-spin text-[#FF9F1C]" /> : <Zap size={12} className="text-[#FF9F1C]" />}
          <span className="hidden sm:inline">SIMULATE</span>
        </button>

        {/* Upload Logs */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1 rounded border border-[#1C232E] bg-[#0A0E14] px-2 py-1 text-[10.5px] text-[#7D8590] hover:text-[#E6EDF3] hover:border-[#39FF88]/40 active:scale-95 transition-all"
          title="Ingest Forensic Bitcoin Logs"
        >
          {isUploading ? <Loader2 size={12} className="animate-spin text-[#39FF88]" /> : <Upload size={12} />}
          <span className="hidden sm:inline">INGEST</span>
        </button>

        {/* Section 65B PDF */}
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-1 rounded border border-[#39FF88]/40 bg-[#39FF88]/15 px-2.5 py-1 text-[10.5px] font-bold text-[#39FF88] hover:bg-[#39FF88]/25 active:scale-95 transition-all"
          title="Export Section 65B Forensic Evidence Dossier"
        >
          <FileText size={12} />
          <span>SEC 65B</span>
        </button>
      </div>
    </header>
  );
}
