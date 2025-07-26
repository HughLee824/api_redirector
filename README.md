# API Redirector

Universal API proxy service for serverless deployment on Vercel.

## Features

- **Universal API Proxy**: Support for multiple API services through a unified interface
- **Google Maps Integration**: Built-in support for Google Maps Geocoding API
- **Authentication**: API key-based authentication with rate limiting
- **Serverless Ready**: Optimized for Vercel deployment
- **Request Logging**: Optional request logging for monitoring
- **TypeScript**: Full TypeScript support with type safety

## Quick Start

### 1. Environment Setup

Create a `.env.local` file:

```env
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Authentication (format: key:name:permissions)
API_KEYS=your_api_key:user1:maps,geocode

# Rate Limiting
DEFAULT_RATE_LIMIT=100
DEFAULT_RATE_WINDOW=3600

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
npx vercel --prod
```

## API Usage

### Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

### Google Maps Geocoding
```bash
curl "https://your-domain.vercel.app/api/proxy/maps/geocode?address=11229&auth_token=your_api_key"
```

### Generic Proxy
```bash
curl -X POST https://your-domain.vercel.app/api/proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -d '{
    "service": "google-maps",
    "endpoint": "/geocode/xml",
    "method": "GET",
    "params": {
      "address": "11229"
    }
  }'
```

## Architecture

- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Full type safety
- **Vercel**: Serverless deployment platform
- **Modular Design**: Easy to extend with new API services

## Project Structure

```
src/
├── app/api/          # API routes
├── lib/
│   ├── auth/         # Authentication logic
│   ├── proxy/        # Proxy services
│   ├── middleware/   # Request middleware
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript types
└── middleware.ts     # Next.js middleware
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License