import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { mkdirSync } from 'fs';

export interface ServerOptions {
  port: number;
  host: string;
  root: string;
  mode: 'development' | 'production' | 'static';
  apiPrefix?: string;
  enableCors?: boolean;
  enableCompression?: boolean;
  enableHelmet?: boolean;
  enableMorgan?: boolean;
  spa?: boolean;
}

export async function createServer(options: ServerOptions): Promise<{
  app: express.Application;
  start(): Promise<void>;
  stop(): Promise<void>;
}> {
  const {
    port,
    host,
    root,
    mode,
    apiPrefix = '/api',
    enableCors = true,
    enableCompression = true,
    enableHelmet = true,
    enableMorgan = true,
    spa = true,
  } = options;

  const app = express();

  // Security headers (adjust CSP for dev mode)
  if (enableHelmet) {
    app.use(helmet({
      contentSecurityPolicy: mode === 'production' ? undefined : false,
    }));
  }

  // CORS
  if (enableCors) {
    app.use(cors({
      origin: mode === 'production' ? false : '*',
      credentials: true,
    }));
  }

  // Compression
  if (enableCompression) {
    app.use(compression());
  }

  // Logging
  if (enableMorgan) {
    app.use(morgan(mode === 'production' ? 'combined' : 'dev'));
  }

  // API routes
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({
      status: 'ok',
      mode,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  if (mode === 'development') {
    // In development, proxy to Vite dev server or serve static files
    app.use(express.static(root, {
      index: 'index.html',
      maxAge: 0,
      etag: true,
      lastModified: true,
    }));
  } else {
    // Serve static files
    app.use(express.static(root, {
      index: 'index.html',
      maxAge: mode === 'production' ? '1y' : 0,
      etag: true,
      lastModified: true,
    }));

    // SPA fallback
    if (spa) {
      app.get('*', (req, res, next) => {
        if (req.path.startsWith(apiPrefix)) return next();
        res.sendFile(path.join(root, 'index.html'));
      });
    }
  }

  // Error handling
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: mode === 'development' ? err.message : 'Something went wrong',
    });
  });

  return {
    app,
    start() {
      return new Promise<void>((resolve) => {
        app.listen(port, host, () => {
          console.log(`WebBuilder server running at http://${host}:${port} (${mode} mode)`);
          resolve();
        });
      });
    },
    async stop() {
      // Cleanup if needed
    },
  };
}

export default { createServer };
