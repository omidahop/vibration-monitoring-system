import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { corsHeaders, handleCors } from '../middleware/cors.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { validateLoginInput } from '../utils/validation.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        // Rate limiting
        const rateLimitResult = await rateLimiter(request, env, 5, 900); // 5 attempts per 15 minutes
        if (!rateLimitResult.success) {
            return new Response(JSON.stringify({
                success: false,
                error: 'تعداد تلاش‌های ناموفق زیاد است. لطفاً 15 دقیقه بعد دوباره امتحان کنید.'
            }), {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { username, password } = await request.json();
        
        // Validate input
        const validation = validateLoginInput(username, password);
        if (!validation.valid) {
            return new Response(JSON.stringify({
                success: false,
                error: validation.error
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Check user in database
        const user = await env.DB.prepare(
            'SELECT * FROM users WHERE username = ? AND is_active = TRUE'
        ).bind(username.toLowerCase().trim()).first();

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                error: 'نام کاربری یا رمز عبور اشتباه است'
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({
                success: false,
                error: 'نام کاربری یا رمز عبور اشتباه است'
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Create session
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await env.DB.prepare(
            'INSERT INTO user_sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
        ).bind(sessionId, user.id, expiresAt.toISOString()).run();

        // Update last login
        await env.DB.prepare(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(user.id).run();

        // Log the login
        await env.DB.prepare(`
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
            VALUES (?, 'LOGIN', 'USER', ?, ?, ?)
        `).bind(
            user.id,
            user.id.toString(),
            request.headers.get('CF-Connecting-IP') || 'unknown',
            request.headers.get('User-Agent') || 'unknown'
        ).run();

        return new Response(JSON.stringify({
            success: true,
            data: {
                token,
                sessionId,
                user: {
                    id: user.id,
                    username: user.username,
                    fullName: user.full_name,
                    role: user.role
                }
            }
        }), {
            status: 200,
            headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Set-Cookie': `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}