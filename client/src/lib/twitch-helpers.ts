/**
 * Helper utilities for interacting with Twitch API and functionality
 */

export interface TwitchCredentials {
  type: 'cookie' | 'oauth';
  value: string;
}

export interface TwitchChannelInfo {
  id: string;
  name: string;
  displayName: string;
  profileImage: string;
  isLive: boolean;
}

export interface TwitchPrediction {
  id: string;
  title: string;
  outcomes: {
    id: string;
    title: string;
    color: string;
    totalPoints: number;
    totalUsers: number;
  }[];
  status: 'ACTIVE' | 'LOCKED' | 'RESOLVED' | 'CANCELED';
  createdAt: string;
  lockedAt?: string;
  endedAt?: string;
}

/**
 * Validates Twitch authentication credentials
 * This is a helper that would typically call Twitch API
 * For the demo app, we just return true
 */
export async function validateTwitchCredentials(credentials: TwitchCredentials): Promise<boolean> {
  // In a real implementation, this would validate the credentials with Twitch
  console.log("Validating Twitch credentials:", credentials.type);
  return true;
}

/**
 * Determines the best prediction outcome based on a strategy
 */
export function determineBestPredictionOutcome(
  prediction: TwitchPrediction,
  strategy: 'random' | 'majority' | 'percentage' | 'custom',
  favorableOddsOnly: boolean = false
): string | null {
  if (!prediction || !prediction.outcomes || prediction.outcomes.length === 0) {
    return null;
  }

  switch (strategy) {
    case 'random':
      // Choose randomly
      const randomIndex = Math.floor(Math.random() * prediction.outcomes.length);
      return prediction.outcomes[randomIndex].id;

    case 'majority':
      // Follow the crowd (most users)
      const mostUsers = prediction.outcomes.reduce((prev, current) => 
        (prev.totalUsers > current.totalUsers) ? prev : current);
      return mostUsers.id;

    case 'percentage':
      // Choose based on odds
      const totalPoints = prediction.outcomes.reduce((sum, outcome) => 
        sum + outcome.totalPoints, 0);
      
      // Calculate odds for each outcome
      const oddsWithId = prediction.outcomes.map(outcome => ({
        id: outcome.id,
        odds: totalPoints > 0 ? outcome.totalPoints / totalPoints : 0
      }));
      
      // Sort by odds (ascending - lower odds = higher payout)
      oddsWithId.sort((a, b) => a.odds - b.odds);
      
      // If we only want favorable odds and the best odds are still >50%, skip this prediction
      if (favorableOddsOnly && oddsWithId[0].odds > 0.5) {
        return null;
      }
      
      return oddsWithId[0].id;

    case 'custom':
      // In a real implementation, this could be a more sophisticated algorithm
      // For now, we'll just pick the outcome with the highest potential return (lowest odds)
      const bestReturn = prediction.outcomes.reduce((prev, current) => 
        (prev.totalPoints < current.totalPoints) ? prev : current);
      return bestReturn.id;
        
    default:
      return null;
  }
}

/**
 * Calculate potential winnings from a prediction
 */
export function calculatePotentialWinnings(
  prediction: TwitchPrediction,
  outcomeId: string,
  betAmount: number
): number {
  const outcome = prediction.outcomes.find(o => o.id === outcomeId);
  if (!outcome) return 0;
  
  const totalPoints = prediction.outcomes.reduce((sum, o) => 
    sum + o.totalPoints, 0);
  
  const otherPoints = totalPoints - outcome.totalPoints;
  
  // Simple calculation of potential return
  // In reality, Twitch uses a more complex formula
  const potentialReturn = (otherPoints / (outcome.totalPoints + betAmount)) * betAmount;
  
  return Math.floor(potentialReturn + betAmount);
}

/**
 * Parse Twitch auth token from cookie or OAuth
 * (Simplified version for demo purposes)
 */
export function parseTwitchAuthToken(credentials: TwitchCredentials): string {
  if (credentials.type === 'oauth') {
    return credentials.value.trim();
  } else {
    // Extract auth token from cookie (this is a simplified example)
    const authMatch = credentials.value.match(/auth-token=([^;]+)/);
    return authMatch ? authMatch[1] : '';
  }
}
