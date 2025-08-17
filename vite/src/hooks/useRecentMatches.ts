import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface RecentMatch {
  id: string;
  user: {
    id: string;
    name: string;
    photos: string[];
    age: number;
    is_verified: boolean;
  };
  matched_at: string;
  is_new: boolean;
}

interface UseRecentMatchesReturn {
  matches: RecentMatch[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRecentMatches = (limit: number = 5): UseRecentMatchesReturn => {
  const [matches, setMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRecentMatches(limit);
      setMatches(response.matches);
    } catch (err) {
      console.error('Failed to fetch recent matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recent matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [limit]);

  // 在组件重新挂载时重新获取数据（路由切换场景）
  useEffect(() => {
    // 延迟执行，确保组件完全挂载
    const timer = setTimeout(() => {
      if (matches.length === 0) {
        fetchMatches();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []); // 空依赖数组，只在组件挂载时执行一次

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches
  };
};