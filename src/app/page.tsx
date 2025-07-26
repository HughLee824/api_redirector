export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>API Redirector</h1>
      <p>Universal API proxy service for serverless deployment.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Available Endpoints</h2>
        <ul>
          <li>
            <strong>Health Check:</strong> <code>GET /api/health</code>
          </li>
          <li>
            <strong>Google Maps Geocoding:</strong> <code>GET /api/proxy/maps/geocode?address=ADDRESS&auth_token=TOKEN</code>
          </li>
          <li>
            <strong>Generic Proxy:</strong> <code>POST /api/proxy</code>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Authentication</h2>
        <p>All API endpoints require authentication via:</p>
        <ul>
          <li><code>Authorization: Bearer TOKEN</code> header</li>
          <li><code>auth_token=TOKEN</code> URL parameter</li>
          <li><code>api_key=TOKEN</code> URL parameter</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Documentation</h2>
        <p>For detailed API documentation, see <code>/docs/API.md</code></p>
      </div>
    </main>
  )
} 