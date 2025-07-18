import { corsHeaders, handleCors } from '../middleware/cors.js';
import { authenticateUser } from '../middleware/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        const authResult = await authenticateUser(request, env);
        if (!authResult.success) {
            return new Response(JSON.stringify({
                success: false,
                error: 'دسترسی غیرمجاز'
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const preferences = await env.DB.prepare(`
            SELECT preferences FROM user_preferences WHERE user_id = ?
        `).bind(authResult.user.id).first();

        let userPreferences = {
            theme: 'light',
            primaryColor: '#2563eb',
            dri1Color: '#3b82f6',
            dri2Color: '#ef4444',
            equipmentPriority: {},
            parameterPriority: {},
            parameterMode: 'velocity-first',
            analysisThreshold: 20,
            analysisTimeRange: 7,
            analysisComparisonDays: 1
        };

        if (preferences) {
            userPreferences = { ...userPreferences, ...JSON.parse(preferences.preferences) };
        }

        return new Response(JSON.stringify({
            success: true,
            data: userPreferences
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get user preferences error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    try {
        const authResult = await authenticateUser(request, env);
        if (!authResult.success) {
            return new Response(JSON.stringify({
                success: false,
                error: 'دسترسی غیرمجاز'
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const preferences = await request.json();
        
        // Validate and sanitize preferences
        const validPreferences = {
            theme: preferences.theme || 'light',
            primaryColor: preferences.primaryColor || '#2563eb',
            dri1Color: preferences.dri1Color || '#3b82f6',
            dri2Color: preferences.dri2Color || '#ef4444',
            equipmentPriority: preferences.equipmentPriority || {},
            parameterPriority: preferences.parameterPriority || {},
            parameterMode: preferences.parameterMode || 'velocity-first',
            analysisThreshold: preferences.analysisThreshold || 20,
            analysisTimeRange: preferences.analysisTimeRange || 7,
            analysisComparisonDays: preferences.analysisComparisonDays || 1,
            defaultUnit: preferences.defaultUnit || 'DRI1',
            autoSave: preferences.autoSave !== false,
            notifications: preferences.notifications !== false,
            language: preferences.language || 'fa',
            dateFormat: preferences.dateFormat || 'persian'
        };

        // Check if preferences exist
        const existingPreferences = await env.DB.prepare(`
            SELECT id FROM user_preferences WHERE user_id = ?
        `).bind(authResult.user.id).first();

        if (existingPreferences) {
            // Update existing preferences
            await env.DB.prepare(`
                UPDATE user_preferences 
                SET preferences = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `).bind(JSON.stringify(validPreferences), authResult.user.id).run();
        } else {
            // Insert new preferences
            await env.DB.prepare(`
                INSERT INTO user_preferences (user_id, preferences)
                VALUES (?, ?)
            `).bind(authResult.user.id, JSON.stringify(validPreferences)).run();
        }

        // Log the action
        await env.DB.prepare(`
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
            VALUES (?, 'PREFERENCES_UPDATED', 'USER_PREFERENCES', ?, ?)
        `).bind(
            authResult.user.id,
            authResult.user.id.toString(),
            JSON.stringify({ preferences: validPreferences })
        ).run();

        return new Response(JSON.stringify({
            success: true,
            message: 'تنظیمات با موفقیت ذخیره شد'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Save user preferences error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطای سرور'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}