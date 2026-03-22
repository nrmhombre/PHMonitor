import { Incident, CATEGORY_COLORS, CONFIDENCE_COLORS, SOURCE_TRUST_LEVELS } from "@/types";

interface IncidentFeedProps {
  incidents: Incident[];
  selectedId: number | null;
  onSelectIncident: (incident: Incident) => void;
}

export default function IncidentFeed({
  incidents,
  selectedId,
  onSelectIncident,
}: IncidentFeedProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getSourceLabel = (sourceType: string) => {
    return SOURCE_TRUST_LEVELS[sourceType as keyof typeof SOURCE_TRUST_LEVELS]?.label || sourceType;
  };

  const getSourceColor = (sourceType: string) => {
    return SOURCE_TRUST_LEVELS[sourceType as keyof typeof SOURCE_TRUST_LEVELS]?.color || "#6b7280";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#1e293b] bg-[#0f1419]">
        <h2 className="text-sm font-semibold text-white">INTELLIGENCE FEED</h2>
        <p className="text-xs text-[#6b7280] mt-1">
          {incidents.length} event{incidents.length !== 1 ? "s" : ""} detected
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {incidents.length === 0 ? (
          <div className="p-4 text-center text-[#6b7280] text-sm">
            No incidents match current filters
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {incidents.map((incident) => {
              const categoryColors = CATEGORY_COLORS[incident.category];
              const confidenceColors = CONFIDENCE_COLORS[incident.confidence];
              
              return (
                <button
                  key={incident.id}
                  onClick={() => onSelectIncident(incident)}
                  className={`w-full p-4 text-left transition-all hover:bg-[#151b26] ${
                    selectedId === incident.id ? "bg-[#151b26] border-l-2 border-l-[#3b82f6]" : "border-l-2 border-l-transparent"
                  }`}
                >
                  {/* Date and Region */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#6b7280]">
                      {formatDate(incident.date)}
                    </span>
                    {incident.region && (
                      <span className="text-xs text-[#4b5563]">
                        {incident.region}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-medium text-sm text-white mb-2 line-clamp-2 leading-relaxed">
                    {incident.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-[#9ca3af] line-clamp-2 mb-3">
                    {incident.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {/* Category */}
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor: categoryColors?.bg,
                        color: categoryColors?.text,
                      }}
                    >
                      {categoryColors?.label}
                    </span>
                    
                    {/* Status */}
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor: incident.status === "confirmed" 
                          ? "rgba(16, 185, 129, 0.15)" 
                          : incident.status === "reported"
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(107, 114, 128, 0.15)",
                        color: incident.status === "confirmed" 
                          ? "#10b981" 
                          : incident.status === "reported"
                          ? "#f59e0b"
                          : "#6b7280",
                      }}
                    >
                      {incident.status}
                    </span>

                    {/* Confidence */}
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor: confidenceColors?.bg,
                        color: confidenceColors?.text,
                      }}
                    >
                      {confidenceColors?.label}
                    </span>

                    {/* Source */}
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        color: getSourceColor(incident.sourceType),
                      }}
                    >
                      {getSourceLabel(incident.sourceType)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
