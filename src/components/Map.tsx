"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Incident, CATEGORY_COLORS, CONFIDENCE_COLORS, SOURCE_TRUST_LEVELS } from "@/types";

// Custom marker icon
const createCustomIcon = (category: string, confidence: string) => {
  const categoryColors: Record<string, string> = {
    maritime: "#06b6d4",
    insurgency: "#f43f5e",
    airspace: "#f59e0b",
    diplomatic: "#a855f7",
    other: "#6b7280",
  };

  const confidenceOpacity: Record<string, number> = {
    high: 1,
    medium: 0.7,
    low: 0.4,
  };

  const color = categoryColors[category] || "#6b7280";
  const opacity = confidenceOpacity[confidence] || 0.7;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.9);
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 0 2px rgba(0,0,0,0.2);
        opacity: ${opacity};
        transition: all 0.2s ease;
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
};

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap() as unknown as { flyTo: (center: [number, number], zoom: number, options?: { duration: number }) => void };

  useEffect(() => {
    if (center) {
      map.flyTo(center, 8, { duration: 1 });
    }
  }, [center, map]);

  return null;
}

interface MapProps {
  incidents: Incident[];
  focusLocation: [number, number] | null;
}

export default function Map({ incidents, focusLocation }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-[#0a0e17] flex items-center justify-center">
        <div className="text-[#6b7280]">Initializing map...</div>
      </div>
    );
  }

  const getSourceLabel = (sourceType: string) => {
    return SOURCE_TRUST_LEVELS[sourceType as keyof typeof SOURCE_TRUST_LEVELS]?.label || sourceType;
  };

  return (
    <MapContainer
      center={[12.8797, 121.774]}
      zoom={6}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapUpdater center={focusLocation} />

      {incidents.map((incident) => {
        const categoryColors = CATEGORY_COLORS[incident.category];
        const confidenceColors = CONFIDENCE_COLORS[incident.confidence];

        return (
          <Marker
            key={incident.id}
            position={[incident.lat, incident.lng]}
            icon={createCustomIcon(incident.category, incident.confidence) as unknown as undefined}
          >
            <Popup>
              <div className="min-w-[280px] max-w-[320px]">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-sm text-white leading-tight">
                    {incident.title}
                  </h3>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor: categoryColors?.bg,
                      color: categoryColors?.text,
                    }}
                  >
                    {categoryColors?.label}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor: incident.status === "confirmed" 
                        ? "rgba(16, 185, 129, 0.15)" 
                        : "rgba(245, 158, 11, 0.15)",
                      color: incident.status === "confirmed" ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {incident.status}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor: confidenceColors?.bg,
                      color: confidenceColors?.text,
                    }}
                  >
                    {confidenceColors?.label} confidence
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs text-[#9ca3af] mb-3 leading-relaxed">
                  {incident.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#334155]">
                  <div className="flex items-center gap-2 text-[10px] text-[#6b7280]">
                    <span>{new Date(incident.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</span>
                    {incident.region && (
                      <>
                        <span>•</span>
                        <span>{incident.region}</span>
                      </>
                    )}
                  </div>
                  {incident.source && (
                    <a
                      href={incident.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#3b82f6] hover:underline font-medium"
                    >
                      {getSourceLabel(incident.sourceType)} →
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
