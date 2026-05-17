export default async function setup() {
  const baseUrl = process.env.ANIMETA_BASE_URL;
  if (!baseUrl) throw new Error('ANIMETA_BASE_URL is not set');
  if (!process.env.ANIMETA_TEST_TOKEN) throw new Error('ANIMETA_TEST_TOKEN is not set');

  const healthUrl = `${baseUrl.replace(/\/$/, '')}/health`;
  const startedAt = Date.now();
  let lastError: unknown;
  while (Date.now() - startedAt < 10000) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
      lastError = new Error(`health returned ${response.status}`);
    } catch (e) {
      lastError = e;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw lastError;
}
