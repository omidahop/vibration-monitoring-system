#!/usr/bin/env node
const https = require('https');
const { execSync } = require('child_process');

const HEALTH_CHECK_URLS = [
  'https://vibration-monitoring.yourdomain.com/health',
  // Add staging URL if needed
];

const MAX_RETRIES = 5;
const RETRY_DELAY = 10000; // 10 seconds

function healthCheck(url, retries = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        console.log(`✅ Health check passed for ${url}`);
        resolve(true);
      } else {
        throw new Error(`Health check failed with status ${response.statusCode}`);
      }
    });
    
    request.on('error', async (error) => {
      if (retries < MAX_RETRIES) {
        console.log(`⏳ Health check failed for ${url}, retrying in ${RETRY_DELAY/1000}s... (${retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        resolve(healthCheck(url, retries + 1));
      } else {
        console.error(`❌ Health check failed for ${url}:`, error.message);
        reject(error);
      }
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Health check timeout'));
    });
  });
}

async function runHealthChecks() {
  console.log('🔍 Running post-deployment health checks...');
  
  try {
    await Promise.all(HEALTH_CHECK_URLS.map(url => healthCheck(url)));
    console.log('✅ All health checks passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Health checks failed:', error.message);
    
    // Optionally rollback deployment
    if (process.env.ENABLE_ROLLBACK === 'true') {
      console.log('🔄 Rolling back deployment...');
      try {
        execSync('npm run rollback', { stdio: 'inherit' });
        console.log('✅ Rollback completed');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError.message);
      }
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  runHealthChecks();
}