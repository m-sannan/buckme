import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Sparkles, X } from "lucide-react";
import { decodeQrFromBlob, decodeQrFromImageData } from "@/lib/decode-qr";
import { parseUpi, SAMPLE_UPI_URI, type UpiPayload } from "@/lib/upi";

export function QrScannerSheet({
  onParsed,
  onClose,
}: {
  onParsed: (payload: UpiPayload) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onParsedRef = useRef(onParsed);
  onParsedRef.current = onParsed;

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera unavailable here. Upload a QR screenshot or paste a UPI ID.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        let ticks = 0;
        const scanLoop = () => {
          raf = requestAnimationFrame(scanLoop);
          ticks += 1;
          if (ticks % 4 !== 0) return;
          const v = videoRef.current;
          if (!v || !ctx || v.readyState < 2 || !v.videoWidth || !v.videoHeight) return;
          canvas.width = v.videoWidth;
          canvas.height = v.videoHeight;
          ctx.drawImage(v, 0, 0, v.videoWidth, v.videoHeight);
          const raw = decodeQrFromImageData(ctx.getImageData(0, 0, v.videoWidth, v.videoHeight));
          if (!raw) return;
          const res = parseUpi(raw);
          if (res.ok) {
            onParsedRef.current(res.payload);
          } else {
            setError(res.error);
          }
        };
        raf = requestAnimationFrame(scanLoop);
      } catch {
        if (!cancelled) {
          setCameraError("Camera permission blocked. Upload a QR image or paste a UPI ID below.");
        }
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const handleRaw = (raw: string) => {
    const res = parseUpi(raw);
    if (res.ok) {
      setError(null);
      onParsed(res.payload);
    } else {
      setError(res.error);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const raw = await decodeQrFromBlob(file);
      if (!raw) {
        setError("No QR found in that image. Try a tighter crop.");
        return;
      }
      handleRaw(raw);
    } catch {
      setError("Could not read that image.");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-[#F8F7FC] p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#6D28D9]" />
            <h2 className="text-lg font-extrabold text-[#5B21B6]">Scan &amp; Pay</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera viewfinder */}
        <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-[#7C3AED] bg-gray-950">
          {cameraError ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-gray-300">
              <Camera className="mb-2 h-8 w-8 text-purple-400" />
              <p>{cameraError}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-purple-300/70" />
        </div>

        {/* Upload & Sample */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-xs font-bold text-[#5B21B6] hover:bg-purple-50"
          >
            <ImagePlus className="h-4 w-4" />
            <span>Upload QR</span>
          </button>
          <button
            type="button"
            onClick={() => handleRaw(SAMPLE_UPI_URI)}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-xs font-bold text-[#5B21B6] hover:bg-purple-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>Try Sample QR</span>
          </button>
        </div>

        {/* Manual VPA / UPI Link */}
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleRaw(manualInput);
          }}
        >
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste UPI ID (name@okhdfcbank) or upi://..."
            className="flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#6D28D9]"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-[#6D28D9] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#5B21B6]"
          >
            Go
          </button>
        </form>

        {error && (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
