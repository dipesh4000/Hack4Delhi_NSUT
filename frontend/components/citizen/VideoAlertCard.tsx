"use client";

import { useState } from "react";
import { Play, AlertTriangle, Clock, Users } from "lucide-react";
import VideoAlertModal from "./VideoAlertModal";

interface VideoAlertCardProps {
  id: string;
  type: "Severe" | "Warning" | "Info";
  title: string;
  message: string;
  timestamp: string;
  targetGroups?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  wardName?: string;
  aqi?: number;
}

const getTypeStyles = (type: string) => {
  switch (type) {
    case "Severe":
      return {
        border: "border-l-red-500",
        bg: "bg-red-50",
        icon: "bg-red-100 text-red-600",
        badge: "bg-red-500 text-white",
        thumbnail: "from-red-600/80 to-red-800/80"
      };
    case "Warning":
      return {
        border: "border-l-orange-500",
        bg: "bg-orange-50",
        icon: "bg-orange-100 text-orange-600",
        badge: "bg-orange-500 text-white",
        thumbnail: "from-orange-600/80 to-orange-800/80"
      };
    default:
      return {
        border: "border-l-blue-500",
        bg: "bg-blue-50",
        icon: "bg-blue-100 text-blue-600",
        badge: "bg-blue-500 text-white",
        thumbnail: "from-blue-600/80 to-blue-800/80"
      };
  }
};

const getThumbnail = (type: string): string => {
  // Placeholder thumbnail images based on severity
  switch (type) {
    case "Severe":
      return "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=225&fit=crop&auto=format";
    case "Warning":
      return "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=400&h=225&fit=crop&auto=format";
    default:
      return "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=225&fit=crop&auto=format";
  }
};

export default function VideoAlertCard({
  id,
  type,
  title,
  message,
  timestamp,
  targetGroups,
  videoUrl,
  thumbnailUrl,
  duration = "0:30",
  wardName = "Your Ward",
  aqi = 342
}: VideoAlertCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const styles = getTypeStyles(type);
  const thumbnail = thumbnailUrl || getThumbnail(type);

  return (
    <>
      <div
        className={`rounded-2xl border-l-4 shadow-sm bg-white overflow-hidden ${styles.border} transition-all duration-300 hover:shadow-lg cursor-pointer`}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Video Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${styles.thumbnail}`} />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`rounded-full bg-white/90 p-5 shadow-xl transition-all duration-300 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
            >
              <Play className="w-8 h-8 text-slate-900 fill-slate-900 ml-1" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </div>

          {/* Severity Badge */}
          <div className={`absolute top-3 left-3 ${styles.badge} px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {type} Alert
          </div>

          {/* Video Indicator */}
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-md">
            📹 VIDEO
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{title}</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full shrink-0 ml-2">
              {timestamp}
            </span>
          </div>
          
          <p className="text-slate-600 text-sm line-clamp-2">{message}</p>

          {targetGroups && targetGroups.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold uppercase tracking-wide">Impacts:</span>
              </div>
              {targetGroups.map((group) => (
                <span
                  key={group}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium"
                >
                  {group}
                </span>
              ))}
            </div>
          )}

          {/* Tap to Watch */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-blue-600 font-semibold flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Tap to watch alert video
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aqi={aqi}
        wardName={wardName}
        videoUrl={videoUrl}
      />
    </>
  );
}
