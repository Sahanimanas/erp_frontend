/**
 * CameraCapture.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A small modal that opens the device webcam, lets the user snap a photo, and
 * hands the captured frame back to the caller as a File (JPEG).
 *
 *   <CameraCapture open={open} onClose={...} onCapture={(file) => upload(file)} />
 *
 * The caller is responsible for uploading the returned File (e.g. via
 * uploadImageFile). The component fully tears down the media stream on close.
 */
import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCcw, Check } from "lucide-react";
import { Button } from "./ui";

export default function CameraCapture({ open, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [shot, setShot] = useState("");   // data URL of the captured still (preview)
  const [ready, setReady] = useState(false);

  // Start / stop the camera with the modal's open state.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError("");
    setShot("");
    setReady(false);

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera is not supported on this device/browser.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch (err) {
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access and try again."
            : err?.message || "Could not access the camera."
        );
      }
    })();

    return () => { cancelled = true; stopStream(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const close = () => { stopStream(); onClose?.(); };

  // Draw the current video frame onto the canvas and keep a preview still.
  const snap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(video, 0, 0, w, h);
    setShot(canvas.toDataURL("image/jpeg", 0.92));
  };

  const retake = () => setShot("");

  // Convert the captured still to a File and hand it back to the caller.
  const usePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `photo-${canvas.width}x${canvas.height}.jpg`, { type: "image/jpeg" });
      onCapture?.(file);
      close();
    }, "image/jpeg", 0.92);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={close}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-700">
            <Camera size={16} />
            <span className="text-sm font-semibold">Take a photo</span>
          </div>
          <button onClick={close} className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
          ) : (
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900">
              {/* Live preview (hidden once a still is captured) */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover ${shot ? "hidden" : ""}`}
              />
              {/* Captured still preview */}
              {shot && <img src={shot} alt="Captured" className="absolute inset-0 h-full w-full object-cover" />}
              {!ready && !shot && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">Starting camera…</div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {!error && (
          <div className="flex justify-end gap-2 px-4 pb-4">
            {shot ? (
              <>
                <Button variant="secondary" size="sm" icon={<RefreshCcw size={14} />} onClick={retake}>Retake</Button>
                <Button size="sm" icon={<Check size={14} />} onClick={usePhoto}>Use photo</Button>
              </>
            ) : (
              <Button size="sm" icon={<Camera size={14} />} disabled={!ready} onClick={snap}>Capture</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
