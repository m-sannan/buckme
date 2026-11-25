import { useEffect, useMemo, useState } from "react";
import { decodeQrFromBlob, qrDataUrl } from "@/lib/decode-qr";
import { trackEvent } from "@/lib/stats";
import { useBuckMeStore } from "@/lib/store";
import { parseAmount, parseUpi, type UpiPayload } from "@/lib/upi";
import { buildPaySearch } from "@/lib/upi-apps";
import { MyQrSheetView } from "./MyQrSheetView";
import { QrScannerSheet } from "./QrScannerSheet";

export function MyQrSheet({ onClose }: { onClose: () => void }) {
  const { profile, setProfile } = useBuckMeStore();
  const [vpa, setVpa] = useState(profile.vpa);
  const [name, setName] = useState(profile.name);
  const [defaultAmount, setDefaultAmount] = useState(profile.defaultAmount);
  const [defaultNote, setDefaultNote] = useState(profile.defaultNote);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const validVpa = useMemo(() => {
    if (!vpa.trim()) return false;
    return parseUpi(vpa.trim()).ok;
  }, [vpa]);

  const shareUrl = useMemo(() => {
    if (!validVpa) return "";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://buckme.app";
    const qs = buildPaySearch({
      vpa: vpa.trim(),
      name: name.trim() || "BuckMe User",
      amount: parseAmount(defaultAmount),
      note: defaultNote.trim(),
    });
    return `${origin}/pay?${qs}`;
  }, [validVpa, vpa, name, defaultAmount, defaultNote]);

  useEffect(() => {
    if (!shareUrl) {
      setQrUrl(null);
      return;
    }
    let cancelled = false;
    void qrDataUrl(shareUrl, { dark: "#4C1D95", light: "#ffffff" }).then((url) => {
      if (!cancelled) setQrUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  useEffect(() => {
    const check = parseUpi(vpa.trim());
    if (!check.ok) return;
    setProfile({
      vpa: check.payload.vpa,
      name: name.trim() || check.payload.name,
      defaultAmount: defaultAmount.trim(),
      defaultNote: defaultNote.trim(),
    });
  }, [vpa, name, defaultAmount, defaultNote, setProfile]);

  const copyTextWithFallback = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fallback below */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) return true;
    } catch {
      /* fallback below */
    }
    return false;
  };

  const handleCopy = async () => {
    if (!shareUrl) {
      setScanError("Scan, upload, or enter a valid UPI ID first.");
      return;
    }
    setScanError(null);
    const ok = await copyTextWithFallback(shareUrl);
    if (!ok) {
      window.prompt("Copy your BuckMe link:", shareUrl);
    }
    setCopied(true);
    void trackEvent("qr_shared");
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    if (!shareUrl) {
      setScanError("Scan, upload, or enter a valid UPI ID first.");
      return;
    }
    setScanError(null);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Buck ${name || "me"} on BuckMe`,
          text: "Send me a Buck via UPI on BuckMe:",
          url: shareUrl,
        });
        void trackEvent("qr_shared");
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        /* fallback to copy */
      }
    }
    await handleCopy();
  };

  const applyParsedPayload = (payload: UpiPayload) => {
    setVpa(payload.vpa);
    setName(payload.name);
    if (payload.amount) setDefaultAmount(String(payload.amount));
    if (payload.note) setDefaultNote(payload.note);
    setScanError(null);
  };

  const handleUploadQr = async (file: File) => {
    try {
      const raw = await decodeQrFromBlob(file);
      if (!raw) {
        setScanError("No QR found in that image. Try a tighter crop.");
        return;
      }
      const res = parseUpi(raw);
      if (!res.ok) {
        setScanError(res.error);
        return;
      }
      applyParsedPayload(res.payload);
    } catch {
      setScanError("Could not read that image. Try another screenshot.");
    }
  };

  const handleDownload = async () => {
    if (!qrUrl) return;
    let downloadHref = qrUrl;
    try {
      const img = new Image();
      img.src = qrUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("qr load failed"));
      });
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 920;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 720, 920);
        grad.addColorStop(0, "#5B21B6");
        grad.addColorStop(0.55, "#7C3AED");
        grad.addColorStop(1, "#9333EA");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 720, 920);

        // Diagonal "b" watermark pattern matching the live card
        ctx.save();
        ctx.translate(360, 460);
        ctx.rotate((-22 * Math.PI) / 180);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.font = "700 44px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let y = -700; y <= 700; y += 96) {
          for (let x = -700; x <= 700; x += 96) {
            ctx.fillText("b", x, y);
          }
        }
        ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "700 34px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("buckme", 360, 88);

        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.font = "600 20px system-ui, sans-serif";
        ctx.fillText("SCAN TO BUCK", 360, 126);

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(140, 168, 440, 440, 32);
        ctx.fill();
        ctx.drawImage(img, 172, 200, 376, 376);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 36px system-ui, sans-serif";
        ctx.fillText(name.trim() || "BuckMe User", 360, 680);

        ctx.fillStyle = "rgba(255,255,255,0.82)";
        ctx.font = "500 24px system-ui, sans-serif";
        ctx.fillText(vpa.trim(), 360, 722);

        const parsedAmt = parseAmount(defaultAmount);
        const subline = [
          parsedAmt ? `₹${parsedAmt}` : "",
          defaultNote.trim(),
        ]
          .filter(Boolean)
          .join(" • ");
        if (subline) {
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.font = "600 24px system-ui, sans-serif";
          ctx.fillText(subline, 360, 774);
        }

        downloadHref = canvas.toDataURL("image/png");
      }
    } catch {
      /* fallback to raw qrUrl */
    }
    const a = document.createElement("a");
    a.href = downloadHref;
    a.download = `buckme-qr-${(name || "pay").toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    void trackEvent("qr_shared");
  };

  const qrPreview = qrUrl ? (
    <img src={qrUrl} alt="BuckMe QR Code" className="h-44 w-44" />
  ) : (
    <div className="flex h-44 w-44 items-center justify-center p-4 text-center text-xs text-gray-500">
      Scan or upload your UPI QR above to generate your BuckMe card
    </div>
  );

  return (
    <>
      <MyQrSheetView
        vpa={vpa}
        name={name}
        amount={defaultAmount}
        note={defaultNote}
        qrPreview={qrPreview}
        copied={copied}
        scanError={scanError}
        onVpaChange={setVpa}
        onNameChange={setName}
        onAmountChange={setDefaultAmount}
        onNoteChange={setDefaultNote}
        onOpenScanner={() => setScannerOpen(true)}
        onUploadQr={(file) => void handleUploadQr(file)}
        onCopy={() => void handleCopy()}
        onShare={() => void handleShare()}
        onSave={() => void handleDownload()}
        onClose={onClose}
      />

      {scannerOpen && (
        <QrScannerSheet
          onClose={() => setScannerOpen(false)}
          onParsed={(payload) => {
            applyParsedPayload(payload);
            setScannerOpen(false);
          }}
        />
      )}
    </>
  );
}
