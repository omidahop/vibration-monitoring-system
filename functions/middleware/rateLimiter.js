export async function rateLimiter(request, env, maxRequests = 60, windowMs = 60000) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = `rate_limit:${ip}`;
    
    try {
        const current = await env.CACHE.get(key);
        const requests = current ? parseInt(current) : 0;
        
        if (requests >= maxRequests) {
            return {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil(windowMs / 1000)
            };
        }
        
        await env.CACHE.put(key, (requests + 1).toString(), {
            expirationTtl: Math.ceil(windowMs / 1000)
        });
        
        return {
            success: true,
            remaining: maxRequests - requests - 1
        };
    } catch (error) {
        console.error('Rate limiter error:', error);
        return { success: true }; // Fail open
    }
}

export function withRateLimit(handler, options = {}) {
    return async (context) => {
        const { request, env } = context;
        
        const rateLimitResult = await rateLimiter(
            request,
            env,
            options.maxRequests || 60,
            options.windowMs || 60000
        );
        
        if (!rateLimitResult.success) {
            return new Response(JSON.stringify({
                success: false,
                error: 'تعداد درخواست‌های شما بیش از حد مجاز است'
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': rateLimitResult.retryAfter
                }
            });
        }
        
        const response = await handler(context);
        
        // Add rate limit headers
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining);
        response.headers.set('X-RateLimit-Limit', options.maxRequests || 60);
        
        return response;
    };
}