import { CategoryDto } from "./category";

export type UserDto = {
  id: string;
  name: string;
  dateJoined: number; // TODO: Date
  categories: CategoryDto[] | null;
  recordCount: number | null;
  historyCount: number | null;
  isTwitterConnected: boolean | null;
}