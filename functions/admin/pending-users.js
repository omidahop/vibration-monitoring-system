import { corsHeaders, handleCors } from '../middleware/cors.js';
import { authenticateUser } from '../middleware/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        const authResult = await authenticateUser(request, env);
        if (!authResult.success || !['admin', 'supervisor'].includes(authResult.user.role)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'دسترسی غیرمجاز'
            }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const pendingUsers = await env.DB.prepare(`
            SELECT 
                id, username, full_name, role, job_role, employee_id, 
                work_shift, created_at
            FROM users 
            WHERE is_active = FALSE AND approved_at IS NULL
            ORDER BY created_at DESC
        `).all();

        return new Response(JSON.stringify({
            success: true,
            data: pendingUsers.results || []
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get pending users error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}