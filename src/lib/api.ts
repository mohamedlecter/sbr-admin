const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to convert relative image paths to full URLs
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /uploads, use it directly (will be proxied by Vite)
  if (imagePath.startsWith('/uploads')) {
    return imagePath;
  }
  
  // If it starts with /, it's a relative path from the server root
  if (imagePath.startsWith('/')) {
    return imagePath; // Use relative path, will be proxied
  }
  
  // Otherwise, assume it's a relative path
  return `/${imagePath}`;
}

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
    
    // Don't set Content-Type for FormData, let the browser set it with boundary
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle unauthorized/forbidden responses - token is invalid
      if (response.status === 401 || response.status === 403) {
        authApi.logout();
        // Dispatch a custom event to notify the app to redirect to login
        window.dispatchEvent(new CustomEvent('auth:invalid-token'));
      }
      return { error: data.error || 'Request failed' };
    }

    return { data };
  } catch (error) {
    console.error('API request error:', error);
    return { error: 'Network error occurred' };
  }
}

// Auth APIs
export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    is_admin: number;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Login failed' };
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }

      return { data };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error occurred' };
    }
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_token');
  },
  validateToken: async (): Promise<boolean> => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // If token is invalid, clear it
      if (response.status === 401 || response.status === 403) {
        authApi.logout();
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      // On network error, assume token might be valid (don't log out)
      // But return false to be safe
      return false;
    }
  },
};

// Dashboard APIs
export const dashboardApi = {
  getStatistics: () => apiRequest('/admin/dashboard'),
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
    return apiRequest(`/admin/users?${queryParams}`);
  },
  getOne: (id: string) => apiRequest(`/admin/users/${id}`),
  updateMembership: (id: string, data: { membership_type: string; membership_points?: number }) =>
    apiRequest(`/admin/users/${id}/membership`, {
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
    return apiRequest(`/admin/orders?${queryParams}`);
  },
  getOne: (id: string) => apiRequest(`/admin/orders/${id}`),
  updateStatus: (id: string, data: { status: string; tracking_number?: string }) =>
    apiRequest(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Products APIs
export const productsApi = {
  getAll: (params: PaginationParams & { 
    type?: string; 
    search?: string; 
    manufacturer_id?: string; 
    category_id?: string 
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return apiRequest(`/admin/products?${queryParams}`);
  },
};

// Parts APIs
export const partsApi = {
  create: (formData: FormData) =>
    apiRequest('/admin/parts', {
      method: 'POST',
      body: formData,
    }),
  delete: (id: string) =>
    apiRequest(`/admin/parts/${id}`, {
      method: 'DELETE',
    }),
  getOne: (id: string) => apiRequest(`/admin/parts/${id}`),
  update: (id: string, formData: FormData) =>
    apiRequest(`/admin/parts/${id}`, {
      method: 'PUT',
      body: formData,
    }),
};

// Merchandise APIs
export const merchandiseApi = {
  create: (data: any) =>
    apiRequest('/admin/merchandise', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/admin/merchandise/${id}`, {
      method: 'DELETE',
    }),
  getOne: (id: string) => apiRequest(`/admin/merchandise/${id}`),
  update: (id: string, data: any) =>
    apiRequest(`/admin/merchandise/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Manufacturers APIs
export const manufacturersApi = {
  getAll: () => apiRequest('/products/manufacturers'),
  create: (formData: FormData) =>
    apiRequest('/admin/manufacturers', {
      method: 'POST',
      body: formData,
    }),
  update: (id: string, formData: FormData) =>
    apiRequest(`/admin/manufacturers/${id}`, {
      method: 'PUT',
      body: formData,
    }),
  delete: (id: string) =>
    apiRequest(`/admin/manufacturers/${id}`, {
      method: 'DELETE',
    }),
};

// Categories APIs
export const categoriesApi = {
  getAll: () => apiRequest('/products/categories'),
  create: (data: { name: string; description?: string; parent_id?: string; image_url?: string }) =>
    apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; description?: string; parent_id?: string; image_url?: string }) =>
    apiRequest(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/admin/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Models APIs
export const modelsApi = {
  getByMakeName: (makeName: string) => apiRequest(`/products/models/make-name/${encodeURIComponent(makeName)}`),
};

// Feedback APIs
export const feedbackApi = {
  getAll: (params: PaginationParams & { feedback_type?: string }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return apiRequest(`/admin/feedback?${queryParams}`);
  },
};

// Ambassadors APIs
export const ambassadorsApi = {
  getAll: (params: PaginationParams & { status?: string }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return apiRequest(`/admin/ambassadors?${queryParams}`);
  },
  updateStatus: (id: string, data: { status: string; admin_notes?: string }) =>
    apiRequest(`/admin/ambassadors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Partners APIs
export const partnersApi = {
  getAll: () => apiRequest('/admin/partners'),
  getById: (id: string) => apiRequest(`/admin/partners/${id}`),
  create: (formData: FormData) =>
    apiRequest('/admin/partners', {
      method: 'POST',
      body: formData,
    }),
  update: (id: string, formData: FormData) =>
    apiRequest(`/admin/partners/${id}`, {
      method: 'PUT',
      body: formData,
    }),
  delete: (id: string) =>
    apiRequest(`/admin/partners/${id}`, {
      method: 'DELETE',
    }),
};
