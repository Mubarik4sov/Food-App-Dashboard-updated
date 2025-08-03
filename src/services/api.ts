const API_BASE_URL = 'https://groceryapp-production-d3fc.up.railway.app/api';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
    };
  } | null;
}

export interface SignupRequest {
  role_name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email_address: string;
  street_address1: string;
  street_address2?: string;
  city: string;
  state: string;
  zip_code: string;
  description?: string;
  restaurant_name?: string;
  agreement_docs?: string;
  password: string;
}

export interface SignupResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    message: string;
    user: {
      id: number;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
    };
  } | null;
}

export interface RequestOTPRequest {
  email: string;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
    };
  } | null;
}

export interface ForgotPasswordRequest {
  email: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface GetUsersRequest {
  role?: string;
  user_id?: number;
}

export interface GetUsersResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    id: number;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    street_address1?: string;
    street_address2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    description?: string;
    restaurant_name?: string;
    created_at: string;
    updated_at: string;
  }[] | null;
}

export interface CreateCategoryRequest {
  id?: number;
  categoryName: string;
  isSubCategory: boolean;
  longDescription?: string;
  shortDescription?: string;
  coverImage?: string;
  parentCategoryIds?: number[];
}

export interface CreateCategoryResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    id: number;
    categoryName: string;
    isSubCategory: boolean;
    longDescription?: string;
    shortDescription?: string;
    coverImage?: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface DeleteCategoryRequest {
  categoryId: number;
  parentCategoryId?: number;
}

export interface CategoryResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    id: number;
    categoryName: string;
    isSubCategory: boolean;
    longDescription?: string;
    shortDescription?: string;
    coverImage?: string;
    parentCategories?: any[];
    subCategories?: any[];
    created_at: string;
    updated_at: string;
  }[] | null;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const contentType = response.headers.get('content-type');
      let responseData: any;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = { message: text };
      }

      // Return responseData on success
      if (response.ok) {
        return responseData;
      }

      // Extract errorMessage from backend response
      const errorMessage =
        responseData.errorMessage || responseData.message || 'Request failed';
      throw new Error(errorMessage);
    } catch (error: any) {
      // Only show this if it's a real fetch/network failure
      if (
        error instanceof TypeError &&
        error.message.includes('Failed to fetch')
      ) {
        throw new Error(
          'Network error: Unable to connect to server. Please check your internet connection.'
        );
      }

      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.makeRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestOTP(data: RequestOTPRequest): Promise<RequestOTPResponse> {
    return this.makeRequest<RequestOTPResponse>('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return this.makeRequest<VerifyOTPResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.makeRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers(params?: GetUsersRequest): Promise<GetUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/auth/getUsers${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<GetUsersResponse>(endpoint, {
      method: 'GET',
    });
  }

  // Category APIs
  async createUpdateCategory(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    return this.makeRequest<CreateCategoryResponse>('/category/createUpdateCategory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(data: DeleteCategoryRequest): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('/category/softDeleteOrDetach', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async getAllCategories(): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>('/category/getAll', {
      method: 'GET',
    });
  }

  async getParentCategories(): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>('/category/getOnlyParentCategories', {
      method: 'GET',
    });
  }

  async getSubCategories(parentId: number): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>(`/category/getSubCategories/${parentId}`, {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();