import { Client } from './client';
import { UserDTO, UserFetchOptions } from './types';

export type Loader = {
  callV4<T = any>(path: string, params?: any): Promise<T>;
  v5: Client;
  getCurrentUser(params?: { options?: UserFetchOptions }): Promise<UserDTO | null>;
  graphql<T>(doc: any /* DocumentNode */, variables?: any): Promise<T>;
  apolloClient: any /* ApolloClient */;
};
