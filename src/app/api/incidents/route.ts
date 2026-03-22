import { NextResponse } from "next/server";
import { scrapeIncidents } from "@/lib/scraper";

// Cache for scraped data
let cachedIncidents: any[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 300000; // 5 minutes cache

export async function GET() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedIncidents && (now - lastFetchTime) < CACHE_DURATION) {
    return NextResponse.json({
      data: cachedIncidents,
      lastUpdated: new Date(lastFetchTime).toISOString(),
      source: "PH Defense Monitor Live Feed (Cached)",
      status: "active",
      cached: true,
    });
  }
  
  try {
    // Scrape fresh data
    const incidents = await scrapeIncidents();
    
    // Update cache
    cachedIncidents = incidents;
    lastFetchTime = now;
    
    return NextResponse.json({
      data: incidents,
      lastUpdated: new Date().toISOString(),
      source: "Live RSS Feed (PNA, Reuters)",
      status: "active",
      cached: false,
    });
  } catch (error) {
    console.error("Scraper error:", error);
    
    // Return cached data on error if available
    if (cachedIncidents) {
      return NextResponse.json({
        data: cachedIncidents,
        lastUpdated: new Date(lastFetchTime).toISOString(),
        source: "PH Defense Monitor (Cached - Error)",
        status: "degraded",
        cached: true,
        error: "Failed to fetch fresh data",
      });
    }
    
    return NextResponse.json({
      error: "Failed to fetch incidents",
    }, { status: 500 });
  }
}
