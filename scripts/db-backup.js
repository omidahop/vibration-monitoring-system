#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

try {
  console.log('Creating database backup...');
  
  // Create backup file
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
  
  // Export all tables
  const command = `wrangler d1 execute vibration-monitoring-db --command=".dump" > "${backupFile}"`;
  execSync(command, { stdio: 'inherit' });
  
  console.log(`Backup created: ${backupFile}`);
  
  // Keep only last 10 backups
  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(backupDir, f)).mtime
    }))
    .sort((a, b) => b.time - a.time);
    
  if (files.length > 10) {
    files.slice(10).forEach(file => {
      fs.unlinkSync(path.join(backupDir, file.name));
      console.log(`Removed old backup: ${file.name}`);
    });
  }
  
} catch (error) {
  console.error('Backup failed:', error.message);
  process.exit(1);
}