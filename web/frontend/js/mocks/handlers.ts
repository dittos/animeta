import { rest } from 'msw'

export const handlers = [
  rest.get('/api/getTest', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ url: req.url }),
    )
  }),

  rest.post('/api/postTest', (req, res, ctx) => {
    if (
      !req.headers.get('x-csrf-token') ||
      !req.cookies['_csrf'] ||
      !req.cookies['crumb'] ||
      req.headers.get('x-csrf-token') !== req.cookies['crumb']
    ) {
      return res(
        ctx.status(403),
        ctx.text('invalid csrf token'),
      )
    }
    return res(
      ctx.status(200),
      ctx.json({ body: req.body }),
    )
  }),

  rest.delete('/api/deleteTest', (req, res, ctx) => {
    if (
      !req.headers.get('x-csrf-token') ||
      !req.cookies['_csrf'] ||
      !req.cookies['crumb'] ||
      req.headers.get('x-csrf-token') !== req.cookies['crumb']
    ) {
      return res(
        ctx.status(403),
        ctx.text('invalid csrf token'),
      )
    }
    return res(
      ctx.status(200),
      ctx.json({}),
    )
  }),

  rest.all('/api/standardError', (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({ message: 'message' }),
    )
  }),

  rest.all('/api/nonJsonError', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.body('internal server error'),
    )
  }),

  rest.all('/api/networkError', (req, res, ctx) => {
    res.networkError('connection refused')
  }),
]