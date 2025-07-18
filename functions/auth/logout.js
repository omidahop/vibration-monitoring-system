import { corsHeaders, handleCors } from '../middleware/cors.js';
import { authenticateUser } from '../middleware/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        const authResult = await authenticateUser(request, env);
        
        if (authResult.success) {
            // Delete session
            const sessionCookie = request.headers.get('Cookie');
            if (sessionCookie) {
                const sessionMatch = sessionCookie.match(/session=([^;]*)/);
                if (sessionMatch) {
                    await env.DB.prepare(
                        'DELETE FROM user_sessions WHERE id = ?'
                    ).bind(sessionMatch[1]).run();
                }
            }

            // Log the logout
            await env.DB.prepare(`
                INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
                VALUES (?, 'LOGOUT', 'USER', ?, ?, ?)
            `).bind(
                authResult.user.id,
                authResult.user.id.toString(),
                request.headers.get('CF-Connecting-IP') || 'unknown',
                request.headers.get('User-Agent') || 'unknown'
            ).run();
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'خروج موفقیت‌آمیز'
        }), {
            status: 200,
            headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
            }
        });

    } catch (error) {
        console.error('Logout error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}