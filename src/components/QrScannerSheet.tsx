import { useEffect, useRef, useState } from "react";
import { decodeQrFromBlob, decodeQrFromImageData } from "@/lib/decode-qr";
import { parseUpi, SAMPLE_UPI_URI, type UpiPayload } from "@/lib/upi";
import { QrScannerSheetView } from "./QrScannerSheetView";

export function QrScannerSheet({
  onParsed,
  onClose,
}: {
  onParsed: (payload: UpiPayload) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onParsedRef = useRef(onParsed);
  onParsedRef.current = onParsed;

  const [cameraError, setCameraError] = useState<string | null>(null);
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
    <QrScannerSheetView
      videoRef={videoRef}
      cameraError={cameraError}
      error={error}
      onUploadFile={(file) => void handleFile(file)}
      onTrySample={() => handleRaw(SAMPLE_UPI_URI)}
      onSubmitManual={handleRaw}
      onClose={onClose}
    />
  );
}
