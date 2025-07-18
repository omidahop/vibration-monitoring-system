// Main entry point for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Route handling
    try {
      // Auth routes
      if (url.pathname === '/auth/login') {
        const { onRequestPost } = await import('./auth/login.js');
        return onRequestPost({ request, env, ctx });
      }
      
      if (url.pathname === '/auth/register') {
        const { onRequestPost } = await import('./auth/register.js');
        return onRequestPost({ request, env, ctx });
      }
      
      if (url.pathname === '/auth/logout') {
        const { onRequestPost } = await import('./auth/logout.js');
        return onRequestPost({ request, env, ctx });
      }
      
      // Admin routes
      if (url.pathname === '/admin/users') {
        const { onRequestGet, onRequestPut } = await import('./admin/users.js');
        if (request.method === 'GET') {
          return onRequestGet({ request, env, ctx });
        } else if (request.method === 'PUT') {
          return onRequestPut({ request, env, ctx });
        }
      }
      
      if (url.pathname === '/admin/pending-users') {
        const { onRequestGet } = await import('./admin/pending-users.js');
        return onRequestGet({ request, env, ctx });
      }
      
      if (url.pathname === '/admin/stats') {
        const { onRequestGet } = await import('./admin/stats.js');
        return onRequestGet({ request, env, ctx });
      }
      
      // API routes
      if (url.pathname === '/api/check-username') {
        const { onRequestPost } = await import('./api/check-username.js');
        return onRequestPost({ request, env, ctx });
      }
      
      if (url.pathname === '/api/user-preferences') {
        const { onRequestGet, onRequestPost } = await import('./api/user-preferences.js');
        if (request.method === 'GET') {
          return onRequestGet({ request, env, ctx });
        } else if (request.method === 'POST') {
          return onRequestPost({ request, env, ctx });
        }
      }
      
      // Default: serve static files or 404
      if (url.pathname === '/' || url.pathname === '/pages/') {
        return new Response(null, {
          status: 302,
          headers: { Location: '/pages/index.html' }
        });
      }
      
      // 404 for unmatched routes
      return new Response('Not Found', { status: 404 });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};