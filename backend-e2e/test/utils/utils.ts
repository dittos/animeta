import { TestFactoryUtils } from './factory';
import { TestUser } from './contract';
import { TestClient } from './testClient';

export class TestUtils {
  public readonly factory = new TestFactoryUtils();

  getHttpClient() {
    return new TestClient();
  }

  getHttpClientWithSessionKey(sessionKey: string) {
    return new TestClient({
      'x-animeta-session-key': sessionKey,
    });
  }

  getHttpClientForUser(user: TestUser) {
    return this.getHttpClientWithSessionKey(user.sessionKey);
  }

  async close(): Promise<void> {}
}
