"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import IncidentFeed from "@/components/IncidentFeed";
import Filter from "@/components/Filter";
import { Incident, Category, Status, Confidence, CATEGORY_COLORS } from "@/types";

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0e17] flex items-center justify-center">
      <div className="text-[#6b7280]">Loading map data...</div>
    </div>
  ),
});

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<Status | "all">("all");
  const [selectedConfidence, setSelectedConfidence] = useState<Confidence | "all">("all");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data from API
  const fetchIncidents = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/incidents");
      const data = await response.json();
      
      if (data.data) {
        // Filter valid incidents
        const validIncidents = (data.data as Incident[]).filter((incident): incident is Incident => {
          return (
            typeof incident.id === 'number' &&
            typeof incident.title === 'string' &&
            typeof incident.category === 'string' &&
            typeof incident.status === 'string' &&
            typeof incident.confidence === 'string' &&
            typeof incident.date === 'string' &&
            typeof incident.lat === 'number' &&
            typeof incident.lng === 'number' &&
            typeof incident.summary === 'string'
          );
        });
        
        setIncidents(validIncidents);
        setLastUpdated(new Date(data.lastUpdated));
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Auto-refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchIncidents();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((incident) => {
        if (selectedCategory !== "all" && incident.category !== selectedCategory) {
          return false;
        }
        if (selectedStatus !== "all" && incident.status !== selectedStatus) {
          return false;
        }
        if (selectedConfidence !== "all" && incident.confidence !== selectedConfidence) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incidents, selectedCategory, selectedStatus, selectedConfidence]);

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncidentId(incident.id);
    setFocusLocation([incident.lat, incident.lng]);
  };

  const handleCategoryChange = (category: Category | "all") => {
    setSelectedCategory(category);
    setSelectedIncidentId(null);
    setFocusLocation(null);
  };

  const handleStatusChange = (status: Status | "all") => {
    setSelectedStatus(status);
    setSelectedIncidentId(null);
    setFocusLocation(null);
  };

  const handleConfidenceChange = (confidence: Confidence | "all") => {
    setSelectedConfidence(confidence);
    setSelectedIncidentId(null);
    setFocusLocation(null);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = incidents.length;
    const highConfidence = incidents.filter(i => i.confidence === "high").length;
    const confirmed = incidents.filter(i => i.status === "confirmed").length;
    const byCategory = {
      maritime: incidents.filter(i => i.category === "maritime").length,
      insurgency: incidents.filter(i => i.category === "insurgency").length,
      airspace: incidents.filter(i => i.category === "airspace").length,
      diplomatic: incidents.filter(i => i.category === "diplomatic").length,
      other: incidents.filter(i => i.category === "other").length,
    };
    return { total, highConfidence, confirmed, byCategory };
  }, [incidents]);

  // Tension level based on confirmed incidents in last 30 days
  const tensionLevel = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentConfirmed = incidents.filter(
      i => i.status === "confirmed" && new Date(i.date) >= thirtyDaysAgo
    ).length;
    if (recentConfirmed >= 6) return { level: "HIGH", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" };
    if (recentConfirmed >= 3) return { level: "ELEVATED", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
    return { level: "NORMAL", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
  }, [incidents]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0e17]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b7280]">Initializing secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0e17]">
      {/* Header - World Monitor Style */}
      <header className="monitor-header border-b border-[#1e293b]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white tracking-tight">PH DEFENSE MONITOR</h1>
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">
                  Philippine Security Intelligence
                </p>
              </div>
            </div>

            {/* Status Panel */}
            <div className="flex items-center gap-4">
              {/* Live Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-[#f59e0b]' : 'bg-[#10b981] animate-pulse'}`}></div>
                <span className="text-xs text-[#6b7280]">
                  {isRefreshing ? 'Updating...' : `Live • ${formatLastUpdated()}`}
                </span>
              </div>

              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{ backgroundColor: tensionLevel.bg }}
              >
                <span className="text-xs text-[#6b7280]">ALERT LEVEL</span>
                <span 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: tensionLevel.color }}
                >
                  {tensionLevel.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-2 border-t border-[#1e293b] bg-[#0f1419]">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#6b7280]">TOTAL INCIDENTS</span>
              <span className="font-semibold text-white">{stats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6b7280]">VERIFIED</span>
              <span className="font-semibold text-[#10b981]">{stats.confirmed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6b7280]">HIGH CONFIDENCE</span>
              <span className="font-semibold text-[#3b82f6]">{stats.highConfidence}</span>
            </div>
            <div className="hidden md:flex items-center gap-4 ml-auto">
              {Object.entries(CATEGORY_COLORS).slice(0, 4).map(([cat, colors]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.text }}
                  />
                  <span className="text-[#6b7280]">{colors.label}</span>
                  <span className="font-medium text-white">{stats.byCategory[cat as keyof typeof stats.byCategory]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-[420px] bg-[#0a0e17] border-r border-[#1e293b] flex flex-col">
          <Filter
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            selectedConfidence={selectedConfidence}
            onCategoryChange={handleCategoryChange}
            onStatusChange={handleStatusChange}
            onConfidenceChange={handleConfidenceChange}
          />
          <div className="flex-1 overflow-hidden">
            <IncidentFeed
              incidents={filteredIncidents}
              selectedId={selectedIncidentId}
              onSelectIncident={handleSelectIncident}
            />
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <Map incidents={filteredIncidents} focusLocation={focusLocation} />
        </main>
      </div>

      {/* Footer */}
      <footer className="hidden lg:block px-4 py-2 border-t border-[#1e293b] bg-[#0f1419]">
        <div className="flex items-center justify-between text-xs text-[#6b7280]">
          <div className="flex items-center gap-4">
            <span>DATA SOURCES: Government agencies, news agencies, think tanks</span>
            <span className="text-[#334155]">|</span>
            <span>Auto-refresh: 30s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#10b981]">●</span>
            <span>Live Feed Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
