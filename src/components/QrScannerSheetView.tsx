import React, { useState } from 'react';
import { X, Upload, ScanLine } from 'lucide-react';

interface QrScannerSheetProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraError: string | null;
  error: string | null;
  onUploadFile: (file: File) => void;
  onTrySample: () => void;
  onSubmitManual: (raw: string) => void;
  onClose: () => void;
}

export const QrScannerSheetView: React.FC<QrScannerSheetProps> = ({
  videoRef,
  cameraError,
  error,
  onUploadFile,
  onTrySample,
  onSubmitManual,
  onClose,
}) => {
  const [manual, setManual] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
    e.target.value = '';
  };

  const submitManual = () => {
    const raw = manual.trim();
    if (raw) onSubmitManual(raw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#F8F7FC] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#5B21B6]">Scan & Pay</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5B21B6] shadow-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {/* Purple dashed reticle */}
          <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-dashed border-[#C4B5FD]" />
          {cameraError && (
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-black/70 px-3 py-2 text-center text-xs text-white">
              {cameraError}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-center text-sm text-red-600">{error}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#E9D5FF] bg-white text-sm font-semibold text-[#5B21B6]">
            <Upload className="h-4 w-4" />
            Upload QR
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <button
            type="button"
            onClick={onTrySample}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-[#E9D5FF] bg-white text-sm font-semibold text-[#5B21B6]"
          >
            <ScanLine className="h-4 w-4" />
            Try Sample QR
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitManual()}
            placeholder="VPA or upi:// link"
            className="min-h-[44px] flex-1 rounded-2xl border border-[#E9D5FF] bg-white px-4 text-sm outline-none focus:border-[#7C3AED]"
          />
          <button
            type="button"
            onClick={submitManual}
            className="min-h-[44px] min-w-[72px] rounded-2xl bg-[#5B21B6] px-4 text-sm font-semibold text-white"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrScannerSheetView;
