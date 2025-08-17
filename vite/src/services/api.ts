/**
 * API service layer
 * Unified management of backend API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

class ApiService {
  private token: string | null = null;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5000; // 5秒缓存

  constructor() {
    // Get token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // 清除所有缓存
  clearCache() {
    console.log('🧹 Clearing all API cache');
    this.requestCache.clear();
  }

  // 清除特定路径的缓存
  clearCacheForEndpoint(endpoint: string) {
    console.log('🧹 Clearing cache for:', endpoint);
    const keysToDelete = [];
    for (const [key] of this.requestCache.entries()) {
      if (key.includes(endpoint)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.requestCache.delete(key));
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    this.clearCache(); // 登出时清除所有缓存
  }

  // General request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;
    
    // 检查缓存
    if (useCache && options.method === 'GET') {
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('🎯 Returning cached response for:', cacheKey);
        return cached.data;
      }
    }
    
    // 检查是否有相同的请求正在进行中
    if (this.pendingRequests.has(cacheKey)) {
      console.log('🔄 Returning pending request for:', cacheKey);
      return this.pendingRequests.get(cacheKey);
    }

    // 创建新请求
    const requestPromise = this.makeRequest<T>(url, options);
    
    // 存储在 pending requests
    this.pendingRequests.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      
      // 缓存 GET 请求结果
      if (useCache && options.method === 'GET') {
        this.requestCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } finally {
      // 清理 pending requests 和过期缓存
      this.pendingRequests.delete(cacheKey);
      this.cleanExpiredCache();
    }
  }

  // 清理过期缓存
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.requestCache.delete(key);
      }
    }
  }

  // Make the actual request
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication header
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    // Detailed logging for debugging
    console.log('🚀 API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body,
      bodyType: typeof config.body,
      bodyLength: config.body ? config.body.length : 0
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📡 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Handle 401 Unauthorized - session expired
      if (response.status === 401) {
        console.error('Session expired or unauthorized');
        this.clearToken();
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }
      
      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        console.log('📄 Raw Response Text:', responseText);
        
        if (responseText.trim()) {
          data = JSON.parse(responseText);
          console.log('📋 Parsed Response Data:', data);
        } else {
          console.warn('⚠️ Empty response body');
          data = {};
        }
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        console.error('Response that failed to parse:', await response.clone().text());
        throw new Error('Server response format error');
      }

      // Check HTTP status code and error info in response
      if (!response.ok || data.error || data.code) {
        const errorMessage = data.error || data.message || `Request failed (${response.status})`;
        console.error('API Error:', { status: response.status, data });
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication related APIs
  async login(email: string, password: string) {
    // Use JSON format for login request
    const loginData = {
      email,
      password
    };
    
    console.log('🔧 Logging in with JSON format:', {
      loginData,
      contentType: 'application/json'
    });
    
    const response = await this.request<{
      message: string;
      token: string;
      user: any;
    }>('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    this.setToken(response.token);
    this.clearCache(); // 登录时清除所有缓存，确保数据新鲜
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender?: string;
    bio?: string;
    location?: string;
    interests?: string[];
    // 新增字段
    occupation?: string;
    education?: string;
    zodiac_sign?: string;
    photos?: string[];
    interested_in?: string;
    age_min?: number;
    age_max?: number;
    date_of_birth?: string;
  }) {
    // Use JSON format for register request
    console.log('🔧 Registering with JSON format:', {
      userData,
      contentType: 'application/json'
    });
    
    const response = await this.request<{
      message: string;
      token: string;
      user: any;
    }>('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    this.setToken(response.token);
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearToken();
    }
  }

  // User related APIs
  async getCurrentUser() {
    return this.request<{
      user: any;
    }>('/api/users/me', {}, false); // 禁用缓存，确保获取最新用户数据
  }
  
  // Photo related APIs
  async uploadPhoto(photoData: string, contentType: string = 'image/jpeg', fileName?: string) {
    return this.request<{
      success: boolean;
      photoUrl: string;
      fileName: string;
    }>('/api/photos/upload', {
      method: 'POST',
      body: JSON.stringify({ photo: photoData, contentType, fileName }),
    });
  }
  
  async getUserPhotos(userId: string) {
    return this.request<{
      photos: Array<{
        id: string;
        photo_url: string;
        created_at: string;
      }>;
    }>(`/api/photos/user/${userId}`);
  }
  
  async deletePhoto(photoId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  // Moment图片上传API - 独立于用户个人照片
  async uploadMomentImage(photoData: string, contentType: string = 'image/jpeg', fileName?: string) {
    return this.request<{
      success: boolean;
      photoUrl: string;
      fileName: string;
    }>('/api/moments/upload-image', {
      method: 'POST',
      body: JSON.stringify({ photo: photoData, contentType, fileName }),
    });
  }

  // 聊天图片上传API - 独立于用户个人照片和Moment图片
  async uploadChatImage(photoData: string, contentType: string = 'image/jpeg', fileName?: string) {
    return this.request<{
      success: boolean;
      imageUrl: string;
      filePath: string;
    }>('/api/messages/upload-image', {
      method: 'POST',
      body: JSON.stringify({ photoData, contentType, fileName }),
    });
  }

  async updateUserProfile(userData: {
    name?: string;
    bio?: string;
    location?: string;
    occupation?: string;
    education?: string;
    zodiac_sign?: string;
    gender?: string;
    birthday?: string;
    interests?: string[];
    photos?: string[];
  }) {
    const response = await this.request<{
      message: string;
      user: any;
    }>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    // 用户资料更新后清除用户相关缓存
    this.clearCacheForEndpoint('/api/users/me');
    return response;
  }

  async getDiscoverUsers() {
    return this.request<{
      users: any[];
      preferences: any;
    }>('/api/users/discover', {}, true); // 启用缓存
  }

  async getUserById(userId: string) {
    return this.request<{
      user: any;
    }>(`/api/users/${userId}`);
  }

  async updateUserPreferences(preferences: {
    age_min?: number;
    age_max?: number;
    interested_in?: 'men' | 'women' | 'everyone';
    interests?: string[];
  }) {
    return this.request<{
      message: string;
      preferences: any;
    }>('/api/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Match related APIs
  async likeUser(userId: string) {
    return this.request<{
      message: string;
      is_match: boolean;
      match_score: number;
      compatibility: string;
      reasons: string[];
    }>(`/api/matches/like/${userId}`, {
      method: 'POST',
    });
  }

  async superlikeUser(userId: string) {
    return this.request<{
      message: string;
      is_match: boolean;
      match_score: number;
      compatibility: string;
      reasons: string[];
    }>(`/api/matches/superlike/${userId}`, {
      method: 'POST',
    });
  }

  async skipUser(userId: string) {
    return this.request<{
      message: string;
    }>(`/api/matches/skip/${userId}`, {
      method: 'POST',
    });
  }

  async unlikeUser(userId: string) {
    return this.request<{
      message: string;
    }>(`/api/matches/unlike/${userId}`, {
      method: 'POST',
    });
  }

  async getMatches() {
    return this.request<{
      matches: any[];
    }>('/api/matches/list');
  }

  async getRecentMatches(limit: number = 5) {
    return this.request<{
      matches: Array<{
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
      }>;
    }>(`/api/matches/recent?limit=${limit}`);
  }

  async getLikes() {
    return this.request<{
      likes: any[];
    }>('/api/matches/my-likes');
  }

  // 获取用户操作状态（收藏和喜欢）
  async getUserActions(targetId?: string) {
    const params = targetId ? `?target_id=${targetId}` : '';
    return this.request<{
      favorites: any[];
      likedUsers: any[];
    }>(`/api/matches/user-actions${params}`);
  }

  // 收藏功能
  async favoriteUser(userId: string) {
    return this.request<{
      message: string;
    }>(`/api/matches/favorite/${userId}`, {
      method: 'POST',
    });
  }

  async unfavoriteUser(userId: string) {
    return this.request<{
      message: string;
    }>(`/api/matches/favorite/${userId}`, {
      method: 'DELETE',
    });
  }

  async getFavorites() {
    return this.request<{
      favorites: any[];
    }>('/api/matches/favorites');
  }

  // 撤销操作
  async undoLastAction() {
    return this.request<{
      message: string;
      undone_action: {
        type: string;
        target_user_id: string;
        created_at: string;
      };
    }>('/api/matches/undo', {
      method: 'POST',
    });
  }

  // Message related APIs
  async getChatRooms(otherUserId?: string) {
    let endpoint = '/api/messages/rooms';
    if (otherUserId) {
      const params = new URLSearchParams({ userId: otherUserId });
      endpoint += `?${params}`;
    }
    return this.request<{
      rooms: any[];
    }>(endpoint);
  }

  async getMessages(roomId: string) {
    return this.request<{
      messages: any[];
    }>(`/api/messages/room/${roomId}/messages`);
  }

  async sendMessage(roomId: string, content: string, type: 'text' | 'emoji' | 'image' = 'text', imageUrl?: string) {
    // Use JSON format for message sending
    const messageData = {
      content,
      type,
      ...(imageUrl && { image_url: imageUrl })
    };
    
    console.log('🔧 Sending message with JSON format:', {
      roomId,
      messageData,
      contentType: 'application/json'
    });
    
    return this.request<{
      message: string;
      data: any;
    }>(`/api/messages/room/${roomId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
  }

  async sendImageMessage(roomId: string, imageFile: File) {
    try {
      // 验证文件类型
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('只能上传图片文件');
      }

      // 验证文件大小 (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        throw new Error('图片文件大小不能超过5MB');
      }

      // 转换为base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      // 上传聊天图片（使用独立的聊天图片上传接口）
      const uploadResponse = await this.uploadChatImage(base64String, imageFile.type, imageFile.name);
      if (!uploadResponse.success || !uploadResponse.imageUrl) {
        throw new Error('图片上传失败');
      }

      // 发送图片消息
      return await this.sendMessage(roomId, `[图片]`, 'image', uploadResponse.imageUrl);
    } catch (error) {
      console.error('发送图片消息失败:', error);
      throw error;
    }
  }

  async createChatRoom(userId: string) {
    return this.request<{
      room_id: string;
      message: string;
    }>(`/api/messages/room/user/${userId}`, {
      method: 'POST',
    });
  }

  async deleteMessage(messageId: string) {
    return this.request<{
      message: string;
    }>(`/api/messages/message/${messageId}`, {
      method: 'DELETE',
    });
  }

  async searchMessages(query: string, userId?: string) {
    const params = new URLSearchParams({ q: query });
    if (userId) params.append('userId', userId);
    
    return this.request<{
      messages: any[];
      query: string;
      total: number;
    }>(`/api/messages/search?${params}`);
  }

  // Moment related APIs
  async createMoment(momentData: {
    content: string;
    images?: string[];
    location?: string;
    hashtags?: string[];
    audience?: 'public' | 'friends' | 'private';
  }) {
    return this.request<{
      message: string;
      data: any;
    }>('/api/moments/create', {
      method: 'POST',
      body: JSON.stringify(momentData),
    });
  }

  async getMoments(limit: number = 20, offset: number = 0, userId?: string) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (userId) params.append('userId');
    
    return this.request<{
      moments: any[];
      pagination: {
        limit: number;
        offset: number;
        total: number;
        has_more: boolean;
      };
    }>(`/api/moments/list?${params}`, {}, true); // 启用缓存
  }

  async likeMoment(momentId: string) {
    return this.request<{
      message: string;
      liked: boolean;
    }>(`/api/moments/${momentId}/like`, {
      method: 'POST',
    });
  }

  async unlikeMoment(momentId: string) {
    return this.request<{
      message: string;
      liked: boolean;
    }>(`/api/moments/${momentId}/like`, {
      method: 'DELETE',
    });
  }

  async getMomentDetails(momentId: string) {
    return this.request<{
      moment: any;
    }>(`/api/moments/${momentId}`);
  }

  async deleteMoment(momentId: string) {
    return this.request<{
      message: string;
    }>(`/api/moments/${momentId}`, {
      method: 'DELETE',
    });
  }

  // Moment Comment related APIs
  async getMomentComments(momentId: string) {
    return this.request<{ comments: any[] }>(`/api/comments/moment/${momentId}`);
  }

  async createMomentComment(momentId: string, content: string, parentCommentId: string | null = null) {
    // Use JSON format for comment creation
    const commentData = {
      content,
      parent_comment_id: parentCommentId
    };
    
    console.log('🔧 Creating comment with JSON format:', {
      momentId,
      commentData,
      contentType: 'application/json'
    });
    
    return this.request<{ message: string; comment: any }>(`/api/comments/moment/${momentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });
  }

  // Helper method to validate JSON
  private isValidJson(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 删除动态评论 - API服务层
   * @param commentId - 评论ID
   */
  async deleteMomentComment(commentId: string) {
    // 调试日志：API服务层参数检查
    console.log('API Service deleteMomentComment called with commentId:', commentId);
    console.log('commentId type:', typeof commentId, 'value:', JSON.stringify(commentId));
    
    // 简化参数验证
    if (!commentId || commentId === 'undefined' || commentId === 'null') {
      console.error('API Service: Invalid commentId:', commentId);
      throw new Error('Invalid comment ID provided to API service');
    }
    
    const endpoint = `/api/comments/${commentId}`;
    console.log('API Service: Making DELETE request to:', endpoint);
    
    return this.request<{ message: string }>(endpoint, {
      method: 'DELETE',
    });
  }

  async getUserMoments(userId: string, limit: number = 20, offset: number = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    return this.request<{
      moments: any[];
      user: any;
      pagination: {
        limit: number;
        offset: number;
        total: number;
        has_more: boolean;
      };
    }>(`/api/moments/user/${userId}/list?${params}`);
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      timestamp: string;
      environment: string;
      version: string;
      database: string;
    }>('/api/health');
  }

  // Database initialization
  async initializeDatabase() {
    return this.request<{
      message: string;
      status: string;
    }>('/api/db/init', {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default ApiService;