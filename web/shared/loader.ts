import { UserDTO, UserFetchOptions } from './types';

export type Loader = {
  call<T = any>(path: string, params?: any): Promise<T>;
  callV4<T = any>(path: string, params?: any): Promise<T>;
  getCurrentUser(params?: { options?: UserFetchOptions }): Promise<UserDTO | null>;
};
