import cuid from 'cuid';
import { Period, StatusType, TestCategory, TestHistory, TestRecord, TestUser, TestWork } from './contract';
import { HttpResponse } from './testClient';

function getBaseUrl(): string {
  const baseUrl = process.env.ANIMETA_BASE_URL;
  if (!baseUrl) throw new Error('ANIMETA_BASE_URL is not set');
  return baseUrl.replace(/\/$/, '');
}

function getTestToken(): string {
  const token = process.env.ANIMETA_TEST_TOKEN;
  if (!token) throw new Error('ANIMETA_TEST_TOKEN is not set');
  return token;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-animeta-test-token': getTestToken(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

export class TestFactoryUtils {
  async newUser({
    isStaff = false,
    password,
  }: {
    isStaff?: boolean;
    password?: string;
  } = {}): Promise<TestUser> {
    return request('POST', '/__test/users', { isStaff, password });
  }

  async setPassword(user: TestUser, password: string): Promise<void> {
    await request('POST', `/__test/users/${user.id}/password`, { password });
  }

  async createSession(user: TestUser): Promise<{ sessionKey: string }> {
    return request('POST', `/__test/users/${user.id}/session`, {});
  }

  async newCategory({
    user,
    name,
  }: {
    user: TestUser;
    name?: string;
  }): Promise<TestCategory> {
    return request('POST', '/__test/categories', { userId: user.id, name });
  }

  async newWork({
    periods,
    metadata,
  }: {
    periods?: Period[];
    metadata?: Record<string, unknown>;
  } = {}): Promise<TestWork> {
    return request('POST', '/__test/works', {
      periods: periods?.map(it => it.toString()),
      metadata,
    });
  }

  async addTitleMapping(work: TestWork, title: string): Promise<void> {
    await request('POST', `/__test/works/${work.id}/title-mappings`, { title });
  }

  async addStaff(work: TestWork, params: {
    personId?: string;
    personName?: string;
    task: string;
    position?: number;
  }): Promise<{ id: string; personId: string }> {
    return request('POST', `/__test/works/${work.id}/staffs`, params);
  }

  async newRecord({
    user,
    work,
    category,
    comment,
    status,
    statusType,
  }: {
    user?: TestUser;
    work?: TestWork;
    category?: TestCategory;
    comment?: string;
    status?: string;
    statusType?: StatusType;
  } = {}): Promise<{ record: TestRecord; history: TestHistory }> {
    return request('POST', '/__test/records', {
      userId: user?.id,
      workId: work?.id,
      categoryId: category?.id ?? null,
      comment,
      status,
      statusType,
    });
  }

  async newHistory({
    user,
    work,
    record,
    comment,
  }: {
    user?: TestUser;
    work?: TestWork;
    record?: TestRecord;
    comment?: string;
  } = {}): Promise<TestHistory> {
    if (!record) record = (await this.newRecord({ user, work, comment })).record;
    return request('POST', '/__test/histories', { recordId: record.id, comment });
  }

  async createTwitterSetting(user: TestUser): Promise<void> {
    await request('POST', `/__test/users/${user.id}/twitter-setting`, { key: 'key', secret: 'secret' });
  }

  async getTwitterSetting(user: TestUser): Promise<unknown> {
    return request('GET', `/__test/users/${user.id}/twitter-setting`);
  }

  async rebuildWorkIndex(): Promise<void> {
    await request('POST', '/__test/work-index/rebuild', {});
  }

  async deleteAllRecords() {
    await request('DELETE', '/__test/records');
  }

  async deleteAllWorks() {
    await request('DELETE', '/__test/works');
  }
}
