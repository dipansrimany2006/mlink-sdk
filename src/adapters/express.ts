import type { Router, Request, Response, NextFunction } from 'express';
import type { Action } from '../builders';
import { validateTransactionRequest } from '../validators';

// Create Express router
export function createExpressHandler(
  action: Action,
  RouterClass: new () => Router
): Router {
  const router = new RouterClass();

  // CORS middleware
  router.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // OPTIONS handler
  router.options('/', (_req: Request, res: Response) => {
    res.sendStatus(200);
  });

  // GET handler
  router.get('/', (_req: Request, res: Response) => {
    try {
      const metadata = action.getMetadata();
      res.json(metadata);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: { message } });
    }
  });

  // POST handler
  router.post('/', async (req: Request, res: Response) => {
    try {
      const validation = validateTransactionRequest(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: { message: validation.error } });
      }

      const response = await action.handleRequest(validation.data);
      res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: { message } });
    }
  });

  return router;
}
