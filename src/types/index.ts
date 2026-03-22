export interface Incident {
  id: number;
  title: string;
  category: "maritime" | "insurgency" | "airspace" | "diplomatic" | "other";
  status: "confirmed" | "reported" | "unverified";
  confidence: "high" | "medium" | "low";
  date: string;
  lat: number;
  lng: number;
  summary: string;
  source?: string;
  sourceType: "government" | "news_agency" | "major_outlet" | "think_tank" | "social_media" | "community";
  region?: string;
}

export type Category = Incident["category"];
export type Status = Incident["status"];
export type Confidence = Incident["confidence"];
export type SourceType = Incident["sourceType"];

// Source trustworthiness mapping
export const SOURCE_TRUST_LEVELS: Record<SourceType, { confidence: Confidence; label: string; color: string }> = {
  government: { confidence: "high", label: "Government", color: "#10b981" },
  news_agency: { confidence: "high", label: "News Agency", color: "#10b981" },
  think_tank: { confidence: "high", label: "Think Tank", color: "#06b6d4" },
  major_outlet: { confidence: "medium", label: "Major Media", color: "#f59e0b" },
  social_media: { confidence: "low", label: "Social Media", color: "#f97316" },
  community: { confidence: "low", label: "Community", color: "#ef4444" },
};

export const CONFIDENCE_COLORS: Record<Confidence, { bg: string; text: string; label: string }> = {
  high: { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", label: "High" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", label: "Medium" },
  low: { bg: "rgba(249, 115, 22, 0.15)", text: "#f97316", label: "Low" },
};

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; label: string }> = {
  maritime: { bg: "rgba(6, 182, 212, 0.15)", text: "#06b6d4", label: "Maritime" },
  insurgency: { bg: "rgba(244, 63, 94, 0.15)", text: "#f43f5e", label: "Insurgency" },
  airspace: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", label: "Airspace" },
  diplomatic: { bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7", label: "Diplomatic" },
  other: { bg: "rgba(107, 114, 128, 0.15)", text: "#6b7280", label: "Other" },
};
