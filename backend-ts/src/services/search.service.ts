import { Injectable } from "@nestjs/common";
import { Connection } from "typeorm";

export type SearchResultItem = {
  id: number;
  title: string;
  recordCount: number;
  imageUrl?: string;
};

@Injectable()
export class SearchService {
  constructor(private connection: Connection) {}

  async search(query: string, limit: number): Promise<SearchResultItem[]> {
    return this.doSearch(`%${makeKey(query).join('%')}%`, limit)
  }

  async suggest(query: string, limit: number): Promise<SearchResultItem[]> {
    return this.doSearch(`${makeKey(query).join('')}%`, limit)
  }

  private async doSearch(pattern: string, limit: number): Promise<SearchResultItem[]> {
    type WorkIndexRow = {
      id: number;
      title: string;
      record_count: number;
      image_filename: string | null;
    };
    const result: WorkIndexRow[] = await this.connection.query(`
      SELECT DISTINCT w.*, wi.verified, wi.record_count
      FROM search_worktitleindex wti
      JOIN search_workindex wi ON (wti.work_id = wi.work_id)
      JOIN work_work w ON (w.id = wti.work_id)
      WHERE
        wti.key LIKE $1
        AND (wi.verified = true OR wi.record_count >= $2)
        AND wi.blacklisted = false
      ORDER BY wi.verified DESC, wi.record_count DESC
      LIMIT $3
    `, [pattern, 2, limit])
    return result.map(it => ({
      id: it.id,
      title: it.title,
      recordCount: it.record_count,
      imageUrl: it.image_filename ? `https://storage.googleapis.com/animeta-static/media/${it.image_filename}` : null,
    }))
  }
}

const codePointOfGa = '가'.codePointAt(0)
const codePointOfHih = '힣'.codePointAt(0)

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
    const codePoint = c.codePointAt(0)
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
