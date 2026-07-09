const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Load environment variables from the project root directory (.env, .env.production, etc.)
const { loadEnvConfig } = require('@next/env');
const projectDir = __dirname;
loadEnvConfig(projectDir);

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app in production or development mode
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the request URL
      const parsedUrl = parse(req.url, true);
      // Handle the request using Next.js request handler
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
  console.error('Error preparing Next.js app:', err);
  process.exit(1);
});
