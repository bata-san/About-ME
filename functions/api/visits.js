export async function onRequest(context) {
  // Real Counter Logic using External API (No KV required)
  // Proxies the request to counterapi.dev to hide details and avoid CORS issues if any.
  
  try {
    // Namespace: bata-san-portfolio, Key: visits
    const response = await fetch('https://api.counterapi.dev/v1/bata-san-portfolio/visits/up');
    
    if (!response.ok) {
      throw new Error('Upstream API failed');
    }

    const data = await response.json();
    // counterapi.dev returns { "count": 123 }
    
    return new Response(JSON.stringify({ count: data.count }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    // Fallback or Error
    return new Response(JSON.stringify({ error: 'Failed to fetch count' }), { 
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
