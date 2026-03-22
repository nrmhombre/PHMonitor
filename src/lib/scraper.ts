// Enhanced News Scraper Service for PH Defense Monitor
// Sources: Philippine Government Agencies, International News Agencies, GDELT API, RSS Feeds

import { Incident, Category, Confidence, Status, SourceType } from "@/types";

// ============================================
// RSS FEED URLs - Philippine Government Agencies
// ============================================
const GOV_RSS_FEEDS = {
  // Philippine News Agency (PNA) - Official government news
  pna: "https://www.pna.gov.ph/rss/",
  pna_defense: "https://www.pna.gov.ph/sections/defense",
  
  // NDRRMC - Disaster and emergency alerts
  ndrrtc: "https://ndrrmc.gov.ph/feed/",
  
  // Department of Foreign Affairs
  dfa: "https://dfa.gov.ph/news/rss",
  
  // Philippine Coast Guard
  pcg: "https://coastguard.gov.ph/publications/rss/",
  
  // Armed Forces of the Philippines
  afp: "https://www.afp.gov.ph/feed/",
  
  // Department of National Defense
  dnd: "https://dnd.gov.ph/feed/",
};

// ============================================
// RSS FEED URLs - International News Agencies
// ============================================
const NEWS_AGENCY_RSS_FEEDS = {
  // Reuters - Philippines specific
  reuters_ph: "https://www.reutersagency.com/feed/?best-topics=politics&post_type=best&countries=PH",
  reuters_world: "https://www.reutersagency.com/feed/?best-regions=asia-pacific&post_type=best",
  
  // Associated Press (AP) - via NewsAPI.org or direct
  ap_world: "https://feeds.ap.org/feed/ap-top-news/world",
  
  // Agence France-Presse (AFP)
  afp: "https://www.afp.com/feed/rss/en/asia-pacific",
  
  // BBC News
  bbc_world: "http://feeds.bbci.co.uk/news/world/rss.xml",
  bbc_asia: "http://feeds.bbci.co.uk/news/world/asia/rss.xml",
};

// ============================================
// RSS FEED URLs - Philippine News Media
// ============================================
const PH_NEWS_RSS_FEEDS = {
  // Major Philippine newspapers
  inquirer: "https://newsinfo.inquirer.net/feed/",
  manilaBulletin: "https://mb.com.ph/feed/",
  philstar: "https://www.philstar.com/feed/",
  abs_cbn: "https://news.abs-cbn.com/feed/",
  rappler: "https://www.rappler.com/feed/",
  
  // TV networks
  gma: "https://www.gmanetwork.com/news/rss/",
  
  // Regional news
  mindanodaily: "https://mindanodaily.com/feed/",
  sunstar: "https://www.sunstar.com.ph/feed/",
};

// ============================================
// GDELT API Configuration
// ============================================
const GDELT_CONFIG = {
  // GDELT Master List v2.0 API - Global news in last 15 minutes
  masterListUrl: "http://api.gdeltproject.org/api/v2/doclist",
  // Query for Philippines-related news
  query: " Philippines OR \"West Philippine Sea\" OR \"South China Sea\" OR Manila OR \"China Coast Guard\" OR \"US Navy\" OR \"AFP\" OR \"PCG\" OR \"NDRRMC\"",
  mode: "artlist",
  format: "rss",
  maxRecords: 50,
  sort: "DateDesc",
};

// Keywords to filter for security-related incidents
const SECURITY_KEYWORDS = [
  // Maritime security
  "coast guard", "navy", "military", "army", "insurgency", "terrorist",
  "west philippine sea", "south china sea", "scarborough", "second thomas shoal",
  "sabina shoal", "escoda shoal", "reed bank", "airspace", "diplomatic", "defense",
  "abu sayyaf", "npa", "communism", "maritime", "fishing", "vessel",
  "china", "chinese", "us navy", "exercise", "patrol", "operation",
  // Philippine specific
  "pcg", "afp", "ndrrc", "pcoast guard", "philippine coast guard",
  "china coast guard", "maritime incident", "collision", "trespassing",
  "installations", "harassment", "water cannon", "laser", "military exercise",
  "bilateral", "alliance", "mutual defense", "vfa", "edca",
  // Regional tensions
  "taiwan", "taiwan strait", "spratly", "kalayaan", "freedom of navigation",
  // Disaster/Security
  "earthquake", "typhoon", "storm", "flood", "volcano", "tsunami", "warning",
  "evacuation", "disaster", "emergency", "casualty", "fatalities",
];

// Philippine location keywords for geocoding
const LOCATION_KEYWORDS: Record<string, { lat: number; lng: number; region: string }> = {
  // West Philippine Sea / South China Sea features
  "west philippine sea": { lat: 12.0, lng: 115.0, region: "West Philippine Sea" },
  "south china sea": { lat: 12.0, lng: 115.0, region: "South China Sea" },
  "sabina shoal": { lat: 11.8333, lng: 116.4833, region: "West Philippine Sea" },
  "escoda shoal": { lat: 11.8333, lng: 116.4833, region: "West Philippine Sea" },
  "second thomas shoal": { lat: 9.736, lng: 115.832, region: "West Philippine Sea" },
  "ayungin shoal": { lat: 9.736, lng: 115.832, region: "West Philippine Sea" },
  "scarborough shoal": { lat: 15.15, lng: 117.75, region: "West Philippine Sea" },
  "panatag": { lat: 15.15, lng: 117.75, region: "West Philippine Sea" },
  "reed bank": { lat: 9.5, lng: 116.5, region: "West Philippine Sea" },
  "magsaysay reef": { lat: 9.9, lng: 115.45, region: "West Philippine Sea" },
  "cuarteron reef": { lat: 9.75, lng: 114.55, region: "West Philippine Sea" },
  "fiery cross reef": { lat: 9.9, lng: 112.95, region: "Spratly Islands" },
  "subi reef": { lat: 9.7, lng: 114.05, region: "Spratly Islands" },
  "mischief reef": { lat: 9.9, lng: 115.55, region: "Spratly Islands" },
  "kalayaan": { lat: 11.5, lng: 114.3, region: "Kalayaan Island Group" },
  "spratly": { lat: 10.0, lng: 114.0, region: "Spratly Islands" },
  "spratly islands": { lat: 10.0, lng: 114.0, region: "Spratly Islands" },
  
  // Major Philippine cities and regions
  "manila": { lat: 14.5995, lng: 120.9842, region: "Metro Manila" },
  "metro manila": { lat: 14.5995, lng: 120.9842, region: "Metro Manila" },
  "cebu city": { lat: 10.3157, lng: 123.8854, region: "Central Visayas" },
  "cebu": { lat: 10.3, lng: 123.9, region: "Central Visayas" },
  "davao": { lat: 7.0731, lng: 125.6127, region: "Davao Region" },
  "davao city": { lat: 7.0731, lng: 125.6127, region: "Davao Region" },
  "palawan": { lat: 9.5, lng: 118.5, region: "Palawan" },
  "puerto Princesa": { lat: 9.7392, lng: 118.3893, region: "Palawan" },
  "coron": { lat: 11.9538, lng: 120.2050, region: "Palawan" },
  "elnido": { lat: 11.1958, lng: 119.4617, region: "Palawan" },
  
  // Northern Philippines
  "batanes": { lat: 20.5, lng: 121.9, region: "Batanes" },
  "bataan": { lat: 14.7, lng: 120.4, region: "Central Luzon" },
  "subic": { lat: 14.8801, lng: 120.2355, region: "Central Luzon" },
  "subic bay": { lat: 14.8801, lng: 120.2355, region: "Central Luzon" },
  "zambales": { lat: 15.3, lng: 119.9, region: "Central Luzon" },
  "quezon": { lat: 14.0, lng: 122.0, region: "CALABARZON" },
  "quezon city": { lat: 14.6760, lng: 121.0437, region: "Metro Manila" },
  
  // Southern Philippines
  "mindanao": { lat: 8.0, lng: 125.0, region: "Mindanao" },
  "sulu": { lat: 5.975, lng: 121.083, region: "Sulu" },
  "zamboanga": { lat: 6.9, lng: 122.1, region: "Western Mindanao" },
  "zamboanga city": { lat: 6.9, lng: 122.1, region: "Western Mindanao" },
  "cotabato": { lat: 7.2, lng: 124.2, region: "SOCCSKSARGEN" },
  "jolo": { lat: 6.0514, lng: 120.9980, region: "Sulu" },
  "siasi": { lat: 5.5541, lng: 120.8180, region: "Sulu" },
  "tawi-tawi": { lat: 5.3546, lng: 119.8229, region: "Bangsamoro" },
  
  // Visayas
  "visayas": { lat: 10.0, lng: 123.0, region: "Visayas" },
  "iloilo": { lat: 10.7202, lng: 122.5621, region: "Western Visayas" },
  "bacolod": { lat: 10.6407, lng: 122.9748, region: "Western Visayas" },
  "negros": { lat: 10.0, lng: 123.0, region: "Negros Island" },
  "bohol": { lat: 9.85, lng: 124.1435, region: "Central Visayas" },
  "leyte": { lat: 11.0, lng: 124.5, region: "Eastern Visayas" },
  "tacloban": { lat: 11.2433, lng: 124.9765, region: "Eastern Visayas" },
  "samal": { lat: 7.0745, lng: 125.7087, region: "Davao Region" },
  
  // Luzon
  "luzon": { lat: 15.0, lng: 121.0, region: "Luzon" },
  "benguet": { lat: 16.5, lng: 120.7, region: "Cordillera" },
  "baguio": { lat: 16.4023, lng: 120.5960, region: "Cordillera" },
  "ilocos": { lat: 16.5, lng: 120.3, region: "Ilocos Region" },
  "vigan": { lat: 17.5749, lng: 120.3868, region: "Ilocos Region" },
  
  // Sea lanes
  "sulus": { lat: 6.5, lng: 121.5, region: "Sulu Sea" },
  "sulu sea": { lat: 6.5, lng: 121.5, region: "Sulu Sea" },
  "celebes sea": { lat: 3.0, lng: 122.0, region: "Celebes Sea" },
};

// ============================================
// Helper Functions
// ============================================

// Categorize article based on keywords
function categorizeArticle(title: string, description: string): { category: Category; confidence: Confidence } {
  const text = `${title} ${description}`.toLowerCase();
  
  const categoryKeywords: Record<Category, string[]> = {
    maritime: [
      "coast guard", "navy", "vessel", "fishing", "maritime", "shoal", "sea", 
      "ship", "patrol boat", "warship", "collision", "sinking", "piracy",
      "west philippine sea", "south china sea", "china coast guard",
      "philippine coast guard", "pcg", "maritime incident", "water cannon"
    ],
    insurgency: [
      "insurgency", "terrorist", "abu sayyaf", "npa", "communist", "militant", 
      "rebel", "operation", "military operation", "asg", "mis",
      "attack", "clash", "encounter", "ambush", "bombing", "explosion"
    ],
    airspace: [
      "airspace", "air force", "aircraft", "plane", "drone", "radar", 
      "air patrol", "fighter", "jet", "surveillance", "air defense"
    ],
    diplomatic: [
      "diplomatic", "china", "us", "asean", "meeting", "talks", "foreign", 
      "embassy", "protest", "summit", "bilateral", "vfa", "edca",
      "mutual defense", "treaty", "agreement", "trade", "sanctions"
    ],
    other: []
  };

  // Map disaster-related keywords to appropriate categories
  const disasterKeywords = ["earthquake", "typhoon", "storm", "flood", "volcano", "tsunami",
    "disaster", "ndrrc", "evacuation", "warning", "casualty", "fatalities",
    "pagasa", "phivolcs", "landslide", "eruption"];
  const textLower = text.toLowerCase();
  
  if (disasterKeywords.some(k => textLower.includes(k))) {
    return { category: "other" as Category, confidence: "medium" };
  }
  
  // Check each category in order
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        // Higher confidence for multiple keyword matches
        const matchCount = keywords.filter(k => text.includes(k)).length;
        let confidence: Confidence = "medium";
        if (matchCount >= 3) confidence = "high";
        else if (matchCount >= 1 && ["coast guard", "navy", "west philippine sea", "terrorist", "earthquake", "typhoon"].some(k => text.includes(k))) {
          confidence = "high";
        }
        
        return { category: cat as Category, confidence };
      }
    }
  }
  return { category: "other" as Category, confidence: "low" };
}

// Extract location from article text
function extractLocation(title: string, description: string): { lat: number; lng: number; region: string } | null {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check each location keyword in order (longer matches first)
  const sortedLocations = Object.entries(LOCATION_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  
  for (const [keyword, location] of sortedLocations) {
    if (text.includes(keyword)) {
      return location;
    }
  }
  return null;
}

// Check if article is security-related
function isSecurityRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return SECURITY_KEYWORDS.some(keyword => text.includes(keyword));
}

// Determine source type from source name
function determineSourceType(sourceName: string, url: string): SourceType {
  const lowerUrl = url.toLowerCase();
  const lowerName = sourceName.toLowerCase();
  
  // Government sources
  if (lowerUrl.includes('gov.ph') || lowerUrl.includes('pna.gov') || 
      lowerName.includes('ndrrc') || lowerName.includes('pcg') || 
      lowerName.includes('afp') || lowerName.includes('dnd') || 
      lowerName.includes('dfa') || lowerName.includes('dost') ||
      lowerName.includes('pagasa') || lowerName.includes('phivolcs')) {
    return "government";
  }
  
  // GDELT/API source
  if (lowerName.includes('gdelt') || lowerName.includes('api')) {
    return "news_agency";
  }
  
  // Default to news agency
  return "news_agency";
}

// ============================================
// RSS Fetching Functions
// ============================================

// Fetch and parse RSS feed
async function fetchRSSFeed(url: string, sourceName: string): Promise<Partial<Incident>[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PHDefenseMonitor/1.0 (News Aggregator)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`[${sourceName}] Failed to fetch: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRSSXML(xml, sourceName, url);
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log(`[${sourceName}] Request timed out`);
    } else {
      console.log(`[${sourceName}] Error fetching:`, error);
    }
    return [];
  }
}

// Simple XML parser for RSS feeds
function parseRSSXML(xml: string, sourceName: string, sourceUrl: string): Partial<Incident>[] {
  const incidents: Partial<Incident>[] = [];
  
  // Extract items from RSS XML
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/gi;
  const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/gi;
  const linkRegex = /<link>(.*?)<\/link>/gi;
  const dateRegex = /<pubDate>(.*?)<\/pubDate>|<dc:date>(.*?)<\/dc:date>/gi;
  const sourceRegex = /<source[^>]*>(.*?)<\/source>/gi;
  
  let match;
  let itemCount = 0;
  const maxItems = 25; // Limit items per feed
  
  while ((match = itemRegex.exec(xml)) !== null && itemCount < maxItems) {
    const itemXml = match[1];
    
    const titleMatch = titleRegex.exec(itemXml);
    const descMatch = descRegex.exec(itemXml);
    const linkMatch = linkRegex.exec(itemXml);
    const dateMatch = dateRegex.exec(itemXml);
    const sourceMatch = sourceRegex.exec(itemXml);
    
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || "").trim() : "";
    const description = descMatch ? (descMatch[1] || descMatch[2] || "").replace(/<[^>]*>/g, "").trim() : "";
    const link = linkMatch ? linkMatch[1].trim() : "";
    const pubDate = dateMatch ? (dateMatch[1] || dateMatch[2] || "") : "";
    const itemSource = sourceMatch ? sourceMatch[1].trim() : sourceName;
    
    // Skip if no title or not security related
    if (!title || !isSecurityRelated(title, description)) continue;
    
    const { category, confidence } = categorizeArticle(title, description);
    const location = extractLocation(title, description);
    
    incidents.push({
      title,
      summary: description.substring(0, 300) + (description.length > 300 ? "..." : ""),
      source: link,
      sourceType: determineSourceType(itemSource || sourceName, link || sourceUrl),
      category,
      confidence,
      status: "reported" as Status,
      date: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      lat: location?.lat || 12.8797,
      lng: location?.lng || 121.774,
      region: location?.region || "Philippines",
    });
    
    itemCount++;
  }
  
  return incidents;
}

// ============================================
// GDELT API Functions
// ============================================

// Fetch from GDELT API
async function fetchGDELT(): Promise<Partial<Incident>[]> {
  try {
    const gdeltUrl = `${GDELT_CONFIG.masterListUrl}?query=${encodeURIComponent(GDELT_CONFIG.query)}&mode=${GDELT_CONFIG.mode}&format=${GDELT_CONFIG.format}&maxrecords=${GDELT_CONFIG.maxRecords}&sort=${GDELT_CONFIG.sort}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(gdeltUrl, {
      headers: {
        'User-Agent': 'PHDefenseMonitor/1.0',
        'Accept': 'application/rss+xml, application/xml',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`[GDELT] Failed to fetch: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const incidents = parseRSSXML(xml, "GDELT API", gdeltUrl);
    
    console.log(`[GDELT] Fetched ${incidents.length} incidents`);
    return incidents;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log(`[GDELT] Request timed out`);
    } else {
      console.log(`[GDELT] Error fetching:`, error);
    }
    return [];
  }
}

// ============================================
// Main Scraper Function
// ============================================

// Main scraper function - fetches from all sources
export async function scrapeIncidents(): Promise<Incident[]> {
  console.log("===========================================");
  console.log("Starting enhanced news scrape...");
  console.log("Sources: Government RSS, News Agency RSS, GDELT API");
  console.log("===========================================");
  
  const allIncidents: Partial<Incident>[] = [];
  
  // 1. Fetch from Philippine Government RSS feeds
  console.log("\n[1/4] Fetching Government RSS feeds...");
  const govFeeds = Object.entries(GOV_RSS_FEEDS);
  for (const [name, url] of govFeeds) {
    console.log(`  Fetching: ${name}`);
    const incidents = await fetchRSSFeed(url, name.toUpperCase());
    allIncidents.push(...incidents);
  }
  
  // 2. Fetch from International News Agency RSS feeds
  console.log("\n[2/4] Fetching News Agency RSS feeds...");
  const newsFeeds = Object.entries(NEWS_AGENCY_RSS_FEEDS);
  for (const [name, url] of newsFeeds) {
    console.log(`  Fetching: ${name}`);
    const incidents = await fetchRSSFeed(url, name.toUpperCase());
    allIncidents.push(...incidents);
  }
  
  // 3. Fetch from Philippine News RSS feeds
  console.log("\n[3/4] Fetching Philippine News RSS feeds...");
  const phFeeds = Object.entries(PH_NEWS_RSS_FEEDS);
  for (const [name, url] of phFeeds) {
    console.log(`  Fetching: ${name}`);
    const incidents = await fetchRSSFeed(url, name.toUpperCase());
    allIncidents.push(...incidents);
  }
  
  // 4. Fetch from GDELT API
  console.log("\n[4/4] Fetching from GDELT API...");
  const gdeltIncidents = await fetchGDELT();
  allIncidents.push(...gdeltIncidents);
  
  // Deduplicate by title (case-insensitive)
  const seen = new Set<string>();
  const uniqueIncidents = allIncidents.filter(incident => {
    const key = incident.title?.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  // Convert to Incident format and sort by date
  const incidents: Incident[] = uniqueIncidents
    .filter((item): item is Incident => 
      item.title !== undefined && 
      item.summary !== undefined &&
      item.category !== undefined
    )
    .map((item, index) => ({
      id: Date.now() + index,
      title: item.title!,
      summary: item.summary!,
      category: item.category!,
      status: item.status || "reported" as Status,
      confidence: item.confidence!,
      date: item.date!,
      lat: item.lat!,
      lng: item.lng!,
      source: item.source || "",
      sourceType: item.sourceType!,
      region: item.region!,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Filter to last 30 days to keep data fresh
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentIncidents = incidents.filter(i => new Date(i.date) >= thirtyDaysAgo);
  
  console.log("\n===========================================");
  console.log(`Scraping complete!`);
  console.log(`Total unique incidents: ${incidents.length}`);
  console.log(`Recent incidents (last 30 days): ${recentIncidents.length}`);
  console.log("===========================================");
  
  // Return recent incidents, but at least some data if available
  return recentIncidents.length > 0 ? recentIncidents : incidents.slice(0, 50);
}
