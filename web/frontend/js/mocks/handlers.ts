import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/getTest', ({ request }) => {
    return HttpResponse.json(
      { url: request.url.toString() },
      { status: 200 },
    )
  }),

  http.post('/api/postTest', async ({ request, cookies }) => {
    if (
      !request.headers.get('x-csrf-token') ||
      !cookies['_csrf'] ||
      !cookies['crumb'] ||
      request.headers.get('x-csrf-token') !== cookies['crumb']
    ) {
      return HttpResponse.text(
        'invalid csrf token',
        { status: 403 },
      )
    }
    return HttpResponse.json(
      { body: await request.json() },
      { status: 200 },
    )
  }),

  http.delete('/api/deleteTest', ({ request, cookies }) => {
    if (
      !request.headers.get('x-csrf-token') ||
      !cookies['_csrf'] ||
      !cookies['crumb'] ||
      request.headers.get('x-csrf-token') !== cookies['crumb']
    ) {
      return HttpResponse.text(
        'invalid csrf token',
        { status: 403 },
      )
    }
    return HttpResponse.json(
      {},
      { status: 200 },
    )
  }),

  http.all('/api/standardError', () => {
    return HttpResponse.json(
      { message: 'message' },
      { status: 400 },
    )
  }),

  http.all('/api/nonJsonError', () => {
    return HttpResponse.text(
      'internal server error',
      { status: 500 },
    )
  }),

  http.all('/api/networkError', () => {
    return HttpResponse.error()
  }),
]