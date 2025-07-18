import jwt from 'jsonwebtoken';

export async function authenticateUser(request, env) {
    try {
        const authHeader = request.headers.get('Authorization');
        const sessionCookie = request.headers.get('Cookie');
        
        let token = null;
        
        // Check Authorization header
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        
        // Check session cookie as fallback
        if (!token && sessionCookie) {
            const sessionMatch = sessionCookie.match(/session=([^;]*)/);
            if (sessionMatch) {
                const sessionId = sessionMatch[1];
                const session = await env.DB.prepare(
                    'SELECT user_id FROM user_sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP'
                ).bind(sessionId).first();
                
                if (session) {
                    const user = await env.DB.prepare(
                        'SELECT * FROM users WHERE id = ? AND is_active = TRUE'
                    ).bind(session.user_id).first();
                    
                    if (user) {
                        return {
                            success: true,
                            user: {
                                id: user.id,
                                username: user.username,
                                role: user.role,
                                fullName: user.full_name
                            }
                        };
                    }
                }
            }
        }
        
        if (!token) {
            return { success: false, error: 'No token provided' };
        }
        
        // Verify JWT token
        const decoded = jwt.verify(token, env.JWT_SECRET);
        
        // Check if user still exists and is active
        const user = await env.DB.prepare(
            'SELECT * FROM users WHERE id = ? AND is_active = TRUE'
        ).bind(decoded.userId).first();
        
        if (!user) {
            return { success: false, error: 'User not found or inactive' };
        }
        
        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                fullName: user.full_name
            }
        };
        
    } catch (error) {
        console.error('Authentication error:', error);
        return { success: false, error: 'Invalid token' };
    }
}

export function requireRole(roles) {
    return async (request, env, context) => {
        const authResult = await authenticateUser(request, env);
        
        if (!authResult.success) {
            return new Response(JSON.stringify({
                success: false,
                error: 'دسترسی غیرمجاز'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (!roles.includes(authResult.user.role)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'سطح دسترسی کافی نیست'
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Add user to context for use in the handler
        context.user = authResult.user;
        return null; // Continue to next middleware/handler
    };
}