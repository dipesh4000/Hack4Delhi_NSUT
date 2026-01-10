"use client";

import { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX, AlertTriangle, MapPin } from "lucide-react";

interface VideoAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  aqi: number;
  wardName: string;
  videoUrl?: string;
}

const getAlertVideo = (aqi: number): string => {
  // Using engaging placeholder videos based on severity
  if (aqi > 300) {
    return "https://assets.mixkit.co/videos/preview/mixkit-red-alert-lights-flashing-in-red-and-yellow-25844-large.mp4";
  } else if (aqi > 200) {
    return "https://assets.mixkit.co/videos/preview/mixkit-smoke-rising-in-the-air-from-the-ground-27451-large.mp4";
  } else {
    return "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-during-golden-hour-from-below-34570-large.mp4";
  }
};

const getSeverityInfo = (aqi: number) => {
  if (aqi > 300) {
    return {
      level: "HAZARDOUS",
      color: "from-red-600 to-red-800",
      bgColor: "bg-red-500/90",
      textColor: "text-red-100",
      message: "Air quality is extremely dangerous. Avoid ALL outdoor activities immediately!",
      icon: "🚨"
    };
  } else if (aqi > 200) {
    return {
      level: "VERY UNHEALTHY",
      color: "from-purple-600 to-purple-800",
      bgColor: "bg-purple-500/90",
      textColor: "text-purple-100",
      message: "Serious health effects for everyone. Minimize outdoor exposure.",
      icon: "⚠️"
    };
  } else {
    return {
      level: "UNHEALTHY",
      color: "from-orange-500 to-orange-700",
      bgColor: "bg-orange-500/90",
      textColor: "text-orange-100",
      message: "Health effects may be experienced by sensitive groups.",
      icon: "⚡"
    };
  }
};

export default function VideoAlertModal({
  isOpen,
  onClose,
  aqi,
  wardName,
  videoUrl
}: VideoAlertModalProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  const severity = getSeverityInfo(aqi);
  const video = videoUrl || getAlertVideo(aqi);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-2xl transform transition-all duration-500 ${
          isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Video Background */}
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            src={video}
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${severity.color} opacity-60`} />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="animate-pulse">
                  <span className="text-3xl">{severity.icon}</span>
                </div>
                <div className={`${severity.bgColor} backdrop-blur-sm px-4 py-2 rounded-full`}>
                  <span className="text-white font-bold tracking-wider text-sm">
                    {severity.level} ALERT
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="space-y-4">
              {/* AQI Display */}
              <div className="flex items-end gap-4">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Current AQI</p>
                  <p className="text-5xl font-black text-white">{aqi}</p>
                </div>
                <div className="flex items-center gap-2 text-white/90 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{wardName}</span>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-lg">{severity.message}</p>
                    <p className="text-white/70 text-sm mt-2">
                      Wear an N95 mask if you must go outside. Keep windows closed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleClose}
                className="w-full py-4 rounded-2xl bg-white font-bold text-slate-900 hover:bg-white/90 transition-colors shadow-lg"
              >
                I Understand - Take Precautions
              </button>
            </div>
          </div>

          {/* Pulsing Border Effect */}
          <div className={`absolute inset-0 rounded-3xl border-4 ${
            aqi > 300 ? "border-red-500" : aqi > 200 ? "border-purple-500" : "border-orange-500"
          } animate-pulse pointer-events-none`} />
        </div>
      </div>
    </div>
  );
}
