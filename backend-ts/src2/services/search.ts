import { WorkIndex } from "src/entities/work_index.entity";
import { db } from "src2/database";

export type SearchResultItem = {
  id: number;
  title: string;
  recordCount: number;
}

export async function searchWorks(query: string, limit: number, minRecordCount: number = 2): Promise<SearchResultItem[]> {
  return doSearch(`%${makeKey(query).join('%')}%`, limit, minRecordCount)
}

export async function suggestWorks(query: string, limit: number): Promise<SearchResultItem[]> {
  return doSearch(`${makeKey(query).join('')}%`, limit)
}

async function doSearch(pattern: string, limit: number, minRecordCount: number = 2): Promise<SearchResultItem[]> {
  const result = await db.createQueryBuilder(WorkIndex, 'wi')
    .innerJoin('search_worktitleindex', 'wti', 'wti.work_id = wi.work_id')
    .where('wti.key LIKE :pattern', { pattern })
    .andWhere('(wi.verified = true OR wi.record_count >= :minRecordCount)', { minRecordCount })
    .andWhere('wi.blacklisted = false')
    .orderBy('wi.verified', 'DESC')
    .addOrderBy('wi.record_count', 'DESC')
    .limit(limit)
    .distinct()
    .getMany()
  return result.map(it => ({
    id: it.work_id,
    title: it.title,
    recordCount: it.record_count,
  }))
}

const codePointOfGa = '가'.codePointAt(0)!
const codePointOfHih = '힣'.codePointAt(0)!

const firsts = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
const middles = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅗㅏ",
  "ㅗㅐ", "ㅗㅣ", "ㅛ", "ㅜ", "ㅜㅓ", "ㅜㅔ", "ㅜㅣ", "ㅠ", "ㅡ",
  "ㅡㅣ", "ㅣ"
]
const lasts = [
  "", "ㄱ", "ㄲ", "ㄱㅅ", "ㄴ", "ㄴㅈ", "ㄴㅎ", "ㄷ", "ㄹ",
  "ㄹㄱ", "ㄹㅁ", "ㄹㅂ", "ㄹㅅ", "ㄹㅌ", "ㄹㅍ", "ㄹㅎ", "ㅁ",
  "ㅂ", "ㅂㅅ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
]

export function makeKey(query: string): string[] {
  const buf: string[] = []
  for (let c of query) {
    const codePoint = c.codePointAt(0)!
    if (codePointOfGa <= codePoint && codePoint <= codePointOfHih) {
      const offset = codePoint - codePointOfGa
      const first = firsts[Math.floor(offset / (middles.length * lasts.length))]
      const middle = middles[Math.floor(offset / lasts.length) % middles.length]
      const last = lasts[offset % lasts.length]
      buf.push(first + middle + last)
    } else if (/\p{L}|\p{N}/u.exec(c)) {
      buf.push(c.toLowerCase())
    }
  }
  return buf
}
