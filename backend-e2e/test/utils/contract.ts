export enum StatusType {
  FINISHED = 0,
  WATCHING = 1,
  SUSPENDED = 2,
  INTERESTED = 3,
}

export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
} as const;

export interface UserDto {
  id: string;
  name: string;
}

export interface TestUser {
  id: string;
  username: string;
  sessionKey: string;
  date_joined: string;
}

export interface TestCategory {
  id: string;
  name: string;
}

export interface TestWork {
  id: string;
  title: string;
}

export interface TestRecord {
  id: string;
  title: string;
  work_id: string;
  status: string;
  status_type: StatusType;
}

export interface TestHistory {
  id: string;
  status: string;
  status_type: StatusType;
  updated_at: string | null;
}

export class Period {
  constructor(
    public readonly year: number,
    public readonly quarter: number,
  ) {}

  toString() {
    return `${this.year}Q${this.quarter}`;
  }
}

export const Periods = {
  // TODO: sync with impl code
  current: new Period(2026, 3),
};

export function recordNodeId(databaseId: string | number): string {
  return Buffer.from(`Record:${databaseId}`).toString('base64');
}
