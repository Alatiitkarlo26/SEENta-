/**
 * Item & Notification Service for SEENta
 * Connects to the Express backend and Supabase Cloud database
 * Manages Found Item Posts (FR-SEEN-0003), Lost Item Reports (FR-SEEN-0002),
 * and Automated Matching Notifications (SYS-SEEN-0002).
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const itemService = {
  // =========================================================================
  // FOUND ITEM POSTS (FR-SEEN-0003, UC-003)
  // =========================================================================
  async getFoundPosts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.finderId) params.append('finderId', filters.finderId);

    const res = await fetch(`${API_URL}/items/found?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch found item posts');
    return data.items || [];
  },

  async getFoundPostById(id) {
    const res = await fetch(`${API_URL}/items/found/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch post details');
    return data.item;
  },

  async createFoundPost(postData, photoUrls = []) {
    const res = await fetch(`${API_URL}/items/found`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...postData, photoUrls })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create found item post');
    return data.item;
  },

  // =========================================================================
  // LOST ITEM REPORTS (FR-SEEN-0002, UC-002)
  // =========================================================================
  async getLostReports(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.userId) params.append('userId', filters.userId);

    const res = await fetch(`${API_URL}/items/lost?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch lost reports');
    return data.items || [];
  },

  async getLostReportById(id) {
    const res = await fetch(`${API_URL}/items/lost/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch lost report details');
    return data.item;
  },

  async createLostReport(reportData) {
    const res = await fetch(`${API_URL}/items/lost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to file lost item report');
    return data.item;
  },

  // =========================================================================
  // NOTIFICATIONS (SYS-SEEN-0002)
  // =========================================================================
  async getNotifications(userId) {
    if (!userId) return [];
    const res = await fetch(`${API_URL}/notifications?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
    return data.notifications || [];
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update notification status');
    return data.notification;
  },

  async markAllNotificationsRead(userId) {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update notifications');
    return data;
  }
};
