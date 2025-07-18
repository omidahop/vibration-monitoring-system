import bcrypt from 'bcryptjs';
import { corsHeaders, handleCors } from '../middleware/cors.js';
import { validateRegisterInput } from '../utils/validation.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        const { username, password, fullName, role = 'operator', jobRole, employeeId, workShift } = await request.json();
        
        // Validate input
        const validation = validateRegisterInput(username, password, fullName);
        if (!validation.valid) {
            return new Response(JSON.stringify({
                success: false,
                error: validation.error
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Check if username already exists
        const existingUser = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username.toLowerCase().trim()).first();

        if (existingUser) {
            return new Response(JSON.stringify({
                success: false,
                error: 'این نام کاربری قبلاً استفاده شده است'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user (inactive by default)
        const result = await env.DB.prepare(`
            INSERT INTO users (username, password_hash, full_name, role, job_role, employee_id, work_shift, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)
        `).bind(username.toLowerCase().trim(), passwordHash, fullName, role, jobRole, employeeId, workShift).run();

        // Log the registration
        await env.DB.prepare(`
            INSERT INTO audit_logs (action, resource_type, resource_id, new_values, ip_address, user_agent)
            VALUES ('USER_REGISTRATION', 'USER', ?, ?, ?, ?)
        `).bind(
            result.meta.last_row_id.toString(),
            JSON.stringify({ username, fullName, role, jobRole, workShift }),
            request.headers.get('CF-Connecting-IP') || 'unknown',
            request.headers.get('User-Agent') || 'unknown'
        ).run();

        return new Response(JSON.stringify({
            success: true,
            message: 'ثبت‌نام با موفقیت انجام شد. منتظر تایید مدیر باشید.'
        }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}