export interface RiskCategory {
  name: string;
  score: number;
  description: string;
}

export interface ParsedReport {
  entity: string;
  date: string;
  overallScore: number | null;
  creditRating: string;
  equityType: "Public" | "Private" | "Unknown";
  riskDecomposition: RiskCategory[];
  rawMarkdown: string; // Modified markdown without the extracted headers
}

export function parseReportText(text: string): ParsedReport {
  let entity = "Unknown Entity";
  let date = "Unknown Date";
  let overallScore: number | null = null;
  let creditRating = "N/A";
  let equityType: "Public" | "Private" | "Unknown" = "Unknown";
  const riskDecomposition: RiskCategory[] = [];
  
  // Clean up excessive equal signs and hyphens from the start
  let cleanText = text.replace(/={10,}\s*INTEGRATED RISK ASSESSMENT REPORT\s+/gi, "");

  // Extract Entity, Date, Score, Rating
  const headerRegex = /ENTITY:\s*(.*?)\s*DATE:\s*(.*?)\s*OVERALL RISK SCORE:\s*(\d+)(?:\/100)?\s*INTERNAL CREDIT RATING:\s*(.*?)(?=\n|$)/i;
  const headerMatch = cleanText.match(headerRegex);
  
  if (headerMatch) {
    entity = headerMatch[1].trim();
    date = headerMatch[2].trim();
    overallScore = parseInt(headerMatch[3].trim(), 10);
    creditRating = headerMatch[4].trim();
    
    // Attempt to guess equity type from entity name/ticker
    if (entity.match(/\([A-Z]+\)/)) {
        equityType = "Public";
    } else {
        equityType = "Private";
    }

    // Remove the matched header from text
    cleanText = cleanText.replace(headerRegex, "").trim();
  } else {
    // Try fallback regexes if the format is slightly different
    const entityMatch = cleanText.match(/ENTITY:\s*(.*?)(?=\s*DATE:|\n|$)/i);
    if (entityMatch) entity = entityMatch[1].trim();

    const scoreMatch = cleanText.match(/OVERALL RISK SCORE:\s*(\d+)/i);
    if (scoreMatch) overallScore = parseInt(scoreMatch[1].trim(), 10);
    
    const ratingMatch = cleanText.match(/INTERNAL CREDIT RATING:\s*(.*?)(?=\n|$)/i);
    if (ratingMatch) creditRating = ratingMatch[1].trim();
  }

  // Extract Risk Decomposition
  const decompStart = cleanText.indexOf("RISK DECOMPOSITION");
  if (decompStart !== -1) {
    // Look for the next section divider to stop parsing categories
    const nextSectionRegex = /-{5,}\s*[A-Z\s]+-{5,}/g;
    nextSectionRegex.lastIndex = decompStart + 20; // Start looking after "RISK DECOMPOSITION"
    const nextSectionMatch = nextSectionRegex.exec(cleanText);
    const decompEnd = nextSectionMatch ? nextSectionMatch.index : cleanText.length;
    
    const decompBlock = cleanText.substring(decompStart, decompEnd);
    
    // Parse categories like "Geopolitical Risk: 75/100 — High exposure..."
    const categoryRegex = /([A-Za-z\s\/]+):\s*(\d+)(?:\/100)?\s*(?:—|-|–)\s*(.*?)(?=\n[A-Za-z\s\/]+:|$)/gs;
    let match;
    while ((match = categoryRegex.exec(decompBlock)) !== null) {
        if (!match[1].toLowerCase().includes("risk decomposition")) {
            riskDecomposition.push({
                name: match[1].trim(),
                score: parseInt(match[2].trim(), 10),
                description: match[3].trim().replace(/\n/g, " "),
            });
        }
    }
  }

  // Clean the markdown for display: 
  // Replace `------------ SECTION ------------` with `## SECTION`
  let displayMarkdown = cleanText.replace(/-{5,}\s*(.*?)\s*-{5,}/g, "## $1");
  // Replace `======...` with `#`
  displayMarkdown = displayMarkdown.replace(/={5,}\n(.*)/g, "# $1");

  return {
    entity,
    date,
    overallScore,
    creditRating,
    equityType,
    riskDecomposition,
    rawMarkdown: displayMarkdown,
  };
}
