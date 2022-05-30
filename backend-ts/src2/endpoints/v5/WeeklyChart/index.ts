import { getWeeklyWorks } from "src2/services/chart";

export type WeeklyChartItem = {
  rank: number;
  work: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
  diff?: number;
  sign?: number;
};

export default async function (params: {}): Promise<WeeklyChartItem[]> {
  return await getWeeklyWorks(5)
}