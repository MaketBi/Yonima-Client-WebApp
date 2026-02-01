#!/usr/bin/env node

/**
 * Script pour générer les icônes PWA à partir d'un fichier source
 *
 * Prérequis: sharp
 * npm install sharp --save-dev
 *
 * Usage: node scripts/generate-icons.js [source-image]
 *
 * Si aucune image source n'est fournie, des icônes placeholder seront créées.
 */

const fs = require('fs');
const path = require('path');

// Sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];
const SHORTCUT_SIZE = 96;

const ICONS_DIR = path.join(__dirname, '../public/icons');

// Yonima brand color
const PRIMARY_COLOR = '#1DB88E';

// Create a simple SVG placeholder for each size
function createPlaceholderSVG(size, text = 'Y') {
  const fontSize = Math.floor(size * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.125)}" fill="${PRIMARY_COLOR}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">
    ${text}
  </text>
</svg>`;
}

// Create maskable icon SVG (with padding for safe zone)
function createMaskableSVG(size) {
  const padding = Math.floor(size * 0.2); // 20% padding
  const innerSize = size - (padding * 2);
  const fontSize = Math.floor(innerSize * 0.5);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PRIMARY_COLOR}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">
    Y
  </text>
</svg>`;
}

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Try to use sharp if available
  let sharp;
  try {
    sharp = require('sharp');
    console.log('Using sharp for PNG generation\n');
  } catch {
    console.log('sharp not installed. Creating SVG placeholders only.');
    console.log('To generate PNG icons, install sharp: npm install sharp --save-dev\n');
    sharp = null;
  }

  // Generate main icons
  for (const size of ICON_SIZES) {
    const filename = `icon-${size}x${size}`;
    const svgContent = createPlaceholderSVG(size);

    if (sharp) {
      try {
        await sharp(Buffer.from(svgContent))
          .png()
          .toFile(path.join(ICONS_DIR, `${filename}.png`));
        console.log(`Created: ${filename}.png`);
      } catch (err) {
        console.error(`Failed to create ${filename}.png:`, err.message);
      }
    } else {
      fs.writeFileSync(path.join(ICONS_DIR, `${filename}.svg`), svgContent);
      console.log(`Created: ${filename}.svg (placeholder)`);
    }
  }

  // Generate maskable icons
  for (const size of MASKABLE_SIZES) {
    const filename = `icon-maskable-${size}x${size}`;
    const svgContent = createMaskableSVG(size);

    if (sharp) {
      try {
        await sharp(Buffer.from(svgContent))
          .png()
          .toFile(path.join(ICONS_DIR, `${filename}.png`));
        console.log(`Created: ${filename}.png`);
      } catch (err) {
        console.error(`Failed to create ${filename}.png:`, err.message);
      }
    } else {
      fs.writeFileSync(path.join(ICONS_DIR, `${filename}.svg`), svgContent);
      console.log(`Created: ${filename}.svg (placeholder)`);
    }
  }

  // Generate shortcut icons
  const shortcuts = [
    { name: 'shortcut-restaurant', icon: 'R' },
    { name: 'shortcut-orders', icon: 'C' },
    { name: 'shortcut-cart', icon: 'P' },
  ];

  for (const shortcut of shortcuts) {
    const svgContent = createPlaceholderSVG(SHORTCUT_SIZE, shortcut.icon);

    if (sharp) {
      try {
        await sharp(Buffer.from(svgContent))
          .png()
          .toFile(path.join(ICONS_DIR, `${shortcut.name}.png`));
        console.log(`Created: ${shortcut.name}.png`);
      } catch (err) {
        console.error(`Failed to create ${shortcut.name}.png:`, err.message);
      }
    } else {
      fs.writeFileSync(path.join(ICONS_DIR, `${shortcut.name}.svg`), svgContent);
      console.log(`Created: ${shortcut.name}.svg (placeholder)`);
    }
  }

  console.log('\nIcon generation complete!');

  if (!sharp) {
    console.log('\nNote: SVG placeholders were created. For production, replace with actual PNG icons.');
    console.log('You can use tools like:');
    console.log('  - https://realfavicongenerator.net/');
    console.log('  - https://www.pwabuilder.com/imageGenerator');
    console.log('  - Or install sharp: npm install sharp --save-dev');
  }
}

generateIcons().catch(console.error);
