import app from './app';
import { env } from './config/env';

const port = env.port;

app.listen(port, () => {
  // Simple startup log; structured logging is configured in logger.ts
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});

