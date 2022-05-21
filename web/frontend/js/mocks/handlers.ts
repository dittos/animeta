import { rest } from 'msw'

export const handlers = [
  rest.get('/api/getTest', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ url: req.url }),
    )
  }),

  rest.get('/api/standardError', (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({ message: 'message' }),
    )
  }),

  rest.get('/api/nonJsonError', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.body('internal server error'),
    )
  }),

  rest.get('/api/networkError', (req, res, ctx) => {
    res.networkError('connection refused')
  }),
]