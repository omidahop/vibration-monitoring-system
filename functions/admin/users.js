import { corsHeaders, handleCors } from '../middleware/cors.js';
import { authenticateUser } from '../middleware/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        // Authenticate and check admin role
        const authResult = await authenticateUser(request, env);
        if (!authResult.success || authResult.user.role !== 'admin') {
            return new Response(JSON.stringify({
                success: false,
                error: 'دسترسی غیرمجاز'
            }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                u.*,
                approver.username as approved_by_username,
                approver.full_name as approved_by_name,
                COUNT(*) OVER() as total_count
            FROM users u
            LEFT JOIN users approver ON u.approved_by = approver.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status === 'pending') {
            query += ' AND u.is_active = FALSE AND u.approved_at IS NULL';
        } else if (status === 'active') {
            query += ' AND u.is_active = TRUE';
        } else if (status === 'inactive') {
            query += ' AND u.is_active = FALSE';
        }
        
        query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const users = await env.DB.prepare(query).bind(...params).all();

        return new Response(JSON.stringify({
            success: true,
            data: {
                users: users.results || [],
                pagination: {
                    page,
                    limit,
                    total: users.results?.[0]?.total_count || 0,
                    totalPages: Math.ceil((users.results?.[0]?.total_count || 0) / limit)
                }
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get users error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        const authResult = await authenticateUser(request, env);
        if (!authResult.success || authResult.user.role !== 'admin') {
            return new Response(JSON.stringify({
                success: false,
                error: 'دسترسی غیرمجاز'
            }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { userId, action, data } = await request.json();
        
        if (!userId || !action) {
            return new Response(JSON.stringify({
                success: false,
                error: 'اطلاعات ناکافی'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        let result;
        let auditAction;
        let auditData;

        switch (action) {
            case 'approve':
                result = await env.DB.prepare(`
                    UPDATE users 
                    SET is_active = TRUE, approved_by = ?, approved_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).bind(authResult.user.id, userId).run();
                auditAction = 'USER_APPROVED';
                auditData = { userId, approvedBy: authResult.user.id };
                break;

            case 'reject':
                result = await env.DB.prepare(`
                    DELETE FROM users WHERE id = ? AND is_active = FALSE
                `).bind(userId).run();
                auditAction = 'USER_REJECTED';
                auditData = { userId, rejectedBy: authResult.user.id };
                break;

            case 'deactivate':
                result = await env.DB.prepare(`
                    UPDATE users SET is_active = FALSE WHERE id = ?
                `).bind(userId).run();
                auditAction = 'USER_DEACTIVATED';
                auditData = { userId, deactivatedBy: authResult.user.id };
                break;

            case 'activate':
                result = await env.DB.prepare(`
                    UPDATE users SET is_active = TRUE WHERE id = ?
                `).bind(userId).run();
                auditAction = 'USER_ACTIVATED';
                auditData = { userId, activatedBy: authResult.user.id };
                break;

            case 'update_role':
                if (!data.role || !['admin', 'supervisor', 'operator'].includes(data.role)) {
                    throw new Error('نقش نامعتبر');
                }
                result = await env.DB.prepare(`
                    UPDATE users SET role = ? WHERE id = ?
                `).bind(data.role, userId).run();
                auditAction = 'USER_ROLE_UPDATED';
                auditData = { userId, newRole: data.role, updatedBy: authResult.user.id };
                break;

            default:
                throw new Error('عملیات نامعتبر');
        }

        // Log the action
        await env.DB.prepare(`
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
            VALUES (?, ?, 'USER', ?, ?)
        `).bind(
            authResult.user.id,
            auditAction,
            userId.toString(),
            JSON.stringify(auditData)
        ).run();

        return new Response(JSON.stringify({
            success: true,
            message: 'عملیات با موفقیت انجام شد'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update user error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}