#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple SVG icon
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" rx="20"/>
  <path d="M${size * 0.2} ${size * 0.3} L${size * 0.5} ${size * 0.15} L${size * 0.8} ${size * 0.3} L${size * 0.8} ${size * 0.7} L${size * 0.5} ${size * 0.85} L${size * 0.2} ${size * 0.7} Z" fill="white"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.1}" fill="#2563eb"/>
</svg>`;
}

// Ensure icons directory exists
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
iconSizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  
  // Note: In a real scenario, you'd use a library like sharp or canvas to convert SVG to PNG
  // For now, we'll just save the SVG files
  fs.writeFileSync(
    path.join(iconsDir, filename.replace('.png', '.svg')),
    svg
  );
  
  console.log(`Generated ${filename}`);
});

console.log('Icon generation completed!');
console.log('Note: Convert SVG files to PNG using a tool like sharp or online converter');