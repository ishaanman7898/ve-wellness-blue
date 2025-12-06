# VE Cart Server

Backend server for processing VE International cart checkouts using Puppeteer.

## Local Development

```bash
npm install
npm start
```

## Railway Deployment

This server is configured for Railway deployment:

1. Connect your GitHub repository to Railway
2. Set the root directory to `cart`
3. Railway will automatically detect the Node.js buildpack
4. The server will start on the PORT environment variable

**Note:** Puppeteer requires a Chromium browser. For Railway deployment, you may need to use `puppeteer-core` with a remote browser service like Browserless.io for production use, as Railway doesn't support headed browsers.

## API Endpoints

- `GET /health` - Health check
- `POST /checkout` - Start checkout process
- `GET /checkout/status/:sessionId` - Get checkout status

## Environment Variables

- `PORT` - Server port (default: 3001)
