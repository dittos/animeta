import { UserDTO, UserFetchOptions } from './types';

export type Loader = {
  call(path: string, params?: any): Promise<any>;
  getCurrentUser(params?: { options?: UserFetchOptions }): Promise<UserDTO | null>;
};
