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

        const today = new Date().toISOString().split('T')[0];

        // Get stats
        const pendingUsers = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM users 
            WHERE is_active = FALSE AND approved_at IS NULL
        `).first();

        const activeUsers = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM users WHERE is_active = TRUE
        `).first();

        const todayData = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM vibration_data WHERE date = ?
        `).bind(today).first();

        const todayActivities = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM audit_logs 
            WHERE date(timestamp) = ?
        `).bind(today).first();

        return new Response(JSON.stringify({
            success: true,
            data: {
                pendingUsers: pendingUsers?.count || 0,
                activeUsers: activeUsers?.count || 0,
                todayData: todayData?.count || 0,
                alerts: todayActivities?.count || 0
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}