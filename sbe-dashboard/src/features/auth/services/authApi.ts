import { apiClient } from '../../../lib/apiClient';

export interface LoginRequest {
  dni: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', request);
}