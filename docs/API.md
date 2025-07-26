# API Documentation

## Authentication

All API endpoints require authentication using one of the following methods:

### 1. Authorization Header
```
Authorization: Bearer your_api_key
```

### 2. URL Parameter (auth_token)
```
GET /api/endpoint?auth_token=your_api_key
```

### 3. URL Parameter (api_key)
```
GET /api/endpoint?api_key=your_api_key
```

## Endpoints

### Health Check

Check the health status of the API service.

**Endpoint:** `GET /api/health`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-14T15:30:00Z",
    "version": "1.0.0",
    "services": {
      "google-maps": "available"
    }
  },
  "timestamp": "2025-01-14T15:30:00Z"
}
```

### Google Maps Geocoding

Direct proxy to Google Maps Geocoding API with authentication and rate limiting.

**Endpoint:** `GET /api/proxy/maps/geocode`

**Authentication:** Required

**Parameters:**
- `address` (string): Address to geocode (required if `latlng` not provided)
- `latlng` (string): Coordinates for reverse geocoding (required if `address` not provided)
- `language` (string, optional): Language for results
- `region` (string, optional): Region bias
- `components` (string, optional): Component filtering
- `bounds` (string, optional): Viewport bias
- `result_type` (string, optional): Filter by result type
- `location_type` (string, optional): Filter by location type

**Examples:**

Forward Geocoding:
```bash
curl "https://api.example.com/api/proxy/maps/geocode?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&auth_token=your_api_key"
```

Reverse Geocoding:
```bash
curl "https://api.example.com/api/proxy/maps/geocode?latlng=37.4224764,-122.0842499&auth_token=your_api_key"
```

**Response:**
Returns the raw Google Maps API XML response with additional proxy headers.

### Generic Proxy

Universal proxy endpoint for supported services.

**Endpoint:** `POST /api/proxy`

**Authentication:** Required

**Request Body:**
```json
{
  "service": "google-maps",
  "endpoint": "/geocode/xml",
  "method": "GET",
  "params": {
    "address": "1600 Amphitheatre Parkway, Mountain View, CA"
  },
  "headers": {
    "Custom-Header": "value"
  }
}
```

**GET Alternative:**
```
GET /api/proxy?service=google-maps&endpoint=/geocode/xml&address=1600+Amphitheatre+Parkway
```

**Supported Services:**
- `google-maps`: Google Maps Platform APIs

**Example:**
```bash
curl -X POST https://api.example.com/api/proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -d '{
    "service": "google-maps",
    "endpoint": "/geocode/xml",
    "method": "GET",
    "params": {
      "address": "New York, NY"
    }
  }'
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  },
  "timestamp": "2025-01-14T15:30:00Z"
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Access denied
- `BAD_REQUEST`: Invalid request parameters
- `TOO_MANY_REQUESTS`: Rate limit exceeded
- `NOT_FOUND`: Endpoint not found
- `INTERNAL_ERROR`: Server error

## Rate Limiting

Rate limits are applied per API key and can be configured via environment variables.

**Default Limits:**
- 100 requests per hour per API key

**Headers:**
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: Time when rate limit resets

## Response Headers

All proxied responses include additional headers:

- `X-Proxy-Service`: Name of the proxied service
- `X-Proxy-Timestamp`: Timestamp of the proxy request

## Examples

### JavaScript/Node.js

```javascript
const response = await fetch('https://api.example.com/api/proxy/maps/geocode?address=New York&auth_token=your_key');
const data = await response.text(); // XML response
```

### Python

```python
import requests

response = requests.get(
    'https://api.example.com/api/proxy/maps/geocode',
    params={'address': 'New York', 'auth_token': 'your_key'}
)
print(response.text)
```

### cURL

```bash
curl -H "Authorization: Bearer your_api_key" \
     "https://api.example.com/api/proxy/maps/geocode?address=New+York"
``` 