/**
 * API service layer
 * Unified management of backend API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Token is now initialized lazily to be SSR-safe
  }

  // To be called from a client component
  initializeTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // General request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (!this.token && typeof window !== 'undefined') {
        this.initializeTokenFromStorage();
    }

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      if (!response.ok || data.error) {
        const errorMessage = data.error || data.message || `Request failed (${response.status})`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // --- AUTH ---
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any; }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(userData: any) {
     const response = await this.request<{ token: string; user: any; }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(response.token);
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // --- USERS ---
  async getCurrentUser() {
    return this.request<{ user: any; }>('/api/users/me');
  }

  async updateUserProfile(userData: any) {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getDiscoverUsers() {
    return this.request<{ users: any[]; }>('/api/users/discover');
  }

  async getUserById(userId: string) {
    return this.request<{ user: any; }>(`/api/users/${userId}`);
  }

  // --- MATCHES ---
  async likeUser(userId: string) {
    return this.request(`/api/matches/like/${userId}`, { method: 'POST' });
  }

  async superlikeUser(userId: string) {
    return this.request(`/api/matches/superlike/${userId}`, { method: 'POST' });
  }

  async skipUser(userId: string) {
    return this.request(`/api/matches/skip/${userId}`, { method: 'POST' });
  }

  async unlikeUser(userId: string) {
    return this.request(`/api/matches/unlike/${userId}`, { method: 'POST' });
  }

  async getMatches() {
    return this.request<{ matches: any[]; }>('/api/matches/list');
  }

  async getRecentMatches(limit: number = 5) {
    return this.request<{ matches: any[] }>(`/api/matches/recent?limit=${limit}`);
  }

  async getLikes() {
    return this.request<{ likes: any[] }>('/api/matches/my-likes');
  }

  async getUserActions(targetId?: string) {
    const params = targetId ? `?target_id=${targetId}` : '';
    return this.request<{ favorites: any[]; likedUsers: any[] }>(`/api/matches/user-actions${params}`);
  }

  async favoriteUser(userId: string) {
    return this.request(`/api/matches/favorite/${userId}`, { method: 'POST' });
  }

  async unfavoriteUser(userId: string) {
    return this.request(`/api/matches/favorite/${userId}`, { method: 'DELETE' });
  }

  async getFavorites() {
    return this.request<{ favorites: any[] }>('/api/matches/favorites');
  }

  async undoLastAction() {
    return this.request('/api/matches/undo', { method: 'POST' });
  }

  // --- MESSAGES ---
  async getChatRooms(otherUserId?: string) {
    let endpoint = '/api/messages/rooms';
    if (otherUserId) {
      endpoint += `?userId=${otherUserId}`;
    }
    return this.request<{ rooms: any[] }>(endpoint);
  }

  async getMessages(roomId: string) {
    return this.request<{ messages: any[] }>(`/api/messages/room/${roomId}/messages`);
  }

  async sendMessage(roomId: string, content: string, type: 'text' | 'emoji' | 'image' = 'text', imageUrl?: string) {
    return this.request(`/api/messages/room/${roomId}/send`, {
      method: 'POST',
      body: JSON.stringify({ content, type, image_url: imageUrl }),
    });
  }

  async sendImageMessage(roomId: string, imageFile: File) {
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
    const uploadResponse = await this.uploadChatImage(base64String, imageFile.type, imageFile.name);
    return this.sendMessage(roomId, `[图片]`, 'image', uploadResponse.imageUrl);
  }

  async uploadChatImage(photoData: string, contentType: string, fileName?: string) {
    return this.request<{ imageUrl: string; }>(`/api/messages/upload-image`, {
      method: 'POST',
      body: JSON.stringify({ photoData, contentType, fileName }),
    });
  }

  // --- MOMENTS ---
  async createMoment(momentData: any) {
    return this.request('/api/moments/create', {
      method: 'POST',
      body: JSON.stringify(momentData),
    });
  }

  async getMoments(limit: number = 20, offset: number = 0) {
    return this.request<{ moments: any[] }>(`/api/moments/list?limit=${limit}&offset=${offset}`);
  }

  async likeMoment(momentId: string) {
    return this.request(`/api/moments/${momentId}/like`, { method: 'POST' });
  }

  async unlikeMoment(momentId: string) {
    return this.request(`/api/moments/${momentId}/like`, { method: 'DELETE' });
  }

  async deleteMoment(momentId: string) {
    return this.request(`/api/moments/${momentId}`, { method: 'DELETE' });
  }

  async getMomentComments(momentId: string) {
    return this.request<{ comments: any[] }>(`/api/comments/moment/${momentId}`);
  }

  async createMomentComment(momentId: string, content: string, parentCommentId: string | null = null) {
    return this.request(`/api/comments/moment/${momentId}`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_comment_id: parentCommentId }),
    });
  }

  async deleteMomentComment(commentId: string) {
    return this.request(`/api/comments/${commentId}`, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export default ApiService;
