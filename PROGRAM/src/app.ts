import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'body-parser';
import { corsMiddleware } from './middleware/cors.middleware';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLoggerMiddleware } from './middleware/requestLogger.middleware';
import v1Routes from './routes/v1';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
      },
    },
  }),
);
app.use(compression());
app.use(corsMiddleware);
app.use(cookieParser());
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }));
app.use(requestLoggerMiddleware);
app.use(rateLimitMiddleware);

// Local dev file serving for uploaded assignment files.
// In production, store files in object storage (S3/GCS) + serve via CDN.
app.use('/uploads', express.static('uploads'));

app.use('/api/v1', v1Routes);

app.use(errorMiddleware);

export default app;

