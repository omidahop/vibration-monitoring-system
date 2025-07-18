import { corsHeaders, handleCors } from '../middleware/cors.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        const { username } = await request.json();
        
        if (!username || username.length < 3) {
            return new Response(JSON.stringify({
                success: false,
                error: 'نام کاربری باید حداقل 3 کاراکتر باشد'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Check if username exists
        const existingUser = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username.toLowerCase().trim()).first();

        return new Response(JSON.stringify({
            success: true,
            available: !existingUser
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Check username error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}