import * as cheerio from 'cheerio';
import got from 'got';

export async function getAnnMetadata(annId: string): Promise<cheerio.Cheerio<cheerio.Element>> {
  const response = await got.get(`https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=${annId}`).text()
  const doc = cheerio.load(response)
  return doc('anime').first()
}
