import { Category, Status, Confidence, CATEGORY_COLORS, CONFIDENCE_COLORS } from "@/types";

interface FilterProps {
  selectedCategory: Category | "all";
  selectedStatus: Status | "all";
  selectedConfidence: Confidence | "all";
  onCategoryChange: (category: Category | "all") => void;
  onStatusChange: (status: Status | "all") => void;
  onConfidenceChange: (confidence: Confidence | "all") => void;
}

const categories: { value: Category | "all"; label: string; color: string }[] = [
  { value: "all", label: "All", color: "#9ca3af" },
  { value: "maritime", label: "Maritime", color: "#06b6d4" },
  { value: "insurgency", label: "Insurgency", color: "#f43f5e" },
  { value: "airspace", label: "Airspace", color: "#f59e0b" },
  { value: "diplomatic", label: "Diplomatic", color: "#a855f7" },
  { value: "other", label: "Other", color: "#6b7280" },
];

const statuses: { value: Status | "all"; label: string; color: string }[] = [
  { value: "all", label: "All", color: "#9ca3af" },
  { value: "confirmed", label: "Confirmed", color: "#10b981" },
  { value: "reported", label: "Reported", color: "#f59e0b" },
  { value: "unverified", label: "Unverified", color: "#6b7280" },
];

const confidences: { value: Confidence | "all"; label: string; color: string }[] = [
  { value: "all", label: "All", color: "#9ca3af" },
  { value: "high", label: "High", color: "#10b981" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "low", label: "Low", color: "#f97316" },
];

export default function Filter({
  selectedCategory,
  selectedStatus,
  selectedConfidence,
  onCategoryChange,
  onStatusChange,
  onConfidenceChange,
}: FilterProps) {
  return (
    <div className="p-4 border-b border-[#1e293b] space-y-4">
      {/* Category Filter */}
      <div>
        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                selectedCategory === cat.value
                  ? "ring-1 ring-offset-1 ring-offset-[#0a0e17]"
                  : "hover:bg-[#1c2431]"
              }`}
              style={{
                backgroundColor: selectedCategory === cat.value 
                  ? `${cat.color}20` 
                  : "transparent",
                color: cat.color,
                borderColor: selectedCategory === cat.value ? cat.color : "#334155",
                borderWidth: "1px",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-2">
          Verification Status
        </label>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusChange(status.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                selectedStatus === status.value
                  ? "ring-1 ring-offset-1 ring-offset-[#0a0e17]"
                  : "hover:bg-[#1c2431]"
              }`}
              style={{
                backgroundColor: selectedStatus === status.value 
                  ? `${status.color}20` 
                  : "transparent",
                color: status.color,
                borderColor: selectedStatus === status.value ? status.color : "#334155",
                borderWidth: "1px",
              }}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Confidence Filter */}
      <div>
        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-2">
          Source Confidence
        </label>
        <div className="flex flex-wrap gap-1.5">
          {confidences.map((conf) => (
            <button
              key={conf.value}
              onClick={() => onConfidenceChange(conf.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                selectedConfidence === conf.value
                  ? "ring-1 ring-offset-1 ring-offset-[#0a0e17]"
                  : "hover:bg-[#1c2431]"
              }`}
              style={{
                backgroundColor: selectedConfidence === conf.value 
                  ? `${conf.color}20` 
                  : "transparent",
                color: conf.color,
                borderColor: selectedConfidence === conf.value ? conf.color : "#334155",
                borderWidth: "1px",
              }}
            >
              {conf.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
