import React, { useState } from 'react';
import { X, Copy, Share2, Download, ScanLine, Upload, ChevronDown } from 'lucide-react';
import { BuckMeLogo } from './BuckMeLogo';

interface MyQrSheetProps {
  vpa: string;
  name: string;
  amount: string;
  note: string;
  qrPreview: React.ReactNode;
  copied: boolean;
  scanError: string | null;
  onVpaChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onOpenScanner: () => void;
  onUploadQr: (file: File) => void;
  onCopy: () => void;
  onShare: () => void;
  onSave: () => void;
  onClose: () => void;
}

export const MyQrSheetView: React.FC<MyQrSheetProps> = ({
  vpa,
  name,
  amount,
  note,
  qrPreview,
  copied,
  scanError,
  onVpaChange,
  onNameChange,
  onAmountChange,
  onNoteChange,
  onOpenScanner,
  onUploadQr,
  onCopy,
  onShare,
  onSave,
  onClose,
}) => {
  const [showManual, setShowManual] = useState(!vpa);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadQr(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#F8F7FC] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#5B21B6]">My BuckMe QR</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5B21B6] shadow-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1-tap Scan or Upload existing UPI QR */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenScanner}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#5B21B6] px-3 text-xs font-semibold text-white shadow-sm active:scale-[0.98]"
          >
            <ScanLine className="h-4 w-4" />
            Scan My UPI QR
          </button>
          <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#E9D5FF] bg-white px-3 text-xs font-semibold text-[#5B21B6] active:scale-[0.98]">
            <Upload className="h-4 w-4" />
            Upload QR Image
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {scanError && (
          <p className="mt-2 text-center text-xs font-medium text-red-600">{scanError}</p>
        )}

        {/* QR Card preview */}
        <div className="relative mt-4 overflow-hidden rounded-3xl shadow-md">
          <div
            className="relative overflow-hidden rounded-3xl p-5 text-white"
            style={{
              background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 55%, #9333EA 100%)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="myqr-watermark" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(-22)">
                    <text x="2" y="38" fontSize="26" fontWeight="700" fill="#FFFFFF" fontFamily="system-ui, sans-serif">b</text>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#myqr-watermark)" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BuckMeLogo className="h-5 w-5" color="#FFFFFF" />
                  <span className="text-xs font-semibold tracking-tight">buckme</span>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
                  Scan to Buck
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-3">
                {qrPreview}
              </div>

              <div className="mt-3 text-center">
                <div className="font-semibold">{name || 'Your Name'}</div>
                <div className="text-xs text-white/75">{vpa || 'Scan your UPI QR above'}</div>
                {(amount || note) && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-medium text-white/95">
                    {amount ? `₹${amount}` : ''}
                    {amount && note ? '•' : ''}
                    {note}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Optional Amount & Note before sharing */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#5B21B6]/70">Amount (₹ optional)</label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="min-h-[44px] w-full rounded-2xl border border-[#E9D5FF] bg-white px-4 text-sm tabular-nums outline-none focus:border-[#7C3AED]"
              placeholder="Any amount"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#5B21B6]/70">Note / Keyword</label>
            <input
              type="text"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="min-h-[44px] w-full rounded-2xl border border-[#E9D5FF] bg-white px-4 text-sm outline-none focus:border-[#7C3AED]"
              placeholder="Dinner split"
            />
          </div>
        </div>

        {/* Collapsible manual UPI ID / Name edit */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowManual((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl px-1 py-1.5 text-xs font-medium text-[#5B21B6]/75"
          >
            <span>Edit UPI ID & Display Name</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showManual ? 'rotate-180' : ''}`} />
          </button>

          {showManual && (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5B21B6]/70">Your UPI ID</label>
                <input
                  type="text"
                  value={vpa}
                  onChange={(e) => onVpaChange(e.target.value)}
                  className="min-h-[44px] w-full rounded-2xl border border-[#E9D5FF] bg-white px-3 text-xs outline-none focus:border-[#7C3AED]"
                  placeholder="name@okbank"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5B21B6]/70">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="min-h-[44px] w-full rounded-2xl border border-[#E9D5FF] bg-white px-3 text-xs outline-none focus:border-[#7C3AED]"
                  placeholder="Jason D."
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-[#E9D5FF] bg-white text-xs font-semibold text-[#5B21B6]"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-[#E9D5FF] bg-white text-xs font-semibold text-[#5B21B6]"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-[#E9D5FF] bg-white text-xs font-semibold text-[#5B21B6]"
          >
            <Download className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyQrSheetView;
