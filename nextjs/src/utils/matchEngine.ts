import { User } from '@/context/AppContext';

export interface MatchCriteria {
  ageRange: [number, number];
  maxDistance: number;
  interests: string[];
  gender: string;
  interestedIn: string;
  location: string;
}

export interface MatchScore {
  userId: string;
  score: number;
  reasons: string[];
  compatibility: 'low' | 'medium' | 'high' | 'excellent';
}

export class MatchEngine {
  private static readonly INTEREST_WEIGHT = 0.3;
  private static readonly AGE_WEIGHT = 0.2;
  private static readonly DISTANCE_WEIGHT = 0.25;
  private static readonly VERIFICATION_WEIGHT = 0.15;
  private static readonly ACTIVITY_WEIGHT = 0.1;

  static calculateMatchScore(
    currentUser: User,
    potentialMatch: User,
    criteria: MatchCriteria
  ): MatchScore {
    let score = 0;
    const reasons: string[] = [];

    // Interest compatibility
    const commonInterests = currentUser.interests.filter(interest =>
      potentialMatch.interests.includes(interest)
    );
    const interestScore = commonInterests.length / Math.max(currentUser.interests.length, 1);
    score += interestScore * this.INTEREST_WEIGHT * 100;

    if (commonInterests.length >= 3) {
      reasons.push(`${commonInterests.length} shared interests`);
    }

    // Age compatibility
    const ageDiff = Math.abs(currentUser.age - potentialMatch.age);
    const [minAge, maxAge] = criteria.ageRange;

    if (potentialMatch.age >= minAge && potentialMatch.age <= maxAge) {
      const ageScore = 1 - (ageDiff / 20); // Max 20 years difference
      score += ageScore * this.AGE_WEIGHT * 100;

      if (ageDiff <= 2) {
        reasons.push('Similar age');
      }
    }

    // Distance compatibility (simplified - using location string)
    const distanceScore = this.calculateDistanceScore(currentUser.location, potentialMatch.location, criteria.maxDistance);
    score += distanceScore * this.DISTANCE_WEIGHT * 100;

    if (distanceScore > 0.8) {
      reasons.push('Very close by');
    }

    // Verification bonus
    if (potentialMatch.isVerified) {
      score += this.VERIFICATION_WEIGHT * 100;
      reasons.push('Verified profile');
    }

    // Activity bonus (if online)
    if (potentialMatch.isOnline) {
      score += this.ACTIVITY_WEIGHT * 100;
      reasons.push('Recently active');
    }

    // Additional compatibility factors
    if (commonInterests.length >= 5) {
      reasons.push('High interest compatibility');
    }

    if (ageDiff === 0) {
      reasons.push('Same age');
    }

    const compatibility = this.getCompatibilityLevel(score);

    return {
      userId: potentialMatch.id,
      score: Math.round(score),
      reasons,
      compatibility
    };
  }

  private static calculateDistanceScore(
    userLocation: string,
    matchLocation: string,
    maxDistance: number
  ): number {
    // Simplified distance calculation
    // In a real app, this would use actual coordinates and distance formulas
    if (userLocation === matchLocation) return 1.0;

    // Extract distance from location string if available
    const userDistance = this.extractDistance(userLocation);
    const matchDistance = this.extractDistance(matchLocation);

    if (userDistance !== null && matchDistance !== null) {
      const distance = Math.abs(userDistance - matchDistance);
      return Math.max(0, 1 - (distance / maxDistance));
    }

    // Default score based on location similarity
    return 0.7;
  }

  private static extractDistance(location: string): number | null {
    const match = location.match(/(\d+)\s*miles?\s*away/);
    return match ? parseInt(match[1]) : null;
  }

  private static getCompatibilityLevel(score: number): 'low' | 'medium' | 'high' | 'excellent' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  static getRecommendedUsers(
    currentUser: User,
    allUsers: User[],
    criteria: MatchCriteria,
    limit: number = 10
  ): Array<User & { matchScore?: MatchScore }> {
    const usersWithScores = allUsers
      .filter(user => user.id !== currentUser.id)
      .map(user => ({
        ...user,
        matchScore: this.calculateMatchScore(currentUser, user, criteria)
      }))
      .sort((a, b) => (b.matchScore?.score || 0) - (a.matchScore?.score || 0))
      .slice(0, limit);

    return usersWithScores;
  }

  static getFilteredUsers(
    users: User[],
    criteria: MatchCriteria
  ): User[] {
    return users.filter(user => {
      // Age filter
      const [minAge, maxAge] = criteria.ageRange;
      if (user.age < minAge || user.age > maxAge) return false;

      // Interest filter (at least one common interest)
      const hasCommonInterest = criteria.interests.some(interest =>
        user.interests.includes(interest)
      );
      if (criteria.interests.length > 0 && !hasCommonInterest) return false;

      // Distance filter (simplified)
      const userDistance = this.extractDistance(user.location);
      const maxUserDistance = criteria.maxDistance;
      if (userDistance !== null && userDistance > maxUserDistance) return false;

      return true;
    });
  }

  static getDefaultCriteria(): MatchCriteria {
    return {
      ageRange: [18, 35],
      maxDistance: 50,
      interests: [],
      gender: '',
      interestedIn: 'everyone',
      location: ''
    };
  }
}
