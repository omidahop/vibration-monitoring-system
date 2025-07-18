export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
};

export function handleCors(request) {
    const origin = request.headers.get('Origin');
    const headers = { ...corsHeaders };
    
    if (origin) {
        headers['Access-Control-Allow-Origin'] = origin;
    }
    
    return new Response(null, {
        status: 204,
        headers
    });
}