import React, { useState, useRef, useEffect } from "react";
import { apiService } from "../services/api";

export const VideoCapture = ({ onFrameCapture, roi, onRoiChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStreaming(true);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    initWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture and send frames
  useEffect(() => {
    if (!streaming || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    const captureFrame = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw original video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw ROI rectangle
      if (roi) {
        ctx.strokeStyle = "rgba(255, 165, 0, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
      }

      // Get frame data and send
      const frameData = canvas.toDataURL("image/jpeg", 0.8);
      onFrameCapture(frameData);

      requestAnimationFrame(captureFrame);
    };

    const frameInterval = setInterval(() => {
      if (streaming) {
        captureFrame();
      }
    }, 100); // ~10 FPS

    return () => clearInterval(frameInterval);
  }, [streaming, roi, onFrameCapture]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (roi) {
      // Check if inside ROI
      if (
        x >= roi.x &&
        x <= roi.x + roi.width &&
        y >= roi.y &&
        y <= roi.y + roi.height
      ) {
        setIsDragging(true);
        setDragStart({ x, y });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart || !roi) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    const newRoi = {
      ...roi,
      x: Math.max(0, roi.x + deltaX),
      y: Math.max(0, roi.y + deltaY),
    };

    onRoiChange(newRoi);
    setDragStart({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="video-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="video-feed"
          style={{ cursor: roi ? "grab" : "default" }}
        />
        <div className="video-label original">Original Webcam Feed</div>
      </div>
      <video
        ref={videoRef}
        style={{ display: "none" }}
        playsInline
        muted
      />
    </div>
  );
};

export default VideoCapture;
