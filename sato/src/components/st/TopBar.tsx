import { useRef, useState } from "react";
import { Bell, FileText, Search, Upload, Zap, Loader2, Award, Shield, Cpu } from "lucide-react";
import { toast } from "sonner";
import { simulateAttack, uploadSeizedLogs, getPdfReportUrl } from "@/lib/api";

export function TopBar({
  title,
  breadcrumb,
  onOpenSato,
  onOpenTour,
}: {
  title: string;
  breadcrumb: string;
  onOpenSato?: () => void;
  onOpenTour?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    window.open(getPdfReportUrl("default", "CASE-2026-CBI-0891"), "_blank");
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

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-4 border-b border-border bg-panel/70 px-5 backdrop-blur font-mono">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.json,.xml"
      />

      <div className="w-[220px] shrink-0">
        <h1 className="text-[14px] font-bold tracking-wide text-foreground">{title}</h1>
        <p className="mono-xs mt-0.5 text-muted-foreground truncate text-[10.5px]">{breadcrumb}</p>
      </div>

      <div className="flex flex-1 justify-center">
        <div className="group relative w-[360px] max-w-full">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            placeholder="Search wallet, TXID, IP, country, ASN..."
            className="h-8.5 w-full rounded-full border border-input bg-background/70 pl-9 pr-12 text-[11.5px] text-foreground outline-none transition-all duration-150 placeholder:text-muted-foreground focus:border-signal/60 focus:shadow-[var(--glow-signal)]"
          />
          <span className="mono-xs absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-muted-foreground text-[9.5px]">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* SATO OS Kernel Diagnostic Trigger */}
        <button
          onClick={triggerSato}
          className="lift flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:border-signal/50 hover:text-signal hover:bg-signal/10 active:scale-95 transition-all"
          title="Re-run SATO OS Forensic Kernel Diagnostic"
        >
          <Cpu size={13} className="text-signal" />
          <span>SATO OS</span>
        </button>

        {/* 2-Min Demo Tour Trigger */}
        <button
          onClick={triggerTour}
          className="lift flex items-center gap-1.5 rounded-md border border-signal/40 bg-signal/10 px-2.5 py-1.5 text-[11px] font-semibold text-signal hover:bg-signal/20 active:scale-95 transition-all"
          title="Start 2-Minute SIH Winning Demo Tour"
        >
          <Award size={13} />
          <span>Demo Tour</span>
        </button>

        {/* Attack Simulation */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="lift flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:border-signal/70 hover:shadow-[var(--glow-signal)] active:scale-95 transition-all"
        >
          {isSimulating ? <Loader2 size={13} className="animate-spin text-signal" /> : <Zap size={13} className="text-signal" />}
          <span>Simulate</span>
        </button>

        {/* Upload Logs */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="lift animate-breathe flex items-center gap-1.5 rounded-md bg-[image:var(--gradient-signal)] px-3 py-1.5 text-[11px] font-semibold text-primary-foreground active:scale-95 transition-all"
        >
          {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          <span>Upload</span>
        </button>

        {/* Section 65B PDF */}
        <button
          onClick={handleDownloadPdf}
          className="lift flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
        >
          <FileText size={13} />
          <span>Sec 65B</span>
        </button>

        {/* LEA Agency Badge */}
        <div className="grid h-8 w-8 place-items-center rounded-full border border-signal/40 bg-panel-2 font-mono text-[10.5px] font-bold tracking-wide text-signal">
          CBI
        </div>
      </div>
    </header>
  );
}
