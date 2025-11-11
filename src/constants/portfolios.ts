/**
 * Portfolio and team structure constants
 * Teams are named as "{PORTFOLIO} {TEAM_LEAD_NAME}"
 */

export const PORTFOLIOS = ["iLeadServe", "CCL", "PCL", "TFG"] as const;
export type Portfolio = typeof PORTFOLIOS[number];

// Portfolio to teams mapping - Teams are named as "{PORTFOLIO} {TEAM_LEAD_NAME}"
export const PORTFOLIO_TEAMS: Record<string, string[]> = {
  iLeadServe: [],
  CCL: [
    "CCL Cinthia",
    "CCL Rocio",
  ],
  PCL: [
    "PCL Liz",
    "PCL Meghann",
  ],
  TFG: [
    "TFG Berlyn",
    "TFG Nancy",
  ],
};

export function getTeamsForPortfolio(portfolio: string): string[] {
  return PORTFOLIO_TEAMS[portfolio] ?? [];
}

export function getAllTeams(): string[] {
  return Object.values(PORTFOLIO_TEAMS).flat();
}
