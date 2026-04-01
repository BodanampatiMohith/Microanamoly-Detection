import React, { useEffect, useRef } from "react";

const CAPTURE_INTERVAL_MS = 120;

export const VideoCapture = ({ onFrameCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    initWebcam();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const captureFrame = () => {
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frameData = canvas.toDataURL("image/jpeg", 0.8);
      onFrameCapture?.(frameData);
    };

    const intervalId = window.setInterval(captureFrame, CAPTURE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [onFrameCapture]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      <video ref={videoRef} playsInline muted />
      <canvas ref={canvasRef} />
    </div>
  );
};

export default VideoCapture;
