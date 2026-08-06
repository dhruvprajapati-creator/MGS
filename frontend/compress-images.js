/**
 * Image Compression Script — Maya Global Services
 * Converts heavy PNG/JPG hero images to WebP for faster LCP.
 * Run: node compress-images.js (from the frontend directory)
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const FRONTEND = 'c:\\Users\\Dell-PC\\Desktop\\New folder (2)\\New folder (3)\\frontend';
const ASSETS = path.join(FRONTEND, 'assets');
const BANKS = path.join(ASSETS, 'banks');

async function compress(src, dest, opts = {}) {
  try {
    const { width = null, quality = 75, format = 'webp' } = opts;
    const pipeline = sharp(src);
    if (width) pipeline.resize(width, null, { withoutEnlargement: true });
    
    const before = fs.statSync(src).size;
    await pipeline[format]({ quality }).toFile(dest);
    const after = fs.statSync(dest).size;
    
    const saved = ((1 - after / before) * 100).toFixed(1);
    console.log('OK ' + path.basename(src) + ' -> ' + path.basename(dest) + '  (' + Math.round(before/1024) + 'KB -> ' + Math.round(after/1024) + 'KB, -' + saved + '%)');
  } catch (err) {
    console.error('ERR ' + path.basename(src) + ': ' + err.message);
  }
}

async function main() {
  console.log('\n=== Hero Background Images ===');
  await compress(path.join(ASSETS, 'slide1_bg.png'),                path.join(ASSETS, 'slide1_bg.webp'),                { width: 1280, quality: 75 });
  await compress(path.join(ASSETS, 'hero_slide_5_bg.png'),          path.join(ASSETS, 'hero_slide_5_bg.webp'),          { width: 1280, quality: 75 });
  await compress(path.join(ASSETS, 'about_hero_bg.png'),            path.join(ASSETS, 'about_hero_bg.webp'),            { width: 1280, quality: 75 });
  await compress(path.join(ASSETS, 'field_agent.png'),              path.join(ASSETS, 'field_agent.webp'),              { width: 900,  quality: 80 });
  await compress(path.join(ASSETS, 'maya_office_bg.png'),           path.join(ASSETS, 'maya_office_bg.webp'),           { width: 1280, quality: 75 });
  await compress(path.join(ASSETS, 'maya_office_bg_with_logo.png'), path.join(ASSETS, 'maya_office_bg_with_logo.webp'), { width: 1280, quality: 75 });
  await compress(path.join(ASSETS, 'simple_rajasthan_map.png'),     path.join(ASSETS, 'simple_rajasthan_map.webp'),     { width: 900,  quality: 80 });

  console.log('\n=== Client Logos ===');
  const logos = [
    ['iti.png','iti.webp'], ['Bandhan_bank.png','bandhan_bank.webp'], ['cars24.jpg','cars24.webp'],
    ['spinny.jpg','spinny.webp'], ['jana.jpg','jana.webp'], ['axis.jpg','axis.webp'],
    ['lic.png','lic.webp'], ['saraswat.jpg','saraswat.webp'], ['nissan.jpg','nissan.webp'],
    ['oto.jpg','oto.webp'], ['mas.jpg','mas.webp'], ['ikf.png','ikf.webp'],
    ['chola.png','chola.webp'], ['lt.png','lt.webp'], ['tata.png','tata.webp'],
    ['toyota.png','toyota.webp'], ['kmpl.png','kmpl.webp'], ['piramal.png','piramal.webp'],
    ['tyger.png','tyger.webp'], ['mudra.png','mudra.webp'],
    ['ganesh.webp','ganesh_opt.webp'], ['jain_finance.webp','jain_finance_opt.webp'],
  ];
  for (const [src, dest] of logos) {
    const s = path.join(BANKS, src), d = path.join(BANKS, dest);
    if (fs.existsSync(s)) await compress(s, d, { width: 180, quality: 85 });
  }
  console.log('\nDone! Update CSS/HTML to use .webp paths.');
}

main().catch(console.error);
