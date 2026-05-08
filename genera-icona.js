const sharp = require('sharp');
const path = require('path');

const svg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="180" fill="#06080f"/>
  <rect width="1024" height="1024" rx="180" fill="url(#grad)"/>
  <defs>
    <radialGradient id="grad" cx="30%" cy="30%">
      <stop offset="0%" style="stop-color:#1a1500;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06080f;stop-opacity:1" />
    </radialGradient>
  </defs>
  <text x="512" y="480" font-family="Georgia, serif" font-size="280" font-weight="bold" fill="#c9965a" text-anchor="middle" dominant-baseline="middle" font-style="italic">AQ</text>
  <text x="512" y="680" font-family="Arial, sans-serif" font-size="80" fill="#5a5f72" text-anchor="middle" letter-spacing="8">ANCORA QUI</text>
</svg>
`;

sharp(Buffer.from(svg))
  .resize(1024, 1024)
  .png()
  .toFile(path.join(__dirname, 'assets/images/icon.png'), (err) => {
    if (err) console.error(err);
    else console.log('Icona creata!');
  });

sharp(Buffer.from(svg))
  .resize(1024, 1024)
  .png()
  .toFile(path.join(__dirname, 'assets/images/splash-icon.png'), (err) => {
    if (err) console.error(err);
    else console.log('Splash creato!');
  });