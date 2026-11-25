import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, Share2, X } from "lucide-react";
import { qrDataUrl } from "@/lib/decode-qr";
import { trackEvent } from "@/lib/stats";
import { useBuckMeStore } from "@/lib/store";
import { parseAmount, parseUpi } from "@/lib/upi";
import { buildPaySearch } from "@/lib/upi-apps";

export function MyQrSheet({ onClose }: { onClose: () => void }) {
  const { profile, setProfile } = useBuckMeStore();
  const [vpa, setVpa] = useState(profile.vpa);
  const [name, setName] = useState(profile.name);
  const [defaultAmount, setDefaultAmount] = useState(profile.defaultAmount);
  const [defaultNote, setDefaultNote] = useState(profile.defaultNote);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [vpaError, setVpaError] = useState<string | null>(null);

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

  const handleSave = () => {
    const check = parseUpi(vpa.trim());
    if (!check.ok) {
      setVpaError(check.error);
      return;
    }
    setVpaError(null);
    setProfile({
      vpa: check.payload.vpa,
      name: name.trim() || check.payload.name,
      defaultAmount: defaultAmount.trim(),
      defaultNote: defaultNote.trim(),
    });
    void trackEvent("qr_created");
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    void trackEvent("qr_shared");
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    void trackEvent("qr_shared");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buck ${name || "me"} on BuckMe`,
          text: `Send me a Buck via UPI on BuckMe:`,
          url: shareUrl,
        });
        return;
      } catch {
        /* fallback to copy */
      }
    }
    await handleCopy();
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `buckme-qr-${name || "pay"}.png`;
    a.click();
    void trackEvent("qr_shared");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#F8F7FC] p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#5B21B6]">My BuckMe QR</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close My BuckMe QR"
            className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Setup fields */}
        <div className="mt-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-gray-600">Your UPI ID *</label>
              <input
                type="text"
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                onBlur={handleSave}
                placeholder="you@okaxis"
                className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                placeholder="Jason / Lucia"
                className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#6D28D9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-gray-600">Default ₹ (opt)</label>
              <input
                type="number"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
                onBlur={handleSave}
                placeholder="Any amount"
                className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600">Note (opt)</label>
              <input
                type="text"
                value={defaultNote}
                onChange={(e) => setDefaultNote(e.target.value)}
                onBlur={handleSave}
                placeholder="For Leonida bail"
                className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#6D28D9]"
              />
            </div>
          </div>
          {vpaError && <p className="text-xs font-medium text-red-600">{vpaError}</p>}
        </div>

        {/* BuckMe QR Card */}
        {qrUrl ? (
          <div className="buckme-gradient buckme-pattern mt-4 flex flex-col items-center rounded-3xl p-5 text-white shadow-lg">
            <div className="flex w-full items-center justify-between">
              <span className="text-base font-extrabold">buckme</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold">
                SCAN TO BUCK
              </span>
            </div>
            <div className="mt-3 rounded-2xl bg-white p-3 shadow-md">
              <img src={qrUrl} alt="BuckMe QR Code" className="h-44 w-44" />
            </div>
            <p className="mt-3 text-sm font-extrabold">{name || "BuckMe User"}</p>
            <p className="text-[11px] text-purple-200">{vpa}</p>
            <p className="mt-1 text-[10px] text-purple-100/80">
              Opens your BuckMe Pay page (not raw UPI)
            </p>

            <div className="mt-4 grid w-full grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-white px-2 py-2 text-xs font-bold text-[#5B21B6]"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleShare()}
                className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-white/20 px-2 py-2 text-xs font-bold text-white"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-white/20 px-2 py-2 text-xs font-bold text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-purple-300 bg-white p-6 text-center text-xs text-gray-500">
            Enter a valid UPI ID above (e.g. <code>yourname@okaxis</code>) to generate your BuckMe QR.
          </div>
        )}
      </div>
    </div>
  );
}
