const API_BASE_URL = 'http://localhost:3000/api/admin';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to handle API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('admin_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }

    return { data };
  } catch (error) {
    console.error('API request error:', error);
    return { error: 'Network error occurred' };
  }
}

// Dashboard APIs
export const dashboardApi = {
  getStatistics: () => apiRequest('/dashboard'),
};

// Users APIs
export const usersApi = {
  getAll: (params: PaginationParams & { 
    search?: string; 
    membership_type?: string; 
    email_verified?: boolean 
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return apiRequest(`/users?${queryParams}`);
  },
  updateMembership: (id: string, data: { membership_type: string; membership_points?: number }) =>
    apiRequest(`/users/${id}/membership`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Orders APIs
export const ordersApi = {
  getAll: (params: PaginationParams & { 
    status?: string; 
    payment_status?: string; 
    user_id?: string 
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return apiRequest(`/orders?${queryParams}`);
  },
  updateStatus: (id: string, data: { status: string; tracking_number?: string }) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Products APIs
export const productsApi = {
  getAll: (params: PaginationParams & { 
    type?: string; 
    search?: string; 
    brand_id?: string; 
    category_id?: string 
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return apiRequest(`/products?${queryParams}`);
  },
};

// Parts APIs
export const partsApi = {
  create: (data: any) =>
    apiRequest('/parts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Merchandise APIs
export const merchandiseApi = {
  create: (data: any) =>
    apiRequest('/merchandise', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Brands APIs
export const brandsApi = {
  getAll: () => apiRequest('/brands'),
  create: (data: { name: string; description?: string; logo_url?: string }) =>
    apiRequest('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; description?: string; logo_url?: string }) =>
    apiRequest(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/brands/${id}`, {
      method: 'DELETE',
    }),
};

// Categories APIs
export const categoriesApi = {
  getAll: () => apiRequest('/categories'),
  create: (data: { name: string; description?: string; parent_id?: string; image_url?: string }) =>
    apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; description?: string; parent_id?: string; image_url?: string }) =>
    apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Feedback APIs
export const feedbackApi = {
  getAll: (params: PaginationParams & { feedback_type?: string }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return apiRequest(`/feedback?${queryParams}`);
  },
};

// Ambassadors APIs
export const ambassadorsApi = {
  getAll: (params: PaginationParams & { status?: string }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return apiRequest(`/ambassadors?${queryParams}`);
  },
  updateStatus: (id: string, data: { status: string; admin_notes?: string }) =>
    apiRequest(`/ambassadors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
