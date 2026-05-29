import { buildApp } from './app.js';

const PORT = Number(process.env.PORT ?? 3000);
const app = buildApp();

app
  .listen({ port: PORT, host: '0.0.0.0' })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(`[@jdo/api] listening on http://localhost:${PORT}`);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
